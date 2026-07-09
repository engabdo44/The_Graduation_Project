import React, { useState } from 'react';
import { translations } from '../translations';
import { Search, Printer, FileText, CheckCircle2 } from 'lucide-react';

const BirthCertificateServices = ({ dir, lang }) => {
  const [activeTab, setActiveTab] = useState('ISSUE');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatedCert, setGeneratedCert] = useState(null);

  const t = translations[lang] || translations['en'];

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    setSelectedResult(null);
    setGeneratedCert(null);
    try {
        const response = await fetch(`http://localhost:5000/api/admin/citizens/search?q=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.citizens && data.citizens.length > 0) {
                setSearchResults(data.citizens);
                if (data.citizens.length === 1) handleSelectResult(data.citizens[0]);
            }
        }
    } catch (error) {
        console.error('Search error', error);
    } finally {
        setSearchLoading(false);
    }
  };

  const handleSelectResult = (data) => {
    setSelectedResult(data);
  };

  const processAction = async (fee, successMessage) => {
    setActionLoading(true);
    try {
        if (fee > 0 && selectedResult) {
            await fetch('http://localhost:5000/api/admin/birth-certificates/reprint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ citizen_id: selectedResult.citizen_id })
            });
        }
        setTimeout(() => {
            setActionLoading(false);
            setGeneratedCert({ ...selectedResult, certNumber: 'BC-' + Math.floor(Math.random() * 1000000) });
        }, 800);
    } catch (e) {
        console.error(e);
        setActionLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${dir === 'rtl' ? 'font-arabic text-right' : 'text-left'}`}>
      <header className={`flex ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end border-b pb-4 border-gray-200 dark:border-white/10`}>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            {dir === 'rtl' ? 'خدمات شهادة الميلاد' : 'Birth Certificate Services'}
          </h2>
          <p className="text-sm font-bold text-gray-400 mt-1">Official Document Generation</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
            <button onClick={() => { setActiveTab('ISSUE'); setSelectedResult(null); setGeneratedCert(null); setSearchResults([]); }} className={`px-4 py-2 ${activeTab === 'ISSUE' ? 'bg-white dark:bg-white/10 shadow text-primary-600 dark:text-white' : 'text-gray-500'} rounded-lg font-bold text-xs transition-all`}>
                {dir === 'rtl' ? 'إصدار جديد ($0)' : 'New Issuance ($0)'}
            </button>
            <button onClick={() => { setActiveTab('REPRINT'); setSelectedResult(null); setGeneratedCert(null); setSearchResults([]); }} className={`px-4 py-2 ${activeTab === 'REPRINT' ? 'bg-white dark:bg-white/10 shadow text-primary-600 dark:text-white' : 'text-gray-500'} rounded-lg font-bold text-xs transition-all`}>
                {dir === 'rtl' ? 'طلب طباعة ($10)' : 'Reprint Request ($10)'}
            </button>
        </div>
      </header>

      {!generatedCert && (
        <div className="bg-white dark:bg-[#020617] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
            <div className={`flex gap-3 mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="relative flex-1">
                    <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${dir === 'rtl' ? 'right-4' : 'left-4'}`} size={20} />
                    <input 
                        className={`w-full h-12 ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 outline-none focus:border-primary-500 transition-all font-bold text-gray-900 dark:text-white`}
                        placeholder={dir === 'rtl' ? 'ابحث بالرقم أو الاسم...' : 'Search Citizen UID or Name...'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button onClick={handleSearch} className="bg-primary-600 hover:bg-primary-700 text-white px-8 rounded-xl font-black uppercase text-xs transition-all">
                    {searchLoading ? '...' : (dir === 'rtl' ? 'بحث' : 'Search')}
                </button>
            </div>

            {searchResults.length > 0 && !selectedResult && (
                <div className="space-y-3">
                    {searchResults.map((res, i) => (
                        <div key={i} onClick={() => handleSelectResult(res)} className={`p-4 border rounded-xl border-gray-200 dark:border-white/10 hover:border-primary-500 cursor-pointer flex justify-between items-center ${dir === 'rtl' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{res.full_name}</h3>
                                <p className="text-xs text-gray-500">{res.citizen_id} - {res.national_id_number || 'No ID'}</p>
                            </div>
                            <span className="text-primary-500 font-bold text-xs uppercase tracking-widest">{dir === 'rtl' ? 'تحديد' : 'Select'}</span>
                        </div>
                    ))}
                </div>
            )}

            {selectedResult && (
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 mt-4">
                    <h3 className={`font-black text-gray-900 dark:text-white text-lg mb-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        {dir === 'rtl' ? 'تفاصيل السجل' : 'Registration Details'}
                    </h3>
                    <div className={`grid grid-cols-2 gap-4 mb-6 ${dir === 'rtl' ? 'text-right flex-row-reverse' : 'text-left'}`}>
                        <div><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Citizen Name</p><p className="font-bold text-gray-900 dark:text-white">{selectedResult.full_name}</p></div>
                        <div><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">National ID</p><p className="font-bold text-gray-900 dark:text-white">{selectedResult.national_id_number || selectedResult.citizen_id}</p></div>
                        <div><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Gender</p><p className="font-bold text-gray-900 dark:text-white">{selectedResult.gender}</p></div>
                        <div><p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Date of Birth</p><p className="font-bold text-gray-900 dark:text-white">{selectedResult.date_of_birth ? new Date(selectedResult.date_of_birth).toLocaleDateString() : 'N/A'}</p></div>
                    </div>

                    <div className={`flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <button onClick={() => setSelectedResult(null)} className="px-6 py-3 rounded-xl border border-gray-300 dark:border-white/20 font-bold text-gray-600 dark:text-gray-300">Cancel</button>
                        {activeTab === 'ISSUE' ? (
                            <button onClick={() => processAction(0, 'Issued successfully')} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase text-sm shadow-sm flex items-center justify-center gap-2">
                                {actionLoading ? 'Processing...' : <><FileText size={16} /> Generate New Certificate ($0)</>}
                            </button>
                        ) : (
                            <button onClick={() => processAction(10, 'Sent to printing')} disabled={actionLoading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black uppercase text-sm shadow-sm flex items-center justify-center gap-2">
                                {actionLoading ? 'Processing...' : <><Printer size={16} /> Submit Reprint Request ($10)</>}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}

      {generatedCert && (
        <div className="bg-white p-12 shadow-sm border border-gray-200 rounded-3xl relative overflow-hidden flex flex-col items-center">
            <div className={`flex justify-between w-full mb-8 ${dir === 'rtl' ? 'flex-row-reverse text-left' : 'text-right'}`}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Coat_of_arms_of_Somalia.svg" alt="Crest" className="h-16" />
                <div>
                    <h3 className="font-black text-gray-900 uppercase">Federal Government</h3>
                    <p className="text-primary-600 font-bold uppercase mt-1">of Somalia</p>
                </div>
            </div>

            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-widest mb-10 text-center">Certificate of Birth</h1>

            <div className={`w-full grid grid-cols-2 gap-y-8 gap-x-12 px-8 mb-12 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <div className="border-b border-gray-100 pb-2">
                    <p className="text-[10px] uppercase font-black text-primary-600 tracking-[0.2em] mb-1">Citizen Name</p>
                    <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{generatedCert.full_name}</p>
                </div>
                <div className="border-b border-gray-100 pb-2">
                    <p className="text-[10px] uppercase font-black text-primary-600 tracking-[0.2em] mb-1">Date of Birth</p>
                    <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{generatedCert.date_of_birth ? new Date(generatedCert.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="border-b border-gray-100 pb-2">
                    <p className="text-[10px] uppercase font-black text-primary-600 tracking-[0.2em] mb-1">Gender</p>
                    <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{generatedCert.gender}</p>
                </div>
                <div className="border-b border-gray-100 pb-2">
                    <p className="text-[10px] uppercase font-black text-primary-600 tracking-[0.2em] mb-1">Certificate Number</p>
                    <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{generatedCert.certNumber}</p>
                </div>
            </div>

            <div className="w-full flex justify-center gap-4 mt-8 print:hidden">
                <button onClick={() => window.print()} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2"><Printer size={16} /> Print PDF</button>
                <button onClick={() => {setGeneratedCert(null); setSelectedResult(null);}} className="bg-gray-200 text-gray-900 px-8 py-3 rounded-xl font-bold">Close</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default BirthCertificateServices;
