import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import CitizenSearch from './components/CitizenSearch';
import Login from './components/Login';
import CriminalRecordForm from './components/CriminalRecordForm';
import ResidentCriminalRecordForm from './components/ResidentCriminalRecordForm';
import Reports from './components/Reports';
import CriminalArchives from './components/CriminalArchives';

import { translations } from './translations';
const INITIAL_CITIZENS = [{
  id: "SPF-100234-MG",
  firstName: "Ahmed",
  lastName: "Mohamed",
  dateOfBirth: "1985-05-12",
  gender: 'MALE',
  address: "22 Freedom St, Hodan District, Mogadishu",
  phoneNumber: "+252 61 555 1234",
  photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300&h=300",
  records: [{
    id: "REC-9910",
    date: "2023-11-15",
    type: "Traffic Violation",
    severity: 'A',
    description: "Exceeding speed limit in residential area of Mogadishu.",
    officerId: "OFF-77",
    location: "Hodan District",
    status: "CLOSED"
  }]
}];
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem('spf_lang') || 'en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [citizens, setCitizens] = useState(INITIAL_CITIZENS);
  const [dashboardData, setDashboardData] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'dashboard') {
      fetch('http://localhost:5000/api/dashboard/stats')
        .then(res => res.json())
        .then(data => setDashboardData(data))
        .catch(err => console.error('Failed to load dashboard stats:', err));
    }
  }, [isLoggedIn, activeTab]);
  const spfLogo = "/logo.svg";
  const t = translations[lang];
  useEffect(() => {
    localStorage.setItem('spf_lang', lang);
    document.documentElement.dir = t.dir;
    document.documentElement.lang = lang;

    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (user) {
      fetch('http://localhost:5000/api/logs/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id || null,
          action: 'language_changed',
          target: 'system_ui',
          details: `Language switched to ${lang} by user ${user.username}`
        })
      }).catch(err => console.error('Failed to log language change', err));
    }
  }, [lang, t.dir, user]);

  const handleAddRecord = async (citizenId, recordData) => {
    try {
      const response = await fetch('http://localhost:5000/api/criminal-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_number: citizenId,
          crime_type: recordData.type,
          severity: recordData.severity || 'C',
          incident_date: new Date().toISOString(),
          crime_details: recordData.description,
          status: 'open'
        })
      });

      if (!response.ok) throw new Error('Failed to save record');

      const result = await response.json();
      
      // Update local state if needed for immediate UI update
      setCitizens(prev => prev.map(c => c.id === citizenId ? {
        ...c,
        records: [{
          id: result.record.record_id,
          date: new Date().toISOString().split('T')[0],
          type: recordData.type,
          severity: recordData.severity || 'A',
          description: recordData.description,
          status: 'OPEN'
        }, ...c.records]
      } : c));

      // Refresh dashboard data if on dashboard
      if (activeTab === 'dashboard') {
        fetch('http://localhost:5000/api/dashboard/stats')
          .then(res => res.json())
          .then(data => setDashboardData(data));
      }
    } catch (error) {
      console.error('Add Record Error:', error);
      alert('Error saving criminal record to database.');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    if (userData.accountType === 'Police_Officer') {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const canAccessTab = (tab) => {
    if (!user) return false;
    const allowedRoles = ['Police_Officer', 'admin', 'Police_Supervisor', 'Police_Administrator', 'Ministry_Health_Admin'];
    return allowedRoles.includes(user.accountType);
  };
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} lang={lang} onLangChange={setLang} />;
  }
  return <div className={`flex h-screen bg-[#f8fafc] overflow-hidden font-medium`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
      
      <main className="flex-1 overflow-y-auto relative flex flex-col custom-scrollbar">
        {/* Modern Header */}
        <header className="sticky top-0 z-40 px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex justify-between items-center shrink-0">
          <div className="flex items-center gap-8">
             <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-0.5 h-3 bg-[#c5a059] rounded-full"></div>
                   <h2 className="official-heading text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em] leading-none">{t.subTitle}</h2>
                </div>
                <p className="official-heading text-xl font-black text-[#0b1528] tracking-tight leading-none">{t.title}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="h-6 w-px bg-slate-100"></div>

            {/* Globe Language Switcher */}
            <div className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className={`flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-100 transition-all active:scale-95 group shadow-sm ${showLangMenu ? 'bg-[#0b1528] border-[#0b1528] text-white' : 'bg-white text-slate-500 hover:border-slate-200'}`} title="Change Language">
                <span className="globe-rotate text-base">🌍</span>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {lang === 'so' ? 'AF-SO' : lang === 'ar' ? 'العربية' : 'EN-US'}
                </span>
              </button>
              
              {showLangMenu && <div className={`absolute top-14 ${t.dir === 'rtl' ? 'left-0' : 'right-0'} w-48 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-2xl p-1.5 z-50 animate-in`}>
                  {['so', 'ar', 'en'].map(l => <button key={l} onClick={() => {
                setLang(l);
                setShowLangMenu(false);
              }} className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${lang === l ? 'bg-[#0b1528] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <span>{l === 'so' ? 'Af-Soomaali' : l === 'ar' ? 'العربية' : 'English'}</span>
                      {lang === l && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>}
                    </button>)}
                </div>}
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className={`flex items-center gap-4 ${t.dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className={t.dir === 'rtl' ? 'text-left' : 'text-right'}>
                  <p className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight">Cmdr. Hassan Adan</p>
                  <p className="text-[8px] font-black text-[#c5a059] uppercase tracking-[0.2em] mt-0.5">{t.officer} // SPF-9921</p>
               </div>
               <div className="w-10 h-10 bg-white border border-slate-100 p-1 rounded-full shadow-sm group hover:border-[#c5a059] transition-all cursor-pointer relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute inset-0 bg-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={spfLogo} alt="Officer Avatar" className="w-full h-full object-contain relative z-10" />
               </div>
               <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-300 hover:text-white hover:bg-red-700 hover:border-red-700 transition-all group shadow-sm active:scale-95" title="Logout">
                 <span className="text-lg transition-transform group-hover:rotate-12">⏻</span>
               </button>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="p-12 flex-1 relative">
          <div className="absolute top-0 left-0 w-full h-full official-seal-bg pointer-events-none"></div>
          
          <div className="relative z-10">
            {!canAccessTab(activeTab) ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-lock text-red-500 text-3xl"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.5em] mb-2">Access Denied</h3>
                <p className="text-sm text-slate-600 mb-6 font-bold uppercase tracking-widest">You do not have permission to access this section</p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="bg-[#0b1528] text-white px-6 py-3 font-black uppercase tracking-wider text-xs hover:bg-[#162a4d] transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <DashboardOverview dashboardData={dashboardData} lang={lang} />}
                {activeTab === 'search' && <CitizenSearch citizens={citizens} onAddRecord={handleAddRecord} lang={lang} />}
                {activeTab === 'add-crime' && <CriminalRecordForm lang={lang} />}
                {activeTab === 'add-resident-crime' && <ResidentCriminalRecordForm lang={lang} />}
                {activeTab === 'archives' && <CriminalArchives lang={lang} user={user} />}
                {activeTab === 'reports' && <Reports lang={lang} user={user} />}

                {!['dashboard', 'search', 'add-crime', 'add-resident-crime', 'archives', 'reports'].includes(activeTab) && <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-40">

                    <div className="w-40 h-40 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-6xl mb-10 shadow-inner p-8">
                      <img src={spfLogo} alt="Restricted" className="w-full h-full object-contain grayscale" />
                    </div>
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-[0.5em]">Classified Access</h3>
                    <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">Biometric Authorization Required</p>
                  </div>}
              </>
            )}
          </div>
        </div>
        
        {/* Sophisticated Footer */}
        <footer className="px-8 py-3 border-t border-slate-200 bg-white/50 backdrop-blur-md flex justify-between items-center">
           <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
           </div>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-40">Ciidanka Booliska Soomaaliyeed © 2024</p>
        </footer>
      </main>
    </div>;
};
export default App;
