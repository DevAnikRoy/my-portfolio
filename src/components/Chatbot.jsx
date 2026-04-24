import React, { useState } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');

    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });
    
    const data = await res.json();
    setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 h-96 bg-slate-900 border border-slate-700 rounded-xl flex flex-col shadow-2xl overflow-hidden">
          <div className="p-4 bg-slate-800 border-bottom border-slate-700 font-bold text-white">Anik's AI Assistant</div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-slate-700'} max-w-[80%] text-white text-sm`}>
                {msg.content}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-700 flex gap-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-800 text-white p-2 rounded outline-none text-sm"
              placeholder="Ask me anything..."
            />
            <button onClick={sendMessage} className="text-blue-400 font-bold">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;