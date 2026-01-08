
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, DollarSign, Shield, Send, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const BecomeHost: React.FC = () => {
  const { t } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyName: '',
    location: '',
    description: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="pb-16 bg-slate-50 dark:bg-reva-900 transition-colors duration-500">
      
      {/* Hero */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden mb-16 rounded-b-[4rem]">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury Home" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-reva-900/70"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter"
          >
            Unlock the Potential of Your Property
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 font-medium"
          >
            Join Reva's exclusive collection of hosts and connect with discerning travelers.
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <BenefitCard 
            icon={<Home size={32} />} 
            title="Complete Control" 
            desc="You decide when your property is available and who stays there." 
            delay={0.1}
          />
          <BenefitCard 
            icon={<DollarSign size={32} />} 
            title="Maximize Earnings" 
            desc="Our AI-driven pricing ensures you get the best value for your luxury asset." 
            delay={0.2}
          />
          <BenefitCard 
            icon={<Shield size={32} />} 
            title="Trusted Partners" 
            desc="We verify all guests and offer comprehensive protection for your peace of mind." 
            delay={0.3}
          />
        </div>

        {/* Application Form */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-reva-800 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-transparent dark:border-white/5"
        >
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Application Received!</h2>
              <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-8 font-medium">
                Thank you for your interest in becoming a Reva host. Our team will review your property details and get back to you within 48 hours.
              </p>
              <button 
                onClick={() => window.location.href = '/'} 
                className="px-8 py-4 bg-reva-gold text-reva-900 font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-reva-gold/20"
              >
                Return Home
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">List Your Property</h2>
                <p className="text-slate-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em]">Fill out the form below to start your journey.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 dark:bg-reva-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-reva-gold dark:text-white font-bold"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 dark:bg-reva-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-reva-gold dark:text-white font-bold"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 dark:bg-reva-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-reva-gold dark:text-white font-bold"
                      placeholder="+962 79 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">Property Location</label>
                    <select 
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 dark:bg-reva-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-reva-gold dark:text-white font-bold appearance-none uppercase tracking-widest text-xs"
                    >
                      <option value="">Select Governorate</option>
                      <option value="Amman">Amman</option>
                      <option value="Dead Sea">Dead Sea</option>
                      <option value="Aqaba">Aqaba</option>
                      <option value="Wadi Rum">Wadi Rum</option>
                      <option value="Ajloun">Ajloun</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">Property Name / Type</label>
                  <input 
                    type="text" 
                    name="propertyName"
                    required
                    value={formData.propertyName}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 dark:bg-reva-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-reva-gold dark:text-white font-bold"
                    placeholder="e.g. Sunset Villa, Downtown Apartment"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest ml-1">Brief Description</label>
                  <textarea 
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 dark:bg-reva-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:border-reva-gold dark:text-white font-bold resize-none"
                    placeholder="Tell us a bit about your property..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-reva-gold text-reva-900 font-black text-xs rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-reva-gold/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                >
                  Submit Application <Send size={20} className="rtl:rotate-180"/>
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const BenefitCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, delay: number }> = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-white dark:bg-reva-800 p-8 rounded-[2rem] text-center border border-transparent dark:border-white/5 shadow-lg hover:border-reva-gold/30 transition-all"
  >
    <div className="w-16 h-16 bg-slate-50 dark:bg-reva-900 rounded-2xl flex items-center justify-center text-reva-gold mx-auto mb-6 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">{title}</h3>
    <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-sm font-medium">
      {desc}
    </p>
  </motion.div>
);

export default BecomeHost;
