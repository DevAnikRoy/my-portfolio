import { useCallback, useEffect, useRef, useState } from "react";
import { createAudioRecorder, blobToBase64 } from "../services/voice-agent/audioRecorder";
import { chatVoice, synthesizeSpeech, transcribeAudio } from "../services/voice-agent/voiceApi";
import { playSpeech, stopSpeaking } from "../services/voice-agent/ttsPlayer";
import { pauseNavMic, resumeNavMic } from "../services/voice-agent/micMutex";

/**
 * Turn-based voice call state machine:
 * idle | listening | thinking | speaking | error
 */
export default function useVoiceAgent({ active }) {
  const [status, setStatus] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [userCaption, setUserCaption] = useState("");
  const [agentCaption, setAgentCaption] = useState("");
  const [messages, setMessages] = useState([]);

  const recorderRef = useRef(null);
  const messagesRef = useRef([]);
  const mutedRef = useRef(false);
  const activeRef = useRef(active);
  const statusRef = useRef("idle");
  const objectUrlsRef = useRef([]);
  const processingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

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

  const resetSession = useCallback(() => {
    stopSpeaking();
    recorderRef.current?.cancel();
    recorderRef.current = null;
    processingRef.current = false;
    cleanupAudioUrls();
    setStatus("idle");
    statusRef.current = "idle";
    setError("");
    setUserCaption("");
    setAgentCaption("");
    setMessages([]);
    messagesRef.current = [];
    setMuted(false);
  }, []);

  useEffect(() => {
    if (active) {
      pauseNavMic();
      setStatus("idle");
      statusRef.current = "idle";
      processingRef.current = false;
      setError("");
      setUserCaption("");
      setAgentCaption(
        "Hi — I'm Anik's voice agent. Hold the mic, ask about Webflow, React, or projects, then release."
      );
      setMessages([]);
      messagesRef.current = [];
      return () => {
        stopSpeaking();
        recorderRef.current?.cancel();
        recorderRef.current = null;
        processingRef.current = false;
        cleanupAudioUrls();
        resumeNavMic();
      };
    }
    return undefined;
  }, [active]);

  const startListening = useCallback(async () => {
    if (!activeRef.current || mutedRef.current || processingRef.current) return;
    const current = statusRef.current;
    if (current !== "idle" && current !== "error") return;

    setError("");
    setUserCaption("");
    try {
      const recorder = createAudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setStatus("listening");
      statusRef.current = "listening";
    } catch (err) {
      setStatus("error");
      statusRef.current = "error";
      setError(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone permission denied. Allow mic access and try again."
          : err?.message || "Could not access the microphone."
      );
    }
  }, []);

  const stopListeningAndProcess = useCallback(async () => {
    if (!activeRef.current) return;
    if (statusRef.current !== "listening" || !recorderRef.current || processingRef.current) {
      return;
    }

    processingRef.current = true;
    setStatus("thinking");
    statusRef.current = "thinking";

    try {
      const { blob, mimeType } = await recorderRef.current.stop();
      recorderRef.current = null;

      const audioBase64 = await blobToBase64(blob);
      const transcript = await transcribeAudio({ audioBase64, mimeType });

      if (!transcript) {
        setStatus("error");
        statusRef.current = "error";
        setError("I didn't catch that. Hold the mic and try again.");
        processingRef.current = false;
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
      setAgentCaption(reply);

      setStatus("speaking");
      statusRef.current = "speaking";

      let audioUrl = null;
      try {
        audioUrl = await synthesizeSpeech(reply);
        if (audioUrl) objectUrlsRef.current.push(audioUrl);
      } catch {
        audioUrl = null;
      }

      if (!activeRef.current) {
        processingRef.current = false;
        return;
      }

      await playSpeech({ audioUrl, text: reply });
      if (!activeRef.current) {
        processingRef.current = false;
        return;
      }

      setStatus("idle");
      statusRef.current = "idle";
    } catch (err) {
      recorderRef.current = null;
      setStatus("error");
      statusRef.current = "error";
      setError(
        err?.message?.includes("Failed to fetch")
          ? "Voice backend offline. Run `netlify dev` locally, or try again after deploy."
          : err?.message || "Something went wrong on this turn."
      );
    } finally {
      processingRef.current = false;
    }
  }, []);

  const hangUp = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (next) {
        stopSpeaking();
        if (recorderRef.current) {
          recorderRef.current.cancel();
          recorderRef.current = null;
          setStatus("idle");
          statusRef.current = "idle";
        }
      }
      return next;
    });
  }, []);

  return {
    status,
    muted,
    error,
    userCaption,
    agentCaption,
    startListening,
    stopListeningAndProcess,
    hangUp,
    toggleMute,
    resetSession,
  };
}
