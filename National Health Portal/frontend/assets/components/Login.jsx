import React, { useState } from 'react';
import { motion } from 'motion/react';
import { translations } from '../translations';
import LanguageSwitcher from './LanguageSwitcher';

const Login = ({ onLogin, lang, setLang }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    nodeId: 'MOG-HQ-PRIMARY'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = translations[lang].login;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (credentials.username.trim() && credentials.password.trim()) {
        onLogin({
          name: credentials.username === 'admin' ? 'Dr. Jama Mohamed' : credentials.username,
          role: credentials.username === 'admin' ? 'System Root' : 'Sector Authorized',
          node: credentials.nodeId,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.username}`
        });
      } else {
        setError(t.errorEmpty);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className={`min-h-screen bg-gov-navy flex items-center justify-center p-6 guilloche-pattern ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <LanguageSwitcher lang={lang} setLang={setLang} variant="floating" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gov-navy via-gov-gold to-gov-blue"></div>
        
        <div className="p-10">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Somalia.svg" alt="Crest" className="h-14" />
            </motion.div>
            <h2 className="text-2xl font-black text-gov-navy gov-serif uppercase tracking-tight leading-tight">{t.title}</h2>
            <p className="text-gov-blue font-bold text-[10px] uppercase tracking-[0.3em] mt-2">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.username}</label>
              <div className="relative">
                <i className={`fa-solid fa-user-shield absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-300 text-sm`}></i>
                <input 
                  required
                  className={`w-full h-12 ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-slate-50 rounded-xl border border-slate-200 focus:border-gov-blue outline-none transition-all font-bold text-gov-navy text-[13px]`}
                  placeholder={t.usernamePlaceholder}
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t.password}</label>
              <div className="relative">
                <i className={`fa-solid fa-key absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-300 text-sm`}></i>
                <input 
                  required
                  type="password"
                  className={`w-full h-12 ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-slate-50 rounded-xl border border-slate-200 focus:border-gov-blue outline-none transition-all font-bold text-gov-navy text-[13px]`}
                  placeholder={t.passwordPlaceholder}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-[10px] font-bold uppercase leading-relaxed text-center"
              >
                <i className="fa-solid fa-triangle-exclamation mr-2"></i>
                {error}
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="w-full h-14 bg-gov-navy text-gov-gold rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 border-b-[3px] border-gov-gold text-xs mt-4"
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
              ) : (
                <>
                  <i className="fa-solid fa-fingerprint"></i>
                  {t.submit}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button 
              onClick={() => {
                onLogin({
                  name: 'Dr. Jama Mohamed',
                  role: 'System Root',
                  node: 'MOG-HQ-PRIMARY',
                  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
                });
              }}
              className="w-full h-11 bg-gov-blue/5 text-gov-blue rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gov-blue hover:text-white transition-all flex items-center justify-center gap-2 border border-gov-blue/10"
            >
              <i className="fa-solid fa-bolt"></i>
              {t.quickAccess}
            </button>
          </div>

          <p className="text-center text-[9px] text-slate-400 mt-8 font-medium uppercase tracking-widest leading-relaxed">
            {t.secureNote}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
