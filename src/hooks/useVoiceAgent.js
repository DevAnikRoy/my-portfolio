import { useCallback, useEffect, useRef, useState } from "react";
import { createAudioRecorder, blobToBase64, cleanAudioMime } from "../services/voice-agent/audioRecorder";
import {
  chatSite,
  synthesizeSpeech,
  submitCallReport,
  transcribeAudio,
  warmVoiceApis,
} from "../services/voice-agent/voiceApi";
import { playSpeech, stopSpeaking } from "../services/voice-agent/ttsPlayer";
import { registerMicController } from "../services/voice-agent/micMutex";
import {
  MARKETING_WINDOW_MS,
  pickIntroGreeting,
  pickOpeningGreeting,
} from "../services/voice-agent/prompts";
import { isGhostTranscript } from "../services/voice-agent/transcriptGuard";
import { watchBargeIn } from "../services/voice-agent/bargeIn";
import { releaseWarmedMic, warmMic, getWarmedMic } from "../services/voice-agent/micWarm";
import {
  formatKnownContact,
  ingestUserUtterance,
  loadContactMemory,
  memoryHasContact,
  transcriptHasContact,
} from "../services/voice-agent/sessionMemory";
import { resolveNavIntent } from "../services/voice-agent/navIntent";

/**
 * Unified site Sam state machine:
 * connecting | speaking | listening | thinking | ending | error | idle
 *
 * @param {{ active: boolean, kind?: "intro" | "full", onActions?: Function, onSessionEnd?: Function }} opts
 */
