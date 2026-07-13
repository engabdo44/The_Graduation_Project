import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import PrintingCenter from './components/PrintingCenter';

import BirthCertificate from './components/BirthCertificate';
import DeathCertificate from './components/DeathCertificate';
import HealthRecords from './components/HealthRecords';
import MinistryDashboard from './components/MinistryDashboard';
import Login from './components/Login';
import LanguageSwitcher from './components/LanguageSwitcher';
import Reports from './components/Reports';
import { View } from './types';
import { translations } from './translations';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('health_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('health_currentView') || View.MINISTRY_DASHBOARD;
  });
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('health_lang') || 'en';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('health_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('health_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('health_currentView', currentView);
  }, [currentView]);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('health_lang', lang);
  }, [lang]);

  const handleLogin = (userData) => {
    setUser(userData);
    // Set initial view based on role
      setCurrentView(View.MINISTRY_DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(View.MINISTRY_DASHBOARD);
  };

  const canAccessView = (view) => {
    if (!user) return false;
    
    if (user.role === 'Ministry Health Admin' || user.role === 'Ministry_Health_Admin') {
      return true;
    }
    
    return false;
  };

  if (!user) {
    return <Login onLogin={handleLogin} lang={lang} setLang={setLang} />;
  }

  const renderView = () => {
    // Check access control
    if (!canAccessView(currentView)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-lock text-rose-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-black text-gov-navy mb-2">
            {lang === 'ar' ? 'وصول مرفوض' : 'Access Denied'}
          </h2>
          <p className="text-slate-600 font-medium mb-6">
            {lang === 'ar' 
              ? 'ليس لديك الصلاحية للوصول إلى هذه الصفحة'
              : 'You do not have permission to access this page'}
          </p>
          <button
            onClick={() => setCurrentView(View.MINISTRY_DASHBOARD)}
            className="bg-gov-navy text-white px-6 py-3 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-black transition-colors"
          >
            {lang === 'ar' ? 'العودة إلى لوحة التحكم' : 'Return to Dashboard'}
          </button>
        </div>
      );
    }

    switch (currentView) {
      case View.MINISTRY_DASHBOARD: return <MinistryDashboard user={user} lang={lang} />;
      case View.BIRTH_CERT: return <BirthCertificate lang={lang} />;
      case View.DEATH_CERT: return <DeathCertificate lang={lang} />;
      case View.HEALTH_RECORDS: return <HealthRecords lang={lang} />;
      case View.PRINTING_CENTER: return <PrintingCenter user={user} lang={lang} />;
      case View.REPORTS: return <Reports user={user} lang={lang} />;
      default: return <MinistryDashboard user={user} lang={lang} />;
    }
  };

  return (
    <div className={`min-h-screen flex bg-[#f8fafc] guilloche-pattern ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        user={user}
        onLogout={handleLogout}
        lang={lang}
      />
      
      <LanguageSwitcher lang={lang} setLang={setLang} variant="floating" />
      
      <main className={`flex-1 ${lang === 'ar' ? 'mr-64' : 'ml-64'} p-6 min-h-screen relative`}>
         <div className="max-w-[1240px] mx-auto pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="pb-20"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
