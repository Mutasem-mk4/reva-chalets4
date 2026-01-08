
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, KeyRound, AlertCircle, Send, Cpu } from 'lucide-react';
import { dataService } from '../services/dataService';
import { User as UserType, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

type AuthState = 'LOGIN' | 'SIGNUP' | 'OTP_SIGNUP' | 'OTP_LOGIN' | 'PENDING';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authState, setAuthState] = useState<AuthState>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(false);
      setAuthState('LOGIN');
      setOtp('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (authState === 'LOGIN') {
        await dataService.login(email, password);
        setAuthState('OTP_LOGIN');
      } 
      else if (authState === 'SIGNUP') {
        if (role === UserRole.ADMIN) throw new Error("Restricted operation.");
        await dataService.requestSignupOtp({ name, email, password, role });
        setAuthState('OTP_SIGNUP');
      } 
      else if (authState === 'OTP_SIGNUP') {
        const verifiedUser = await dataService.verifySignupOtp(email, otp);
        if (verifiedUser.isApproved) {
          // Auto-approved customers bypass the pending screen
          onLoginSuccess(verifiedUser);
          onClose();
        } else {
          // Owners move to vetting screen
          setAuthState('PENDING');
        }
      } 
      else if (authState === 'OTP_LOGIN') {
        const verifiedUser = await dataService.verifyLoginOtp(email, otp);
        onLoginSuccess(verifiedUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (authState === 'OTP_SIGNUP') {
        await dataService.requestSignupOtp({ name, email, password, role });
      } else {
        await dataService.login(email, password);
      }
      setOtp('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-reva-900/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative w-full max-w-md bg-white dark:bg-reva-800 border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Loading Overlay with Live Animation */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] bg-reva-900/90 backdrop-blur-md flex flex-col items-center justify-center gap-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-reva-gold rounded-full"
                />
                <div className="relative w-20 h-20 bg-reva-gold rounded-3xl flex items-center justify-center">
                  <Cpu className="text-reva-900 animate-spin-slow" size={40} />
                </div>
              </div>
              <p className="text-reva-gold text-[10px] font-black tracking-[0.4em] uppercase animate-pulse">
                Encrypting Data...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white z-10 p-2 rounded-full hover:bg-white/10 transition-all">
          <X size={20} />
        </button>

        <div className="p-10">
          <div className="text-center mb-10">
            <motion.div 
              animate={{ 
                scale: (authState === 'OTP_SIGNUP' || authState === 'OTP_LOGIN') ? [1, 1.1, 1] : 1,
                rotate: (authState === 'OTP_SIGNUP' || authState === 'OTP_LOGIN') ? [0, 5, -5, 0] : 0 
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-16 h-16 bg-reva-gold rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-reva-gold/20"
            >
              {(authState === 'OTP_SIGNUP' || authState === 'OTP_LOGIN') ? <KeyRound className="text-reva-900" size={32} /> : <ShieldCheck className="text-reva-900" size={32} />}
            </motion.div>
            
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter uppercase">
              {authState === 'LOGIN' && 'REVA ACCESS'}
              {authState === 'SIGNUP' && 'JOIN SANCTUARY'}
              {(authState === 'OTP_SIGNUP' || authState === 'OTP_LOGIN') && 'CHECK EMAIL'}
              {authState === 'PENDING' && 'VETTING STAGE'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium px-4">
              {authState === 'LOGIN' && 'Enter credentials to trigger authentication.'}
              {authState === 'SIGNUP' && 'Request access to the elite collection.'}
              {(authState === 'OTP_SIGNUP' || authState === 'OTP_LOGIN') && `A secure 6-digit code was dispatched to your inbox.`}
              {authState === 'PENDING' && 'Email verified. Your application is now being reviewed by Reva HQ.'}
            </p>
          </div>

          {authState === 'PENDING' ? (
            <div className="text-center space-y-6">
              <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex flex-col items-center gap-6">
                 <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                   <AlertCircle className="text-amber-500" size={32} />
                 </div>
                 <p className="text-slate-900 dark:text-gray-200 font-bold leading-relaxed">
                   EMAIL VERIFIED SUCCESSFUL.<br/>
                   <span className="text-xs font-medium opacity-70">Administrator approval is required before your first login.</span>
                 </p>
              </div>
              <button onClick={onClose} className="w-full py-5 bg-reva-gold text-reva-900 font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-reva-gold/20">Return to Exploration</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {(authState === 'OTP_SIGNUP' || authState === 'OTP_LOGIN') ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key="otp-input" className="space-y-6">
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-reva-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-5 pl-12 pr-4 text-center text-3xl font-black tracking-[0.5em] text-reva-gold focus:outline-none focus:ring-2 focus:ring-reva-gold"
                        placeholder="000000"
                        required
                        autoFocus
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleResend}
                      disabled={isLoading}
                      className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-reva-gold transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={12} /> Resend Verification Code
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="main-inputs" className="space-y-5">
                    {authState === 'SIGNUP' && (
                      <>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-reva-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-reva-gold"
                            placeholder="Display Name"
                            required
                          />
                        </div>
                        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-reva-900/50 rounded-2xl border border-white/5">
                          {(['CUSTOMER', 'OWNER'] as UserRole[]).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all tracking-widest uppercase ${role === r ? 'bg-reva-gold text-reva-900 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            >
                              {r === 'CUSTOMER' ? 'GUEST' : 'OWNER'}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-reva-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-reva-gold"
                        placeholder="Verified Email"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-reva-900/50 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-reva-gold"
                        placeholder="Security Password"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-[10px] font-black text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20 uppercase tracking-widest">
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-reva-gold text-reva-900 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-reva-gold/20 disabled:opacity-50 uppercase tracking-[0.2em] text-[11px]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  (authState === 'OTP_SIGNUP' || authState === 'OTP_LOGIN') ? 'AUTHORIZE SESSION' : 
                  authState === 'LOGIN' ? 'REQUEST ACCESS' : 'START VERIFICATION'
                )}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
          )}

          <div className="mt-10 text-center">
            {(authState === 'OTP_SIGNUP' || authState === 'OTP_LOGIN') ? (
               <button onClick={() => setAuthState(authState === 'OTP_SIGNUP' ? 'SIGNUP' : 'LOGIN')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Back to Credentials</button>
            ) : authState !== 'PENDING' && (
              <button
                onClick={() => setAuthState(authState === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                className="text-[10px] font-black text-reva-gold tracking-[0.3em] uppercase hover:underline"
              >
                {authState === 'LOGIN' ? "Establish New Identity" : "Already Vetted? Enter"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
