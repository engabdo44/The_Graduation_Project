import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateBirthCertificateCopy } from '../services/geminiService';
import { translations } from '../translations';

const BirthCertificate = ({ lang }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: 'Male',
    hospital: '',
    doctor: '',
  });

  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiNote, setAiNote] = useState('');

  const t = translations[lang].birth;
  const common = translations[lang].common;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const note = await generateBirthCertificateCopy(formData);
      setAiNote(note || '');

      // Persist to database via Express API
      const uid = `SOM-B-${Math.floor(1000 + Math.random() * 9000)}-SYNC`;
      await fetch('http://localhost:5002/api/birth-certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          aiNote: note || '',
          uid
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
    <div className={`max-w-4xl mx-auto space-y-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <motion.header 
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end border-b-2 border-gov-gold pb-4`}
      >
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black text-gov-navy uppercase tracking-tighter gov-serif">{t.title}</h2>
          <div className={`flex items-center gap-2 mt-1 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-gov-blue font-black text-[9px] tracking-[0.3em] uppercase opacity-80">Federal Republic of Somalia</span>
            <div className="h-3 w-px bg-slate-300"></div>
            <span className="text-slate-400 font-bold text-[8px] uppercase">Vital Records</span>
          </div>
        </div>
        {isGenerated && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsGenerated(false)} 
            className="bg-gov-navy text-gov-gold px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg"
          >
            <i className="fa-solid fa-plus-circle"></i> {t.buttonNew}
          </motion.button>
        )}
      </motion.header>

      <AnimatePresence mode="wait">
        {!isGenerated ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            onSubmit={handleSubmit} 
            className={`bg-white rounded-3xl p-8 shadow-xl border border-slate-100 ring-1 ring-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gov-navy via-gov-gold to-gov-blue"></div>
            
            <div className={`md:col-span-2 flex items-center gap-4 bg-gov-blue/[0.03] p-4 rounded-xl border border-gov-blue/10 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className="w-8 h-8 rounded-lg bg-gov-blue text-white flex items-center justify-center shadow-md shrink-0">
                  <i className="fa-solid fa-file-shield text-xs"></i>
               </div>
               <div>
                  <p className={`text-[9px] font-black text-gov-navy uppercase tracking-widest ${lang === 'ar' ? 'text-right' : 'text-left'}`}>Directive</p>
                  <p className={`text-[10px] font-semibold text-slate-500 leading-tight ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{t.directive}</p>
               </div>
            </div>
            
            <InputGroup label={t.fieldLabels.fullName} value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} placeholder={t.placeholders.fullName} lang={lang} />
            <InputGroup label={t.fieldLabels.dob} type="date" value={formData.dateOfBirth} onChange={v => setFormData({...formData, dateOfBirth: v})} lang={lang} />
            <InputGroup label={t.fieldLabels.father} value={formData.fatherName} onChange={v => setFormData({...formData, fatherName: v})} lang={lang} />
            <InputGroup label={t.fieldLabels.mother} value={formData.motherName} onChange={v => setFormData({...formData, motherName: v})} lang={lang} />
            <InputGroup label={t.fieldLabels.locality} value={formData.placeOfBirth} onChange={v => setFormData({...formData, placeOfBirth: v})} placeholder={t.placeholders.locality} lang={lang} />
            
            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 block ${lang === 'ar' ? 'text-right pr-1 pl-0' : 'text-left'}`}>{t.fieldLabels.gender}</label>
              <select 
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">{lang === 'ar' ? 'ذكر' : lang === 'so' ? 'Lab' : 'Male'}</option>
                <option value="Female">{lang === 'ar' ? 'أنثى' : lang === 'so' ? 'Dhedig' : 'Female'}</option>
              </select>
            </div>

            <InputGroup label={t.fieldLabels.facility} value={formData.hospital} onChange={v => setFormData({...formData, hospital: v})} lang={lang} />
            <InputGroup label={t.fieldLabels.physician} value={formData.doctor} onChange={v => setFormData({...formData, doctor: v})} lang={lang} />

            <motion.button 
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit" 
              className={`md:col-span-2 w-full bg-gov-navy text-gov-gold h-14 rounded-2xl font-black uppercase tracking-[0.25em] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 border-b-[3px] border-gov-gold text-xs ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-stamp px-1"></i>
                  {t.buttonAuth}
                </>
              )}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div 
            key="certificate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-12 shadow-inner relative overflow-hidden min-h-[800px] flex flex-col items-center border-[20px] border-white ring-1 ring-slate-200">
              <div className="absolute inset-0 border-[2px] border-double border-gov-gold m-3 pointer-events-none"></div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none select-none">
                  <i className="fa-solid fa-star text-[40rem]"></i>
              </div>

              <div className="relative z-10 w-full text-center">
                  <div className={`flex justify-between items-start mb-10 px-6 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Somalia.svg" alt="Crest" className="h-20 drop-shadow-sm" />
                      <div className={lang === 'ar' ? 'text-left' : 'text-right'}>
                          <p className="text-gov-navy font-black text-base gov-serif uppercase leading-none">Federal Government</p>
                          <p className="text-gov-blue font-bold text-sm gov-serif uppercase tracking-tight mt-1 opacity-80">of Somalia</p>
                      </div>
                  </div>

                  <div className="space-y-2 mb-14">
                    <h2 className="text-4xl font-black text-gov-navy gov-serif tracking-tighter">{t.certTitle}</h2>
                    <div className="flex items-center justify-center gap-4 opacity-40">
                      <div className="h-px w-16 bg-gov-gold"></div>
                      <span className="text-gov-gold font-black tracking-[0.4em] text-[10px] uppercase">{lang === 'ar' ? 'سجل رسمي' : lang === 'so' ? 'Diiwaan Rasmi ah' : 'Official Record'}</span>
                      <div className="h-px w-16 bg-gov-gold"></div>
                    </div>
                  </div>
              </div>

              <div className="relative z-10 w-full grid grid-cols-2 gap-y-10 gap-x-12 px-12">
                <CertField label={t.fieldLabels.fullName} value={formData.fullName} lang={lang} />
                <CertField label={lang === 'ar' ? 'تاريخ الدخول' : 'Entry Date'} value={formData.dateOfBirth} lang={lang} />
                <CertField label={t.fieldLabels.father} value={formData.fatherName} lang={lang} />
                <CertField label={t.fieldLabels.mother} value={formData.motherName} lang={lang} />
                <CertField label={t.fieldLabels.locality} value={formData.placeOfBirth} lang={lang} />
                <CertField label={t.fieldLabels.gender} value={formData.gender} lang={lang} />
                <CertField label={t.fieldLabels.facility} value={formData.hospital} lang={lang} />
                <CertField label={t.fieldLabels.physician} value={formData.doctor} lang={lang} />
              </div>

              <div className="mt-auto w-full pt-14 grid grid-cols-3 gap-6 items-end px-10 relative z-10">
                <div className="text-center flex flex-col items-center">
                   <div className="w-20 h-20 mb-4 border-2 border-double border-gov-gold/20 rounded-full flex items-center justify-center relative bg-slate-50/50">
                      <div className="text-[7px] text-gov-gold font-black uppercase text-center leading-tight">
                        Health Seal<br/>Somalia
                      </div>
                   </div>
                   <p className="text-[8px] font-black uppercase text-gov-navy tracking-widest border-t border-gov-navy/20 pt-1.5 w-full">Authorization</p>
                </div>

                <div className="text-center mb-2">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 inline-block mb-3">
                      <i className="fa-solid fa-qrcode text-4xl text-gov-navy opacity-80"></i>
                    </div>
                    <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em]">UID: {Math.floor(1000 + Math.random() * 9000)}-SYNC</p>
                </div>

                <div className="text-center">
                   <div className="h-14 mb-2 flex items-center justify-center">
                      <p className="font-serif italic text-xl text-gov-navy opacity-60">Jama M.</p>
                   </div>
                   <p className="text-[8px] font-black uppercase text-gov-navy tracking-widest border-t border-gov-navy/20 pt-1.5 w-full">Signature</p>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gov-navy p-6 rounded-2xl border-l-4 border-gov-gold shadow-lg"
            >
              <h4 className={`text-gov-gold font-black mb-2 flex items-center gap-2 uppercase tracking-[0.15em] text-[10px] ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <i className="fa-solid fa-microchip"></i>
                Intelligence Matrix
              </h4>
              <p className={`text-blue-100/80 text-[11px] leading-relaxed font-medium italic ${lang === 'ar' ? 'text-right' : ''}`}>
                "{aiNote}"
              </p>
            </motion.div>

            <div className={`grid grid-cols-2 gap-4 pb-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <button className="bg-white text-gov-navy border border-gov-navy h-14 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-md">
                 <i className="fa-solid fa-print"></i> {common.print}
              </button>
              <button className="bg-gov-blue text-white h-14 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gov-navy transition-all flex items-center justify-center gap-3 shadow-lg shadow-gov-blue/10">
                 <i className="fa-solid fa-cloud-arrow-up"></i> {common.sync}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", placeholder, lang }) => (
  <div className="space-y-2">
    <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 block ${lang === 'ar' ? 'text-right pr-1 pl-0' : 'text-left'}`}>{label}</label>
    <input 
      required
      type={type}
      className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 outline-none transition-all font-black text-gov-navy uppercase text-[10px] placeholder:text-slate-300 ${lang === 'ar' ? 'text-right' : 'text-left'}`}
      placeholder={placeholder || `Set ${label.toLowerCase()}...`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const CertField = ({ label, value, lang }) => (
  <div className={`border-b border-slate-100 pb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
    <p className="text-[8px] uppercase font-black text-gov-blue tracking-[0.25em] mb-1.5 opacity-60">{label}</p>
    <p className={`text-lg font-black text-gov-navy gov-serif uppercase tracking-tight leading-tight ${lang === 'ar' ? 'font-arabic' : ''}`}>{value || translations[lang].common.na}</p>
  </div>
);

export default BirthCertificate;
