import React, { useState } from 'react';
import { motion } from 'motion/react';
import { translations } from '../translations';
import LanguageSwitcher from './LanguageSwitcher';
import { NotificationContainer } from './Notification';

const Login = ({ onLogin, lang, setLang }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    nodeId: 'MOG-HQ-PRIMARY'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  const t = translations[lang].login;

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5002/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        addNotification('success', lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
        
        // Redirect based on role
        const redirectView = (data.user.role === 'Ministry Health Admin' || data.user.role === 'Ministry_Health_Admin') ? 'MINISTRY_DASHBOARD' : 'DASHBOARD';
        
        onLogin({
          ...data.user,
          redirectView
        });
      } else {
        setError(data.error || t.errorEmpty);
        addNotification('error', data.error || (lang === 'ar' ? 'فشل تسجيل الدخول' : 'Login failed'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      const msg = lang === 'ar'
        ? 'تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.'
        : 'Unable to reach the server. Please try again later.';
      setError(msg);
      addNotification('error', msg);
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gov-navy flex items-center justify-center p-6 guilloche-pattern ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <LanguageSwitcher lang={lang} setLang={setLang} variant="floating" />
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} lang={lang} />
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



          <p className="text-center text-[9px] text-slate-400 mt-8 font-medium uppercase tracking-widest leading-relaxed">
            {t.secureNote}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
