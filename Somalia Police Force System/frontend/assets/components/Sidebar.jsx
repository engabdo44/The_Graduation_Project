import React from 'react';
import { translations } from '../translations';
const Sidebar = ({
  activeTab,
  setActiveTab,
  lang
}) => {
  const t = translations[lang];
  const spfLogo = "/logo.svg";
  const menuItems = [{
    id: 'dashboard',
    label: t.dashboard,
    icon: '🏛️'
  }, {
    id: 'search',
    label: t.search,
    icon: '🔍'
  }, {
    id: 'archives',
    label: t.archives || 'Criminal Archives',
    icon: '🗄️'
  }, {
    id: 'add-crime',
    label: lang === 'ar' ? 'إضافة سجل جنائي' : (lang === 'so' ? 'Diiwaan Dambiyeed' : 'Add Crime'),
    icon: '⚖️'
  }, {
    id: 'add-resident-crime',
    label: lang === 'ar' ? 'سجل جنائي للمقيمين' : (lang === 'so' ? 'Dambiyada Dadka Soo Galootiga' : 'Resident Crime Record'),
    icon: '🛂'
  }, {
    id: 'reports',
    label: t.reports || 'Reports',
    icon: '📊'
  }];
  return <div className={`w-64 bg-[#0b1528] text-slate-300 h-screen flex flex-col border-r border-white/10 z-30 relative overflow-hidden`}>
      <div className="p-8 relative z-10 flex flex-col items-center">
        <div className="relative mb-6 group cursor-pointer">
          <img src={spfLogo} alt="Somali Police Force Seal" className="w-40 h-40 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar relative z-10">
        {menuItems.map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full group flex items-center px-5 py-3 transition-all duration-200 rounded-lg ${activeTab === item.id ? 'bg-white/10 text-white shadow-lg shadow-black/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <span className={`text-base transition-transform group-hover:scale-110 ${t.dir === 'rtl' ? 'ml-3' : 'mr-3'}`}>{item.icon}</span>
            <span className="font-bold text-[9px] uppercase tracking-[0.2em]">{item.label}</span>
          </button>)}
      </nav>

    </div>;
};
export default Sidebar;
