import { useCallback, useEffect, useRef, useState } from "react";
import { createAudioRecorder, blobToBase64, cleanAudioMime } from "../services/voice-agent/audioRecorder";
import {
  chatSite,
  synthesizeSpeech,
  submitCallReport,
  transcribeAudio,
} from "../services/voice-agent/voiceApi";
import { playSpeech, stopSpeaking } from "../services/voice-agent/ttsPlayer";
import { registerMicController } from "../services/voice-agent/micMutex";
import { MARKETING_WINDOW_MS, OPENING_GREETING } from "../services/voice-agent/prompts";
import { isGhostTranscript } from "../services/voice-agent/transcriptGuard";

function transcriptHasContact(messages = []) {
  const blob = messages.map((m) => m.content || "").join(" ");
  return (
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(blob) ||
    /\+?\d[\d\s()-]{7,}\d/.test(blob)
  );
}

/**
 * Unified site Sam state machine:
 * connecting | speaking | listening | thinking | ending | error | idle
 */
export default function useVoiceAgent({ active, onActions }) {
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
  const statusRef = useRef("idle");
  const objectUrlsRef = useRef([]);
  const processingRef = useRef(false);
  const listenGenerationRef = useRef(0);
  const sessionIdRef = useRef(0);
  const sessionStartedAtRef = useRef(0);
  const onActionsRef = useRef(onActions);
  const captionTimerRef = useRef(null);
  const externalPauseRef = useRef(false);

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
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  apiRef.current.speakText = async (text) => {
    setAgentCaption(text);
    showCaptionBriefly(Math.min(7000, 1800 + text.length * 40));
    setStatusBoth("speaking");

    // Prefer young neural Jenny; wait longer before browser fallback
    const edgePromise = synthesizeSpeech(text)
      .then((url) => {
        if (url) objectUrlsRef.current.push(url);
        return url;
      })
      .catch(() => null);

    if (!activeRef.current) return;
    await playSpeech({ text, edgePromise, preferEdgeMs: 1100 });

    // Echo guard — don't open the mic while speakers are still ringing
    await new Promise((r) => setTimeout(r, 550));
  };

  apiRef.current.beginListening = async () => {
    if (!activeRef.current || mutedRef.current || processingRef.current) return;
    if (externalPauseRef.current) return;

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
            }, 220);
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
    if (!activeRef.current) return;
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

      // Whisper often invents "Thank you." on silence/echo — ignore and keep listening
      if (!transcript || isGhostTranscript(transcript)) {
        processingRef.current = false;
        if (activeRef.current && !mutedRef.current && !externalPauseRef.current) {
          apiRef.current.beginListening?.();
        }
        return;
      }

      setUserCaption(transcript);
      showCaptionBriefly(2800);
      const userMessage = { role: "user", content: transcript };
      const nextMessages = [...messagesRef.current, userMessage];
      setMessages(nextMessages);
      messagesRef.current = nextMessages;

      const sessionElapsedMs = sessionStartedAtRef.current
        ? Date.now() - sessionStartedAtRef.current
        : 0;

      const { speak, actions } = await chatSite(nextMessages, {
        sessionElapsedMs,
        hasContact: transcriptHasContact(nextMessages),
      });
      if (!activeRef.current) {
        processingRef.current = false;
        return;
      }

      const reply = speak || "Got it.";
      const assistantMessage = { role: "assistant", content: reply };
      const withReply = [...nextMessages, assistantMessage];
      setMessages(withReply);
      messagesRef.current = withReply;

      // Speak + navigate in parallel for snappier feel
      const speakP = apiRef.current.speakText(reply);
      if (actions?.length) {
        try {
          onActionsRef.current?.(actions);
        } catch (err) {
          console.error("Sam actions failed:", err);
        }
      }
      await speakP;
      processingRef.current = false;

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

    (async () => {
      const greeting = OPENING_GREETING;
      const seed = [{ role: "assistant", content: greeting }];
      setMessages(seed);
      messagesRef.current = seed;
      setAgentCaption(greeting);
      processingRef.current = true;

      try {
        await apiRef.current.speakText(greeting);
        if (sessionId !== sessionIdRef.current || !activeRef.current) return;
        processingRef.current = false;
        if (!mutedRef.current && !externalPauseRef.current) {
          apiRef.current.beginListening?.();
        }
      } catch (err) {
        if (sessionId !== sessionIdRef.current) return;
        processingRef.current = false;
        setStatusBoth("error");
        setError(err?.message || "Could not start Sam's greeting.");
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
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    };
  }, [active]);

  const hangUp = useCallback(async () => {
    listenGenerationRef.current += 1;
    stopSpeaking();
    recorderRef.current?.cancel();
    recorderRef.current = null;
    processingRef.current = true;
    setStatusBoth("ending");
    setReportStatus("Saving conversation…");
    setCaptionVisible(true);

    const transcript = messagesRef.current || [];
    try {
      if (transcript.length >= 1) {
        const result = await submitCallReport(transcript);
        const tg = result?.delivery?.telegram?.ok;
        const sheet = result?.delivery?.sheet?.ok;
        if (tg && sheet) setReportStatus("Report sent to Telegram + Sheets.");
        else if (tg) setReportStatus("Telegram sent. Sheets needs webhook fix.");
        else if (sheet) setReportStatus("Sheets row added. Telegram failed.");
        else setReportStatus("Report saved. Delivery incomplete.");
      } else {
        setReportStatus("Session ended.");
      }
    } catch (err) {
      console.error(err);
      setReportStatus(err?.message || "Session ended. Report delivery failed.");
    } finally {
      processingRef.current = false;
      cleanupAudioUrls();
      setStatusBoth("idle");
    }
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
      } else if (activeRef.current && !processingRef.current && !externalPauseRef.current) {
        apiRef.current.beginListening?.();
      }
      return next;
    });
  }, []);

  const retryListen = useCallback(() => {
    setError("");
    if (activeRef.current && !mutedRef.current && !externalPauseRef.current) {
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
