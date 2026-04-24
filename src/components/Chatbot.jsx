import React, { useState } from "react";
import { X, Send, Bot } from "lucide-react"; // Removed MessageSquareText, added Bot

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
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
      {/* 1. THE AGENT FAB (Mobile/Tablet Only) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-blue-400 rounded-2xl shadow-2xl border border-slate-700 hover:scale-110 active:scale-95 transition-all duration-300"
        >
          {/* FIXED: Changed MessageSquareText to Bot here */}
          <Bot size={28} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* 2. CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full h-[100dvh] sm:bottom-6 sm:right-6 sm:w-96 sm:h-[550px] z-[60] bg-slate-900 border border-slate-700 sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          
          {/* Header */}
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-bold text-white text-sm">Anik's AI Assistant</h3>
                <p className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">Online | Dhaka, BD</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages Section */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center shadow-xl">
                    {/* FIXED: Changed MessageSquareText to Bot here */}
                    <Bot size={32} className="text-blue-400" />
                  </div>
                </div>

                <h3 className="text-white font-semibold text-lg mb-2">Hello, I'm Anik's Agent.</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  I'm here to provide insights into Anik's technical workflow at <span className="text-blue-400">Softvence</span> and his expertise in Creative Frontend.
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  {['Webflow & GSAP', 'React Apps', 'Full-Stack'].map((chip) => (
                    <span key={chip} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[10px] text-gray-400 uppercase tracking-tight">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-800 text-gray-200 rounded-tl-none border border-slate-700"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-1 items-center text-blue-400 text-xs font-medium ml-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 tracking-tight">Agent is thinking...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/30 backdrop-blur-sm flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-slate-900 border border-slate-700 text-white p-2.5 px-4 rounded-xl outline-none text-sm focus:border-blue-500 transition-all placeholder:text-gray-600"
              placeholder="Inquire about Anik's stack..."
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="bg-blue-600 p-2.5 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;