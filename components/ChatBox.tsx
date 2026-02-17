
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Search } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatService } from '../services/chatService';

export const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am your AI Shopping Assistant. Paste a product link or ask me anything about a store!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Initial model message placeholder
    setMessages(prev => [...prev, { role: 'model', text: '', isSearching: userMessage.includes('http') }]);

    try {
      await chatService.sendMessage(userMessage, (updatedText) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const last = newMessages[newMessages.length - 1];
          if (last.role === 'model') {
            last.text = updatedText;
            last.isSearching = false;
          }
          return newMessages;
        });
      });
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all group flex items-center gap-2"
        >
          <div className="relative">
            <MessageSquare size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm px-0 group-hover:px-2">
            Ask Gemini
          </span>
        </button>
      ) : (
        <div className="bg-white w-[90vw] md:w-[400px] h-[600px] rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-xl">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Gemini Assistant</h4>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Always Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {m.isSearching && (
                    <div className="flex items-center gap-2 mb-2 text-blue-500 animate-pulse text-[10px] font-black uppercase tracking-widest">
                      <Search size={12} /> Searching live web...
                    </div>
                  )}
                  {m.text || (isLoading && i === messages.length - 1 ? <Loader2 size={16} className="animate-spin" /> : '')}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white">
            <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 p-1 group focus-within:border-blue-500 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a product link..."
                className="w-full bg-transparent py-3 px-4 text-sm focus:outline-none font-bold"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-90 shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-1 opacity-40">
              <Sparkles size={10} className="text-blue-600" />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Powered by Gemini Search</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
