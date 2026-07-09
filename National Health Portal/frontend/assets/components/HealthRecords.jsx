import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { summarizeHealthRecord } from '../services/geminiService';
import { translations } from '../translations';
import { NotificationContainer } from './Notification';

const HealthRecords = ({ lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    id_number: '',
    full_name: '',
    dob: '',
    gender: 'Male',
    blood_type: 'A+',
    allergies: '',
    medical_history: '',
    contact_number: '',
    region: 'Banaadir'
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  const t = translations[lang].records;
  const common = translations[lang].common;

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    setSelectedPatient(null);
    setAiSummary('');
    try {
      const response = await fetch(`http://localhost:5002/api/health-records/${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const patient = await response.json();
        // Format the dates
        const formattedPatient = {
          id: patient.id_number,
          fullName: patient.full_name,
          dateOfBirth: patient.dob ? patient.dob.split('T')[0] : '',
          gender: patient.gender,
          bloodType: patient.blood_type,
          allergies: patient.allergies || [],
          medicalHistory: patient.medical_history || [],
          lastCheckup: patient.last_checkup ? patient.last_checkup.split('T')[0] : '',
          contactNumber: patient.contact_number,
          region: patient.region
        };
        setSelectedPatient(formattedPatient);
      } else {
        const errorMsg = lang === 'ar' ? 'فشل البحث. المريض غير موجود في السجل الوطني' :
                          lang === 'so' ? 'Baadhitaanku waa fashilmay. Bukaan lama helin' :
                          'Search failed. Patient not found in national records';
        addNotification('error', errorMsg);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = lang === 'ar' ? 'حدث خطأ أثناء الاتصال بقاعدة بيانات الصحة' :
                        'Error connecting to national health database';
      addNotification('error', errorMsg);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/health-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newPatient,
          allergies: newPatient.allergies.split(',').map(s => s.trim()).filter(Boolean),
          medical_history: newPatient.medical_history.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        const successMsg = lang === 'ar' ? 'تم تسجيل السجل الطبي للمريض بنجاح في قاعدة البيانات' :
                           'Patient medical record registered successfully in database';
        addNotification('success', successMsg);
        
        // Auto-fill searching and view their record
        setSearchTerm(newPatient.id_number);
        setIsAddingPatient(false);
        // Reset state
        setNewPatient({
          id_number: '',
          full_name: '',
          dob: '',
          gender: 'Male',
          blood_type: 'A+',
          allergies: '',
          medical_history: '',
          contact_number: '',
          region: 'Banaadir'
        });
      } else {
        const errorData = await response.json();
        addNotification('error', errorData.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      addNotification('error', 'Failed to save patient record to server');
    } finally {
      setRegisterLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    const summary = await summarizeHealthRecord(selectedPatient.medicalHistory);
    setAiSummary(summary);
    setLoading(false);
  };

  return (
    <div className={`space-y-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} lang={lang} />
      <motion.header 
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b-[2px] border-gov-gold pb-4 flex justify-between items-end"
      >
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black text-gov-navy gov-serif uppercase tracking-tighter">{t.title}</h2>
          <p className="text-gov-blue font-bold text-[9px] tracking-[0.25em] uppercase mt-1 opacity-80">{t.subtitle}</p>
        </div>
        {isAddingPatient && (
          <button 
            onClick={() => setIsAddingPatient(false)}
            className="bg-gov-navy text-gov-gold px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <i className={`fa-solid ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
            {lang === 'ar' ? 'العودة للبحث' : 'Back to Search'}
          </button>
        )}
      </motion.header>

      <AnimatePresence mode="wait">
        {isAddingPatient ? (
          <motion.form 
            key="register-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleRegisterPatient}
            className={`bg-white rounded-3xl p-8 shadow-xl border border-slate-100 ring-1 ring-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gov-navy via-gov-gold to-gov-blue"></div>
            
            <div className={`md:col-span-2 flex items-center gap-4 bg-gov-gold/[0.04] p-4 rounded-xl border border-gov-gold/20 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className="w-8 h-8 rounded-lg bg-gov-gold text-gov-navy flex items-center justify-center shadow-md shrink-0">
                  <i className="fa-solid fa-user-plus text-xs"></i>
               </div>
               <div>
                  <p className={`text-[9px] font-black text-gov-navy uppercase tracking-widest ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'تسجيل جديد' : 'New Health Entry'}</p>
                  <p className={`text-[10px] font-semibold text-slate-500 leading-tight ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'إدخال مواطن جديد في السجل الطبي الفيدرالي لجمهورية الصومال.' : 'Registering a new citizen entry into the Federal Republic of Somalia Medical Ledger.'}</p>
               </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'الاسم الكامل للمواطن' : 'Citizen Full Name'}</label>
              <input 
                required
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                placeholder={lang === 'ar' ? 'أدخل الاسم الثلاثي...' : 'Enter full name...'}
                value={newPatient.full_name}
                onChange={e => setNewPatient({...newPatient, full_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'رقم الهوية الوطنية / رقم الإقامة' : 'National ID / Resident Permit'}</label>
              <input 
                required
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                placeholder="SOM-ID-XXXXX"
                value={newPatient.id_number}
                onChange={e => setNewPatient({...newPatient, id_number: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}</label>
              <input 
                required
                type="date"
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                value={newPatient.dob}
                onChange={e => setNewPatient({...newPatient, dob: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'الجنس' : 'Gender'}</label>
              <select 
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                value={newPatient.gender}
                onChange={e => setNewPatient({...newPatient, gender: e.target.value})}
              >
                <option value="Male">{lang === 'ar' ? 'ذكر' : 'Male'}</option>
                <option value="Female">{lang === 'ar' ? 'أنثى' : 'Female'}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'فصيلة الدم' : 'Blood Group'}</label>
              <select 
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                value={newPatient.blood_type}
                onChange={e => setNewPatient({...newPatient, blood_type: e.target.value})}
              >
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'المنطقة' : 'Operational Region'}</label>
              <input 
                required
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                value={newPatient.region}
                onChange={e => setNewPatient({...newPatient, region: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'رقم الاتصال الآمن' : 'Secure Contact Phone'}</label>
              <input 
                required
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                placeholder="+252 XX XXX XXXX"
                value={newPatient.contact_number}
                onChange={e => setNewPatient({...newPatient, contact_number: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'تنبيهات الحساسية الطبية (مفصولة بفاصلة)' : 'Medical Allergies Alerts (comma separated)'}</label>
              <input 
                className={`w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                placeholder="Penicillin, Peanuts"
                value={newPatient.allergies}
                onChange={e => setNewPatient({...newPatient, allergies: e.target.value})}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className={`text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ${lang === 'ar' ? 'text-right pr-1' : 'pl-1 text-left'}`}>{lang === 'ar' ? 'التاريخ الطبي والعمليات (مفصول بفاصلة)' : 'Clinical Medical History entries (comma separated)'}</label>
              <textarea 
                required
                rows={3}
                className={`w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-gov-blue focus:ring-4 focus:ring-gov-blue/5 outline-none transition-all font-black text-gov-navy uppercase text-[10px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                placeholder="Chronic Hypertension, Type 2 Diabetes, Eye Surgery (2021)"
                value={newPatient.medical_history}
                onChange={e => setNewPatient({...newPatient, medical_history: e.target.value})}
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              disabled={registerLoading}
              type="submit" 
              className={`md:col-span-2 w-full bg-gov-navy text-gov-gold h-14 rounded-2xl font-black uppercase tracking-[0.25em] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 border-b-[3px] border-gov-gold text-xs ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} cursor-pointer`}
            >
              {registerLoading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-save px-1"></i>
                  {lang === 'ar' ? 'حفظ وتفويض الملف الطبي' : 'Save and Authorize Record'}
                </>
              )}
            </motion.button>
          </motion.form>
        ) : (
          <div className="space-y-6">
            <div className={`max-w-xl mx-auto flex gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 ring-1 ring-slate-100 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="relative flex-1">
                <i className={`fa-solid fa-id-card absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gov-blue text-sm`}></i>
                <input 
                  className={`w-full h-11 ${lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-gov-blue/20 outline-none transition-all font-bold text-gov-navy text-[11px]`}
                  placeholder={lang === 'ar' ? "ابحث برقم الهوية الوطنية أو الاسم..." : "Search by Citizen ID or Full Name..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={searchLoading}
                className={`bg-gov-navy text-gov-gold px-6 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-md flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} cursor-pointer`}
              >
                {searchLoading ? <i className="fa-solid fa-sync fa-spin text-[10px]"></i> : <i className="fa-solid fa-search text-[10px]"></i>}
                {lang === 'ar' ? "بحث في القاعدة" : "Sync Records"}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {selectedPatient ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                         <div className="text-[6px] font-black text-gov-navy border border-gov-navy px-1 py-0.5 rounded uppercase">TS-DATA</div>
                      </div>
                      <div className="flex flex-col items-center text-center pb-6 border-b border-slate-50 mb-6 relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 mb-4 p-1.5 border border-slate-100">
                          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${selectedPatient.id}`} alt="Identity" className="w-full h-full rounded-xl opacity-80" />
                        </div>
                        <h3 className="text-xl font-black text-gov-navy gov-serif uppercase leading-tight">{selectedPatient.fullName}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gov-blue font-black text-[9px] tracking-widest uppercase">{selectedPatient.id}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <DossierRow label={lang === 'ar' ? 'المنطقة العملياتية' : 'Operational Region'} value={selectedPatient.region} lang={lang} />
                        <DossierRow label={lang === 'ar' ? 'تاريخ الدخول' : 'Date of Entry'} value={selectedPatient.dateOfBirth} lang={lang} />
                        <DossierRow label={lang === 'ar' ? 'فصيلة الدم' : 'Vital Group'} value={selectedPatient.bloodType} color="text-rose-600" lang={lang} />
                        <DossierRow label={lang === 'ar' ? 'رقم الاتصال' : 'Secure Comms'} value={selectedPatient.contactNumber} lang={lang} />
                      </div>
                    </div>

                    <div className="bg-gov-navy p-6 rounded-3xl shadow-xl text-white">
                      <h4 className={`text-gov-gold font-black mb-3 flex items-center gap-2 uppercase text-[9px] tracking-widest ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <i className="fa-solid fa-biohazard text-[10px]"></i>
                        {lang === 'ar' ? 'تنبيهات حرجة' : 'Critical Alerts'}
                      </h4>
                      <div className={`flex flex-wrap gap-2 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                        {selectedPatient.allergies.length > 0 ? (
                          selectedPatient.allergies.map(a => (
                            <span key={a} className="bg-white/5 text-white/90 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-white/5">{a}</span>
                          ))
                        ) : (
                          <span className="text-[9px] opacity-60 italic">{lang === 'ar' ? 'لا يوجد حساسية معروفة' : 'No known allergies'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    <div className={`bg-white p-8 rounded-3xl shadow-xl border border-slate-100 min-h-[400px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                      <div className={`flex justify-between items-center mb-8 border-b border-slate-50 pb-4 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <h3 className={`text-lg font-black text-gov-navy uppercase tracking-tighter flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <i className="fa-solid fa-folder-open text-gov-gold text-sm"></i>
                          {lang === 'ar' ? 'التاريخ السريري' : 'Clinical History'}
                        </h3>
                        <button 
                          onClick={generateSummary}
                          disabled={loading}
                          className={`bg-gov-blue/5 text-gov-blue px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-gov-blue hover:text-white transition-all flex items-center gap-2 border border-gov-blue/10 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} cursor-pointer`}
                        >
                          {loading ? <i className="fa-solid fa-sync fa-spin"></i> : <i className="fa-solid fa-wand-magic text-[10px]"></i>}
                          {lang === 'ar' ? 'ملخص الذكاء الاصطناعي' : 'AI Briefing'}
                        </button>
                      </div>

                      {aiSummary && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mb-8 p-6 bg-gov-navy rounded-2xl text-white relative border-b-4 border-b-gov-gold overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 w-24 h-24 bg-gov-gold/5 rounded-full -mr-12 -mt-12"></div>
                           <p className={`text-[11px] leading-relaxed font-medium italic opacity-90 relative z-10 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{aiSummary}</p>
                        </motion.div>
                      )}

                      <div className="space-y-3">
                        {selectedPatient.medicalHistory.length > 0 ? (
                          selectedPatient.medicalHistory.map((item, idx) => (
                            <div key={idx} className={`flex gap-4 items-start p-4 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className="w-8 h-8 shrink-0 bg-slate-50 rounded-lg flex items-center justify-center text-gov-blue font-black text-[10px] group-hover:bg-gov-navy group-hover:text-white transition-all">
                                {idx + 1}
                              </div>
                              <div className={`flex-1 min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                 <p className="text-gov-navy font-bold text-[13px] leading-snug">{item}</p>
                                 <p className="text-[8px] text-slate-300 font-black uppercase mt-1 tracking-widest">Verified Clinical Entry</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-xs italic">{lang === 'ar' ? 'لا يوجد تاريخ طبي مسجل' : 'No medical history entries recorded'}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-6">
                       <AdminAction icon="fa-file-signature" label={lang === 'ar' ? 'سجل جديد' : 'New Record'} color="bg-gov-navy" lang={lang} onClick={() => setIsAddingPatient(true)} />
                       <AdminAction icon="fa-capsules" label={lang === 'ar' ? 'وصفة طبية' : 'Prescription'} color="bg-gov-blue" lang={lang} onClick={() => addNotification('info', lang === 'ar' ? 'الوصفات الإلكترونية مؤمنة ومقفلة' : 'E-Prescribing is secured and locked')} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 bg-white border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300"
                >
                   <i className="fa-solid fa-fingerprint text-5xl mb-4 opacity-10"></i>
                   <p className="font-black uppercase tracking-[0.2em] text-[10px]">{lang === 'ar' ? 'في انتظار تعريف المواطن' : 'Awaiting Citizen Identity Pulse'}</p>
                   <button 
                     onClick={() => setIsAddingPatient(true)}
                     className="mt-4 bg-gov-navy text-gov-gold px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md hover:bg-black transition-all cursor-pointer"
                   >
                     {lang === 'ar' ? 'إدخال سجل طبي جديد' : 'Create New Health Record'}
                   </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DossierRow = ({ label, value, color = "text-[#1B365D]", lang }) => (
  <div className={`flex flex-col gap-1 border-b border-slate-50 pb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-sm font-black uppercase ${color}`}>{value}</span>
  </div>
);

const AdminAction = ({ icon, label, color, lang, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-5 p-6 bg-white rounded-3xl shadow-xl border border-slate-100 hover:border-[#C5A059] transition-all text-left group w-full ${lang === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'} cursor-pointer`}
  >
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform`}>
      <i className={`fa-solid ${icon} text-xl`}></i>
    </div>
    <span className="font-black text-[#1B365D] text-sm uppercase tracking-wider">{label}</span>
  </button>
);

export default HealthRecords;
