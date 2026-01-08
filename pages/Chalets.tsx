
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, Loader2, Sparkles, Crown } from 'lucide-react';
import ChaletCard from '../components/ChaletCard';
import { dataService, LANDMARKS } from '../services/dataService';
import { Chalet } from '../types';
import { useApp } from '../contexts/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ChaletsPage: React.FC = () => {
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [chalets, setChalets] = useState<Chalet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');

  // Initial load from Data Service
  useEffect(() => {
    const fetchChalets = async () => {
      setIsLoading(true);
      try {
        const data = await dataService.getChalets(true);
        setChalets(data);
      } catch (error) {
        console.error("Failed to fetch chalets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChalets();
  }, []);

  // Handle incoming search/filter state
  useEffect(() => {
    const state = location.state as any;
    if (state) {
      if (state.initialSearch) {
        const initialSearch = state.initialSearch;
        const commonLocations = Object.keys(LANDMARKS);
        if (commonLocations.some(loc => initialSearch.toLowerCase().includes(loc.toLowerCase()))) {
          setLocationFilter(initialSearch);
        } else {
          setSearchTerm(initialSearch);
        }
      }
      if (state.luxuryTier) {
        setTierFilter(state.luxuryTier);
      }
      // Clear state after handling to prevent re-filtering on unrelated re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredChalets = chalets.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter ? c.location.toLowerCase().includes(locationFilter.toLowerCase()) : true;
    const matchesTier = tierFilter ? c.luxuryTier === tierFilter : true;
    return matchesSearch && matchesLocation && matchesTier;
  });

  return (
    <div className="pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="text-center md:text-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4 justify-center md:justify-start"
          >
            <Sparkles className="text-reva-gold" size={20} />
            <span className="text-reva-gold text-[10px] font-black tracking-[0.4em] uppercase">The Elite Collection</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter"
          >
            ALL <span className="text-reva-gold">CHALETS</span>
          </motion.h1>
        </div>
        
        <motion.p 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-slate-500 dark:text-gray-400 text-lg max-w-md font-medium text-center md:text-right"
        >
          {t('collectionSub')}
        </motion.p>
      </div>

      {/* Advanced Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-reva-800/80 backdrop-blur-3xl p-3 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/10 mb-16 flex flex-col md:flex-row gap-3 items-center sticky top-24 z-40"
      >
        <div className="flex-[2] w-full relative group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-reva-gold transition-colors" size={20} />
           <input 
             type="text" 
             placeholder="Search by name or experience..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-50 dark:bg-reva-900/50 border border-transparent focus:border-reva-gold/30 pl-16 pr-6 py-5 rounded-[2rem] text-slate-900 dark:text-white focus:outline-none transition-all font-bold"
           />
        </div>
        
        <div className="w-full md:w-auto min-w-[200px] relative group">
           <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-reva-gold transition-colors" size={20} />
           <select 
             value={locationFilter}
             onChange={(e) => setLocationFilter(e.target.value)}
             className="w-full bg-slate-50 dark:bg-reva-900/50 border border-transparent focus:border-reva-gold/30 pl-16 pr-10 py-5 rounded-[2rem] text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none transition-all font-bold uppercase tracking-widest text-xs"
           >
             <option value="">All Territories</option>
             {Object.keys(LANDMARKS).map(loc => (
               <option key={loc} value={loc}>{loc}</option>
             ))}
           </select>
           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>

        <div className="w-full md:w-auto min-w-[180px] relative group">
           <Crown className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-reva-gold transition-colors" size={20} />
           <select 
             value={tierFilter}
             onChange={(e) => setTierFilter(e.target.value)}
             className="w-full bg-slate-50 dark:bg-reva-900/50 border border-transparent focus:border-reva-gold/30 pl-16 pr-10 py-5 rounded-[2rem] text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none transition-all font-bold uppercase tracking-widest text-xs"
           >
             <option value="">All Tiers</option>
             <option value="Elite">Elite Only</option>
             <option value="Premium">Premium</option>
             <option value="Standard">Standard</option>
           </select>
           <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-100 dark:bg-reva-800/50 rounded-[3.5rem] h-[500px] animate-pulse-slow border border-white/5" />
            ))}
          </div>
        ) : filteredChalets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {filteredChalets.map((chalet, index) => (
                <ChaletCard key={chalet._id} chalet={chalet} index={index} t={t} navigate={navigate} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400">
               <Search size={40} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">No Sanctuaries Found</p>
              <p className="text-slate-500 font-medium">Try broadening your search criteria or explore a different territory.</p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setLocationFilter(''); setTierFilter(''); }}
              className="px-8 py-4 bg-reva-900 dark:bg-white text-white dark:text-reva-900 font-black rounded-2xl text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-xl"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChaletsPage;
