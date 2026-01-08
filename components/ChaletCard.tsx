
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Star, Bed, ArrowUpRight, Crown } from 'lucide-react';
import { Chalet } from '../types';

interface ChaletCardProps {
  chalet: Chalet;
  index: number;
  t: (key: string) => string;
  navigate: (path: string) => void;
}

const ChaletCard: React.FC<ChaletCardProps> = ({ chalet, index, t, navigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group cursor-pointer relative p-3 rounded-[3.5rem] transition-all duration-700 hover:bg-white dark:hover:bg-reva-900/30 border border-transparent hover:border-slate-200 dark:hover:border-reva-gold/20 shadow-none hover:shadow-2xl"
      onClick={() => navigate(`/chalets/${chalet._id}`)}
    >
      {/* Immersive Image Container */}
      <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl premium-shadow ring-1 ring-slate-200 dark:ring-white/5">
        <motion.img 
          src={chalet.imageUrl} 
          alt={chalet.name} 
          className="w-full h-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-110"
        />
        
        {/* Dynamic Overlays: Deeper in dark mode */}
        <div className="absolute inset-0 bg-gradient-to-t from-reva-950 via-reva-950/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-700" />
        
        {/* Elite Badge */}
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-reva-950/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
           <Crown size={12} className="text-reva-gold" />
           <span className="text-[8px] font-black text-white uppercase tracking-widest">Elite Registry</span>
        </div>

        {/* Focus Data: Price */}
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between translate-y-4 group-hover:translate-y-0 transition-all duration-700">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-reva-gold uppercase tracking-[0.3em] drop-shadow-md">Signature Yield</p>
              <p className="text-5xl font-black text-white tracking-tighter transition-all duration-500 group-hover:text-reva-gold group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]">
                {chalet.pricePerNight} <span className="text-sm font-light text-white/60">JD</span>
              </p>
           </div>
           <motion.div 
             whileHover={{ scale: 1.1 }}
             className="w-14 h-14 bg-reva-gold rounded-[1.25rem] flex items-center justify-center text-reva-900 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"
           >
              <ArrowUpRight size={28} strokeWidth={3} />
           </motion.div>
        </div>
      </div>

      {/* Context Info: Adjusted for dark mode consistency */}
      <div className="space-y-4 px-4 pb-4">
        <div className="flex justify-between items-start gap-4">
           <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors group-hover:text-reva-gold leading-none">
             {chalet.name}
           </h3>
           <div className="flex items-center gap-1.5 px-3 py-1 bg-reva-gold/10 dark:bg-reva-gold/5 rounded-full border border-reva-gold/20 shrink-0">
              <Star size={12} className="fill-reva-gold text-reva-gold" />
              <span className="text-xs font-black text-reva-gold">{chalet.rating}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-[0.25em]">
            <MapPin size={14} className="text-reva-gold mr-2 shrink-0" />
            {chalet.location}
          </div>
          
          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-white/10 pl-6">
             <div className="flex items-center gap-2">
                <Users size={12} className="text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{chalet.maxGuests}</span>
             </div>
             <div className="flex items-center gap-2">
                <Bed size={12} className="text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{chalet.bedrooms}</span>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChaletCard;
