import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BirthCertificate from './components/BirthCertificate';
import DeathCertificate from './components/DeathCertificate';
import HealthRecords from './components/HealthRecords';
import Login from './components/Login';
import LanguageSwitcher from './components/LanguageSwitcher';
import { View } from './types';
import { translations } from './translations';

const App = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState(View.DASHBOARD);
  const [lang, setLang] = useState('en');

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLogout = () => {
    setUser(null);
    setCurrentView(View.DASHBOARD);
  };

  if (!user) {
    return <Login onLogin={setUser} lang={lang} setLang={setLang} />;
  }

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD: return <Dashboard user={user} lang={lang} />;
      case View.BIRTH_CERT: return <BirthCertificate lang={lang} />;
      case View.DEATH_CERT: return <DeathCertificate lang={lang} />;
      case View.HEALTH_RECORDS: return <HealthRecords lang={lang} />;
      default: return <Dashboard user={user} lang={lang} />;
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
