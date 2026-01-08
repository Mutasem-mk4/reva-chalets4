
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { Search, MapPin, ChevronDown, Sparkles, Navigation, ArrowUpRight, MousePointer2, Crown, Shield } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import ChaletCard from '../components/ChaletCard';
import { dataService, LANDMARKS } from '../services/dataService';
import { Chalet } from '../types';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chalets, setChalets] = useState<Chalet[]>([]);
  const { t } = useApp();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Interactive Mouse Effect
  const mouseX = useSpring(0, { stiffness: 100, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.05]);

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
    <div className="flex flex-col gap-0 pb-16 overflow-hidden bg-slate-50 dark:bg-reva-950">
      {/* Immersive Hero Section with Liquid Glow Animation */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        
        {/* Interactive Ambient Glow */}
        <motion.div 
          style={{ x: mouseX, y: mouseY }}
          className="fixed w-[600px] h-[600px] bg-reva-gold/10 rounded-full blur-[120px] pointer-events-none z-[1] -translate-x-1/2 -translate-y-1/2 hidden lg:block"
        />

        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=2070&auto=format&fit=crop" 
            alt="Jordan Landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-reva-950/90 via-reva-950/40 to-reva-950" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 md:px-6 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <motion.div 
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="inline-flex items-center gap-3 py-1.5 px-6 md:px-8 rounded-full border border-white/20 text-white/70 text-[9px] md:text-[10px] font-black tracking-[0.4em] mb-6 md:mb-10 uppercase"
            >
              <Sparkles size={12} className="text-reva-gold" />
              {t('exclusivelyJordanian')}
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[11rem] font-black text-white tracking-tighter leading-[0.9] mb-8 md:mb-14 drop-shadow-2xl">
              {t('findPeace')}
            </h1>
            
            <p className="text-sm md:text-lg lg:text-xl text-slate-300 mb-12 md:mb-20 max-w-2xl mx-auto font-light leading-relaxed px-4">
              {t('heroText')}
            </p>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-white/10 backdrop-blur-3xl border border-white/10 p-3 md:p-2.5 rounded-[2.5rem] md:rounded-[3.5rem] max-w-3xl mx-auto flex flex-col md:flex-row gap-4 md:gap-3 shadow-2xl premium-shadow"
            >
              <div className="flex-1 flex items-center px-6 md:px-10 bg-reva-900/60 rounded-[1.8rem] md:rounded-[2.8rem] h-20 md:h-22 border border-white/5 hover:border-reva-gold/30 focus-within:border-reva-gold/50 transition-all relative group shadow-inner">
                <Navigation className="text-reva-gold group-hover:scale-110 transition-transform mr-4 shrink-0" size={22} />
                <div className="flex-1 flex flex-col items-start">
                  <span className="text-[9px] font-black text-reva-gold/60 uppercase tracking-widest mb-0.5 ml-1">{t('destination')}</span>
                  <select
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-white w-full text-sm md:text-base appearance-none cursor-pointer font-bold uppercase tracking-[0.1em] truncate placeholder:text-slate-500"
                  >
                    <option value="" className="bg-reva-900 text-slate-500">{t('whereToDiscover')}</option>
                    {Object.keys(LANDMARKS).map(loc => (
                      <option key={loc} value={loc} className="bg-reva-900">{loc.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <ChevronDown className="ml-4 text-reva-gold/40 group-hover:text-reva-gold transition-colors" size={18} />
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: '#eab308' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="w-full md:w-auto h-20 md:h-22 px-12 md:px-16 bg-reva-gold text-reva-900 font-black rounded-[1.8rem] md:rounded-[2.8rem] transition-all flex items-center justify-center gap-4 text-sm md:text-base tracking-[0.2em] uppercase shadow-xl shadow-reva-gold/20"
              >
                <Search size={22} strokeWidth={3} />
                {t('explore')}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 hidden sm:flex"
        >
          <div className="w-px h-10 md:h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
          <span className="text-[9px] font-black tracking-widest uppercase">{t('scroll')}</span>
        </motion.div>
      </section>

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 w-full py-20 md:py-40">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 md:mb-32 gap-6 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-8 md:w-12 bg-reva-gold" />
              <span className="text-reva-gold text-[9px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] uppercase">{t('featuredSelection')}</span>
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{t('eliteRegistry')}</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 pt-4 lg:pt-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={handleDiscoverElite}
              className="group flex items-center gap-3 md:gap-4 bg-reva-gold text-reva-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-reva-gold/20"
            >
              <Crown size={18} /> {t('discoverElite')} <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </motion.button>

            <motion.button 
              whileHover={{ x: 10 }}
              onClick={() => navigate('/chalets')}
              className="group flex items-center gap-3 md:gap-4 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] md:text-xs"
            >
              {t('viewEntireCatalog')} <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
          {chalets.map((chalet, index) => (
            <ChaletCard key={chalet._id} chalet={chalet} index={index} t={t} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 md:py-40 bg-white/5 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
          <FeatureBlock 
            title={t('vettedSecurity')} 
            desc={t('vettedSecurityDesc')} 
            icon={<Shield size={24} />} 
          />
          <FeatureBlock 
            title={t('conciergeAI')} 
            desc={t('conciergeAIDesc')} 
            icon={<Navigation size={24} />} 
          />
          <FeatureBlock 
            title={t('pureLuxury')} 
            desc={t('pureLuxuryDesc')} 
            icon={<Sparkles size={24} />} 
          />
        </div>
      </section>
    </div>
  );
};

const FeatureBlock = ({ title, desc, icon }: any) => (
  <div className="space-y-4 md:space-y-6 text-center md:text-left">
    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center text-reva-gold mx-auto md:mx-0">{icon}</div>
    <h3 className="text-lg md:text-xl font-black text-white tracking-tighter uppercase">{title}</h3>
    <p className="text-slate-400 font-light leading-relaxed text-xs md:text-sm">{desc}</p>
  </div>
);

export default Home;
