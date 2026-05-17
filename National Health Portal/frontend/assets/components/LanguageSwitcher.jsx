import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const LanguageSwitcher = ({ lang, setLang, variant = 'floating' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇴' },
    { code: 'so', label: 'Soomaali', flag: '🇸🇴' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const containerClasses = variant === 'floating' 
    ? `fixed top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-[100]`
    : `relative px-6 py-4 border-b border-white/5`;

  const buttonClasses = variant === 'floating'
    ? "w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center text-gov-navy hover:scale-110 transition-transform border border-slate-100"
    : "w-full h-10 bg-white/5 rounded-xl flex items-center justify-between px-4 text-white/70 hover:bg-white/10 transition-all border border-white/5";

  return (
    <div className={containerClasses} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        <i className="fa-solid fa-globe text-lg"></i>
        {variant === 'sidebar' && (
          <>
            <span className="text-[10px] font-black uppercase tracking-widest flex-1 text-center">
              {languages.find(l => l.code === lang)?.label}
            </span>
            <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: variant === 'floating' ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute ${variant === 'floating' ? (lang === 'ar' ? 'left-0' : 'right-0') : 'left-6 right-6'} mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[110]`}
          >
            <div className="py-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    lang === l.code ? 'bg-gov-blue/5 text-gov-blue font-black' : 'text-slate-600 font-bold'
                  }`}
                >
                  <span className={`text-[11px] uppercase tracking-wider ${l.code === 'ar' ? 'font-arabic' : ''}`}>{l.label}</span>
                  {lang === l.code && <i className="fa-solid fa-check text-[10px]"></i>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
