import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, Sparkles, Navigation, ArrowUpRight, Crown, Shield, Globe, MousePointer2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import ChaletCard from '../components/ChaletCard';
import { dataService, LANDMARKS } from '../services/dataService';
import { Chalet } from '../types';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chalets, setChalets] = useState<Chalet[]>([]);
  const { t, language } = useApp();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Interactive Mouse Effect
  const mouseX = useSpring(0, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 1000], [1, 1.15]);
  const blurValue = useTransform(scrollY, [0, 400], [0, 10]);

  useEffect(() => {
    const loadFeatured = async () => {
      const data = await dataService.findChalets({ status: 'APPROVED' });
      setChalets(data.slice(0, 3));
    };
    loadFeatured();
  }, []);

  const handleSearch = () => {
    navigate('/chalets', { state: { initialSearch: searchTerm } });
  };

  const handleDiscoverElite = () => {
    navigate('/chalets', { state: { luxuryTier: 'Elite' } });
  };

  return (
    <div className="flex flex-col gap-0 pb-16 overflow-hidden bg-slate-50 dark:bg-reva-950 transition-colors duration-1000">
      {/* Immersive Hero Section */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        
        {/* Interactive Ambient Glow (Live Animation) */}
        <motion.div 
          style={{ 
            x: mouseX, 
            y: mouseY,
          }}
          className="fixed w-[800px] h-[800px] bg-reva-gold/5 rounded-full blur-[140px] pointer-events-none z-[1] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        />

        <motion.div 
          style={{ y: heroY, scale: heroScale, filter: `blur(${blurValue}px)` }} 
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=2070&auto=format&fit=crop" 
            alt="Jordan Landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-reva-950/80 via-reva-950/30 to-reva-950" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 md:px-6 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              animate={{ 
                opacity: [0.4, 0.9, 0.4],
                boxShadow: ["0 0 0px #d4af37", "0 0 30px #d4af37", "0 0 0px #d4af37"]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-flex items-center gap-3 py-2 px-8 rounded-full border border-white/20 text-white/90 text-[10px] font-black tracking-[0.5em] mb-12 uppercase bg-white/5 backdrop-blur-md"
            >
              <Sparkles size={14} className="text-reva-gold animate-pulse" />
              {t('exclusivelyJordanian')}
            </motion.div>
            
            <motion.h1 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="text-6xl sm:text-8xl md:text-9xl lg:text-[13rem] font-black text-white tracking-tighter leading-[0.8] mb-12 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {t('findPeace')}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-base md:text-xl lg:text-2xl text-slate-300 mb-16 max-w-2xl mx-auto font-light leading-relaxed px-4 text-glow"
            >
              {t('heroText')}
            </motion.p>

            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="bg-white/5 backdrop-blur-3xl border border-white/10 p-3 rounded-[3rem] md:rounded-[4rem] max-w-3xl mx-auto flex flex-col md:flex-row gap-4 shadow-[0_40px_100px_rgba(0,0,0,0.4)]"
            >
              <div className="flex-1 flex items-center px-8 bg-reva-900/40 rounded-[2.2rem] h-20 md:h-24 border border-white/5 hover:border-reva-gold/40 focus-within:border-reva-gold/60 transition-all group relative">
                <Navigation className="text-reva-gold group-hover:rotate-45 transition-transform duration-500 mr-4 shrink-0" size={24} />
                <div className="flex-1 flex flex-col items-start">
                  <span className="text-[9px] font-black text-reva-gold/70 uppercase tracking-widest mb-1 ml-1">{t('destination')}</span>
                  <select
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white w-full text-sm md:text-base appearance-none cursor-pointer font-bold uppercase tracking-[0.15em] truncate placeholder:text-slate-500"
                  >
                    <option value="" className="bg-reva-900 text-slate-500">{t('whereToDiscover')}</option>
                    {Object.keys(LANDMARKS).map(loc => (
                      <option key={loc} value={loc} className="bg-reva-900">{loc.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <ChevronDown className="ml-4 text-reva-gold/30 group-hover:translate-y-1 transition-all" size={20} />
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: '#eab308' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="w-full md:w-auto h-20 md:h-24 px-16 bg-reva-gold text-reva-900 font-black rounded-[2.2rem] transition-all flex items-center justify-center gap-4 text-sm md:text-base tracking-[0.3em] uppercase shadow-[0_15px_40px_rgba(212,175,55,0.3)]"
              >
                <Search size={24} strokeWidth={3} />
                {t('explore')}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-40"
        >
          <div className="w-[2px] h-24 bg-gradient-to-b from-transparent via-reva-gold to-transparent" />
          <span className="text-[10px] font-black tracking-[0.5em] uppercase text-white">{t('scroll')}</span>
        </motion.div>
      </section>

      {/* Featured Collection Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 w-full py-32 md:py-48">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 md:mb-40 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-6">
              <div className="h-[2px] w-16 bg-reva-gold" />
              <span className="text-reva-gold text-[10px] md:text-[11px] font-black tracking-[0.5em] uppercase">{t('featuredSelection')}</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{t('eliteRegistry')}</h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 pt-6 lg:pt-0"
          >
            <motion.button 
              whileHover={{ scale: 1.05, x: 5 }}
              onClick={handleDiscoverElite}
              className="group flex items-center gap-4 bg-reva-gold text-reva-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-[0_20px_40px_rgba(212,175,55,0.2)]"
            >
              <Crown size={20} /> {t('discoverElite')} <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </motion.button>

            <motion.button 
              whileHover={{ x: 10, color: '#d4af37' }}
              onClick={() => navigate('/chalets')}
              className="group flex items-center gap-4 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs transition-colors"
            >
              {t('viewEntireCatalog')} <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20">
          {chalets.map((chalet, index) => (
            <ChaletCard key={chalet._id} chalet={chalet} index={index} t={t} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* Philosophy Section with Background Animation */}
      <section className="py-32 md:py-56 bg-white/5 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
           <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-reva-gold/20 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-reva-emerald/10 rounded-full blur-[120px] animate-float" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
            <FeatureBlock 
              title={t('vettedSecurity')} 
              desc={t('vettedSecurityDesc')} 
              icon={<Shield size={32} />} 
              delay={0.1}
            />
            <FeatureBlock 
              title={t('conciergeAI')} 
              desc={t('conciergeAIDesc')} 
              icon={<Navigation size={32} />} 
              delay={0.3}
            />
            <FeatureBlock 
              title={t('pureLuxury')} 
              desc={t('pureLuxuryDesc')} 
              icon={<Sparkles size={32} />} 
              delay={0.5}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureBlock = ({ title, desc, icon, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="space-y-8 text-center md:text-left group"
  >
    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-reva-gold mx-auto md:mx-0 shadow-inner group-hover:scale-110 transition-transform duration-500 border border-white/5 group-hover:border-reva-gold/40">
      {icon}
    </div>
    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase group-hover:text-reva-gold transition-colors">{title}</h3>
    <p className="text-slate-400 font-light leading-relaxed text-sm md:text-base">{desc}</p>
  </motion.div>
);

export default Home;