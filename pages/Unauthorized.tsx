
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative inline-block mb-8"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert size={48} />
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 w-10 h-10 bg-reva-gold rounded-full flex items-center justify-center text-reva-900 shadow-lg"
          >
            <Lock size={18} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4"
        >
          ACCESS DENIED
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 dark:text-gray-400 mb-10 font-medium"
        >
          You do not have the security clearance required to view this sanctuary. Please contact the administrator or switch accounts.
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-reva-900 dark:bg-white text-white dark:text-reva-900 font-black rounded-2xl shadow-xl transition-all"
        >
          <ArrowLeft size={20} /> RETURN TO SAFETY
        </motion.button>
      </div>
    </div>
  );
};

export default Unauthorized;
