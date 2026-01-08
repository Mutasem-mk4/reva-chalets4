
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  MapPin, Star, Users, Bed, Wifi, Wind, Coffee, Home, 
  ChevronLeft, CheckCircle, Sparkles, Loader2, AlertTriangle, 
  Share2, ChevronRight, Calendar as CalendarIcon, RotateCcw,
  ChevronDown, Info, History, Maximize2, Mail, Link as LinkIcon, 
  Copy, CalendarDays, ArrowRight, Trash2, GripVertical, Settings, Save, X as CloseIcon,
  Navigation, Utensils, Mountain
} from 'lucide-react';
import { Chalet, User, UserRole, Booking } from '../types';
import { dataService } from '../services/dataService';
import { useApp } from '../contexts/AppContext';

const ChaletDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useApp();
  const [chalet, setChalet] = useState<Chalet | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [residencyHistory, setResidencyHistory] = useState<Booking[]>([]);
  
  // Gallery State
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isEditingGallery, setIsEditingGallery] = useState(false);
  const [editableGallery, setEditableGallery] = useState<string[]>([]);

  // Advanced Date Range States
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const currentUser = dataService.getCurrentUser();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const loadResidencyHistory = async (chaletId: string) => {
    const user = dataService.getCurrentUser();
    if (!user) return;

    try {
      const allBookings = await dataService.getBookings();
      const relevant = allBookings.filter(b => b.chaletId === chaletId && b.userId === user._id);
      setResidencyHistory(relevant.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()));
    } catch (err) {
      console.error("Ledger Sync Failed", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const foundChalet = await dataService.getChaletById(id);
        if (foundChalet) {
          setChalet(foundChalet);
          setEditableGallery(foundChalet.gallery || []);
          const foundOwner = await dataService.getUserById(foundChalet.ownerId);
          if (foundOwner) setOwner(foundOwner);
          document.title = `${foundChalet.name} | Reva Chalet`;
          
          await loadResidencyHistory(id);
        }
      } catch (error) {
        console.error("Failed to load chalet", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Close share menu on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id]);

  // Gallery Preparation
  const allImages = useMemo(() => {
    if (!chalet) return [];
    const images = [chalet.imageUrl];
    if (chalet.gallery && chalet.gallery.length > 0) {
      chalet.gallery.forEach(img => {
        if (img !== chalet.imageUrl) images.push(img);
      });
    }
    return images;
  }, [chalet]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveImgIndex((prevIndex) => (prevIndex + newDirection + allImages.length) % allImages.length);
  };

  const handleShareEmail = () => {
    if (!chalet) return;
    const subject = encodeURIComponent(`Exclusive Invitation: Discover ${chalet.name}`);
    const body = encodeURIComponent(
      `Experience the pinnacle of luxury at ${chalet.name}.\n\n` +
      `Property Identity: ${chalet.name}\n` +
      `Territory: ${chalet.location}\n` +
      `Registry Tier: ${chalet.luxuryTier} Collection\n\n` +
      `Explore this curated sanctuary and its full architectural narrative at the following registry link:\n` +
      `${window.location.href}\n\n` +
      `Synchronized by Reva Chalet Core.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback(t('registryLinkCopied'));
    setTimeout(() => setShareFeedback(null), 3000);
    setShowShareMenu(false);
  };

  const handleShareToggle = async () => {
    if (navigator.share && chalet) {
      try {
        await navigator.share({
          title: `Reva Chalet | ${chalet.name}`,
          text: `Inspect this architectural sanctuary in ${chalet.location}.`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to custom menu if sharing fails or is cancelled
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  // Gallery Admin Functions
  const handleRemoveImage = (imgUrl: string) => {
    setEditableGallery(prev => prev.filter(img => img !== imgUrl));
  };

  const handleSaveGallery = async () => {
    if (!chalet) return;
    setLoading(true);
    try {
      const updatedChalet = { ...chalet, gallery: editableGallery };
      await dataService.saveChalet(updatedChalet);
      setChalet(updatedChalet);
      setIsEditingGallery(false);
      setActiveImgIndex(0);
      setShareFeedback("Registry Gallery Updated.");
      setTimeout(() => setShareFeedback(null), 3000);
    } catch (err) {
      console.error("Failed to save gallery", err);
      setDateError("Failed to update registry gallery.");
    } finally {
      setLoading(false);
    }
  };

  // Generate Calendar Grid
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [viewDate]);

  const handleDateClick = (date: Date) => {
    if (date < today) return;
    setDateError(null);

    // Flow 1: If no start date, or we already have a full range, start a new selection
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } 
    // Flow 2: If we have a start date but click a date before or on it, update the start date
    else if (date.getTime() <= startDate.getTime()) {
      setStartDate(date);
      setEndDate(null);
    } 
    // Flow 3: Perfect selection - pick the end date
    else {
      setEndDate(date);
      setHoveredDate(null);
    }
  };

  const isSelected = (date: Date) => {
    return (startDate?.getTime() === date.getTime()) || (endDate?.getTime() === date.getTime());
  };

  const isInRange = (date: Date) => {
    if (!startDate) return false;
    
    // Confirmed Range
    if (endDate) {
      return date > startDate && date < endDate;
    }
    
    // Preview Range (Hover)
    if (hoveredDate && hoveredDate > startDate) {
      return date > startDate && date < hoveredDate;
    }
    
    return false;
  };

  const totalNights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chalet) return;
    
    const user = dataService.getCurrentUser();
    if (!user) {
      alert("Identification Required. Please sign in.");
      return;
    }

    // Comprehensive Client-Side Validation
    if (!startDate || !endDate) {
      setDateError("Incomplete Range: Please finalize your arrival and departure dates.");
      return;
    }

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    if (endTimestamp < startTimestamp) {
      setDateError("Chronological Error: Departure cannot occur before arrival.");
      return;
    }

    if (endTimestamp === startTimestamp) {
      setDateError("Minimum Residency Violation: An overnight stay (at least 1 night) is required.");
      return;
    }

    // Ensure range is at least one day
    if (totalNights < 1) {
       setDateError(t('residencyInsufficient'));
       return;
    }

    setBookingLoading(true);
    try {
      await dataService.createBooking({
        chaletId: chalet._id,
        userId: user._id,
        guestName: user.name,
        checkIn: startDate.toISOString().split('T')[0],
        checkOut: endDate.toISOString().split('T')[0],
        totalPrice: chalet.pricePerNight * totalNights,
      });
      
      setBookingSuccess(true);
      await loadResidencyHistory(chalet._id);
      setStartDate(null);
      setEndDate(null);
      setDateError(null);
      
      // Auto-hide success toast after 6 seconds
      setTimeout(() => setBookingSuccess(false), 6000);
    } catch (error) {
      console.error("Transmission Error", error);
      setDateError("Registry Sync Fault: Unable to process reservation at this time.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-slate-50 dark:bg-reva-950 min-h-[70vh]">
        <Loader2 className="animate-spin text-reva-gold mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-reva-gold animate-pulse">{t('syncingRegistry')}</p>
      </div>
    );
  }

  if (!chalet) return null;

  return (
    <div className="pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-reva-950 text-slate-900 dark:text-white transition-all duration-500 min-h-screen">
      {/* Toast Notification for Booking Success */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -120, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -120, scale: 0.9, x: "-50%" }}
            className="fixed top-28 left-1/2 z-[300] w-[95%] max-w-lg bg-emerald-600 dark:bg-emerald-500 text-white p-6 md:p-8 rounded-[2.5rem] font-black shadow-[0_32px_80px_rgba(16,185,129,0.3)] flex flex-col gap-4 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
                  <Sparkles size={28} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg uppercase tracking-tighter">Reservation Dispatched</h4>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest mt-1">Registry Synchronized Successfully</p>
                </div>
              </div>
              <button 
                onClick={() => setBookingSuccess(false)}
                className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <CloseIcon size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 dark:text-gray-400 hover:text-reva-gold transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            {language === 'ar' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {t('returnToMap')}
          </button>
          
          <div className="flex items-center gap-4">
            {isAdmin && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingGallery(!isEditingGallery)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all border ${
                  isEditingGallery 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-reva-gold'
                }`}
              >
                {isEditingGallery ? <CloseIcon size={16} /> : <Settings size={16} />}
                {isEditingGallery ? t('cancelEdit') : t('manageGallery')}
              </motion.button>
            )}

            <div className="relative" ref={shareMenuRef}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShareToggle}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-reva-gold hover:border-reva-gold/40 transition-all text-[9px] font-black uppercase tracking-widest shadow-sm"
              >
                <Share2 size={16} /> {t('shareExperience')} {shareFeedback && <span className="ml-2 text-emerald-500 text-[8px] animate-pulse">{shareFeedback}</span>}
              </motion.button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-4 w-64 bg-white dark:bg-reva-800 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-2xl z-50 overflow-hidden`}
                  >
                    <div className="p-4 space-y-2">
                      <button 
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                      >
                        <div className="w-10 h-10 bg-reva-gold/10 rounded-xl flex items-center justify-center text-reva-gold group-hover:scale-110 transition-transform">
                          <LinkIcon size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{t('copyRegistryLink')}</span>
                      </button>
                      
                      <button 
                        onClick={handleShareEmail}
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                      >
                        <div className="w-10 h-10 bg-reva-gold/10 rounded-xl flex items-center justify-center text-reva-gold group-hover:scale-110 transition-transform">
                          <Mail size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{t('dispatchEmail')}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Immersive Gallery Carousel or Admin Gallery Management */}
        <AnimatePresence mode="wait">
          {!isEditingGallery ? (
            <motion.div 
              key="carousel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative mb-12 h-[400px] md:h-[600px] w-full group"
            >
              <div className="relative w-full h-full rounded-[3.5rem] overflow-hidden shadow-2xl bg-reva-900 border border-white/5">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={activeImgIndex}
                    src={allImages[activeImgIndex]}
                    custom={direction}
                    variants={{
                      enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (direction: number) => ({ x: direction < 0 ? 1000 : -1000, opacity: 0 })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-reva-950/60 via-transparent to-transparent pointer-events-none" />
                
                <div className={`absolute bottom-10 ${language === 'ar' ? 'right-10' : 'left-10'} flex flex-col gap-4 pointer-events-none`}>
                  <span className="px-5 py-2.5 bg-reva-gold text-reva-900 font-black rounded-full text-[10px] tracking-[0.2em] uppercase shadow-2xl backdrop-blur-md">
                    {t('eliteRegistryBadge')}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <button 
                    onClick={() => paginate(-1)}
                    className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all"
                  >
                    {language === 'ar' ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
                  </button>
                  <button 
                    onClick={() => paginate(1)}
                    className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 transition-all"
                  >
                    {language === 'ar' ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
                  </button>
                </div>

                <div className={`absolute bottom-8 ${language === 'ar' ? 'left-10' : 'right-10'} flex gap-2`}>
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > activeImgIndex ? 1 : -1);
                        setActiveImgIndex(idx);
                      }}
                      className={`h-1.5 transition-all duration-500 rounded-full ${idx === activeImgIndex ? 'w-8 bg-reva-gold' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                    />
                  ))}
                </div>

                <div className={`absolute top-8 ${language === 'ar' ? 'left-10' : 'right-10'} px-4 py-2 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 text-[9px] font-black text-white uppercase tracking-widest`}>
                  {activeImgIndex + 1} / {allImages.length}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="admin-gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative mb-12 w-full"
            >
              <div className="bg-white dark:bg-reva-900 rounded-[3.5rem] p-10 border border-reva-gold/20 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter">Registry Gallery Architect</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Reorder & Prune Visual Assets</p>
                   </div>
                   <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveGallery}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                   >
                     <Save size={18} /> Save Hierarchy
                   </motion.button>
                </div>

                <div className="bg-slate-50 dark:bg-reva-950/50 p-8 rounded-[2.5rem] border border-white/5">
                   <div className="mb-8 p-6 bg-reva-gold/5 border border-reva-gold/10 rounded-2xl flex items-center gap-6">
                      <div className="w-14 h-14 rounded-xl bg-reva-gold/20 flex items-center justify-center text-reva-gold shrink-0">
                         <Home size={24} />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-reva-gold uppercase tracking-widest mb-1">Primary Asset (Hero)</p>
                         <p className="text-[11px] font-medium text-slate-500 italic truncate max-w-md">{chalet.imageUrl}</p>
                      </div>
                      <div className="ml-auto px-4 py-2 bg-reva-gold/10 border border-reva-gold/20 text-reva-gold text-[9px] font-black rounded-lg uppercase tracking-widest">Locked Position</div>
                   </div>

                   <Reorder.Group 
                    axis="y" 
                    values={editableGallery} 
                    onReorder={setEditableGallery}
                    className="space-y-4"
                   >
                     {editableGallery.map((img) => (
                       <Reorder.Item 
                        key={img} 
                        value={img}
                        className="group flex items-center gap-6 p-4 bg-white dark:bg-reva-800 border border-slate-100 dark:border-white/5 rounded-2xl shadow-sm hover:border-reva-gold/40 transition-all cursor-grab active:cursor-grabbing"
                       >
                         <div className="text-slate-400 group-hover:text-reva-gold transition-colors">
                            <GripVertical size={20} />
                         </div>
                         <div className="w-20 h-14 rounded-xl overflow-hidden shadow-inner shrink-0 bg-reva-950">
                            <img src={img} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-medium text-slate-400 truncate opacity-50">{img}</p>
                         </div>
                         <button 
                          onClick={() => handleRemoveImage(img)}
                          className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                         >
                            <Trash2 size={18} />
                         </button>
                       </Reorder.Item>
                     ))}
                   </Reorder.Group>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Main Info Column */}
          <div className="lg:col-span-7 space-y-16">
            <div>
              <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-6">{chalet.name}</h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center text-slate-500 dark:text-gray-400 text-[11px] font-black uppercase tracking-widest">
                  <MapPin size={18} className="mr-2 text-reva-gold" /> {chalet.location}
                </div>
                <div className="flex items-center gap-2 text-reva-gold font-black">
                   <Star className="fill-reva-gold" size={18} />
                   <span className="text-lg">{chalet.rating}</span>
                   <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">({chalet.reviewCount} {t('vettedReviews')})</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 py-12 border-y border-slate-100 dark:border-white/5">
               <FeatureBlock icon={<Users size={20}/>} label={`${chalet.maxGuests} ${t('guests')}`} />
               <FeatureBlock icon={<Bed size={20}/>} label={`${chalet.bedrooms} ${t('bedrooms')}`} />
               <FeatureBlock icon={<Home size={20}/>} label={t('fullSanctuary')} />
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                <Info size={24} className="text-reva-gold" /> {t('narrative')}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-light">
                {chalet.description}
              </p>
            </div>

            <div className="space-y-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('amenities')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {chalet.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-6 bg-white dark:bg-reva-800 border border-slate-100 dark:border-white/5 rounded-3xl hover:border-reva-gold/30 transition-all shadow-sm group">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-reva-900/50 flex items-center justify-center text-reva-gold group-hover:scale-110 transition-transform">
                       <CheckCircle size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-200">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Residency History Section */}
            {residencyHistory.length > 0 && (
              <div className="space-y-10 pt-16 border-t border-slate-100 dark:border-white/5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                  <History size={24} className="text-reva-gold" /> {t('history')}
                </h2>
                <div className="space-y-4">
                  {residencyHistory.map((pb, idx) => (
                    <motion.div 
                      key={pb._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-8 bg-white dark:bg-reva-800 border border-slate-100 dark:border-white/5 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-reva-gold/20 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-reva-950/50 flex items-center justify-center text-reva-gold">
                          <CalendarIcon size={24} />
                        </div>
                        <div>
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${pb.status === 'CONFIRMED' ? 'text-emerald-500' : 'text-reva-gold'}`}>
                            {pb.status}
                          </p>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {new Date(pb.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — {new Date(pb.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className={`w-full sm:w-auto ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('totalStayValue')}</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{pb.totalPrice} JD</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Integrated Date Range Picker Sidebar */}
          <div className="lg:col-span-5">
             <div className="lg:sticky lg:top-32 bg-white dark:bg-reva-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-white/10">
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <span className="text-4xl md:text-5xl font-black text-reva-gold tracking-tighter">{chalet.pricePerNight} JD</span>
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] ml-2">{t('night')}</span>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* Integrated Range Slots */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-reva-950/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('arrival')}</p>
                       <p className={`text-sm font-black tracking-tight ${startDate ? 'text-reva-gold' : 'text-slate-300 dark:text-slate-700'}`}>
                         {startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : t('pickArrival')}
                       </p>
                    </div>
                    <div className={`border-l border-slate-200 dark:border-white/10 pl-6 space-y-2`}>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('departure')}</p>
                       <p className={`text-sm font-black tracking-tight ${endDate ? 'text-reva-gold' : 'text-slate-300 dark:text-slate-700'}`}>
                         {endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : t('pickDeparture')}
                       </p>
                    </div>
                  </div>

                  {/* Range Visual Feedback */}
                  <div className="flex items-center justify-between px-2 h-6">
                    <AnimatePresence>
                      {totalNights > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest"
                        >
                          <CheckCircle size={14} /> {t('totalResidency')}: {totalNights} {t('night')}{totalNights > 1 ? '' : ''}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {startDate && (
                      <button 
                        onClick={() => { setStartDate(null); setEndDate(null); setDateError(null); }}
                        className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> {t('resetRange')}
                      </button>
                    )}
                  </div>

                  {/* Calendar Grid Integration */}
                  <div className="bg-slate-50 dark:bg-reva-950/20 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 relative overflow-hidden">
                     <div className="flex items-center justify-between mb-8">
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="p-3 bg-white dark:bg-reva-900 rounded-xl hover:text-reva-gold transition-all shadow-sm">
                           {language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">
                           {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="p-3 bg-white dark:bg-reva-900 rounded-xl hover:text-reva-gold transition-all shadow-sm">
                           {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-7 gap-y-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                          <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase mb-4">{d}</div>
                        ))}
                        {calendarDays.map((day, idx) => {
                          if (!day) return <div key={idx} />;
                          const selected = isSelected(day);
                          const range = isInRange(day);
                          const disabled = day < today;
                          const isStart = startDate?.getTime() === day.getTime();
                          const isEnd = endDate?.getTime() === day.getTime();

                          return (
                            <div key={idx} className="relative h-11">
                              {range && (
                                <motion.div 
                                  layoutId="rangeHighlight"
                                  className={`absolute inset-y-1 inset-x-0 bg-reva-gold/15 ${isStart ? 'rounded-l-2xl' : ''} ${isEnd ? 'rounded-r-2xl' : ''}`}
                                />
                              )}
                              <button
                                disabled={disabled}
                                onMouseEnter={() => !endDate && setHoveredDate(day)}
                                onMouseLeave={() => setHoveredDate(null)}
                                onClick={() => handleDateClick(day)}
                                className={`
                                  relative w-full h-full flex items-center justify-center text-[11px] font-black transition-all z-10
                                  ${disabled ? 'opacity-10 cursor-not-allowed text-slate-500' : 'text-slate-900 dark:text-white'}
                                  ${selected ? 'bg-reva-gold text-reva-900 rounded-2xl shadow-xl scale-105' : 'hover:bg-reva-gold/10 rounded-2xl'}
                                `}
                              >
                                {day.getDate()}
                              </button>
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  <AnimatePresence>
                    {dateError && (
                      <motion.div 
                        key={dateError}
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ 
                          opacity: 1, 
                          x: [0, -5, 5, -5, 5, 0],
                        }} 
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 p-5 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/5"
                      >
                        <AlertTriangle size={18} /> {dateError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('authorizedGuests')}</label>
                    <div className="relative">
                      <select 
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full p-6 bg-slate-50 dark:bg-reva-950/50 border border-slate-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-reva-gold text-xs font-black dark:text-white appearance-none cursor-pointer"
                      >
                        {[...Array(chalet.maxGuests)].map((_, i) => (
                          <option key={i} value={i + 1} className="bg-reva-950">{i + 1} {t('authorizedGuests')} {i > 0 ? '' : ''}</option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute ${language === 'ar' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 pointer-events-none text-slate-400`} size={18} />
                    </div>
                  </div>

                  <button 
                    onClick={handleBook}
                    disabled={bookingLoading}
                    className="w-full bg-reva-gold text-reva-900 font-black py-6 rounded-2xl shadow-2xl shadow-reva-gold/20 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-3"
                  >
                    {bookingLoading ? <Loader2 className="animate-spin" size={24} /> : <>{t('initializeReservation')} <ArrowRight size={20} className={language === 'ar' ? 'rotate-180' : ''} /></>}
                  </button>
                </div>

                <div className="mt-12 space-y-6 pt-10 border-t border-slate-100 dark:border-white/5">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>{t('eliteTax')}</span>
                     <span className="text-emerald-500">{t('exempt')}</span>
                   </div>
                   <motion.div 
                    animate={{ scale: totalNights > 0 ? [1, 1.02, 1] : 1 }}
                    className="flex justify-between items-center"
                   >
                     <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('totalInvestment')}</span>
                     <span className="text-3xl font-black text-reva-gold tracking-tight">
                        {totalNights > 0 ? chalet.pricePerNight * totalNights : chalet.pricePerNight} JD
                     </span>
                   </motion.div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureBlock = ({ icon, label }: any) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-reva-gold shadow-inner">{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">{label}</span>
  </div>
);

export default ChaletDetails;
