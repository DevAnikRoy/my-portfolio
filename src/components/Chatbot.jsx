import React, { useState } from "react";
import { X, Send } from "lucide-react"; // Clean industry icons

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

  // If the state from App.jsx/Navbar is false, don't show the window
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <div className="w-80 md:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white text-xl">
              Anik's AI Assistant
            </h3>
            <p className="text-[10px] text-blue-400">Online | Dhaka, BD</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Section */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Hi, I can help you explore Anik’s Webflow projects, skills, and
              how he builds high-converting websites. Feel free to ask anything.
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-2xl text-sm max-w-[85%] ${
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
            <div className="text-blue-400 text-xs animate-pulse">
              Thinking...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-slate-900 border border-slate-700 text-white p-2 px-3 rounded-xl outline-none text-sm focus:border-blue-500 transition-colors"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-blue-600 p-2 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
