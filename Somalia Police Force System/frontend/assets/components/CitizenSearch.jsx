import React, { useState } from 'react';
import { analyzeCriminalRecord, suggestCrimeClassification } from '../services/geminiService';
import { translations } from '../translations';
const CitizenSearch = ({
  citizens,
  onAddRecord,
  lang
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const spfLogo = "/logo.svg";
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    severity: 'C'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[lang];

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length !== 11) {
      setError(lang === 'ar' ? 'يرجى إدخال 11 رقماً' : 'Please enter 11 digits');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedCitizen(null);
    setAiAnalysis(null);

    try {
      const response = await fetch(`http://localhost:5000/api/person/${searchTerm}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Person not found');
        }
        throw new Error('Server error');
      }
      
      const data = await response.json();
      
      // Map backend data to frontend format
      const mappedCitizen = {
        id: data.national_number || data.residence_number,
        firstName: data.full_name.split(' ')[0],
        lastName: data.full_name.split(' ').slice(1).join(' ') || '',
        fullName: data.full_name,
        dateOfBirth: new Date(data.dob).toISOString().split('T')[0],
        gender: data.gender.toUpperCase(),
        address: data.address || 'N/A',
        phoneNumber: data.phone || 'N/A',
        photoUrl: data.photoUrl || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300&h=300",
        records: data.criminal_records.map(r => ({
          id: r.record_id,
          date: new Date(r.incident_date).toISOString().split('T')[0],
          type: r.crime_type,
          severity: r.severity || CrimeSeverity.MEDIUM, // Default if not in DB
          description: r.court_decision || 'No details available',
          status: r.status
        }))
      };
      
      setSelectedCitizen(mappedCitizen);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleAiAnalysis = async () => {
    if (!selectedCitizen) return;
    setLoadingAi(true);
    const analysis = await analyzeCriminalRecord(selectedCitizen);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };
  const handleAISuggestion = async () => {
    if (!formData.description) return;
    setSuggesting(true);
    const suggestion = await suggestCrimeClassification(formData.description);
    if (suggestion) {
      setFormData(prev => ({
        ...prev,
        type: suggestion.classification || prev.type,
        severity: suggestion.severity || prev.severity
      }));
    }
    setSuggesting(false);
  };
  const handleSubmitCrime = e => {
    e.preventDefault();
    if (!selectedCitizen) return;
    onAddRecord(selectedCitizen.id, {
      ...formData,
      status: 'PENDING'
    });
    setFormData({
      type: '',
      description: '',
      location: '',
      severity: CrimeSeverity.LOW
    });
    setIsAdding(false);
  };
  return <div className="space-y-10 animate-in max-w-7xl mx-auto pb-10">
      {/* National Intelligence Query Module */}
      <div className="bg-white border border-slate-200 p-10 shadow-xl rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 id-card-pattern opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-1.5 h-1.5 bg-[#c5a059] rounded-full shadow-[0_0_8px_#c5a059]"></div>
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] leading-none">
               {t.subTitle} // {t.search}
             </label>
           </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group/input">
              <span className={`absolute ${t.dir === 'rtl' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-xl transition-colors ${searchTerm ? 'text-[#0b1528]' : 'text-slate-300'}`}>🔍</span>
              <input type="text" placeholder={t.searchPlaceholder} className={`w-full bg-slate-50/50 border border-slate-200 rounded-2xl ${t.dir === 'rtl' ? 'pr-20 pl-8' : 'pl-20 pr-8'} py-4.5 font-bold text-slate-800 focus:border-[#0b1528] focus:bg-white outline-none transition-all text-lg placeholder:text-slate-300 shadow-inner`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <button onClick={handleSearch} disabled={loading} className="bg-[#0b1528] text-white px-12 py-4.5 font-black uppercase tracking-[0.4em] rounded-2xl active:scale-95 text-xs shadow-xl shadow-blue-900/10 hover:bg-[#162a4d] transition-all flex items-center justify-center min-w-[200px]">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : t.searchBtn}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
              ⚠️ {error === 'Person not found' ? (lang === 'ar' ? 'لم يتم العثور على الشخص' : 'Person not found') : error}
            </p>
          )}
        </div>
      </div>

      {selectedCitizen ? <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Detailed Citizen Dossier - National ID Style */}
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white dossier-card overflow-hidden relative group">
              <div className="absolute inset-0 id-card-pattern pointer-events-none opacity-50"></div>
              
              <div className="p-10 text-center bg-slate-50/30 border-b border-slate-100 relative">
                 <div className="absolute top-4 left-6 opacity-10">
                    <img src="/logo.svg" alt="Seal" className="w-14 h-14" />
                 </div>
                 
                 <div className="relative inline-block mb-8">
                    <div className="w-48 h-48 bg-white border-2 border-slate-200 mx-auto p-1 relative shadow-inner overflow-hidden rounded-xl">
                       <img src={selectedCitizen.photoUrl} alt="Subject" className="w-full h-full object-cover grayscale brightness-110 contrast-125" />
                    </div>
                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0b1528] text-white px-4 py-1.5 text-[8px] font-black tracking-widest uppercase whitespace-nowrap border border-white/20`}>
                       {t.verified} // ID-PRO
                    </div>
                 </div>

                 <h3 className="official-heading text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                   {selectedCitizen.firstName} {selectedCitizen.lastName}
                 </h3>
                 <div className="flex items-center justify-center gap-3">
                    <span className="w-8 h-px bg-slate-200"></span>
                    <p className="text-[#c5a059] font-black text-[11px] uppercase tracking-[0.4em]">
                      {selectedCitizen.id}
                    </p>
                    <span className="w-8 h-px bg-slate-200"></span>
                 </div>
              </div>

              <div className="p-8 space-y-6 relative z-10 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/50 border border-slate-100 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest leading-none">{t.gender}</p>
                    <p className="text-xs font-black text-slate-800 uppercase leading-none">{selectedCitizen.gender === 'MALE' ? t.male : t.female}</p>
                  </div>
                  <div className="p-4 bg-white/50 border border-slate-100 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest leading-none">{t.dob}</p>
                    <p className="text-xs font-black text-slate-800 leading-none">{selectedCitizen.dateOfBirth}</p>
                  </div>
                </div>
                <div className="p-4 bg-white/50 border border-slate-100 shadow-sm">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-2 tracking-widest leading-none">{t.address}</p>
                  <p className="text-xs font-black text-slate-800 leading-relaxed uppercase">{selectedCitizen.address}</p>
                </div>
              </div>
            </div>
            
            <button onClick={() => setIsAdding(true)} className="w-full bg-[#991b1b] text-white py-8 rounded-3xl font-black uppercase tracking-[0.4em] hover:bg-red-900 transition-all shadow-xl shadow-red-900/10 flex flex-col items-center justify-center gap-2 group active:scale-95 border-b-4 border-red-950">
              <span className="text-[10px] opacity-60 font-medium tracking-[0.5em] mb-1">Official Directive</span>
              <div className="flex items-center gap-6">
                 <span className="text-3xl transition-transform group-hover:rotate-12">⚖️</span>
                 <span className="text-sm">{t.addCharge}</span>
              </div>
            </button>
          </div>

          {/* AI Insights & Federal Records */}
          <div className="lg:col-span-8 space-y-12">
            {/* Intelligence Profile */}
            <div className="bg-[#0b1528] p-8 text-white rounded-3xl shadow-2xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <img src="/logo.svg" alt="SPF" className="w-16 h-16 grayscale invert" />
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="official-heading text-lg font-bold text-white uppercase tracking-[0.2em] mb-1.5">{t.aiAnalysis}</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.5em]">Forensic Intelligence v8.4</p>
                  </div>
                  {!aiAnalysis && <button onClick={handleAiAnalysis} disabled={loadingAi} className={`px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-[0.3em] transition-all shadow-xl ${loadingAi ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#c5a059] text-[#0b1528] hover:bg-white hover:shadow-white/20 active:scale-95'}`}>
                      {loadingAi ? <div className="flex items-center gap-3">
                            <div className="w-3 h-3 border-2 border-[#0b1528]/30 border-t-[#0c1e3d] rounded-full animate-spin"></div>
                            {t.scanning}
                         </div> : t.runScan}
                    </button>}
                </div>
                
                <div className="min-h-[160px] bg-black/20 backdrop-blur-sm rounded-2xl border border-white/5 p-6 relative">
                   {loadingAi && <div className="absolute inset-0 z-20 pointer-events-none">
                         <div className="w-full h-0.5 bg-[#c5a059] animate-scan opacity-40"></div>
                      </div>}
                   
                   {aiAnalysis ? <div className="space-y-6 animate-in">
                        <div className="flex items-start gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] mt-2 shadow-[0_0_8px_#c5a059]"></div>
                           <div className="text-slate-200 text-[13px] font-medium leading-relaxed tracking-wide">
                              <p className="whitespace-pre-wrap">{aiAnalysis}</p>
                           </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                           <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest italic opacity-60">Verified Investigative Guidance</p>
                           <button onClick={() => setAiAnalysis(null)} className="text-[9px] text-[#c5a059] hover:text-white uppercase font-black tracking-widest transition-colors flex items-center gap-2 border border-[#c5a059]/20 px-4 py-1.5 rounded-full">
                             <span>🗑️</span> {t.discard}
                           </button>
                        </div>
                     </div> : <div className="h-full flex flex-col items-center justify-center text-center py-8">
                         <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-xl mb-4 text-slate-500">🧬</div>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Core Standby</p>
                         <div className="flex gap-2">
                           {[...Array(6)].map((_, i) => <div key={i} className={`w-1 h-3 bg-white/5 rounded-full`} style={{
                    animationDelay: `${i * 150}ms`
                  }}></div>)}
                         </div>
                      </div>}
                </div>
              </div>
            </div>

            {/* Official Record Sheet */}
            <div className="bg-white official-border shadow-xl rounded-3xl overflow-hidden border border-slate-100">
               <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center relative">
                 <div>
                   <h4 className="official-heading text-base font-bold text-slate-900 tracking-tight flex items-center gap-3">
                     {t.criminalHistory}
                   </h4>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Certified Digital Archive</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.liveSync}</span>
                    </div>
                 </div>
               </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      <th className={`px-12 py-6 ${t.dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.date}</th>
                      <th className={`px-8 py-6 ${t.dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.type}</th>
                      <th className={`px-8 py-6 ${t.dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.severity}</th>
                      <th className={`px-12 py-6 ${t.dir === 'rtl' ? 'text-left' : 'text-right'}`}>{t.filingId}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCitizen.records.length > 0 ? selectedCitizen.records.map(record => <tr key={record.id} className="hover:bg-slate-50 transition-all group cursor-default">
                          <td className="px-12 py-8 text-sm font-black text-slate-700 font-mono italic">
                            {record.date}
                          </td>
                          <td className="px-8 py-8">
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                              {record.type}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 truncate max-w-sm">
                              {record.description}
                            </p>
                          </td>
                          <td className="px-8 py-8">
                            <span className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${
                              record.severity === 'F' ? 'bg-red-100 text-red-900 border-red-300' : 
                              record.severity === 'E' ? 'bg-red-50 text-red-700 border-red-200' : 
                              record.severity === 'D' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                              record.severity === 'C' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              record.severity === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {lang === 'ar' ? t[record.severity === 'A' ? 'low' : record.severity === 'B' ? 'medium' : record.severity === 'C' ? 'high' : record.severity === 'D' ? 'critical' : record.severity === 'E' ? 'classE' : 'classF'] : `Class ${record.severity}`}
                            </span>
                          </td>
                          <td className={`px-12 py-8 text-[11px] font-mono font-black text-slate-300 group-hover:text-slate-900 transition-colors ${t.dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                            #{record.id}
                          </td>
                        </tr>) : <tr>
                        <td colSpan={4} className="px-12 py-32 text-center text-slate-400 font-black text-xs uppercase tracking-[0.5em] opacity-40">
                          {t.noRecords}
                        </td>
                      </tr>}
                  </tbody>
                </table>
              </div>
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                     <span className="w-2 h-2 bg-slate-200"></span>
                     End of Official Archive Record // Case Entry {selectedCitizen.records.length}
                  </p>
                  <div className="flex gap-4">
                     <div className="w-8 h-1 bg-[#c5a059]/30"></div>
                     <div className="w-8 h-1 bg-[#0b1528]/30"></div>
                  </div>
              </div>
            </div>
          </div>
        </div> : searchTerm && <div className="bg-white border border-slate-200 p-32 text-center flex flex-col items-center">
          <div className="w-32 h-32 mb-10 opacity-10 grayscale">
            <img src="/logo.svg" alt="Somali Police Seal" />
          </div>
          <p className="text-slate-400 font-black uppercase text-xl tracking-[0.4em] mb-6">{t.noMatches}</p>
          <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">{t.verifyFormat}</p>
        </div>}

      {/* Official Criminal Offense Form Modal */}
      {isAdding && <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-[#0b1528]/40 animate-in overflow-y-auto">
          <div className="bg-white w-full max-w-4xl shadow-2xl rounded-[3rem] relative my-10 overflow-hidden border border-slate-100">
             <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
             
             <div className="p-12 relative z-10">
                <div className="flex justify-between items-start mb-10 border-b border-slate-100 pb-8">
                   <div className="flex gap-6 items-center">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:rotate-3">
                        <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
                      </div>
                      <div>
                        <h3 className="official-heading text-3xl font-black text-slate-900 tracking-tight mb-1">
                          {t.formTitle}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                          {t.formSubtitle}
                        </p>
                      </div>
                   </div>
                   <button onClick={() => setIsAdding(false)} className="bg-slate-50 hover:bg-red-50 hover:text-red-500 w-12 h-12 rounded-full flex items-center justify-center text-slate-400 transition-all active:scale-90 border border-slate-100">✕</button>
                </div>

                <form onSubmit={handleSubmitCrime} className="space-y-10">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {t.description}
                        </label>
                        <button type="button" disabled={!formData.description || suggesting} onClick={handleAISuggestion} className="text-[9px] font-bold text-[#0b1528] bg-white border border-slate-200 uppercase tracking-widest flex items-center gap-2 px-5 py-2.5 rounded-full disabled:opacity-30 transition-all shadow-sm hover:shadow-md active:scale-95">
                          {suggesting ? t.analyzing : `💡 ${t.aiAssist}`}
                        </button>
                      </div>
                      <textarea required className="w-full bg-slate-50/50 border border-slate-200 p-6 text-sm font-medium h-40 focus:border-[#0b1528] focus:bg-white outline-none transition-all resize-none rounded-3xl" placeholder="Detail the circumstances..." value={formData.description} onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })}></textarea>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3 px-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.type}</label>
                         <input required type="text" className="w-full bg-slate-50/50 border border-slate-200 p-5 text-sm font-bold focus:border-[#0b1528] outline-none transition-all rounded-2xl" value={formData.type} onChange={e => setFormData({
                  ...formData,
                  type: e.target.value
                })} />
                      </div>
                      <div className="space-y-3 px-2">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.location}</label>
                         <input required type="text" className="w-full bg-slate-50/50 border border-slate-200 p-5 text-sm font-bold focus:border-[#0b1528] outline-none transition-all rounded-2xl" value={formData.location} onChange={e => setFormData({
                  ...formData,
                  location: e.target.value
                })} />
                      </div>
                   </div>

                   <div className="space-y-5 px-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t.severity}</label>
                      <select 
                        value={formData.severity} 
                        onChange={e => setFormData({...formData, severity: e.target.value})}
                        className="w-full bg-white border border-slate-200 p-5 text-sm font-bold focus:border-[#0b1528] outline-none transition-all rounded-2xl shadow-sm"
                      >
                         <option value="A">{lang === 'ar' ? 'فئة A (الأدنى)' : 'Class A (Lowest)'}</option>
                         <option value="B">{lang === 'ar' ? 'فئة B' : 'Class B'}</option>
                         <option value="C">{lang === 'ar' ? 'فئة C' : 'Class C'}</option>
                         <option value="D">{lang === 'ar' ? 'فئة D' : 'Class D'}</option>
                         <option value="E">{lang === 'ar' ? 'فئة E' : 'Class E'}</option>
                         <option value="F">{lang === 'ar' ? 'فئة F (الأعلى)' : 'Class F (Highest)'}</option>
                      </select>
                   </div>

                   <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-slate-100">
                      <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-5 rounded-2xl border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                         {t.cancel}
                      </button>
                      <button type="submit" className="flex-[2] py-5 bg-[#991b1b] text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-red-900 transition-all active:scale-95 flex items-center justify-center gap-3 rounded-2xl border-b-4 border-red-950">
                         <span>📜</span> {t.submit}
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>}
    </div>;
};
export default CitizenSearch;
