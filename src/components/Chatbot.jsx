import React, { useState, useEffect, useRef } from "react";
import { X, Send, Terminal, ChevronRight, Mic, MicOff, Phone } from "lucide-react";
import { pauseNavMic, resumeNavMic } from "../services/voice-agent/micMutex";

const Chatbot = ({ isOpen, setIsOpen, onStartVoiceCall, liftFab = false }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
      resumeNavMic();
    };
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    pauseNavMic();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      resumeNavMic();
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
      resumeNavMic();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 400);
    };

    recognition.start();
  };

  const sendMessage = async (overrideInput) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ System Offline: I couldn't reach the backend. If you're on Localhost, run 'netlify dev' instead of 'npm run dev'.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = () => {
    setIsOpen(false);
    onStartVoiceCall?.();
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => {
            window.dispatchEvent(new Event("close-mobile-nav"));
            setIsOpen(true);
          }}
          className={`fixed right-4 md:right-6 z-50 p-4 min-w-[52px] min-h-[52px] bg-[#0E0C17]/90 backdrop-blur-xl border border-[#191528] rounded-2xl shadow-[0_0_20px_rgba(120,115,245,0.2)] hover:border-[#7873F5]/50 transition-all duration-300 group ${
            liftFab
              ? "bottom-[max(8.5rem,calc(env(safe-area-inset-bottom)+7.5rem))] md:bottom-28"
              : "bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:bottom-6"
          }`}
        >
          <Terminal size={24} className="text-[#7873F5] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EC77AB] rounded-full border-2 border-[#110E1B] animate-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full h-[100dvh] sm:w-[400px] sm:h-[600px] z-[200] bg-[#110E1B] sm:bg-[#110E1B]/95 backdrop-blur-2xl border-0 sm:border border-[#191528] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden pt-[max(0.5rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]">
          <div className="px-4 sm:px-5 py-3 sm:py-4 bg-[#0E0C17] border-b border-[#191528] flex justify-between items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
              </div>
              <div className="hidden sm:block h-4 w-[1px] bg-[#191528] mx-1"></div>
              <h3 className="font-mono text-[11px] text-[#8E8E93] uppercase tracking-[0.2em] truncate">
                Chat with Sam
              </h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={startCall}
                aria-label="Talk with Sam"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[#7873F5]/15 text-[#7873F5] hover:bg-[#7873F5]/25"
                title="Talk with Sam"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
            {messages.length === 0 && (
              <div className="h-full flex flex-col justify-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Chat with Sam</h2>
                  <p className="text-gray-500 text-sm font-mono leading-relaxed">
                    Anik&apos;s client partner. Ask about his work, or talk through a website / redesign idea.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={startCall}
                    className="group flex justify-between items-center px-4 py-3.5 min-h-[48px] bg-gradient-to-r from-[#7873F5]/15 to-[#EC77AB]/15 border border-[#7873F5]/30 rounded-xl text-[12px] text-white font-mono hover:border-[#7873F5]/60 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Phone size={14} className="text-[#7873F5]" />
                      Talk with Sam
                    </span>
                    <span className="text-[#7873F5]">→</span>
                  </button>
                  {["What can Anik help with?", "Show me relevant work", "How do we start?"].map((label) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(label)}
                      className="group flex justify-between items-center px-4 py-3.5 min-h-[48px] bg-[#0E0C17] border border-[#191528] rounded-xl text-[12px] text-[#8E8E93] font-mono hover:border-[#7873F5]/50 hover:text-white transition-all"
                    >
                      {label}
                      <span className="text-[#7873F5] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-4 rounded-2xl text-[13.5px] max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-[#7873F5] to-[#EC77AB] text-white rounded-tr-none"
                      : "bg-[#0E0C17] text-gray-200 rounded-tl-none border border-[#191528]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-[#7873F5] font-mono text-[10px] tracking-widest opacity-70">
                <span className="animate-pulse">_</span>
                <span>SYSTEM_EXECUTING...</span>
              </div>
            )}
          </div>

          <div className="p-6 pt-0 bg-transparent">
            <div className="relative flex items-center bg-[#0E0C17] border border-[#191528] rounded-2xl p-1.5 focus-within:border-[#7873F5]/40 transition-all">
              <div className="pl-3 text-[#8E8E93] font-mono text-xs">
                <ChevronRight size={14} />
              </div>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-transparent text-white p-2.5 outline-none text-[13px] placeholder:text-gray-600 font-mono"
                placeholder={isListening ? "Listening for command..." : "type or speak..."}
              />

              <button
                onClick={startListening}
                className={`p-2.5 rounded-xl transition-all mr-1 ${
                  isListening
                    ? "text-red-400 bg-red-400/10 animate-pulse shadow-[0_0_10px_rgba(248,113,113,0.2)]"
                    : "text-[#8E8E93] hover:text-white hover:bg-[#1C1C1E]"
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                onClick={() => sendMessage()}
                disabled={isLoading}
                className="bg-[#1C1C1E] p-2.5 rounded-xl text-[#7873F5] hover:bg-[#7873F5] hover:text-white disabled:opacity-30 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
