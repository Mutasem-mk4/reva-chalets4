
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, Sun, Moon, Globe, MapPin, Search, Compass } from 'lucide-react';
import { User, UserRole } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, language, setLanguage, t } = useApp();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleNav = (path: string) => {
    navigate(path);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === UserRole.ADMIN) return '/admin/dashboard';
    if (user.role === UserRole.OWNER) return '/owner/dashboard';
    return '/customer/bookings';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-reva-950 text-slate-900 dark:text-slate-200 flex flex-col overflow-x-hidden transition-all duration-1000">
      {/* Navigation Header */}
      <nav 
        className={`fixed top-0 w-full z-[100] transition-all duration-700 px-4 md:px-8 py-4 ${
          scrolled ? 'bg-white/80 dark:bg-reva-950/80 backdrop-blur-2xl shadow-xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 cursor-pointer flex items-center gap-3 z-[110]" onClick={() => handleNav('/')}>
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              className="w-10 h-10 md:w-12 md:h-12 bg-reva-gold rounded-2xl flex items-center justify-center shadow-lg shadow-reva-gold/30"
            >
              <span className="font-black text-reva-900 text-lg md:text-xl italic">R</span>
            </motion.div>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex flex-col leading-none">
              REVA
              <span className="text-reva-gold font-light text-[10px] md:text-[12px] tracking-[0.4em]">CHALET</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              <NavLink to="/" active={location.pathname === '/'}>{t('discover')}</NavLink>
              <NavLink to="/chalets" active={location.pathname === '/chalets'}>{t('chalets')}</NavLink>
              <NavLink to="/concierge" active={location.pathname === '/concierge'}>
                <div className="flex items-center gap-2">
                   <Compass size={14} className={location.pathname === '/concierge' ? 'text-reva-gold' : 'text-slate-400'} />
                   Concierge
                </div>
              </NavLink>
              {user && (
                <NavLink to={getDashboardPath()} active={location.pathname.includes('dashboard')}>{t('dashboard')}</NavLink>
              )}
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-reva-gold transition-all"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <button 
                onClick={toggleLanguage} 
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-[10px] font-black tracking-widest text-slate-500 hover:text-reva-gold uppercase transition-all"
              >
                {language === 'en' ? 'Arabic' : 'English'}
              </button>
              
              {user ? (
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 p-1 pr-4 rounded-full border border-slate-200 dark:border-white/10">
                  <div className="w-9 h-9 rounded-full bg-reva-gold/20 flex items-center justify-center overflow-hidden">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={16} className="text-reva-gold" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{user.name.split(' ')[0]}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{user.role}</span>
                  </div>
                  <button onClick={onLogout} className="ml-2 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="bg-reva-gold text-reva-900 px-8 py-3 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase hover:brightness-110 transition-all shadow-xl shadow-reva-gold/20"
                >
                  {t('signIn')}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4 z-[110]">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[105] bg-white dark:bg-reva-950 flex flex-col p-8 pt-32"
          >
            <div className="space-y-8">
              <MobileNavLink to="/" onClick={() => setIsMobileMenuOpen(false)} label={t('discover')} />
              <MobileNavLink to="/chalets" onClick={() => setIsMobileMenuOpen(false)} label={t('chalets')} />
              <MobileNavLink to="/concierge" onClick={() => setIsMobileMenuOpen(false)} label="Concierge" />
              {user && (
                <MobileNavLink to={getDashboardPath()} onClick={() => setIsMobileMenuOpen(false)} label={t('dashboard')} />
              )}
            </div>

            <div className="mt-auto space-y-8 pb-12">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={toggleTheme} className="flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-white/5 rounded-3xl gap-3">
                   {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                   <span className="text-[10px] font-black uppercase tracking-widest">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
                <button onClick={toggleLanguage} className="flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-white/5 rounded-3xl gap-3">
                   <Globe size={24} />
                   <span className="text-[10px] font-black uppercase tracking-widest">{language === 'en' ? 'Arabic' : 'English'}</span>
                </button>
              </div>

              {user ? (
                <button 
                  onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                  className="w-full py-6 bg-red-500/10 text-red-500 rounded-3xl font-black uppercase tracking-widest text-xs border border-red-500/20"
                >
                  {t('logOut')}
                </button>
              ) : (
                <button 
                  onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                  className="w-full py-6 bg-reva-gold text-reva-900 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-reva-gold/20"
                >
                  {t('signIn')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Dynamic Padding */}
      <main className={`flex-grow transition-all duration-500 ${!isHome ? 'pt-24 md:pt-32' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-reva-950 border-t border-slate-200 dark:border-white/5 py-24 transition-all mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-12">
            <div className="col-span-1 md:col-span-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">REVA<span className="text-reva-gold font-light">CHALET</span></span>
              <p className="mt-8 text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed text-sm font-medium">
                Crafting the future of leisure. We curate sanctuaries where architecture meets the soul of the Jordanian landscape.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] mb-8 border-b border-reva-gold/20 pb-2 inline-block">Explore</h3>
              <ul className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">
                <li><a href="#" className="hover:text-reva-gold transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-reva-gold transition-colors">Elite Registry</a></li>
                <li><a href="#" className="hover:text-reva-gold transition-colors">Host Program</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] mb-8 border-b border-reva-gold/20 pb-2 inline-block">Support</h3>
              <ul className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">
                <li><a href="#" className="hover:text-reva-gold transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-reva-gold transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-reva-gold transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-24 pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">© 2024 Reva Chalet. All Rights Reserved.</p>
             <div className="flex gap-10">
                {['TW', 'IG', 'LI'].map(soc => (
                  <span key={soc} className="text-[10px] font-black text-slate-400 hover:text-reva-gold cursor-pointer transition-all tracking-[0.3em] uppercase">{soc}</span>
                ))}
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ to, children, active }: any) => (
  <Link 
    to={to} 
    className={`text-[11px] font-black uppercase tracking-[0.3em] transition-all relative group ${
      active ? 'text-reva-gold' : 'text-slate-500 dark:text-slate-400 hover:text-reva-gold'
    }`}
  >
    {children}
    <span className={`absolute -bottom-2 left-0 h-0.5 bg-reva-gold transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
  </Link>
);

const MobileNavLink = ({ to, label, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="block text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter hover:text-reva-gold transition-colors"
  >
    {label}
  </Link>
);

export default Layout;