export default function useVoiceAgent({
  active,
  kind = "full",
  onActions,
  onSessionEnd,
}) {
  const [status, setStatus] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [userCaption, setUserCaption] = useState("");
  const [agentCaption, setAgentCaption] = useState("");
  const [messages, setMessages] = useState([]);
  const [reportStatus, setReportStatus] = useState("");
  const [captionVisible, setCaptionVisible] = useState(false);

  const recorderRef = useRef(null);
  const messagesRef = useRef([]);
  const mutedRef = useRef(false);
  const activeRef = useRef(active);
  const kindRef = useRef(kind);
  const statusRef = useRef("idle");
  const objectUrlsRef = useRef([]);
  const processingRef = useRef(false);
  const listenGenerationRef = useRef(0);
  const sessionIdRef = useRef(0);
  const sessionStartedAtRef = useRef(0);
  const onActionsRef = useRef(onActions);
  const onSessionEndRef = useRef(onSessionEnd);
  const captionTimerRef = useRef(null);
  const externalPauseRef = useRef(false);
  const endingRef = useRef(false);

  const apiRef = useRef({});

  const setStatusBoth = (next) => {
    statusRef.current = next;
    setStatus(next);
  };

  const cleanupAudioUrls = () => {
    objectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    });
    objectUrlsRef.current = [];
  };

  const showCaptionBriefly = (ms = 3600) => {
    setCaptionVisible(true);
    if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    captionTimerRef.current = setTimeout(() => setCaptionVisible(false), ms);
  };

  useEffect(() => {
    onActionsRef.current = onActions;
  }, [onActions]);

  useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    kindRef.current = kind;
  }, [kind]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  apiRef.current.speakText = async (text) => {
    setAgentCaption(text);
    showCaptionBriefly(Math.min(7000, 1800 + text.length * 40));
    setStatusBoth("speaking");

    try {
      if (!getWarmedMic()) await warmMic();
      if (recorderRef.current) await recorderRef.current.ensureStream?.();
    } catch {
      /* permission may already be granted later */
    }

    const edgePromise = synthesizeSpeech(text)
      .then((url) => {
        if (url) objectUrlsRef.current.push(url);
        return url;
      })
      .catch(() => null);

    if (!activeRef.current) return { barged: false };

    let barged = false;
    const mic = recorderRef.current?.getStream?.() || getWarmedMic();
    const stopBarge = mic
      ? watchBargeIn(mic, {
          onBarge: () => {
            barged = true;
            stopSpeaking();
          },
        })
      : () => {};

    try {
      await playSpeech({ text, edgePromise });
    } finally {
      stopBarge();
    }

    if (barged) {
      return { barged: true };
    }

    // Shorter echo guard for snappier turns
    await new Promise((r) => setTimeout(r, 120));
    return { barged: false };
  };

  apiRef.current.beginListening = async () => {
    if (kindRef.current !== "full") return;
    if (!activeRef.current || mutedRef.current || processingRef.current) return;
    if (externalPauseRef.current || endingRef.current) return;

    const gen = ++listenGenerationRef.current;
    setError("");
    setUserCaption("");

    try {
      if (!recorderRef.current) {
        recorderRef.current = createAudioRecorder();
      }
      const recorder = recorderRef.current;

      await recorder.start({
        onAutoStop: async ({ empty }) => {
          if (gen !== listenGenerationRef.current) return;
          if (!activeRef.current || mutedRef.current || externalPauseRef.current) return;

          if (empty) {
            try {
              await recorderRef.current?.stop().catch(() => null);
            } catch {
              /* ignore */
            }
            setTimeout(() => {
              if (activeRef.current && !mutedRef.current && !externalPauseRef.current) {
                apiRef.current.beginListening?.();
              }
            }, 200);
            return;
          }

          apiRef.current.processTurn?.();
        },
      });

      if (gen !== listenGenerationRef.current) {
        recorder.softCancel?.();
        return;
      }
      setStatusBoth("listening");
    } catch (err) {
      setStatusBoth("error");
      setError(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone permission denied. Allow mic access and try again."
          : err?.message || "Could not access the microphone."
      );
    }
  };

  apiRef.current.processTurn = async () => {
    if (!activeRef.current || kindRef.current !== "full") return;
    if (!recorderRef.current || processingRef.current) return;

    processingRef.current = true;
    setStatusBoth("thinking");

    try {
      const { blob, mimeType } = await recorderRef.current.stop();

      const audioBase64 = await blobToBase64(blob);
      const transcript = await transcribeAudio({
        audioBase64,
        mimeType: cleanAudioMime(mimeType),
      });

      if (!transcript || isGhostTranscript(transcript)) {
        processingRef.current = false;
        if (activeRef.current && !mutedRef.current && !externalPauseRef.current) {
          apiRef.current.beginListening?.();
        }
        return;
      }

      ingestUserUtterance(transcript);

      setUserCaption(transcript);
      showCaptionBriefly(2800);
      const userMessage = { role: "user", content: transcript };
      const nextMessages = [...messagesRef.current, userMessage];
      setMessages(nextMessages);
      messagesRef.current = nextMessages;

      const localNav = resolveNavIntent(transcript);
      const localEnd = (localNav?.actions || []).some((a) => a?.type === "endCall");
      const navNow = (localNav?.actions || []).filter((a) => a?.type !== "endCall");
      if (navNow.length) {
        try {
          onActionsRef.current?.(navNow);
        } catch (err) {
          console.error("Tia nav actions failed:", err);
        }
      }

      let speak = localNav?.speak || "";
      let actions = localNav?.actions || [];
      let chatFailed = false;

      if (!localEnd) {
        const sessionElapsedMs = sessionStartedAtRef.current
          ? Date.now() - sessionStartedAtRef.current
          : 0;
        const mem = loadContactMemory();
        const hasContact = transcriptHasContact(nextMessages) || memoryHasContact(mem);
        const knownContact = formatKnownContact(mem);

        const result = await chatSite(nextMessages, {
          sessionElapsedMs,
          hasContact,
          knownContact,
        }).catch((err) => {
          const nav = resolveNavIntent(transcript);
          if (nav) return nav;
          console.error("chatSite failed:", err);
          chatFailed = true;
          return {
            speak: "Sorry — I glitched for a second. Say that again?",
            actions: [],
          };
        });
        speak = result?.speak;
        actions = result?.actions;
      }
      if (!activeRef.current) {
        processingRef.current = false;
        return;
      }

      if (chatFailed) {
        setError("Chat backend hiccup — try once more.");
      }

      const wantsEnd =
        localEnd || (actions || []).some((a) => a?.type === "endCall");
      const reply = wantsEnd
        ? localNav?.speak || speak || "Thanks for chatting — take care!"
        : speak || localNav?.speak || "Got it.";
      const assistantMessage = { role: "assistant", content: reply };
      const withReply = [...nextMessages, assistantMessage];
      setMessages(withReply);
      messagesRef.current = withReply;

      const otherActions = localNav?.actions?.length
        ? []
        : (actions || []).filter((a) => a?.type !== "endCall");

      const speakP = apiRef.current.speakText(reply);
      if (otherActions.length) {
        try {
          onActionsRef.current?.(otherActions);
        } catch (err) {
          console.error("Tia actions failed:", err);
        }
      }
      await speakP;
      processingRef.current = false;

      if (wantsEnd) {
        await apiRef.current.hangUpInternal?.();
        onSessionEndRef.current?.({ reason: "endCall" });
        return;
      }

      if (activeRef.current && !mutedRef.current && !externalPauseRef.current) {
        apiRef.current.beginListening?.();
      } else if (activeRef.current) {
        setStatusBoth("idle");
      }
    } catch (err) {
      processingRef.current = false;
      setStatusBoth("error");
      setError(
        err?.message?.includes("Failed to fetch")
          ? "Voice backend offline. Run `netlify dev` locally, or try again after deploy."
          : err?.message || "Something went wrong on this turn."
      );
    }
  };

  apiRef.current.hangUpInternal = async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    listenGenerationRef.current += 1;
    stopSpeaking();
    recorderRef.current?.cancel();
    recorderRef.current = null;
    processingRef.current = true;
    setStatusBoth("ending");

    const transcript = messagesRef.current || [];
    const userSpoke = transcript.some((m) => m.role === "user");
    const shouldReport = kindRef.current === "full" && userSpoke;

    if (shouldReport) {
      setReportStatus("Saving conversation…");
      setCaptionVisible(true);
      try {
        const result = await submitCallReport(transcript);
        const tg = result?.delivery?.telegram?.ok;
        const sheet = result?.delivery?.sheet?.ok;
        if (tg && sheet) setReportStatus("Report sent to Telegram + Sheets.");
        else if (tg) setReportStatus("Telegram sent. Sheets needs webhook fix.");
        else if (sheet) setReportStatus("Sheets row added. Telegram failed.");
        else setReportStatus("Report saved. Delivery incomplete.");
      } catch (err) {
        console.error(err);
        setReportStatus(err?.message || "Session ended. Report delivery failed.");
      }
    } else {
      setReportStatus("");
    }

    processingRef.current = false;
    cleanupAudioUrls();
    releaseWarmedMic();
    setStatusBoth("idle");
    endingRef.current = false;
  };

  useEffect(() => {
    registerMicController({
      pause: () => {
        externalPauseRef.current = true;
        listenGenerationRef.current += 1;
        try {
          recorderRef.current?.softCancel?.();
        } catch {
          /* ignore */
        }
        if (statusRef.current === "listening") setStatusBoth("idle");
      },
      resume: () => {
        externalPauseRef.current = false;
        if (
          activeRef.current &&
          kindRef.current === "full" &&
          !mutedRef.current &&
          !processingRef.current &&
          statusRef.current !== "speaking" &&
          statusRef.current !== "ending"
        ) {
          setTimeout(() => apiRef.current.beginListening?.(), 200);
        }
      },
    });
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const sessionId = ++sessionIdRef.current;
    sessionStartedAtRef.current = Date.now();
    listenGenerationRef.current += 1;
    processingRef.current = false;
    externalPauseRef.current = false;
    endingRef.current = false;
    setMuted(false);
    setMessages([]);
    messagesRef.current = [];
    setUserCaption("");
    setAgentCaption("");
    setError("");
    setReportStatus("");
    setCaptionVisible(false);
    setStatusBoth("connecting");

    recorderRef.current = createAudioRecorder();
    warmVoiceApis();

    const isIntro = kind === "intro";

    (async () => {
      try {
        await warmMic();
        await recorderRef.current?.ensureStream?.();
      } catch {
        /* user may grant on first listen */
      }

      const greeting = isIntro ? pickIntroGreeting() : pickOpeningGreeting();
      const seed = [{ role: "assistant", content: greeting }];
      setMessages(seed);
      messagesRef.current = seed;
      setAgentCaption(greeting);
      processingRef.current = true;

      try {
        await apiRef.current.speakText(greeting);
        if (sessionId !== sessionIdRef.current || !activeRef.current) return;
        processingRef.current = false;

        if (isIntro) {
          setStatusBoth("idle");
          onSessionEndRef.current?.({ reason: "intro-complete" });
          return;
        }

        if (!mutedRef.current && !externalPauseRef.current) {
          apiRef.current.beginListening?.();
        }
      } catch (err) {
        if (sessionId !== sessionIdRef.current) return;
        processingRef.current = false;
        setStatusBoth("error");
        setError(err?.message || "Could not start Tia's greeting.");
        if (isIntro) {
          onSessionEndRef.current?.({ reason: "intro-error" });
        }
      }
    })();

    return () => {
      sessionIdRef.current += 1;
      listenGenerationRef.current += 1;
      stopSpeaking();
      recorderRef.current?.cancel();
      recorderRef.current = null;
      processingRef.current = false;
      cleanupAudioUrls();
      releaseWarmedMic();
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    };
  }, [active, kind]);

  const hangUp = useCallback(async () => {
    await apiRef.current.hangUpInternal?.();
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      if (next) {
        listenGenerationRef.current += 1;
        stopSpeaking();
        recorderRef.current?.softCancel?.();
        setStatusBoth("idle");
      } else if (
        activeRef.current &&
        kindRef.current === "full" &&
        !processingRef.current &&
        !externalPauseRef.current
      ) {
        apiRef.current.beginListening?.();
      }
      return next;
    });
  }, []);

  const retryListen = useCallback(() => {
    setError("");
    if (
      activeRef.current &&
      kindRef.current === "full" &&
      !mutedRef.current &&
      !externalPauseRef.current
    ) {
      apiRef.current.beginListening?.();
    }
  }, []);

  return {
    status,
    muted,
    error,
    userCaption,
    agentCaption,
    captionVisible,
    messages,
    reportStatus,
    marketingWindowMs: MARKETING_WINDOW_MS,
    hangUp,
    toggleMute,
    retryListen,
  };
}
