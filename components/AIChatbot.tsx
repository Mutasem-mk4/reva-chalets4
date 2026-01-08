
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Navigation, ArrowRight, Home, MessageSquare, Map as MapIcon, ExternalLink, Compass, Loader2, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getGeminiResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
  grounding?: any[];
}

const AIChatbot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: "مرحباً بك في ريفا كونسيرج (Gemini 3 Pro). أنا هنا لمساعدتك في التخطيط لإقامتك الفاخرة. كيف يمكنني خدمتك اليوم؟" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const historyForAi = messages.map(m => ({ role: m.role, text: m.text }));
    const result = await getGeminiResponse(userMsg, historyForAi);

    setMessages(prev => [...prev, { 
      role: 'model', 
      text: result.text,
      grounding: result.grounding
    }]);
    setIsLoading(false);
  };

  const renderText = (text: string) => {
    return <span className="leading-loose whitespace-pre-wrap">{text}</span>;
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 rtl:right-auto rtl:left-4 z-[60] flex flex-col items-end rtl:items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-6 w-[95vw] md:w-[480px] h-[80vh] md:h-[700px] bg-white/95 dark:bg-reva-900/95 backdrop-blur-3xl border border-reva-gold/30 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="p-8 bg-reva-950 border-b border-white/10 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-reva-gold flex items-center justify-center shadow-lg">
                  <Compass className="text-reva-900" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg font-arabic">ريفا كونسيرج</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-reva-emerald animate-pulse" />
                    <p className="text-[10px] text-reva-gold uppercase tracking-[0.2em] font-black">Powered by Gemini 3 Pro</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-3 text-gray-400 hover:text-white rounded-2xl transition-all hover:bg-white/5">
                <X size={24} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] p-6 rounded-[2.5rem] text-sm relative shadow-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-reva-gold text-reva-900 font-bold rounded-tr-none' 
                      : 'bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-gray-100 rounded-tl-none font-arabic'
                  }`}>
                    <div className="text-base">{renderText(msg.text)}</div>
                    
                    {msg.grounding && msg.grounding.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                        <p className="text-[9px] font-black text-reva-gold uppercase tracking-widest mb-2">Sources & Context</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.grounding.map((chunk, cidx) => {
                            const web = chunk.web;
                            if (!web) return null;
                            return (
                              <a 
                                key={cidx}
                                href={web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-reva-gold hover:text-reva-gold transition-all"
                              >
                                <LinkIcon size={12} /> {web.title || "Reference"}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                 <div className="flex justify-start">
                   <div className="bg-white dark:bg-white/5 p-5 rounded-[2.5rem] flex items-center gap-5 border border-slate-200/50 dark:border-white/10 shadow-sm">
                      <Loader2 className="animate-spin text-reva-gold" size={24} />
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Consulting Intelligence...</span>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-8 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-reva-950">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اسأل عن أفضل الشاليهات في جرش..."
                  className="w-full bg-white dark:bg-reva-900 text-slate-900 dark:text-white rounded-[2rem] pl-6 pr-16 py-5 text-sm font-semibold focus:outline-none ring-1 ring-slate-200 dark:ring-white/10 focus:ring-2 focus:ring-reva-gold transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-reva-gold rounded-2xl text-reva-900 hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-20 h-20 rounded-full bg-reva-gold shadow-[0_12px_48px_rgba(0,0,0,0.3)] flex items-center justify-center relative z-10 border-2 border-white/20 text-reva-900"
      >
        {isOpen ? <X size={32} /> : <Compass size={36} />}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
