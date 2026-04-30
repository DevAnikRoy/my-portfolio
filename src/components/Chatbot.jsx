import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Terminal, ChevronRight } from "lucide-react";

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

      {/* 2. PRO DEVELOPER CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full h-[100dvh] sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] z-[60] bg-slate-950/95 backdrop-blur-2xl border border-slate-800 sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* Mac-Style Header */}
          <div className="px-5 py-4 bg-slate-900/50 border-b border-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Traffic Lights */}
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
              </div>
              <div className="h-4 w-[1px] bg-slate-700 mx-1"></div>
              <div>
                <h3 className="font-mono text-[11px] text-gray-400 uppercase tracking-[0.2em]">Technical Agent</h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-hide"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <div className="mb-6 space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">System Initialized.</h2>
                  <p className="text-gray-500 text-sm font-mono tracking-tight leading-relaxed">
                    Ready to discuss <span className="text-blue-400">Creative Frontend</span>, <span className="text-purple-400">Webflow</span>, and project architecture.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { label: 'Get Contact Info', icon: '→' },
                    { label: 'View React Projects', icon: '→' },
                    { label: 'Webflow Services', icon: '→' }
                  ].map((chip) => (
                    <button 
                      key={chip.label} 
                      onClick={() => sendMessage(chip.label)}
                      className="group flex justify-between items-center px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[12px] text-gray-400 font-mono hover:border-blue-500/50 hover:text-white transition-all active:scale-[0.98]"
                    >
                      {chip.label}
                      <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">{chip.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-1`}>
                <div
                  className={`p-4 rounded-2xl text-[13.5px] leading-relaxed max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20"
                      : "bg-slate-900/80 text-gray-200 rounded-tl-none border border-slate-800/50 backdrop-blur-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 items-center text-blue-400 font-mono text-[10px] tracking-widest ml-1 opacity-70">
                <span className="animate-pulse">_</span>
                <span>PROCESSING REQUEST...</span>
              </div>
            )}
          </div>

          {/* Minimal Input Bar */}
          <div className="p-6 pt-0 bg-transparent">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1.5 focus-within:border-slate-600 transition-all">
                <div className="pl-3 text-slate-500 font-mono text-xs"><ChevronRight size={14} /></div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 bg-transparent text-white p-2.5 outline-none text-[13px] placeholder:text-gray-600 placeholder:font-mono"
                  placeholder="type message..."
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading}
                  className="bg-slate-800 p-2.5 rounded-xl text-blue-400 hover:bg-blue-600 hover:text-white disabled:opacity-30 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center px-1">
              <p className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.2em]">Dhaka, BD // {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <div className="flex gap-1.5">
                <div className="w-1 h-1 bg-blue-500/30 rounded-full"></div>
                <div className="w-1 h-1 bg-blue-500/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;