import React, { useState } from 'react';
import { translations } from '../translations';

const Login = ({
  onLogin,
  lang,
  onLangChange
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [error, setError] = useState('');
  const t = translations[lang];
  const spfLogo = "/logo.svg";
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      // Fallback to mock authentication for development
      setTimeout(() => {
        onLogin({
          username: username,
          accountType: 'Police_Officer',
          isActive: true
        });
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#0b1528]">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full official-seal-bg opacity-[0.02]"></div>
      <div className="absolute top-0 left-0 w-full h-1.5 security-banner"></div>
      <div className="absolute bottom-0 left-0 w-full h-1.5 security-banner"></div>

      {/* Globe Switcher for Login */}
      <div className="absolute top-10 right-10 z-50">
        <button onClick={() => setShowLangMenu(!showLangMenu)} className={`px-6 py-3 rounded-none flex items-center gap-3 transition-all active:scale-95 group relative overflow-hidden shadow-2xl border ${showLangMenu ? 'bg-white border-white text-slate-900' : 'bg-white/5 backdrop-blur-xl border-white/10 text-white hover:bg-white/10'}`}>
          <span className="globe-rotate text-xl">🌍</span>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {lang === 'so' ? 'Af-Soomaali' : lang === 'ar' ? 'العربية' : 'English'}
          </span>
        </button>
        
        {showLangMenu && <div className={`absolute top-14 right-0 w-56 bg-white rounded-none overflow-hidden shadow-2xl p-1.5 z-50 animate-in border border-slate-200`}>
            {['so', 'ar', 'en'].map(l => <button key={l} onClick={() => {
          onLangChange(l);
          setShowLangMenu(false);
        }} className={`w-full text-left px-5 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group/item ${lang === l ? 'bg-[#0b1528] text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                <span>{l === 'so' ? 'Af-Soomaali' : l === 'ar' ? 'العربية' : 'English'}</span>
                {lang === l && <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059]"></div>}
              </button>)}
          </div>}
      </div>

      <div className="w-full max-w-md relative z-10 animate-in">
        <div className="bg-white p-12 md:p-16 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#c5a059]"></div>
          
          <div className="flex flex-col items-center mb-16">
            <div className="relative mb-10 group cursor-pointer">
              <div className="absolute inset-0 bg-blue-500/5 blur-2xl transition-all"></div>
              <div className="relative w-32 h-32 p-3 bg-white border border-slate-200 shadow-xl ring-1 ring-slate-100">
                <img src={spfLogo} alt="SPF Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0b1528] text-white text-[8px] font-black px-4 py-1.5 shadow-xl uppercase tracking-[0.2em] border border-white/20 whitespace-nowrap">
                AUTHORIZED PERSONNEL ONLY
              </div>
            </div>
            <h2 className="official-heading text-3xl font-black text-slate-900 text-center tracking-tight mb-3 uppercase">
              {t.loginTitle}
            </h2>
            <div className="h-1 w-16 bg-[#c5a059] mb-6"></div>
            <p className="text-slate-400 text-[10px] text-center font-bold uppercase tracking-[0.3em] max-w-[320px] leading-relaxed">
              {t.loginSub}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-none text-[10px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {t.username}
              </label>
              <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 font-bold outline-none focus:border-[#0b1528] transition-all text-sm placeholder:text-slate-300 rounded-none" placeholder="SPF-XXXX-XX" />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {t.password}
              </label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 font-bold outline-none focus:border-[#0b1528] transition-all text-sm placeholder:text-slate-300 rounded-none" placeholder="••••••••" />
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="h-3 w-3 border-slate-200 rounded-none text-[#0b1528] focus:ring-0" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{t.rememberMe}</span>
              </label>
              <button type="button" className="text-[9px] font-bold text-[#c5a059] uppercase tracking-widest hover:text-[#0b1528] transition-colors">
                {t.forgotPass}
              </button>
            </div>

            <button disabled={isLoading} type="submit" className="w-full bg-[#0b1528] text-white py-5 font-black uppercase tracking-[0.4em] text-[10px] shadow-xl hover:bg-[#162a4d] active:scale-95 transition-all disabled:opacity-50 relative overflow-hidden">
              <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{t.loginBtn}</span>
              {isLoading && <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>}
            </button>
          </form>
          
          <div className="mt-12 flex justify-center items-center gap-4">
             <div className="h-px flex-1 bg-slate-100"></div>
             <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.5em]">Security Protocol v4.2</p>
             <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>
    </div>;
};
export default Login;
