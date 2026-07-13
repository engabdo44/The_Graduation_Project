
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Check, ChevronLeft, ChevronRight, Upload, AlertCircle,
    Info, ShieldCheck, User, CreditCard, FileText,
    Building, MapPin, Printer, Download, Share2, Wallet, Calendar,
    CheckCircle2, Scan, Smartphone, Globe, Landmark, Camera, AlertTriangle,
    Search, LayoutGrid, Clock, FileX, FileCheck
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { getServices } from '../data/servicesData';

const ApplicationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [retrievedData, setRetrievedData] = useState(null);
    const { t, dir } = useLanguage();

    // Form State
    const [formData, setFormData] = useState({
        docType: id?.includes('passport') ? 'passport' : 'id',
        reason: id?.includes('replace') ? 'lost' : 'expiry',
        duration: '5',
        phone: '+252 61 234 5678',
        email: 'citizen@example.so',
        address: 'حي ودجر، مقديشو',
        city: 'مقديشو',
        office: 'المكتب الرئيسي (طريق المطار)',
        paymentMethod: 'card',
        personal_photo: ''
    });

    const services = getServices(t);
    const service = services.find(s => s.id === id);

    useEffect(() => {
        if (id?.includes('replace')) {
            setFormData(prev => ({ ...prev, reason: 'lost' }));
        } else {
            setFormData(prev => ({ ...prev, reason: 'expiry' }));
        }
    }, [id]);

    useEffect(() => {
        if (step === 2 && !retrievedData) {
            const fetchStoredData = async () => {
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                const docId = storedUser.national_number || storedUser.residence_number;
                if (!docId) return;

                if (formData.docType === 'id') {
                    const res = await fetch(`http://localhost:5000/api/admin/search-id?query=${encodeURIComponent(docId)}`);
                    const data = await res.json();
                    if (data.success && data.results.length > 0) {
                        const person = data.results[0];
                        const card = person.idCards?.[0] || {};
                        setRetrievedData({
                            fullName: person.full_name,
                            dob: person.dob,
                            nationality: person.nationality || 'Somali',
                            docNumber: person.national_number || person.residence_number,
                            serialNumber: card.issue_number,
                            gender: person.gender,
                            issueDate: card.issue_date,
                            expiryDate: card.expiry_date
                        });
                    } else {
                        setRetrievedData({
                            fullName: storedUser.full_name || 'N/A',
                            dob: storedUser.dob || 'N/A',
                            nationality: storedUser.nationality || 'Somali',
                            docNumber: storedUser.national_number || storedUser.residence_number || 'N/A',
                            serialNumber: 'N/A',
                            gender: storedUser.gender || 'N/A',
                            issueDate: null,
                            expiryDate: storedUser.id_expiry || null
                        });
                    }
                } else {
                    const res = await fetch(`http://localhost:5000/api/admin/search-passport?query=${encodeURIComponent(docId)}`);
                    const data = await res.json();
                    if (data.success && data.results.length > 0) {
                        const hit = data.results[0];
                        const person = hit.citizen;
                        const ppt = person.passports?.[0] || {};
                        setRetrievedData({
                            fullName: person.full_name,
                            dob: person.dob,
                            nationality: person.nationality || 'Somali',
                            docNumber: ppt.passport_number || hit.passport_number || 'N/A',
                            serialNumber: 'N/A',
                            gender: person.gender,
                            issueDate: ppt.issue_date || hit.issue_date,
                            expiryDate: ppt.expiry_date || hit.expiry_date
                        });
                    } else {
                        // Fallback state
                        setRetrievedData({
                            fullName: storedUser.full_name || 'N/A',
                            dob: storedUser.dob || 'N/A',
                            nationality: storedUser.nationality || 'Somali',
                            docNumber: storedUser.passport_number || 'N/A',
                            serialNumber: 'N/A',
                            gender: storedUser.gender || 'N/A',
                            issueDate: null,
                            expiryDate: storedUser.passport_expiry || null
                        });
                    }
                }
            };
            fetchStoredData();
        }
    }, [step, formData.docType, retrievedData]);

    if (!service) return null;

    const handleNext = async () => {
        if (step < 4) {
            setStep(step + 1);
            window.scrollTo(0, 0);
        } else if (step === 4) {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const typeValue = storedUser.account_type || 'citizen';
            const accId = storedUser.citizen_id || storedUser.resident_id || storedUser.user_id; // fallback
            
            let svcType = id?.includes('passport') ? 'PASSPORT_RENEWAL' : 'ID_RENEWAL';
            if (formData.reason === 'lost' || formData.reason === 'damaged') {
                 svcType = id?.includes('passport') ? 'PASSPORT_REPLACEMENT' : 'ID_REPLACEMENT';
            }
            if (id === 'birth-cert-reprint') svcType = 'BIRTH_CERTIFICATE_REPRINT';

            if (svcType === 'BIRTH_CERTIFICATE_REPRINT') {
                try {
                    let res = await fetch(`http://localhost:5002/api/birth-certificates/${encodeURIComponent(accId)}`);
                    let hData = null;
                    if (res.ok) hData = await res.json();
                    else {
                        res = await fetch(`http://localhost:5002/api/birth-certificates/${encodeURIComponent(retrievedData?.fullName || storedUser.full_name)}`);
                        if (res.ok) hData = await res.json();
                    }

                    if (!hData || hData.length === 0 || hData.error) {
                        setValidationError('You do not have a registered Birth Certificate in the Health System to reprint.');
                        return;
                    }

                    const selectedCert = hData[0];
                    const response = await fetch('http://localhost:5002/api/certificates/birth/reprint', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            birth_id: selectedCert.birth_id,
                            user_id: accId,
                            username: storedUser.username || retrievedData?.fullName || 'citizen',
                            account_type: typeValue
                        })
                    });

                    const data = await response.json();
                    if (!data.success) {
                        setValidationError(data.error || 'Failed to submit reprint request');
                        return;
                    }

                    setValidationError('');
                    setIsSuccess(true);
                    window.scrollTo(0, 0);
                    return;
                } catch (e) {
                    console.error(e);
                    setValidationError('Error connecting to Health System. Please try again.');
                    return;
                }
            }

            try {
                const response = await fetch('http://localhost:5000/api/user/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        applicant_type: typeValue,
                        applicant_id: accId,
                        service_type: svcType,
                        personal_photo: formData.personal_photo
                    })
                });

                const data = await response.json();
                if (!data.success) {
                    setValidationError(data.message);
                    return;
                }
            } catch (e) {
                console.error(e);
                setValidationError('Server connection failed. Please try again later.');
                return;
            }
            
            setValidationError('');
            setIsSuccess(true);
            window.scrollTo(0, 0);
        }
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
            window.scrollTo(0, 0);
        } else {
            navigate(-1);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#f1f5f9] dark:bg-primary-950 flex flex-col items-center justify-center px-4 animate-fade-in py-12">
                <div className="bg-white dark:bg-slate-900/50 p-8 md:p-16 rounded-[3rem] shadow-premium max-w-2xl w-full text-center relative overflow-hidden border border-white dark:border-white/5 mb-8">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-green-500 to-green-400"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-white dark:border-slate-800 animate-bounce">
                            <Check size={48} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{t.successTitle}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-10 font-bold text-lg">
                            {t.successMsg} <br />
                            <span className="text-primary-800 dark:text-gold-400 font-black text-3xl mt-3 block tracking-[0.2em] bg-primary-50 dark:bg-white/5 py-4 rounded-2xl border border-primary-100 dark:border-white/5">
                                SO-{Math.floor(Math.random() * 90000) + 10000}
                            </span>
                        </p>

                        {/* Status Follow-up Timeline */}
                        <div className="mb-12 space-y-6">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">متابعة حالة الطلب المتوقعة</h4>
                            <div className="flex justify-between items-center relative px-2">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-white/5 -translate-y-1/2 z-0"></div>
                                {[
                                    { icon: Clock, label: t.statusReview, active: true },
                                    { icon: FileCheck, label: t.statusVerify, active: false },
                                    { icon: CheckCircle2, label: t.statusApproved, active: false },
                                    { icon: Printer, label: t.statusPrinting, active: false },
                                    { icon: Download, label: t.statusReady, active: false }
                                ].map((s, idx) => (
                                    <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm transition-all ${s.active ? 'bg-primary-900 text-gold-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                                            <s.icon size={16} />
                                        </div>
                                        <span className={`text-[8px] font-black whitespace-nowrap ${s.active ? 'text-primary-900 dark:text-gold-400' : 'text-gray-400'}`}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <button className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl font-bold text-gray-700 dark:text-white border border-gray-100 dark:border-white/10">
                                <Printer size={18} /> طباعة
                            </button>
                            <button className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl font-bold text-gray-700 dark:text-white border border-gray-100 dark:border-white/10">
                                <Download size={18} /> تحميل PDF
                            </button>
                        </div>

                        <button onClick={() => navigate('/home')} className="w-full bg-primary-900 dark:bg-gold-500 text-white dark:text-primary-950 py-5 rounded-2xl font-black text-xl shadow-glow-blue active:scale-95">
                            {t.home}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
    const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-primary-950 py-16 px-4">
            <div className="container mx-auto max-w-6xl">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={handlePrev} className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white group transition-all">
                            <BackIcon size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <span className="text-gold-600 font-black text-[10px] uppercase tracking-widest mb-1 block">الخطوة {step} من 4</span>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{service.title}</h1>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 space-y-8">

                        <div className="hidden lg:flex justify-between items-center bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] shadow-premium border border-white dark:border-white/10">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className="flex flex-col items-center gap-2 relative">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-primary-900 text-gold-400' : 'bg-gray-100 dark:bg-white/5 text-gray-300'
                                        }`}>
                                        {step > s ? <Check size={20} /> : s}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-slate-900/50 p-8 md:p-12 rounded-[3rem] shadow-premium border border-white dark:border-white/10 min-h-[500px] flex flex-col relative overflow-hidden">

                            <div className="flex-grow">
                                {step === 1 && (
                                    <div className="space-y-10 animate-fade-in-up">
                                        <div className="flex items-center gap-4 pb-6 border-b border-gray-50 dark:border-white/5">
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-gold-500 rounded-xl flex items-center justify-center"><LayoutGrid size={24} /></div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.applyStep1}</h2>
                                        </div>

                                        <div className="grid gap-8">
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.reason}</label>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {[
                                                        { id: 'expiry', label: t.expiryReason, icon: Clock },
                                                        { id: 'lost', label: t.lostReason, icon: AlertTriangle },
                                                        { id: 'damaged', label: t.damagedReason, icon: FileX },
                                                        { id: 'update', label: t.updateReason, icon: User }
                                                    ].map((r) => (
                                                        <button
                                                            key={r.id}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, reason: r.id })}
                                                            className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-start ${formData.reason === r.id ? 'border-primary-900 bg-primary-50/50 dark:bg-white/10 dark:border-gold-500' : 'border-gray-50 dark:border-white/5'
                                                                }`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.reason === r.id ? 'bg-primary-900 text-white dark:bg-gold-500 dark:text-primary-950' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                                                <r.icon size={20} />
                                                            </div>
                                                            <span className="font-black text-gray-900 dark:text-white">{r.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {formData.docType === 'passport' && (
                                                <div className="space-y-4 animate-fade-in">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.passportDuration}</label>
                                                    <div className="flex gap-4">
                                                        {['5', '10'].map((d) => (
                                                            <button
                                                                key={d}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, duration: d })}
                                                                className={`flex-1 p-5 rounded-2xl border-2 transition-all font-black ${formData.duration === d ? 'border-primary-900 bg-primary-50 dark:bg-white/10 dark:border-gold-500 text-primary-900 dark:text-white' : 'border-gray-50 dark:border-white/5 text-gray-400'
                                                                    }`}
                                                            >
                                                                {d === '5' ? t.fiveYears : t.tenYears}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-10 animate-fade-in-up">
                                        <div className="flex items-center gap-4 pb-6 border-b border-gray-50 dark:border-white/5">
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-gold-500 rounded-xl flex items-center justify-center"><User size={24} /></div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.applyStep2}</h2>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 space-y-6">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.personalInfoReadOnly}</h4>
                                                
                                                {!retrievedData ? (
                                                    <p className="text-gray-500 text-sm font-bold animate-pulse">Loading identity data from database...</p>
                                                ) : (
                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        {[
                                                            { label: 'Full Name', val: retrievedData.fullName },
                                                            { label: formData.docType === 'id' ? 'National ID Number' : 'Passport Number', val: retrievedData.docNumber },
                                                            { label: 'Date of Birth', val: retrievedData.dob ? new Date(retrievedData.dob).toISOString().split('T')[0] : 'N/A' },
                                                            { label: 'Gender', val: retrievedData.gender?.toUpperCase() || 'N/A' },
                                                            { label: 'Nationality', val: retrievedData.nationality },
                                                            { label: 'Serial Number / Issue No.', val: retrievedData.serialNumber },
                                                            { label: 'Issue Date', val: retrievedData.issueDate ? new Date(retrievedData.issueDate).toISOString().split('T')[0] : 'N/A' },
                                                            { label: 'Expiry Date', val: retrievedData.expiryDate ? new Date(retrievedData.expiryDate).toISOString().split('T')[0] : 'N/A' }
                                                        ].map((item, i) => (
                                                            <div key={i} className="mb-2">
                                                                <p className="text-[10px] text-primary-400 font-bold mb-1 uppercase tracking-tight">{item.label}</p>
                                                                <p className="text-gray-900 dark:text-white font-black uppercase">{item.val}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.editableInfo}</h4>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-gray-500">{t.phoneNumber}</label>
                                                        <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5 rounded-2xl outline-none font-bold focus:border-gold-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-gray-500">البريد الإلكتروني</label>
                                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5 rounded-2xl outline-none font-bold focus:border-gold-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-10 animate-fade-in-up">
                                        <div className="flex items-center gap-4 pb-6 border-b border-gray-50 dark:border-white/5">
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-gold-500 rounded-xl flex items-center justify-center"><Calendar size={24} /></div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.applyStep4}</h2>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.city}</label>
                                                <select className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5 rounded-2xl outline-none font-bold focus:border-gold-500">
                                                    <option>مقديشو</option>
                                                    <option>هرجيسا</option>
                                                    <option>بوساسو</option>
                                                    <option>كسمايو</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.office}</label>
                                                <select className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5 rounded-2xl outline-none font-bold focus:border-gold-500">
                                                    <option>المكتب الرئيسي (طريق المطار)</option>
                                                    <option>مكتب الولاية</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.dateTime}</label>
                                                <input type="datetime-local" className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5 rounded-2xl outline-none font-bold focus:border-gold-500" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 4 && (
                                    <div className="space-y-10 animate-fade-in-up">
                                        <div className="flex items-center gap-4 pb-6 border-b border-gray-50 dark:border-white/5">
                                            <div className="w-12 h-12 bg-primary-50 dark:bg-white/10 text-primary-600 dark:text-gold-500 rounded-xl flex items-center justify-center"><Wallet size={24} /></div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t.applyStep5}</h2>
                                        </div>

                                        <div className="bg-primary-900 dark:bg-gold-500 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-10 -translate-y-10 group-hover:translate-x-0 transition-transform duration-1000">
                                                <Smartphone size={200} className="text-white dark:text-primary-950" />
                                            </div>
                                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div>
                                                    <p className="text-primary-200 dark:text-primary-950 text-[10px] font-black uppercase tracking-widest mb-1">{t.feeAmount}</p>
                                                    <h3 className="text-white dark:text-primary-950 text-5xl font-black tracking-tight">
                                                        {id === 'birth-cert-pdf' ? 'Free ($0.00)' : id === 'birth-cert-reprint' ? '$10.00' : (formData.reason === 'lost' || formData.reason === 'damaged' ? '$50.00' : '$100.00')}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white/10 dark:bg-primary-950/10 px-6 py-3 rounded-2xl border border-white/20">
                                                    <ShieldCheck size={20} className="text-gold-400 dark:text-primary-950" />
                                                    <span className="text-white dark:text-primary-950 font-black text-xs uppercase tracking-widest">آمن 100%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t.paymentMethod}</label>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'card', label: t.bankCard, icon: CreditCard },
                                                    { id: 'wallet', label: t.eWallet, icon: Smartphone }
                                                ].map((pm) => (
                                                    <button
                                                        key={pm.id}
                                                        onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                                                        className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all ${formData.paymentMethod === pm.id ? 'border-primary-900 bg-primary-50 dark:bg-white/10 dark:border-gold-500' : 'border-gray-50 dark:border-white/5'
                                                            }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.paymentMethod === pm.id ? 'bg-primary-900 text-white dark:bg-gold-500 dark:text-primary-950' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                                            <pm.icon size={20} />
                                                        </div>
                                                        <span className="font-black text-sm text-gray-900 dark:text-white">{pm.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-16 pt-10 border-t border-gray-100 dark:border-white/5 relative z-10 flex-col gap-6">
                                {validationError && (
                                    <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-2xl w-full flex items-center gap-3">
                                        <AlertTriangle size={24} className="text-red-500 shrink-0" />
                                        <p className="text-sm font-bold text-red-700 dark:text-red-400 m-0">{validationError}</p>
                                    </div>
                                )}
                                <div className="flex justify-between w-full">
                                    <button
                                        type="button"
                                        onClick={handlePrev}
                                        className="px-8 py-4 border-2 border-gray-100 dark:border-white/5 rounded-2xl text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 font-black transition-all flex items-center gap-3 active:scale-95"
                                    >
                                    <BackIcon size={20} />
                                    {step > 1 ? t.prev : t.cancel}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="bg-primary-900 dark:bg-gold-500 hover:bg-primary-950 dark:hover:bg-gold-600 text-white dark:text-primary-950 px-14 py-4 rounded-2xl font-black text-xl transition-all shadow-glow-blue dark:shadow-glow-gold flex items-center gap-4 hover:-translate-y-1 active:scale-95"
                                >
                                    {step === 4 ? t.confirmPayment : t.next}
                                    {step < 4 && <NextIcon size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-96">
                        <div className="space-y-6 sticky top-28">
                            <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-white dark:border-white/10 shadow-premium">
                                <div className="flex items-center gap-3 pb-6 border-b border-gray-50 dark:border-white/5">
                                    <div className="w-10 h-10 bg-gold-500/10 text-gold-600 rounded-xl flex items-center justify-center">
                                        <AlertCircle size={22} />
                                    </div>
                                    <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight">إرشادات التجديد</h3>
                                </div>

                                <div className="space-y-6 mt-6">
                                    {[
                                        { text: 'تأكد من تحديث بيانات الاتصال لتلقي الإشعارات.', icon: Info },
                                        { text: 'يجب أن تكون الصور الشخصية بمقاس 4x6.', icon: FileText },
                                        { text: 'احرص على التواجد في الموعد المحدد بالمكتب.', icon: Calendar },
                                        { text: 'خدمة التوصيل متاحة بعد الموافقة النهائية.', icon: Smartphone }
                                    ].map((tip, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="w-6 h-6 shrink-0 bg-primary-50 dark:bg-white/5 text-primary-900 dark:text-gold-500 rounded-lg flex items-center justify-center group-hover:bg-primary-900 dark:group-hover:bg-gold-500 group-hover:text-white dark:group-hover:text-primary-950 transition-colors">
                                                <tip.icon size={14} />
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{tip.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ApplicationForm;
