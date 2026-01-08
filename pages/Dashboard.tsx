
import React, { useEffect, useState, useMemo } from 'react';
import { User, UserRole, Booking, Chalet } from '../types';
import { dataService, LANDMARKS } from '../services/dataService';
import { getOwnerInsights } from '../services/geminiService';
import { 
  TrendingUp, DollarSign, Calendar as CalendarIcon, Home as HomeIcon, CheckCircle, 
  XCircle, Loader2, Users, Shield, Plus, Trash2, Edit3, 
  MapPin, Crown, Save, Zap, Briefcase, 
  Sparkles, ArrowRightLeft, BarChart,
  X, AlertCircle, UserCheck,
  CloudLightning, RefreshCcw, ChevronLeft, ChevronRight, Clock,
  Activity, ArrowUpRight, Filter, ClipboardList, User as UserIcon, Phone, Mail, Map as MapIcon,
  ExternalLink, ArrowRight, Eye, EyeOff, LayoutTemplate, History, Layers, Info, Wallet, PieChart,
  LayoutGrid, List, Search, Archive, Globe, Tag, ExternalLink as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart as ReBarChart, Bar, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { useApp } from '../contexts/AppContext';

interface DashboardProps {
  user: User;
}

type DashboardTab = 'inventory' | 'finance' | 'users' | 'bookings';
type BookingPerspective = 'global' | 'ledger';

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { t, language } = useApp();
  const isOwner = user.role === UserRole.OWNER;
  const isAdmin = user.role === UserRole.ADMIN;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chalets, setChalets] = useState<Chalet[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>(isAdmin ? 'finance' : 'inventory');
  
  // Flux Perspective State
  const [bookingPerspective, setBookingPerspective] = useState<BookingPerspective>('global');
  const [selectedChaletForHistory, setSelectedChaletForHistory] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED' | 'PENDING'>('ALL');

  // Selected Booking Detail (Admin Only)
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);

  // View State
  const [inventoryView, setInventoryView] = useState<'grid' | 'list'>('grid');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingChalet, setEditingChalet] = useState<Partial<Chalet> | null>(null);
  const [chaletToDelete, setChaletToDelete] = useState<Chalet | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user._id, isOwner, isAdmin]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedChalets, fetchedBookings, fetchedUsers] = await Promise.all([
        dataService.getChalets(false),
        dataService.getBookings(),
        isAdmin ? dataService.getUsers() : Promise.resolve([])
      ]);

      const myChalets = isOwner ? fetchedChalets.filter(c => c.ownerId === user._id) : fetchedChalets;
      setChalets(myChalets);

      const relevantBookings = isOwner 
        ? fetchedBookings.filter(b => myChalets.some(c => c._id === b.chaletId)) 
        : fetchedBookings;
      setBookings(relevantBookings);

      if (isAdmin) setAllUsers(fetchedUsers);

      if (isOwner && myChalets.length > 0) {
        const tip = await getOwnerInsights(myChalets);
        setAiTip(tip);
      }
    } catch (error) {
      console.error("Dashboard error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculated Metrics
  const metrics = useMemo(() => {
    const totalEarnings = bookings.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const netPayout = bookings.reduce((acc, curr) => acc + (isOwner ? (curr.netPayout || 0) : (curr.commissionFee || 0)), 0);
    const today = new Date();
    today.setHours(0,0,0,0);
    const activeFlux = bookings.filter(b => b.status !== 'CANCELLED' && new Date(b.checkOut) >= today).length;
    const avgOccupancy = chalets.length > 0 
      ? Math.round(chalets.reduce((acc, c) => acc + (c.occupancyRate || 0), 0) / chalets.length) 
      : 0;

    return { totalEarnings, netPayout, activeFlux, avgOccupancy };
  }, [bookings, chalets, isOwner]);

  const handleToggleUserApproval = async (userId: string, currentStatus: boolean) => {
    await dataService.setUserApproval(userId, !currentStatus);
    loadData();
  };

  const handleApproveAsset = async (id: string) => {
    await dataService.updateChaletStatus(id, 'APPROVED');
    loadData();
  };

  const handleDeleteInitiate = (chalet: Chalet) => {
    setChaletToDelete(chalet);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!chaletToDelete) return;
    setIsDeleting(true);
    try {
      await dataService.deleteChalet(chaletToDelete._id);
      setIsDeleteConfirmOpen(false);
      setChaletToDelete(null);
      setSuccessMsg("Asset Purged from Registry.");
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadData();
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChalet) return;
    
    setIsSaving(true);
    try {
      const assetToSave = {
        ...editingChalet,
        ownerId: editingChalet.ownerId || user._id, 
        status: editingChalet.status || (isAdmin ? 'APPROVED' : 'PENDING'),
        isLive: editingChalet.isLive ?? true
      };
      
      await dataService.saveChalet(assetToSave);
      setIsModalOpen(false);
      setEditingChalet(null);
      setSuccessMsg(editingChalet._id ? "Registry Updated." : "Asset Dispatched.");
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadData();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Ledger Filtered Bookings
  const ledgerBookings = useMemo(() => {
    if (!selectedChaletForHistory) return [];
    return bookings
      .filter(b => b.chaletId === selectedChaletForHistory)
      .filter(b => historyFilter === 'ALL' || b.status === historyFilter)
      .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
  }, [bookings, selectedChaletForHistory, historyFilter]);

  const ledgerStats = useMemo(() => {
    if (!selectedChaletForHistory) return null;
    const chaletBookings = bookings.filter(b => b.chaletId === selectedChaletForHistory);
    const confirmed = chaletBookings.filter(b => b.status === 'CONFIRMED');
    const revenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const cancelledCount = chaletBookings.filter(b => b.status === 'CANCELLED').length;
    const cancelRate = chaletBookings.length > 0 ? (cancelledCount / chaletBookings.length) * 100 : 0;
    
    return {
      total: chaletBookings.length,
      confirmed: confirmed.length,
      revenue,
      cancelRate: cancelRate.toFixed(1)
    };
  }, [bookings, selectedChaletForHistory]);

  // Charts
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => {
      const monthBookings = bookings.filter(b => new Date(b.createdAt).getMonth() === i);
      return {
        name: m,
        revenue: monthBookings.reduce((sum, b) => sum + b.totalPrice, 0),
        payout: monthBookings.reduce((sum, b) => sum + (b.netPayout || 0), 0)
      };
    });
  }, [bookings]);

  // Derive modal info
  const detailChalet = useMemo(() => 
    chalets.find(c => c._id === selectedBookingDetail?.chaletId),
    [chalets, selectedBookingDetail]
  );
  const detailOwner = useMemo(() => 
    allUsers.find(u => u._id === detailChalet?.ownerId),
    [allUsers, detailChalet]
  );
  const detailGuest = useMemo(() => 
    allUsers.find(u => u._id === selectedBookingDetail?.userId),
    [allUsers, selectedBookingDetail]
  );

  const handleNavigateToAsset = () => {
    setSelectedBookingDetail(null);
    setActiveTab('inventory');
    // In a real app we might scroll to the element or highlight it
  };

  if (isLoading && chalets.length === 0 && allUsers.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border-4 border-reva-gold border-t-transparent rounded-full" />
          <Zap className="absolute inset-0 m-auto text-reva-gold animate-pulse" size={32} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-reva-gold animate-pulse">Synchronizing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-reva-950 transition-colors duration-1000">
      {/* Toast Overlay */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-reva-emerald text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-2xl flex items-center gap-3 border border-white/20">
            <CloudLightning size={18} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
        {/* Header Section with Live Flux indicator */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-reva-emerald/10 border border-reva-emerald/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-reva-emerald animate-pulse" />
                <span className="text-[9px] font-black text-reva-emerald uppercase tracking-widest">{t('liveFluxActive')}</span>
              </div>
              <div className="px-4 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.role} {t('authority')}</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              {t('commandCenter').split('.')[0]}<br/><span className="text-reva-gold">Center.</span>
            </h1>
          </div>

          {/* Persistent Navigation */}
          <div className="flex bg-white dark:bg-reva-900 p-2 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-x-auto w-full lg:w-auto scrollbar-hide">
             <SectionTab active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet size={18} />} label={t('capital')} />
             <SectionTab active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<LayoutGrid size={18} />} label={t('registry')} />
             <SectionTab active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<ClipboardList size={18} />} label={t('flux')} />
             {isAdmin && <SectionTab active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Shield size={18} />} label={t('identities')} />}
          </div>
        </div>

        {/* Dynamic Content Sections */}
        <AnimatePresence mode="wait">
          {/* 1. FINANCIAL OVERVIEW SECTION */}
          {activeTab === 'finance' && (
            <motion.div key="finance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard title={isOwner ? t('totalEarnings') : t('systemGMV')} value={`${metrics.totalEarnings.toLocaleString()} JD`} trend="+12%" icon={<DollarSign size={24} />} color="text-reva-gold" />
                  <MetricCard title={isOwner ? t('netPayout') : t('systemCommission')} value={`${metrics.netPayout.toLocaleString()} JD`} trend="+8.4%" icon={<TrendingUp size={24} />} color="text-reva-emerald" />
                  <MetricCard title={t('activeFlux')} value={metrics.activeFlux} icon={<ArrowRightLeft size={24} />} color="text-blue-500" />
                  <MetricCard title={t('registryYield')} value={`${metrics.avgOccupancy}%`} icon={<PieChart size={24} />} color="text-amber-500" />
               </div>

               {isOwner && aiTip && (
                 <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-reva-gold/10 border border-reva-gold/20 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-10 shadow-inner relative overflow-hidden group">
                   <div className="absolute -right-20 -top-20 w-64 h-64 bg-reva-gold/5 rounded-full blur-3xl group-hover:bg-reva-gold/10 transition-all duration-1000" />
                   <div className="w-20 h-20 bg-reva-gold rounded-3xl flex items-center justify-center text-reva-900 shrink-0 shadow-2xl relative">
                     <Sparkles size={36} className="animate-float" />
                   </div>
                   <div className="relative">
                      <p className="text-[11px] font-black text-reva-gold uppercase tracking-[0.4em] mb-3">Gemini Core Strategic Analysis</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-gray-100 font-arabic leading-relaxed rtl">{aiTip}</p>
                   </div>
                 </motion.div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white dark:bg-reva-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-2xl">
                     <div className="flex justify-between items-center mb-16">
                        <div>
                           <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                              <TrendingUp className="text-reva-gold" size={20} /> {t('capitalVelocity')}
                           </h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('realTimePerformance')}</p>
                        </div>
                     </div>
                     <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', fontSize: '10px', color: '#fff' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#d4af37" fillOpacity={1} fill="url(#colorRev)" strokeWidth={5} />
                            <Area type="monotone" dataKey="payout" stroke="#10b981" fillOpacity={1} fill="url(#colorPay)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-reva-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-2xl flex flex-col">
                     <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-12 flex items-center gap-3">
                        <MapIcon className="text-reva-gold" size={20} /> {t('territorySaturation')}
                     </h3>
                     <div className="flex-grow flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                           <RePieChart>
                              <Pie
                                 data={LANDMARKS ? Object.keys(LANDMARKS).map(l => ({ name: l, value: chalets.filter(c => c.location === l).length })) : []}
                                 cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value"
                              >
                                 {Object.keys(LANDMARKS).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#d4af37', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index % 5]} />
                                 ))}
                              </Pie>
                              <Tooltip />
                           </RePieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* 2. INVENTORY MANAGEMENT SECTION */}
          {activeTab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white dark:bg-reva-900/40 p-10 rounded-[3.5rem] border border-white/5 shadow-xl">
                  <div className="flex items-center gap-8 w-full md:w-auto">
                     <div className="flex items-center gap-3 bg-slate-100 dark:bg-reva-950 p-1.5 rounded-2xl border border-white/5">
                        <button onClick={() => setInventoryView('grid')} className={`p-3 rounded-xl transition-all ${inventoryView === 'grid' ? 'bg-reva-gold text-reva-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}><LayoutGrid size={18} /></button>
                        <button onClick={() => setInventoryView('list')} className={`p-3 rounded-xl transition-all ${inventoryView === 'list' ? 'bg-reva-gold text-reva-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}><List size={18} /></button>
                     </div>
                     <div className="h-10 w-px bg-white/10 hidden md:block" />
                     <div className="flex-1 md:flex-initial relative group">
                        <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-reva-gold transition-colors`} size={16} />
                        <input type="text" placeholder={t('searchRegistry')} className={`bg-slate-100 dark:bg-reva-950 border border-transparent focus:border-reva-gold/30 ${language === 'ar' ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-4 rounded-2xl text-xs font-bold focus:outline-none transition-all w-full md:w-64`} />
                     </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setEditingChalet({}); setIsModalOpen(true); }}
                    className="w-full md:w-auto bg-reva-gold text-reva-900 font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl shadow-reva-gold/30 text-xs tracking-[0.2em] uppercase"
                  >
                    <Plus size={20} strokeWidth={3} /> {t('dispatchNewAsset')}
                  </motion.button>
               </div>

               <AnimatePresence mode="popLayout">
                  <motion.div layout className={`grid gap-8 ${inventoryView === 'grid' ? 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {chalets.map(c => (
                      <InventoryAssetCard 
                        key={c._id} 
                        chalet={c} 
                        isAdmin={isAdmin} 
                        view={inventoryView} 
                        t={t}
                        onEdit={() => { setEditingChalet(c); setIsModalOpen(true); }} 
                        onApprove={() => handleApproveAsset(c._id)} 
                        onDelete={() => handleDeleteInitiate(c)} 
                      />
                    ))}
                  </motion.div>
               </AnimatePresence>
            </motion.div>
          )}

          {/* 3. RESERVATIONS (FLUX) SECTION */}
          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="flex flex-col lg:flex-row justify-between items-center bg-white dark:bg-reva-900/40 p-10 rounded-[3rem] border border-white/5 shadow-xl gap-8">
                  <div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('flux')}</h2>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">Active Transaction Command</p>
                  </div>
                  <div className="flex gap-4 p-2 bg-slate-50 dark:bg-reva-950 rounded-[2rem] border border-white/5">
                    <button 
                      onClick={() => setBookingPerspective('global')}
                      className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${bookingPerspective === 'global' ? 'bg-reva-gold text-reva-900 shadow-xl' : 'text-slate-500'}`}
                    >
                      <Globe size={18} /> {t('globalFlux')}
                    </button>
                    <button 
                      onClick={() => setBookingPerspective('ledger')}
                      className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${bookingPerspective === 'ledger' ? 'bg-reva-gold text-reva-900 shadow-xl' : 'text-slate-500'}`}
                    >
                      <Archive size={18} /> {t('assetLedger').split(' ')[0]}
                    </button>
                  </div>
               </div>

               <AnimatePresence mode="wait">
                 {bookingPerspective === 'global' ? (
                    <motion.div 
                      key="global-flux"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-white dark:bg-reva-900 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-reva-950/50">
                              <tr>
                                <th className="p-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Guest Node</th>
                                <th className="p-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Asset Reference</th>
                                <th className="p-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Window</th>
                                <th className={`p-10 text-[11px] font-black text-slate-400 uppercase tracking-widest ${language === 'ar' ? 'text-left' : 'text-right'}`}>Capital</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {bookings.map(b => {
                                const chalet = chalets.find(c => c._id === b.chaletId);
                                return (
                                  <tr 
                                    key={b._id} 
                                    onClick={() => isAdmin && setSelectedBookingDetail(b)}
                                    className={`transition-colors group ${isAdmin ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5' : ''}`}
                                  >
                                    <td className="p-10">
                                        <p className="font-black text-slate-900 dark:text-white uppercase text-sm mb-1">{b.guestName}</p>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UID: {b.userId.slice(0, 6)}</p>
                                    </td>
                                    <td className="p-10">
                                        <p className="font-black text-slate-900 dark:text-white uppercase text-sm mb-1">{chalet?.name || t('unknown')}</p>
                                        <p className="text-[9px] font-black text-reva-gold uppercase tracking-widest">{chalet?.location}</p>
                                    </td>
                                    <td className="p-10 text-[11px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">
                                        {b.checkIn} — {b.checkOut}
                                    </td>
                                    <td className={`p-10 font-black text-slate-900 dark:text-white text-base ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                                        {b.totalPrice} JD
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                 ) : (
                    <motion.div 
                      key="asset-ledger"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                    >
                      {/* Asset Selection Panel */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white dark:bg-reva-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                           <div className="flex items-center justify-between mb-8">
                             <h3 className="text-[10px] font-black text-reva-gold uppercase tracking-[0.4em]">{t('registryInventory')}</h3>
                             <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                               <Layers size={14} className="text-reva-gold" />
                               <span className="text-[9px] font-black text-white">{chalets.length}</span>
                             </div>
                           </div>
                           <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                              {chalets.map(c => (
                                <button 
                                  key={c._id}
                                  onClick={() => setSelectedChaletForHistory(c._id)}
                                  className={`w-full p-6 rounded-2xl flex items-center gap-5 transition-all text-left group ${selectedChaletForHistory === c._id ? 'bg-reva-gold text-reva-900 shadow-xl scale-[1.02]' : 'bg-slate-50 dark:bg-reva-950 border border-white/5 hover:border-reva-gold/30'}`}
                                >
                                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/10">
                                    <img src={c.imageUrl} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-grow overflow-hidden">
                                     <p className="font-black uppercase text-[11px] truncate tracking-tighter">{c.name}</p>
                                     <p className={`text-[9px] font-black uppercase tracking-widest ${selectedChaletForHistory === c._id ? 'text-reva-900/60' : 'text-slate-400'}`}>{c.location}</p>
                                  </div>
                                  <ChevronRight size={18} className={`${language === 'ar' ? 'rotate-180' : ''} ${selectedChaletForHistory === c._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} transition-opacity`} />
                                </button>
                              ))}
                           </div>
                        </div>
                      </div>

                      {/* Ledger History View */}
                      <div className="lg:col-span-8">
                         <div className="bg-white dark:bg-reva-900 p-10 md:p-14 rounded-[3.5rem] border border-white/5 shadow-2xl min-h-[500px] flex flex-col">
                            {selectedChaletForHistory ? (
                              <div className="space-y-12 flex-grow">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-10 gap-6">
                                   <div>
                                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('assetLedger')}</h3>
                                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">{t('historicalAudit')}</p>
                                   </div>
                                   <div className="flex flex-wrap gap-2">
                                     {(['ALL', 'CONFIRMED', 'CANCELLED', 'PENDING'] as const).map(f => (
                                       <button 
                                        key={f}
                                        onClick={() => setHistoryFilter(f)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${historyFilter === f ? 'bg-reva-gold text-reva-900 border-reva-gold shadow-lg shadow-reva-gold/20' : 'bg-white dark:bg-reva-950/50 border-white/5 text-slate-500 hover:text-white'}`}
                                       >
                                         {f}
                                       </button>
                                     ))}
                                   </div>
                                </div>

                                {/* Summary Statistics for the Selected Chalet */}
                                {ledgerStats && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     <div className="bg-slate-50 dark:bg-reva-950/50 p-6 rounded-3xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('totalVolume')}</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{ledgerStats.total} {t('nodes')}</p>
                                     </div>
                                     <div className="bg-slate-50 dark:bg-reva-950/50 p-6 rounded-3xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('successRate')}</p>
                                        <p className="text-xl font-black text-reva-emerald uppercase tracking-tighter">{ledgerStats.confirmed} {t('active')}</p>
                                     </div>
                                     <div className="bg-slate-50 dark:bg-reva-950/50 p-6 rounded-3xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('totalEarnings')}</p>
                                        <p className="text-xl font-black text-reva-gold uppercase tracking-tighter">{ledgerStats.revenue.toLocaleString()} JD</p>
                                     </div>
                                     <div className="bg-slate-50 dark:bg-reva-950/50 p-6 rounded-3xl border border-white/5">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('cancelIndex')}</p>
                                        <p className="text-xl font-black text-red-500 uppercase tracking-tighter">{ledgerStats.cancelRate}%</p>
                                     </div>
                                  </div>
                                )}

                                <div className="space-y-4">
                                   {ledgerBookings.map((b, idx) => (
                                     <motion.div 
                                      key={b._id}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="p-8 bg-slate-50 dark:bg-reva-950/50 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-reva-gold/20 transition-all group"
                                     >
                                        <div className="flex items-center gap-6">
                                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110 ${b.status === 'CONFIRMED' ? 'bg-reva-emerald' : b.status === 'CANCELLED' ? 'bg-red-500' : 'bg-reva-gold'}`}>
                                              {b.status === 'CONFIRMED' ? <CheckCircle size={24}/> : b.status === 'CANCELLED' ? <XCircle size={24}/> : <Clock size={24}/>}
                                           </div>
                                           <div>
                                              <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${b.status === 'CONFIRMED' ? 'text-reva-emerald' : b.status === 'CANCELLED' ? 'text-red-500' : 'text-reva-gold'}`}>
                                                  {b.status}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REF: {b._id.slice(0, 8)}</span>
                                              </div>
                                              <p className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{b.guestName}</p>
                                              <p className="text-[11px] font-medium text-slate-500">{b.checkIn} — {b.checkOut}</p>
                                           </div>
                                        </div>
                                        <div className={`w-full md:w-auto ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('nodeValue')}</p>
                                           <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{b.totalPrice} JD</p>
                                           <div className={`flex items-center gap-2 mt-1 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                                             <div className={`w-1.5 h-1.5 rounded-full ${b.paymentStatus === 'PAID' ? 'bg-reva-emerald' : 'bg-reva-gold'}`} />
                                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{b.paymentStatus} STATE</p>
                                           </div>
                                        </div>
                                     </motion.div>
                                   ))}
                                   {ledgerBookings.length === 0 && (
                                     <div className="py-24 text-center space-y-6">
                                        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 dark:text-white/10 mx-auto">
                                           <History size={32} />
                                        </div>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No matching transaction records found for this asset node.</p>
                                     </div>
                                   )}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center gap-8 py-20 text-center flex-grow">
                                 <div className="relative">
                                   <div className="absolute inset-0 bg-reva-gold/20 blur-3xl rounded-full" />
                                   <div className="relative w-28 h-28 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 dark:text-white/10 shadow-inner">
                                      <Archive size={48} className="animate-float" />
                                   </div>
                                 </div>
                                 <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">Audit Identity Required</h3>
                                    <p className="text-slate-500 dark:text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">Select a property profile from the registry inventory to initiate a deep-dive synchronization of its historical reservation flux.</p>
                                 </div>
                              </div>
                            )}
                         </div>
                      </div>
                    </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          )}

          {/* 4. USER MANAGEMENT SECTION */}
          {activeTab === 'users' && isAdmin && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="bg-white dark:bg-reva-900 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-reva-950/50">
                        <tr>
                          <th className="p-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Principal Identity</th>
                          <th className="p-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">Authority Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {allUsers.map(u => (
                          <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                            <td className="p-10">
                                <p className="font-black text-slate-900 dark:text-white uppercase text-sm mb-1">{u.name}</p>
                            </td>
                            <td className="p-10">
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.ADMIN ? 'bg-reva-gold text-reva-900' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                                  {u.role}
                                </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Detailed Booking Audit Modal */}
        <AnimatePresence>
          {selectedBookingDetail && isAdmin && (
            <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-reva-950/95 backdrop-blur-xl" onClick={() => setSelectedBookingDetail(null)} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 30 }} 
                className="relative w-full max-w-4xl bg-white dark:bg-reva-900 rounded-[3.5rem] shadow-[0_32px_120px_rgba(0,0,0,0.6)] border border-white/5 overflow-hidden"
              >
                <div className="p-10 md:p-14">
                  <div className="flex justify-between items-start mb-16">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Activity className="text-reva-gold" size={18} />
                        <span className="text-[10px] font-black text-reva-gold uppercase tracking-[0.4em]">{t('transactionAudit')}</span>
                      </div>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                        Registry Ref:<br/><span className="text-slate-400">{selectedBookingDetail._id.slice(0, 12)}</span>
                      </h2>
                    </div>
                    <button onClick={() => setSelectedBookingDetail(null)} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    {/* Column 1: Guest & Asset */}
                    <div className="space-y-10">
                      <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <UserIcon size={12} className="text-reva-gold" /> {t('guestIdentity')}
                        </h4>
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-white/5">
                           <p className="text-lg font-black text-slate-900 dark:text-white uppercase mb-1">{selectedBookingDetail.guestName}</p>
                           <p className="text-xs font-medium text-slate-500 mb-3">{detailGuest?.email || 'Authenticated Node'}</p>
                           <span className="px-3 py-1 bg-reva-emerald/10 border border-reva-emerald/20 text-reva-emerald text-[9px] font-black rounded-full uppercase tracking-widest">Verified Guest Identity</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <HomeIcon size={12} className="text-reva-gold" /> {t('assetStatus')}
                        </h4>
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-white/5">
                           <p className="text-lg font-black text-slate-900 dark:text-white uppercase mb-1">{detailChalet?.name || 'Unknown Asset'}</p>
                           <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                             <MapPin size={12} className="text-reva-gold" /> {detailChalet?.location}
                           </div>
                           <div className="flex items-center gap-3">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${detailChalet?.status === 'APPROVED' ? 'bg-reva-emerald/10 text-reva-emerald border border-reva-emerald/20' : 'bg-reva-gold/10 text-reva-gold border border-reva-gold/20'}`}>
                               {detailChalet?.status} State
                             </span>
                             <button 
                               onClick={handleNavigateToAsset}
                               className="flex items-center gap-2 text-[9px] font-black text-reva-gold hover:underline uppercase tracking-widest ml-auto"
                             >
                               {t('viewInRegistry')} <ArrowUpRight size={14} />
                             </button>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Details & Financials */}
                    <div className="space-y-10">
                      <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Shield size={12} className="text-reva-gold" /> {t('ownerAuthority')}
                        </h4>
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-white/5">
                           <p className="text-base font-black text-slate-900 dark:text-white uppercase mb-1">{detailOwner?.name || 'Global Registry'}</p>
                           <p className="text-xs font-medium text-slate-500">Registry Admin Role: {detailOwner?.role || 'SYSTEM'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-white/5">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('bookingPeriod')}</p>
                           <p className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">{selectedBookingDetail.checkIn}</p>
                           <p className="text-xs font-black text-slate-900 dark:text-white uppercase">thru {selectedBookingDetail.checkOut}</p>
                        </div>
                        <div className="bg-reva-gold/10 p-6 rounded-3xl border border-reva-gold/20">
                           <p className="text-[9px] font-black text-reva-gold uppercase tracking-widest mb-3">{t('financialNode')}</p>
                           <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{selectedBookingDetail.totalPrice} JD</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Gross Yield</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedBookingDetail(null)}
                    className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl text-xs tracking-[0.4em] uppercase shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {t('closeAudit')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteConfirmOpen && chaletToDelete && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-reva-900/95 backdrop-blur-2xl" onClick={() => setIsDeleteConfirmOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-reva-800 rounded-[3rem] p-10 md:p-14 shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/10 text-center">
                 <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-10 shadow-inner">
                    <AlertCircle size={48} />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Confirm Deletion</h2>
                 <p className="text-slate-500 dark:text-gray-400 font-medium mb-12">
                   You are about to permanently remove <span className="text-reva-gold font-black">{chaletToDelete.name}</span> from the Reva Registry. This action is final and cannot be undone.
                 </p>
                 <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      className="py-5 bg-slate-100 dark:bg-white/5 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest transition-all"
                    >
                      {t('cancel')}
                    </button>
                    <button 
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                      className="py-5 bg-red-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                      {t('delete')}
                    </button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Modal (Placeholder Logic for clarity) */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-reva-900/90 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-5xl bg-white dark:bg-reva-900 rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/5 p-12">
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Registry Modification</h2>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400"><X /></button>
                </div>
                <form onSubmit={handleSaveAsset} className="space-y-8">
                  <FormInput label="Asset Name" value={editingChalet?.name || ''} onChange={(e:any) => setEditingChalet({...editingChalet, name: e.target.value})} />
                  <FormInput label="Price per Night (JD)" type="number" value={editingChalet?.pricePerNight || ''} onChange={(e:any) => setEditingChalet({...editingChalet, pricePerNight: Number(e.target.value)})} />
                  <button type="submit" disabled={isSaving} className="w-full bg-reva-gold text-reva-900 font-black py-6 rounded-3xl flex items-center justify-center gap-4 text-[12px] uppercase tracking-widest shadow-2xl">
                    {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                    {t('save')}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SectionTab = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`px-8 py-5 rounded-[2rem] text-[11px] font-black flex items-center gap-4 transition-all shrink-0 uppercase tracking-[0.2em] ${active ? 'bg-reva-gold text-reva-900 shadow-2xl' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
    {icon} {label}
  </button>
);

const MetricCard = ({ title, value, trend, icon, color }: any) => (
  <div className="bg-white dark:bg-reva-900 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl flex items-center justify-between group">
    <div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{title}</p>
      <div className="flex items-baseline gap-4">
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
        {trend && <span className="text-[10px] font-black text-reva-emerald">{trend}</span>}
      </div>
    </div>
    <div className={`w-16 h-16 rounded-[1.8rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center ${color} shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>{icon}</div>
  </div>
);

const InventoryAssetCard = ({ chalet, isAdmin, view, onEdit, onApprove, onDelete, t }: any) => (
  <motion.div layout className={`bg-white dark:bg-reva-900 rounded-[3.5rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-2xl group ${view === 'list' ? 'flex flex-row items-center p-6' : ''}`}>
     <div className={`relative ${view === 'list' ? 'w-40 h-40 rounded-[2rem]' : 'w-full h-64'} overflow-hidden shrink-0`}>
        <img src={chalet.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
     </div>
     <div className="p-10 flex-grow">
        <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{chalet.name}</h4>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={14} className="text-reva-gold" /> {chalet.location}</p>
        <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
           <button onClick={onEdit} className="flex-1 py-4 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-reva-gold rounded-2xl flex items-center justify-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest">
              <Edit3 size={18}/> {t('edit')}
           </button>
           <button onClick={onDelete} className="flex-1 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center gap-3 transition-all text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-lg shadow-red-500/10">
              <Trash2 size={18}/> {t('delete')}
           </button>
        </div>
     </div>
  </motion.div>
);

const FormInput = ({ label, type = 'text', value, onChange, placeholder }: any) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
     <input type={type} required value={value} onChange={onChange} className="w-full p-6 bg-slate-50 dark:bg-reva-950/50 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-reva-gold transition-all" placeholder={placeholder} />
  </div>
);

export default Dashboard;
