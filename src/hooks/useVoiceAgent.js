import { useCallback, useEffect, useRef, useState } from "react";
import { createAudioRecorder, blobToBase64, cleanAudioMime } from "../services/voice-agent/audioRecorder";
import {
  chatVoice,
  synthesizeSpeech,
  submitCallReport,
  transcribeAudio,
} from "../services/voice-agent/voiceApi";
import { playSpeech, stopSpeaking } from "../services/voice-agent/ttsPlayer";
import { pauseNavMic, resumeNavMic } from "../services/voice-agent/micMutex";
import { OPENING_GREETING } from "../services/voice-agent/prompts";

/**
 * Support-call state machine:
 * connecting | speaking | listening | thinking | ending | error | idle
 */
export default function useVoiceAgent({ active }) {
  const [status, setStatus] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [userCaption, setUserCaption] = useState("");
  const [agentCaption, setAgentCaption] = useState("");
  const [messages, setMessages] = useState([]);
  const [reportStatus, setReportStatus] = useState("");

  const recorderRef = useRef(null);
  const messagesRef = useRef([]);
  const mutedRef = useRef(false);
  const activeRef = useRef(active);
  const statusRef = useRef("idle");
  const objectUrlsRef = useRef([]);
  const processingRef = useRef(false);
  const listenGenerationRef = useRef(0);
  const sessionIdRef = useRef(0);

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
    setStatusBoth("speaking");
    let audioUrl = null;
    try {
      audioUrl = await synthesizeSpeech(text);
      if (audioUrl) objectUrlsRef.current.push(audioUrl);
    } catch {
      audioUrl = null;
    }
    if (!activeRef.current) return;
    await playSpeech({ audioUrl, text });
  };

  apiRef.current.beginListening = async () => {
    if (!activeRef.current || mutedRef.current || processingRef.current) return;

    const gen = ++listenGenerationRef.current;
    setError("");
    setUserCaption("");

    try {
      const recorder = createAudioRecorder();
      recorderRef.current = recorder;

      await recorder.start({
        onAutoStop: async ({ empty }) => {
          if (gen !== listenGenerationRef.current) return;
          if (!activeRef.current || mutedRef.current) return;

          if (empty) {
            try {
              await recorderRef.current?.stop().catch(() => null);
            } catch {
              /* ignore */
            }
            recorderRef.current = null;
            setTimeout(() => {
              if (activeRef.current && !mutedRef.current) {
                apiRef.current.beginListening?.();
              }
            }, 400);
            return;
          }

          apiRef.current.processTurn?.();
        },
      });

      if (gen !== listenGenerationRef.current) {
        recorder.cancel();
        return;
      }
      setStatusBoth("listening");
    } catch (err) {
      setStatusBoth("error");
      setError(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone permission denied. Allow mic access and call again."
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
      recorderRef.current = null;

      const audioBase64 = await blobToBase64(blob);
      const transcript = await transcribeAudio({
        audioBase64,
        mimeType: cleanAudioMime(mimeType),
      });

      if (!transcript) {
        processingRef.current = false;
        if (activeRef.current && !mutedRef.current) {
          apiRef.current.beginListening?.();
        }
        return;
      }

      setUserCaption(transcript);
      const userMessage = { role: "user", content: transcript };
      const nextMessages = [...messagesRef.current, userMessage];
      setMessages(nextMessages);
      messagesRef.current = nextMessages;

      const reply = await chatVoice(nextMessages);
      if (!activeRef.current) {
        processingRef.current = false;
        return;
      }

      const assistantMessage = { role: "assistant", content: reply };
      const withReply = [...nextMessages, assistantMessage];
      setMessages(withReply);
      messagesRef.current = withReply;

      await apiRef.current.speakText(reply);
      processingRef.current = false;

      if (activeRef.current && !mutedRef.current) {
        apiRef.current.beginListening?.();
      } else if (activeRef.current) {
        setStatusBoth("idle");
      }
    } catch (err) {
      recorderRef.current = null;
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
    if (!active) return undefined;

    const sessionId = ++sessionIdRef.current;
    pauseNavMic();
    listenGenerationRef.current += 1;
    processingRef.current = false;
    setMuted(false);
    setMessages([]);
    messagesRef.current = [];
    setUserCaption("");
    setAgentCaption("");
    setError("");
    setReportStatus("");
    setStatusBoth("connecting");

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
        if (!mutedRef.current) apiRef.current.beginListening?.();
      } catch (err) {
        if (sessionId !== sessionIdRef.current) return;
        processingRef.current = false;
        setStatusBoth("error");
        setError(err?.message || "Could not start the call greeting.");
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
      resumeNavMic();
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

    const transcript = messagesRef.current || [];
    try {
      // Greeting-only calls still get a light report so delivery can be verified.
      if (transcript.length >= 1) {
        const result = await submitCallReport(transcript);
        const tg = result?.delivery?.telegram?.ok;
        const sheet = result?.delivery?.sheet?.ok;
        if (tg && sheet) setReportStatus("Report sent to Telegram + Sheets.");
        else if (tg) setReportStatus("Telegram sent. Sheets needs webhook fix.");
        else if (sheet) setReportStatus("Sheets row added. Telegram failed.");
        else setReportStatus("Report saved locally, delivery incomplete.");
      } else {
        setReportStatus("Call ended.");
      }
    } catch (err) {
      console.error(err);
      setReportStatus(err?.message || "Call ended. Report delivery failed.");
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
        recorderRef.current?.cancel();
        recorderRef.current = null;
        setStatusBoth("idle");
      } else if (activeRef.current && !processingRef.current) {
        apiRef.current.beginListening?.();
      }
      return next;
    });
  }, []);

  const retryListen = useCallback(() => {
    setError("");
    if (activeRef.current && !mutedRef.current) {
      apiRef.current.beginListening?.();
    }
  }, []);

  return {
    status,
    muted,
    error,
    userCaption,
    agentCaption,
    messages,
    reportStatus,
    hangUp,
    toggleMute,
    retryListen,
  };
}
