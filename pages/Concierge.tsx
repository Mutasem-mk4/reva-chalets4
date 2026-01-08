
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Compass, Loader2, Link as LinkIcon, Sparkles, 
  Search, MapPin, ExternalLink, ArrowRight, Home, Info, HelpCircle,
  Shield, Globe
} from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { useApp } from '../contexts/AppContext';

interface Message {
  role: 'user' | 'model';
  text: string;
  grounding?: any[];
}

const Concierge: React.FC = () => {
  const { t, language } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: t('conciergeWelcome')
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-reva-950 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col p-4 md:p-8">
        
        {/* Hero Section */}
        <header className="py-12 md:py-20 text-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-20 h-20 bg-reva-gold rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-reva-gold/20"
           >
              <Compass className="text-reva-900" size={40} />
           </motion.div>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{t('eliteConcierge')}</h1>
           <p className="text-[10px] font-black text-reva-gold uppercase tracking-[0.4em] mb-8">{t('unifiedInterface')}</p>
           
           <div className="flex flex-wrap justify-center gap-3">
              <SuggestionChip text={t('bestDeadSea')} onClick={(t) => setInput(t)} />
              <SuggestionChip text={t('wadiRumActivities')} onClick={(t) => setInput(t)} />
              <SuggestionChip text={t('luxuryTripPlan')} onClick={(t) => setInput(t)} />
           </div>
        </header>

        {/* Chat Interface Container */}
        <div className="flex-grow flex flex-col bg-white dark:bg-reva-900 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden relative">
           
           {/* Messages Area */}
           <div className="flex-grow overflow-y-auto p-6 md:p-12 space-y-10 scrollbar-hide">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-8 rounded-[2.5rem] relative leading-relaxed text-base shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-reva-gold text-reva-900 font-bold rounded-tr-none' 
                      : 'bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-gray-100 rounded-tl-none font-arabic'
                  }`}>
                    <div className="whitespace-pre-wrap leading-loose">
                      {msg.text}
                    </div>
                    
                    {msg.grounding && msg.grounding.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                        <div className="flex items-center gap-2 text-reva-gold text-[9px] font-black uppercase tracking-widest">
                           <Search size={12} /> {t('verifiedSources')}
                        </div>
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
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-reva-gold hover:text-reva-gold transition-all"
                              >
                                <ExternalLink size={12} /> {web.title || "External Source"}
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
                   <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 border border-slate-200/50 dark:border-white/10 shadow-sm">
                      <div className="relative">
                         <Loader2 className="animate-spin text-reva-gold" size={28} />
                         <div className="absolute inset-0 bg-reva-gold/20 blur-xl animate-pulse" />
                      </div>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{t('consultingIntelligence')}</span>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-8 md:p-12 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-reva-950/50">
              <div className="relative max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('askConcierge')}
                  className="w-full bg-white dark:bg-reva-900 text-slate-900 dark:text-white rounded-[2.5rem] pl-8 pr-20 py-6 text-base font-medium focus:outline-none ring-1 ring-slate-200 dark:ring-white/10 focus:ring-4 focus:ring-reva-gold/20 transition-all shadow-xl"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-14 h-14 bg-reva-gold rounded-full text-reva-900 hover:brightness-110 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center`}
                >
                  <Send size={24} className={language === 'ar' ? 'rotate-180' : ''} />
                </motion.button>
              </div>
              <div className="mt-6 text-center">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <Sparkles size={12} className="text-reva-gold" /> {t('systemStatusOperational')}
                 </p>
              </div>
           </div>
        </div>

        <div className="py-12 flex justify-center gap-8">
           <InfoItem icon={<HelpCircle size={16} />} text={t('available247')} />
           <InfoItem icon={<Shield size={16} />} text={t('privateEncryption')} />
           <InfoItem icon={<Globe size={16} />} text={t('multilingualSupport')} />
        </div>
      </div>
    </div>
  );
};

const SuggestionChip = ({ text, onClick }: { text: string, onClick: (t: string) => void }) => (
  <button 
    onClick={() => onClick(text)}
    className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[11px] font-black text-slate-500 dark:text-slate-400 hover:text-reva-gold hover:border-reva-gold/40 transition-all uppercase tracking-widest shadow-sm"
  >
    {text}
  </button>
);

const InfoItem = ({ icon, text }: { icon: any, text: string }) => (
  <div className="flex items-center gap-2 text-slate-400">
     <div className="text-reva-gold">{icon}</div>
     <span className="text-[9px] font-black uppercase tracking-widest">{text}</span>
  </div>
);

export default Concierge;
