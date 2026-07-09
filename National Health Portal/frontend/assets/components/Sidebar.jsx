import React from 'react';
import { motion } from 'motion/react';
import { View } from '../types';
import { translations } from '../translations';

const Sidebar = ({ currentView, setView, user, onLogout, lang }) => {
  const t = translations[lang].nav;

  const menuItems = [
    { id: View.DASHBOARD, label: t.dashboard, icon: 'fa-shield-halved' },
    { id: View.HEALTH_RECORDS, label: t.healthRecords, icon: 'fa-users-line' },
    { id: View.BIRTH_CERT, label: t.birthCert, icon: 'fa-baby' },
    { id: View.DEATH_CERT, label: t.deathCert, icon: 'fa-scroll' },
    { id: View.REPORTS, label: t.reports, icon: 'fa-chart-pie' },
    ...(user.role === 'Ministry Health Admin' ? [{ id: View.MINISTRY_DASHBOARD, label: lang === 'ar' ? 'لوحة الوزارة' : 'Ministry Dashboard', icon: 'fa-building-columns' }] : []),
  ];

  return (
    <div className={`w-64 bg-gov-navy h-screen fixed ${lang === 'ar' ? 'right-0' : 'left-0'} top-0 text-white flex flex-col z-50 shadow-2xl border-white/5`}>
      <div className="p-6 text-center border-b border-white/5 relative bg-white/[0.02]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl ring-1 ring-white/10 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gov-blue/10 to-transparent"></div>
          <i className="fa-solid fa-star text-gov-gold text-3xl drop-shadow-[0_0_10px_rgba(197,160,89,0.3)]"></i>
        </motion.div>
        <h1 className="font-black text-xl leading-tight tracking-tight gov-serif uppercase text-white/90">Somalia</h1>
        <p className="text-[9px] text-gov-blue uppercase tracking-[0.3em] mt-1 font-black opacity-60">Ministry of Health</p>
      </div>

      <nav className="flex-1 mt-6">
        <ul className="space-y-1.5 px-4">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setView(item.id)}
                className={`w-full group relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 ${
                  currentView === item.id 
                    ? 'bg-white/5 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                {currentView === item.id && (
                  <motion.div 
                    layoutId="active-nav"
                    className={`absolute ${lang === 'ar' ? 'right-1' : 'left-1'} w-1 h-5 bg-gov-gold rounded-full`}
                  />
                )}
                <i className={`fa-solid ${item.icon} w-5 text-base transition-transform duration-300 group-hover:scale-110 ${currentView === item.id ? 'text-gov-gold' : 'text-slate-500'}`}></i>
                <span className={`font-bold text-[11px] uppercase tracking-wider ${currentView === item.id ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-5">
        <div className="bg-black/20 p-3.5 rounded-2xl border border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl border border-white/10 p-0.5 bg-white/5">
                <div className="w-full h-full rounded-[10px] overflow-hidden">
                  <img src={user.avatar} alt="Admin" className="w-full h-full bg-slate-800" />
                </div>
              </div>
              <div className={`flex-1 min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <p className="text-[10px] font-black text-white/90 truncate uppercase tracking-tight">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></div>
                  <span className="text-[8px] text-gov-blue font-bold uppercase tracking-widest truncate">{user.role}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 opacity-40">
                  <i className="fa-solid fa-server text-[7px] text-gov-gold"></i>
                  <span className="text-[7px] font-mono uppercase tracking-tighter text-white/50">{user.node}</span>
                </div>
              </div>
           </div>
           <button 
             onClick={onLogout}
             className="w-full mt-3 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-tighter border border-rose-500/20"
           >
             <i className="fa-solid fa-power-off text-[10px]"></i>
             {t.logout}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
