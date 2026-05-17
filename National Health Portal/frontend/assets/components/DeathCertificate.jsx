import React, { useState } from 'react';
import { translations } from '../translations';

const DeathCertificate = ({ lang }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfDeath: '',
    placeOfDeath: '',
    causeOfDeath: '',
    citizenId: '',
    informantName: '',
    doctorName: '',
  });

  const [isGenerated, setIsGenerated] = useState(false);
  const [registryNo, setRegistryNo] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[lang].death;
  const common = translations[lang].common;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const registryNumber = `SOM-D-${Math.floor(100000 + Math.random() * 900000)}`;
      setRegistryNo(registryNumber);

      // Persist to database via Express API
      await fetch('http://localhost:5002/api/death-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          registryNumber
        })
      });

      setIsGenerated(true);
    } catch (error) {
      console.error("Database save failed:", error);
      setIsGenerated(true); // Fallback to frontend-only display if backend is offline
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 animate-fadeIn ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <header className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end border-b-2 border-slate-900 pb-4`}>
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black text-slate-900 gov-serif uppercase tracking-tighter">{t.title}</h2>
          <p className="text-slate-500 font-bold text-[9px] tracking-[0.3em] uppercase mt-1">Official Ministry Archive</p>
        </div>
      </header>

      {!isGenerated ? (
        <form onSubmit={handleSubmit} className={`bg-white rounded-3xl p-8 shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className={`md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
             <i className="fa-solid fa-circle-exclamation text-slate-400"></i>
             <p className={`text-[10px] font-bold text-slate-600 ${lang === 'ar' ? 'text-right' : ''}`}>All mortality entries are subject to immediate clinical audit.</p>
          </div>

          <DeathInput label={t.fieldLabels.fullName} value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} lang={lang} />
          <DeathInput label="National Identity ID" value={formData.citizenId} onChange={v => setFormData({...formData, citizenId: v})} lang={lang} />
          <DeathInput label={t.fieldLabels.dod} type="date" value={formData.dateOfDeath} onChange={v => setFormData({...formData, dateOfDeath: v})} lang={lang} />
          <DeathInput label="Locality of Incident" value={formData.placeOfDeath} onChange={v => setFormData({...formData, placeOfDeath: v})} lang={lang} />
          
          <div className="md:col-span-2 space-y-2">
            <label className={`text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 block ${lang === 'ar' ? 'text-right pr-1 pl-0' : 'text-left'}`}>{t.fieldLabels.cause}</label>
            <textarea 
              required
              rows={2}
              className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all font-bold text-slate-900 text-[11px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
              value={formData.causeOfDeath}
              onChange={(e) => setFormData({...formData, causeOfDeath: e.target.value})}
            />
          </div>

          <DeathInput label={t.fieldLabels.declarant} value={formData.doctorName} onChange={v => setFormData({...formData, doctorName: v})} lang={lang} />
          <DeathInput label="Legal Informant" value={formData.informantName} onChange={v => setFormData({...formData, informantName: v})} lang={lang} />

          <button type="submit" disabled={loading} className={`md:col-span-2 w-full bg-slate-900 text-white h-14 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 text-xs ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            {loading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <i className="fa-solid fa-ribbon text-gov-gold"></i> {t.buttonAuth}
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border-[1px] border-slate-200 p-12 rounded-sm shadow-2xl relative min-h-[700px] flex flex-col items-center">
            <div className="absolute inset-0 border-[3px] border-double border-slate-100 m-3 pointer-events-none"></div>
            
            <div className={`text-center mb-10 relative z-10 w-full`}>
              <h2 className="text-xl font-black text-slate-900 tracking-[0.3em] uppercase gov-serif">JAMHUURIYADDA FEDERAALKA SOOMAALIYA</h2>
              <div className="h-px bg-slate-900/10 w-48 mx-auto my-4"></div>
              <h3 className="text-lg font-bold text-slate-600 uppercase tracking-widest">{t.certTitle}</h3>
              <p className="text-slate-400 text-[8px] mt-4 font-black tracking-widest">REGISTRY NO: {registryNo}</p>
            </div>

            <div className={`grid grid-cols-2 gap-x-12 gap-y-8 mt-10 px-6 relative z-10 w-full`}>
              <DeathDetail label={t.fieldLabels.fullName} value={formData.fullName} lang={lang} />
              <DeathDetail label="Citizen ID" value={formData.citizenId} lang={lang} />
              <DeathDetail label={t.fieldLabels.dod} value={formData.dateOfDeath} lang={lang} />
              <DeathDetail label="Place of Death" value={formData.placeOfDeath} lang={lang} />
              <div className={`md:col-span-2 border-b border-slate-100 pb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                 <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mb-1.5 opacity-60">{t.fieldLabels.cause}</p>
                 <p className={`text-base font-bold text-slate-900 italic leading-snug ${lang === 'ar' ? 'font-arabic' : ''}`}>{formData.causeOfDeath}</p>
              </div>
              <DeathDetail label={lang === 'ar' ? 'المبلغ' : 'Informant'} value={formData.informantName} lang={lang} />
              <DeathDetail label={t.fieldLabels.declarant} value={formData.doctorName} lang={lang} />
            </div>

            <div className="mt-auto pt-16 w-full grid grid-cols-2 gap-20 relative z-10 px-10">
              <div className="text-center font-mono">
                <div className="h-12 border-b border-slate-200 w-full"></div>
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-[0.2em] mt-2">Registry Commissioner</p>
              </div>
              <div className="text-center font-mono">
                <div className="h-12 border-b border-slate-200 w-full"></div>
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-[0.2em] mt-2">Certified Seal</p>
              </div>
            </div>
          </div>
          
          <button onClick={() => setIsGenerated(false)} className={`w-full bg-slate-100 text-slate-600 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors shadow-sm`}>
            {lang === 'ar' ? 'العودة إلى نموذج السجل' : 'Back to Registry Form'}
          </button>
        </div>
      )}
    </div>
  );
};

const DeathInput = ({ label, value, onChange, type = "text", lang }) => (
  <div className="space-y-2">
    <label className={`text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1 block ${lang === 'ar' ? 'text-right pr-1 pl-0' : 'text-left'}`}>{label}</label>
    <input 
      required
      type={type}
      className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 outline-none transition-all font-black text-slate-900 uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const DeathDetail = ({ label, value, lang }) => (
  <div className={`border-b border-slate-100 pb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
    <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mb-1.5 opacity-60">{label}</p>
    <p className={`text-sm font-bold text-slate-900 uppercase tracking-tight ${lang === 'ar' ? 'font-arabic' : ''}`}>{value || translations[lang].common.na}</p>
  </div>
);

export default DeathCertificate;
