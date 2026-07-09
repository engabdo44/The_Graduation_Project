import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';
import { NotificationContainer } from './Notification';

const BirthCertificateServices = ({ lang, user }) => {
  const [activeTab, setActiveTab] = useState('ISSUE'); // ISSUE or REPRINT
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatedCert, setGeneratedCert] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const t = translations[lang].birth || translations['en'].birth;
  const common = translations[lang].common || translations['en'].common;

  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      addNotification('warning', lang === 'ar' ? 'الرجاء إدخال مصطلح البحث' : 'Please enter a search term');
      return;
    }
    setSearchLoading(true);
    setSearchResults([]);
    setSelectedResult(null);
    setGeneratedCert(null);
    try {
      const response = await fetch(`http://localhost:5002/api/birth-certificates/${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setSearchResults(data);
          if (data.length === 1) handleSelectResult(data[0]);
        } else {
          addNotification('info', lang === 'ar' ? 'لم يتم العثور على شهادات الميلاد' : 'No birth certificates found');
        }
      } else {
        addNotification('error', lang === 'ar' ? 'لم يتم العثور على السجل' : 'Record not found');
      }
    } catch (error) {
      addNotification('error', 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectResult = (data) => {
    setSelectedResult(data);
  };

  const handleIssue = async () => {
    if (!selectedResult) return;
    setActionLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/certificates/birth/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_id: selectedResult.birth_id,
          generated_by_user_id: user.id || null,
          generated_by_username: user.username || user.name,
          generated_by_role: user.role
        })
      });
      const data = await response.json();
      if (data.success) {
        addNotification('success', lang === 'ar' ? 'تم الإصدار بنجاح!' : 'Certificate issued successfully! (Fee: $0)');
        setGeneratedCert({ ...selectedResult, certNumber: data.certificate_number });
      } else {
        addNotification('error', data.error || 'Failed to issue');
      }
    } catch (e) {
      addNotification('error', 'Issuance error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReprintRequest = async () => {
    if (!selectedResult) return;
    setActionLoading(true);
    try {
      const response = await fetch('http://localhost:5002/api/certificates/birth/reprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birth_id: selectedResult.birth_id,
          user_id: user.id,
          username: user.username || user.name,
          account_type: user.role
        })
      });
      const data = await response.json();
      if (data.success) {
        addNotification('success', lang === 'ar' ? 'تم تقديم طلب الطباعة!' : 'Reprint request submitted! (Fee: $10)');
        setSelectedResult(null);
      } else {
        addNotification('error', data.error || 'Failed to request reprint');
      }
    } catch (e) {
      addNotification('error', 'Reprint request error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} lang={lang} />
      
      <motion.header 
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end border-b-2 border-gov-gold pb-4`}
      >
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black text-gov-navy uppercase tracking-tighter gov-serif">
            {lang === 'ar' ? 'خدمات الشهادات' : 'Birth Certificate Services'}
          </h2>
          <div className={`flex items-center gap-2 mt-1 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-gov-blue font-black text-[9px] tracking-[0.3em] uppercase opacity-80">Federal Republic of Somalia</span>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => { setActiveTab('ISSUE'); setSelectedResult(null); setGeneratedCert(null); setSearchResults([]); }} className={`px-4 py-2 ${activeTab === 'ISSUE' ? 'bg-white shadow text-gov-blue' : 'text-slate-500'} rounded-lg font-bold text-xs transition-all`}>
                {lang === 'ar' ? 'إصدار جديد' : 'New Issuance ($0)'}
            </button>
            <button onClick={() => { setActiveTab('REPRINT'); setSelectedResult(null); setGeneratedCert(null); setSearchResults([]); }} className={`px-4 py-2 ${activeTab === 'REPRINT' ? 'bg-white shadow text-gov-blue' : 'text-slate-500'} rounded-lg font-bold text-xs transition-all`}>
                {lang === 'ar' ? 'طلب طباعة' : 'Reprint Request ($10)'}
            </button>
        </div>
      </motion.header>

      {!generatedCert && (
        <motion.div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
            <div className={`flex gap-3 mb-6 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="relative flex-1">
                    <input 
                        className={`w-full h-12 ${lang === 'ar' ? 'pr-4 text-right' : 'pl-4 text-left'} rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue transition-all font-bold text-gov-navy`}
                        placeholder={lang === 'ar' ? 'ابحث بالرقم أو الاسم...' : 'Search Registration UUID or Name...'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button onClick={handleSearch} className="bg-gov-navy text-gov-gold px-8 rounded-xl font-black uppercase text-xs hover:bg-black transition-all">
                    {searchLoading ? '...' : (lang === 'ar' ? 'بحث' : 'Search')}
                </button>
            </div>

            {searchResults.length > 0 && !selectedResult && (
                <div className="space-y-3">
                    {searchResults.map((res, i) => (
                        <div key={i} onClick={() => handleSelectResult(res)} className={`p-4 border rounded-xl border-slate-200 hover:border-gov-blue cursor-pointer flex justify-between items-center ${lang === 'ar' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <div>
                                <h3 className="font-bold text-gov-navy">{res.full_name}</h3>
                                <p className="text-xs text-slate-500">{res.uid} - {res.dob.split('T')[0]}</p>
                            </div>
                            <span className="text-gov-blue">Select &rarr;</span>
                        </div>
                    ))}
                </div>
            )}

            {selectedResult && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-4">
                    <h3 className={`font-black text-gov-navy text-lg mb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                        {lang === 'ar' ? 'تفاصيل السجل' : 'Registration Details'}
                    </h3>
                    <div className={`grid grid-cols-2 gap-4 mb-6 ${lang === 'ar' ? 'text-right flex-row-reverse' : 'text-left'}`}>
                        <div><p className="text-xs text-slate-500">Citizen Name</p><p className="font-bold text-gov-navy">{selectedResult.full_name}</p></div>
                        <div><p className="text-xs text-slate-500">Database UID</p><p className="font-bold text-gov-navy">{selectedResult.uid}</p></div>
                        <div><p className="text-xs text-slate-500">Father</p><p className="font-bold text-gov-navy">{selectedResult.father_name}</p></div>
                        <div><p className="text-xs text-slate-500">Mother</p><p className="font-bold text-gov-navy">{selectedResult.mother_name}</p></div>
                    </div>

                    <div className={`flex gap-3 pt-4 border-t border-slate-200 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <button onClick={() => setSelectedResult(null)} className="px-6 py-3 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                        {activeTab === 'ISSUE' ? (
                            <button onClick={handleIssue} disabled={actionLoading} className="flex-1 bg-emerald-600 text-white rounded-xl font-black uppercase text-sm hover:bg-emerald-700 shadow-lg">
                                {actionLoading ? 'Processing...' : 'Generate New Certificate ($0)'}
                            </button>
                        ) : (
                            <button onClick={handleReprintRequest} disabled={actionLoading} className="flex-1 bg-gov-blue text-white rounded-xl font-black uppercase text-sm hover:bg-gov-navy shadow-lg">
                                {actionLoading ? 'Processing...' : 'Submit Reprint Request ($10)'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
      )}

      {generatedCert && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 shadow-2xl relative overflow-hidden flex flex-col items-center border-[20px] border-white ring-1 ring-slate-200"
        >
            <div className="absolute inset-0 border-[2px] border-double border-gov-gold m-3 pointer-events-none"></div>
            
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] pointer-events-none select-none">
                <i className="fa-solid fa-star text-[40rem]"></i>
            </div>

            <div className={`flex justify-between w-full mb-8 ${lang === 'ar' ? 'flex-row-reverse text-left' : 'text-right'}`}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Somalia.svg" alt="Crest" className="h-20" />
                <div>
                    <h3 className="font-black text-gov-navy uppercase">Federal Government</h3>
                    <p className="text-gov-blue font-bold uppercase mt-1">of Somalia</p>
                </div>
            </div>

            <h1 className="text-3xl font-black text-gov-navy uppercase tracking-widest mb-10 text-center">Certificate of Birth</h1>

            <div className="w-full grid grid-cols-2 gap-y-8 gap-x-12 px-8 mb-12">
                <CertField label="Citizen Name" value={generatedCert.full_name} />
                <CertField label="Registration Date" value={generatedCert.created_at?.split('T')[0] || generatedCert.dob.split('T')[0]} />
                <CertField label="Place Of Birth" value={generatedCert.place_of_birth} />
                <CertField label="Gender" value={generatedCert.gender} />
                <CertField label="Father Name" value={generatedCert.father_name} />
                <CertField label="Mother Name" value={generatedCert.mother_name} />
                <CertField label="Hospital" value={generatedCert.hospital} />
                <CertField label="Certificate Number" value={generatedCert.certNumber} />
            </div>

            <div className="w-full pt-10 border-t border-slate-200 flex justify-between items-end pb-12 cursor-pointer">
                <div className="text-center">
                    <p className="font-serif italic text-xl opacity-60">Health Officer</p>
                    <p className="text-[10px] font-black uppercase text-gov-navy border-t border-slate-300 pt-2 w-32 mt-2">Signature</p>
                </div>
                <div>
                    <i className="fa-solid fa-qrcode text-5xl opacity-80"></i>
                </div>
                <div className="text-center">
                    <div className="w-16 h-16 border-2 border-gov-gold/30 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-[8px] uppercase text-gov-gold font-black px-2">Health Seal</span></div>
                    <p className="text-[10px] font-black uppercase text-gov-navy border-t border-slate-300 pt-2 w-32">Official Seal</p>
                </div>
            </div>

            <div className="w-full flex justify-center gap-4 mt-8 print:hidden">
                <button onClick={() => window.print()} className="bg-gov-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-gov-navy"><i className="fa-solid fa-print mr-2"></i> Print PDF</button>
                <button onClick={() => {setGeneratedCert(null); setSelectedResult(null);}} className="bg-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-slate-300">Close</button>
            </div>
        </motion.div>
      )}
    </div>
  );
};

const CertField = ({ label, value }) => (
  <div className="border-b border-slate-100 pb-2">
    <p className="text-[9px] uppercase font-black text-gov-blue tracking-[0.2em] mb-1 opacity-70">{label}</p>
    <p className="text-lg font-black text-gov-navy uppercase tracking-tight">{value}</p>
  </div>
);

export default BirthCertificateServices;
