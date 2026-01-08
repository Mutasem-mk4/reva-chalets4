
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, Database, AlertCircle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { User, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Fix: login now returns { user }, resolving the "Property 'user' does not exist on type 'void'" error
      const { user } = await dataService.login(email, password);
      if (user.role !== UserRole.ADMIN) {
        throw new Error("ACCESS DENIED: Administrative credentials required.");
      }
      
      // Fix: Manually set the session as AdminLogin bypasses the standard verifyLoginOtp verification step
      localStorage.setItem('reva_session', JSON.stringify(user));
      
      onLoginSuccess(user);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-reva-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f242d_1px,transparent_1px),linear-gradient(to_bottom,#1f242d_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-reva-900 via-transparent to-transparent"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            animate={{ 
              boxShadow: ["0 0 0px #d4af37", "0 0 40px #d4af37", "0 0 0px #d4af37"],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-reva-gold rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative"
          >
            <ShieldCheck className="text-reva-900" size={48} />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-reva-900 border-2 border-reva-gold rounded-full flex items-center justify-center">
              <Database size={14} className="text-reva-gold" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">System Portal</h1>
          <p className="text-reva-gold text-[10px] font-black tracking-[0.4em] uppercase">Reva Chalet Core Interface</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-reva-gold to-transparent opacity-50"></div>
          
          <form onSubmit={handleAdminLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-reva-gold transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-reva-900/50 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-reva-gold transition-all"
                  placeholder="System Administrator Email"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-reva-gold transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-reva-900/50 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-reva-gold transition-all"
                  placeholder="Encryption Key (Password)"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-500 text-xs font-black uppercase tracking-widest"
              >
                <AlertCircle size={20} /> {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-reva-gold text-reva-900 font-black py-6 rounded-2xl flex items-center justify-center gap-4 hover:brightness-110 transition-all shadow-xl shadow-reva-gold/20 disabled:opacity-50 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  INITIALIZE CORE ACCESS <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
            Unauthorized access attempts are monitored and logged to the <br/>
            <span className="text-reva-gold">REVA-CHALET MongoDB Cluster</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
