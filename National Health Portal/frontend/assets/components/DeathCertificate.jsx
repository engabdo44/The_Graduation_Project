import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [isLookupMode, setIsLookupMode] = useState(false);
  const [registryNo, setRegistryNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const t = translations[lang].death;
  const common = translations[lang].common;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const registryNumber = `SOM-D-${Math.floor(100000 + Math.random() * 900000)}`;
      setRegistryNo(registryNumber);

      // Persist to database via Express API
      const response = await fetch('http://localhost:5002/api/death-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          registryNumber
        })
      });

      if (response.ok) {
        if (lang === 'ar') alert("تم تسجيل شهادة الوفاة بنجاح في السجل الوطني.");
        else alert("Death certificate successfully registered in national registry.");
        setIsGenerated(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save to database'}`);
        setIsGenerated(true);
      }
    } catch (error) {
      console.error("Database save failed:", error);
      if (lang === 'ar') alert("فشل الاتصال بقاعدة البيانات. تم إنشاء معاينة فقط.");
      else alert("Database connection failed. Preview only generated.");
      setIsGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      const response = await fetch(`http://localhost:5002/api/death-certificates/${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          fullName: data.full_name,
          citizenId: data.citizen_id,
          dateOfDeath: data.dod.split('T')[0],
          placeOfDeath: data.place_of_death,
          causeOfDeath: data.cause_of_death,
          informantName: data.informant_name,
          doctorName: data.doctor_name,
        });
        setRegistryNo(data.registry_number);
        setIsGenerated(true);
      } else {
        if (lang === 'ar') alert("لم يتم العثور على شهادة الوفاة.");
        else alert("Death certificate not found.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      if (lang === 'ar') alert("خطأ في الاتصال بالخادم.");
      else alert("Server connection error.");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 animate-fadeIn ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <header className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end border-b-2 border-slate-900 pb-4`}>
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black text-slate-900 gov-serif uppercase tracking-tighter">{t.title}</h2>
          <p className="text-slate-500 font-bold text-[9px] tracking-[0.3em] uppercase mt-1">Official Ministry Archive</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setIsGenerated(false);
              setIsLookupMode(!isLookupMode);
            }} 
            className={`${isLookupMode ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-white'} px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-colors cursor-pointer`}
          >
            <i className={`fa-solid ${isLookupMode ? 'fa-plus-circle' : 'fa-search'}`}></i> 
            {isLookupMode ? (lang === 'ar' ? 'سجل جديد' : 'Register New') : (lang === 'ar' ? 'البحث عن شهادة' : 'Search Archive')}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!isGenerated ? (
          isLookupMode ? (
            <motion.div 
              key="search-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 py-10"
            >
              <form onSubmit={handleSearch} className={`max-w-xl mx-auto flex gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 ring-1 ring-slate-100 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="relative flex-1">
                  <i className={`fa-solid fa-search absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 text-sm`}></i>
                  <input 
                    className={`w-full h-11 ${lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900/10 outline-none transition-all font-bold text-slate-900 text-[11px]`}
                    placeholder={lang === 'ar' ? "ابحث عن شهادة وفاة (الاسم أو الرقم)..." : "Search death certificate (Name or ID)..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={searchLoading}
                  className={`bg-slate-900 text-white px-6 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-md flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} cursor-pointer`}
                >
                  {searchLoading ? <i className="fa-solid fa-sync fa-spin text-[10px]"></i> : <i className="fa-solid fa-bolt text-[10px]"></i>}
                  {lang === 'ar' ? "بحث" : "Search"}
                </motion.button>
              </form>
              
              <div className="text-center py-12 px-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <i className="fa-solid fa-box-archive text-4xl text-slate-200 mb-4 block"></i>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {lang === 'ar' ? 'أدخل الرقم التعريفي للوصول إلى السجل المركزي' : 'Enter Registry ID to access Central Ledger'}
                  </p>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              key="register-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              onSubmit={handleSubmit} 
              className={`bg-white rounded-3xl p-8 shadow-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-900 via-slate-400 to-slate-200"></div>
              
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

              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading} 
                className={`md:col-span-2 w-full bg-slate-900 text-white h-14 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 text-xs ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {loading ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-ribbon text-gov-gold"></i> {t.buttonAuth}
                  </>
                )}
              </motion.button>
            </motion.form>
          )
        ) : (
          <motion.div 
            key="certificate-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-12 shadow-inner relative overflow-hidden min-h-[800px] flex flex-col items-center border-[20px] border-white ring-1 ring-slate-200">
              <div className="absolute inset-0 border-[2px] border-double border-slate-900/10 m-3 pointer-events-none"></div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                  <i className="fa-solid fa-ribbon text-[40rem]"></i>
              </div>

              <div className="relative z-10 w-full text-center">
                  <div className={`flex justify-between items-start mb-10 px-6 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Somalia.svg" alt="Crest" className="h-20 drop-shadow-sm" />
                      <div className={lang === 'ar' ? 'text-left' : 'text-right'}>
                          <p className="text-slate-900 font-black text-base gov-serif uppercase leading-none">Federal Government</p>
                          <p className="text-slate-600 font-bold text-sm gov-serif uppercase tracking-tight mt-1 opacity-80">of Somalia</p>
                      </div>
                  </div>

                  <div className="space-y-2 mb-14">
                    <h2 className="text-4xl font-black text-slate-900 gov-serif tracking-tighter">{t.certTitle}</h2>
                    <div className="flex items-center justify-center gap-4 opacity-40">
                      <div className="h-px w-16 bg-slate-900"></div>
                      <span className="text-slate-900 font-black tracking-[0.4em] text-[10px] uppercase">Official Mortality Record</span>
                      <div className="h-px w-16 bg-slate-900"></div>
                    </div>
                    <p className="text-slate-400 text-[9px] mt-4 font-black tracking-widest uppercase">Registry No: {registryNo}</p>
                  </div>
              </div>

              <div className="relative z-10 w-full grid grid-cols-2 gap-y-10 gap-x-12 px-12">
                <DeathDetail label={t.fieldLabels.fullName} value={formData.fullName} lang={lang} />
                <DeathDetail label="Citizen ID" value={formData.citizenId} lang={lang} />
                <DeathDetail label={t.fieldLabels.dod} value={formData.dateOfDeath} lang={lang} />
                <DeathDetail label="Place of Death" value={formData.placeOfDeath} lang={lang} />
                <div className={`md:col-span-2 border-b border-slate-100 pb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                   <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mb-1.5 opacity-60">{t.fieldLabels.cause}</p>
                   <p className={`text-lg font-black text-slate-900 gov-serif uppercase tracking-tight leading-tight ${lang === 'ar' ? 'font-arabic' : ''}`}>{formData.causeOfDeath}</p>
                </div>
                <DeathDetail label={lang === 'ar' ? 'المبلغ' : 'Informant'} value={formData.informantName} lang={lang} />
                <DeathDetail label={t.fieldLabels.declarant} value={formData.doctorName} lang={lang} />
              </div>

              <div className="mt-auto w-full pt-14 grid grid-cols-3 gap-6 items-end px-10 relative z-10">
                <div className="text-center flex flex-col items-center">
                   <div className="w-20 h-20 mb-4 border-2 border-double border-slate-900/10 rounded-full flex items-center justify-center relative bg-slate-50/50">
                      <div className="text-[7px] text-slate-900 font-black uppercase text-center leading-tight">
                        Federal Seal<br/>Somalia
                      </div>
                   </div>
                   <p className="text-[8px] font-black uppercase text-slate-900 tracking-widest border-t border-slate-900/20 pt-1.5 w-full">Authorization</p>
                </div>

                <div className="text-center mb-2">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 inline-block mb-3">
                      <i className="fa-solid fa-qrcode text-4xl text-slate-900 opacity-80"></i>
                    </div>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Validated</p>
                </div>

                <div className="text-center">
                   <div className="h-14 mb-2 flex items-center justify-center">
                      <p className="font-serif italic text-xl text-slate-900 opacity-60">Dr. Muse A.</p>
                 </div>
                 <p className="text-[8px] font-black uppercase text-slate-900 tracking-widest border-t border-slate-900/20 pt-1.5 w-full">Commissioner</p>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-4 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <motion.button  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-white text-slate-900 border border-slate-900 h-14 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-md">
               <i className="fa-solid fa-print"></i> {common.print}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-slate-900 text-white h-14 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg">
               <i className="fa-solid fa-cloud-arrow-up"></i> {common.sync}
            </motion.button>
          </div>
          
          <button onClick={() => setIsGenerated(false)} className={`w-full bg-slate-100 text-slate-600 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors shadow-sm`}>
            {lang === 'ar' ? 'العودة إلى السجل' : 'Back to Registry'}
          </button>
        </motion.div>
      )}
      </AnimatePresence>
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
