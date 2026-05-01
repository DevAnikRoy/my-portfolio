import React, { useState, useEffect, useRef } from "react";
import { X, Send, Terminal, ChevronRight, Mic, MicOff } from "lucide-react";

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // --- NAVIGATION COMMAND HANDLER ---
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false); // Close chat to reveal the section
    }
  };

  // --- VOICE RECOGNITION LOGIC ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setInput(transcript);

      // --- COMMAND CONTROLLER ---
      if (transcript.includes("about")) {
        scrollToSection("about");
      } else if (transcript.includes("project") || transcript.includes("work")) {
        scrollToSection("projects");
      } else if (transcript.includes("contact") || transcript.includes("hire")) {
        scrollToSection("contact");
      } else if (transcript.includes("education")) {
        scrollToSection("education");
      } else if (transcript.includes("experience")) {
        scrollToSection("experience");
      } else {
        // No command detected? Treat as normal chat
        setTimeout(() => sendMessage(transcript), 500);
      }
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
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. MINIMALIST FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/50 transition-all duration-300 group"
        >
          <Terminal size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
        </button>
      )}

      {/* 2. CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full h-[100dvh] sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] z-[60] bg-slate-950/95 backdrop-blur-2xl border border-slate-800 sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <div className="px-5 py-4 bg-slate-900/50 border-b border-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
              </div>
              <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
              <h3 className="font-mono text-[11px] text-gray-400 uppercase tracking-[0.2em]">Voice Command Active</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-gray-500 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide">
            {messages.length === 0 && (
              <div className="h-full flex flex-col justify-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Voice Controller</h2>
                  <p className="text-gray-500 text-sm font-mono leading-relaxed">
                    Try: <span className="text-blue-400">"Go to projects"</span> or <span className="text-purple-400">"Hire me"</span> to scroll automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {['Get Contact Info', 'View React Projects', 'Experience'].map((label) => (
                    <button 
                      key={label} 
                      onClick={() => sendMessage(label)}
                      className="group flex justify-between items-center px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[12px] text-gray-400 font-mono hover:border-blue-500/50 hover:text-white transition-all"
                    >
                      {label}
                      <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-4 rounded-2xl text-[13.5px] max-w-[85%] ${
                  msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-900/80 text-gray-200 rounded-tl-none border border-slate-800/50"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 items-center text-blue-400 font-mono text-[10px] tracking-widest opacity-70">
                <span className="animate-pulse">_</span>
                <span>SYSTEM_EXECUTING...</span>
              </div>
            )}
          </div>

          <div className="p-6 pt-0 bg-transparent">
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1.5 focus-within:border-slate-600 transition-all">
              <div className="pl-3 text-slate-500 font-mono text-xs"><ChevronRight size={14} /></div>
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
                    : "text-gray-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                onClick={() => sendMessage()}
                disabled={isLoading}
                className="bg-slate-800 p-2.5 rounded-xl text-blue-400 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all"
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