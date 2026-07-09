
import React from 'react';
import {
    User, Mail, Phone, CreditCard, ShieldCheck,
    Award, Globe, Plus, Fingerprint, Calendar, Shield, QrCode, FileText, Download, Gavel
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    // Fetch user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');


    const userData = {
        firstName: storedUser.full_name?.split(' ')[0] || '',
        middleName: storedUser.full_name?.split(' ').slice(1, -1).join(' ') || '',
        lastName: storedUser.full_name?.split(' ').slice(-1)[0] || '',
        fullName: storedUser.full_name || 'Guest User',
        email: storedUser.email || storedUser.username || '',
        phone: storedUser.phone || storedUser.phone_number || '',
        idNumber: storedUser.national_number || storedUser.residence_number || storedUser.national_id_number || 'N/A', // Support both Citizen ID and Resident Number
        accountType: storedUser.account_type || 'citizen',
        nid: storedUser.id || 'N/A',
        dob: storedUser.dob || 'N/A',
        pob: storedUser.place_of_birth || 'N/A',
        gender: storedUser.gender || 'N/A',
        nationality: storedUser.nationality || 'Somali',
        photo: storedUser.photo || null,
        passportNumber: storedUser.passport_number || 'N/A',
        expiryId: storedUser.id_expiry || 'N/A',
        expiryPassport: storedUser.passport_expiry || 'N/A'
    };

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-white/5 pb-4">
            <div className="w-10 h-10 bg-primary-900 dark:bg-gold-500 text-white dark:text-primary-950 rounded-xl flex items-center justify-center">
                <Icon size={20} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h3>
        </div>
    );

    return (
        <div className="bg-[#f8fafc] dark:bg-primary-950 min-h-screen pb-32 transition-colors duration-500">

            <div className="bg-primary-950 pt-20 pb-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-800/40 via-transparent to-transparent"></div>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in-up">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border-4 border-white/20 p-1 overflow-hidden shadow-2xl relative">
                                <img
                                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"
                                    alt="User Avatar"
                                    className="w-full h-full object-cover rounded-[2rem]"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-2xl border-4 border-primary-950 flex items-center justify-center text-white">
                                <ShieldCheck size={18} />
                            </div>
                        </div>

                        <div className="text-center md:text-start space-y-3">
                            <h1 className="text-4xl font-black text-white tracking-tight">{userData.fullName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="flex items-center gap-2 text-primary-200 text-xs font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest">
                                    <CreditCard size={14} className="text-gold-500" />
                                    {userData.idNumber}
                                </span>
                                <span className="flex items-center gap-2 text-primary-200 text-xs font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest">
                                    <Shield size={14} className="text-gold-500" />
                                    Verified Identity
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-24 relative z-20 space-y-12">

                <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] shadow-premium border border-gray-100 dark:border-white/10">
                    <SectionHeader icon={User} title={t.personalInfo} />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
                        {[
                            { label: t.fullName, val: userData.fullName, icon: User },
                            { label: t.nid, val: userData.nid, icon: Fingerprint },
                            { label: t.emailOrId, val: userData.email, icon: Mail },
                            { label: t.phoneNumber, val: userData.phone, icon: Phone },
                            { label: t.dob, val: userData.dob, icon: Calendar },
                            { label: t.nationality, val: userData.nationality, icon: Globe },
                        ].map((item, i) => (
                            <div key={i} className="space-y-1 group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <item.icon size={12} className="text-primary-600 dark:text-gold-500" />
                                    {item.label}
                                </p>
                                <p className="text-gray-900 dark:text-white font-black text-lg group-hover:text-primary-600 dark:group-hover:text-gold-400 transition-colors">{item.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center gap-2">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.idServices || 'ID SERVICES'}</h4>
                            <div className="flex gap-2">
                                <button onClick={() => navigate('/service/id-renew')} className="px-4 py-2 bg-primary-50 dark:bg-white/5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white text-primary-900 font-black rounded-xl text-[10px] transition-all flex items-center gap-2">
                                    <Plus size={14} /> {t.services?.idRenew || 'Renew'}
                                </button>
                                <button onClick={() => navigate('/service/id-replace')} className="px-4 py-2 bg-primary-50 dark:bg-white/5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white text-primary-900 font-black rounded-xl text-[10px] transition-all flex items-center gap-2">
                                    <Plus size={14} /> {dir === 'rtl' ? 'بدل فاقد' : 'Replace'}
                                </button>
                            </div>
                        </div>

                        <div dir="ltr" className="relative w-full max-w-[520px] h-[330px] rounded-2xl overflow-hidden shadow-2xl border border-white/40 group font-sans text-left mx-auto md:mx-0" style={{ background: userData.accountType === 'resident' ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #94a3b8 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)' }}>
                            {/* Background Map Placeholder */}
                            <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                                <Globe size={300} className="text-blue-900" />
                            </div>

                            <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 text-slate-900">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png" alt="Coat of Arms" className="w-14 h-auto drop-shadow-md" />
                                    <div className="text-center flex-1 mx-2 mt-1">
                                        <h3 className="text-[10px] font-bold text-slate-800 leading-tight">Jamhuuriyadda Federaalka Soomaaliya</h3>
                                        <h3 className="text-[12px] font-black text-slate-900 leading-tight my-0.5" dir="rtl">جمهورية الصومال الفيدرالية</h3>
                                        <h3 className="text-[10px] font-bold text-slate-800 leading-tight">Federal Republic of Somalia</h3>
                                        <h4 className="text-[8px] font-bold text-slate-700 leading-tight mt-1.5">Kaarka Aqoonsiga</h4>
                                        <h4 className="text-[9px] font-black text-slate-900 leading-tight">IDENTITY CARD / <span dir="rtl" className="font-bold">بطاقة الهوية</span></h4>
                                    </div>
                                    <div className="w-14 h-9 bg-blue-500 border border-white/50 shadow-sm flex items-center justify-center relative mt-2">
                                        <div className="text-white">
                                            <svg width="16" height="16" viewBox="0 0 512 512"><path fill="#fff" d="M256 16l61.8 190.2h200L356.1 323.8 417.9 514 256 396.2 94.1 514l61.8-190.2L-4.2 206.2h200z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Body  */}
                                <div className="flex gap-4 flex-1 flex-row-reverse">
                                    {/* Details */}
                                    <div className="flex-1 space-y-2 flex flex-col justify-between">
                                        <div className="flex justify-between w-full">
                                            <div className="w-[45%]">
                                                <p className="text-[8px] font-bold text-slate-600 leading-none">Lambarka aqoonsiga <span dir="rtl">رقم الهوية /</span> Identity Number</p>
                                                <p className="text-xs font-black text-slate-900 font-mono tracking-wider mt-0.5">{userData.idNumber}</p>
                                            </div>
                                            <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                <p className="text-[8px] font-bold text-slate-600 leading-none mb-1">Tirada <span dir="rtl">رقم الإصدار /</span> Issue No.</p>
                                                <span className="bg-slate-300 text-slate-900 text-xs font-black font-mono px-2 py-0.5 rounded shadow-sm border border-slate-400/50">
                                                    1
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-600 leading-none">Magaca <span dir="rtl">الاسم /</span> Name</p>
                                            <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{userData.fullName}</p>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <div className="w-[45%]">
                                                <p className="text-[8px] font-bold text-slate-600 leading-none">Jinsiga <span dir="rtl">الجنس /</span> Sex</p>
                                                <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{userData.gender}</p>
                                            </div>
                                            <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda Dhalashada <span dir="rtl">الميلاد /</span> Date of Birth</p>
                                                <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{userData.dob && userData.dob !== 'N/A' ? new Date(userData.dob).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between w-full pt-1.5 border-t border-slate-400/30">
                                            <div className="w-[45%]">
                                                <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda la bixiyey <span dir="rtl">الإصدار /</span> Date of Issue</p>
                                                <p className="text-xs font-black text-slate-900 font-mono mt-0.5">
                                                    {userData.expiryId && userData.expiryId !== 'N/A' 
                                                        ? new Date(new Date(userData.expiryId).setFullYear(new Date(userData.expiryId).getFullYear() - 10)).toLocaleDateString('en-GB').replace(/\//g, '-') 
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda uu dhacayo <span dir="rtl">انتهاء /</span> Date of Expiry</p>
                                                <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{userData.expiryId && userData.expiryId !== 'N/A' ? new Date(userData.expiryId).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-end justify-between pt-1">
                                            {/* Small Hologram Photo Placeholder */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-10 border border-slate-300 rounded overflow-hidden opacity-60 relative mix-blend-multiply mb-0.5">
                                                    <img src={userData.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150"} className="w-full h-full object-cover grayscale" alt="Hologram" />
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Picture & Signature */}
                                    <div className="w-28 flex flex-col items-center justify-between mt-1">
                                        <div className="w-[100px] h-[130px] bg-slate-200 border border-slate-300 shadow-inner overflow-hidden rounded-sm">
                                            <img src={userData.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover grayscale" alt="Profile" />
                                        </div>
                                        <div className="text-center w-full mt-auto pb-1 relative z-20">
                                            <div className="font-['Brush_Script_MT',cursive] text-xl text-slate-800 -rotate-3 mb-0.5">{userData.firstName}</div>
                                            <p className="text-[7px] font-bold text-slate-600 border-t border-slate-400/50 pt-1">Holder's Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Glossy Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 z-20 pointer-events-none mix-blend-overlay"></div>
                        </div>
                    </div>

                    {userData.accountType !== 'resident' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center gap-2">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t.passportServices || 'PASSPORT SERVICES'}</h4>
                                <div className="flex gap-2">
                                    <button onClick={() => navigate('/service/passport-renew')} className="px-4 py-2 bg-primary-50 dark:bg-white/5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white text-primary-900 font-black rounded-xl text-[10px] transition-all flex items-center gap-2">
                                        <Plus size={14} /> {t.services?.pptRenew || 'Renew'}
                                    </button>
                                    <button onClick={() => navigate('/service/passport-replace')} className="px-4 py-2 bg-primary-50 dark:bg-white/5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white text-primary-900 font-black rounded-xl text-[10px] transition-all flex items-center gap-2">
                                        <Plus size={14} /> {dir === 'rtl' ? 'بدل فاقد' : 'Replace'}
                                    </button>
                                </div>
                            </div>

                            <div dir="ltr" className="relative w-full max-w-[520px] h-[330px] rounded-2xl overflow-hidden shadow-2xl border-x-4 border-slate-300 mx-auto md:mx-0 font-sans text-left" style={{ backgroundImage: 'radial-gradient(circle at center, #fdfdfd 0%, #f0ebd8 100%)' }}>
                                <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/400px-Coat_of_arms_of_Somalia.svg.png" className="w-[150px] h-auto mix-blend-multiply" alt="Watermark" />
                                </div>

                                {/* Header */}
                                <div className="flex justify-between items-center px-5 pt-4 pb-2 border-b border-gray-300/60 shrink-0">
                                    <div className="text-center w-36">
                                        <h2 className="text-[10px] font-black tracking-widest text-[#1e3a8a] whitespace-nowrap">JAMHUURIYADDA SOOMAALIYA</h2>
                                        <div className="flex items-center justify-between text-[#1e3a8a] font-black text-[7px] mt-0.5">
                                            <span>BAASABOOR</span>
                                            <span className="font-normal mx-1 text-gray-500">|</span>
                                            <span dir="rtl" className="text-[10px] font-bold leading-none">جواز سفر</span>
                                            <span className="font-normal mx-1 text-gray-500">|</span>
                                            <span>PASSPORT</span>
                                        </div>
                                    </div>
                                    <div className="mx-2 mt-1">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png" className="w-10 h-auto drop-shadow-md" alt="Somalia" />
                                    </div>
                                    <div className="text-center w-36 flex flex-col items-center justify-center">
                                        <div className="bg-white/50 backdrop-blur-sm p-1 rounded-md border border-gray-300/40 opacity-80 mb-1">
                                            <QrCode size={18} className="text-[#1e3a8a]" />
                                        </div>
                                        <h2 className="text-[9px] font-black tracking-widest text-[#1e3a8a] whitespace-nowrap leading-none">SOMALI REPUBLIC</h2>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex flex-1 px-5 py-3 gap-4">
                                    {/* Photo Left */}
                                    <div className="w-[90px] shrink-0">
                                        <div className="w-full h-[120px] bg-white border border-gray-300 p-0.5 shadow-sm mb-1.5 relative">
                                            <img src={userData.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover" alt="Holder" />
                                            {userData.expiryPassport && userData.expiryPassport !== 'N/A' && new Date(userData.expiryPassport) < new Date() ? (
                                                <div className="absolute inset-0 bg-red-600/20 backdrop-blur-[1px] flex items-center justify-center"><span className="text-white font-black text-[8px] uppercase rotate-[-30deg] border border-white px-1">Expired</span></div>
                                            ) : null}
                                        </div>
                                        {/* Small Hologram Photo */}
                                        <div className="w-10 h-12 border border-slate-300 rounded overflow-hidden opacity-40 mx-auto mix-blend-multiply">
                                            <img src={userData.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150"} className="w-full h-full object-cover grayscale" alt="Hologram" />
                                        </div>
                                    </div>

                                    {/* Details Right */}
                                    <div className="flex-1 text-[#1e3a8a] flex flex-col justify-start">
                                        <div className="flex gap-2 mb-1 pb-1">
                                            <div className="w-1/4">
                                                <p className="text-[6px] font-bold text-gray-500">Type / <span dir="rtl">النوع</span></p>
                                                <p className="text-[12px] font-bold font-mono text-black leading-none mt-0.5">P</p>
                                            </div>
                                            <div className="w-1/4">
                                                <p className="text-[6px] font-bold text-gray-500">Code / <span dir="rtl">الرمز</span></p>
                                                <p className="text-[12px] font-bold font-mono text-black leading-none mt-0.5">SOM</p>
                                            </div>
                                            <div className="flex-1 text-right border-l border-gray-300 pl-2">
                                                <p className="text-[6px] font-bold text-gray-500">Passport No / <span dir="rtl">رقم الجواز</span></p>
                                                <p className="text-sm font-black font-mono tracking-widest text-[#e11d48] mt-0.5">{userData.passportNumber}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1.5 mt-1">
                                            <div>
                                                <p className="text-[6px] font-bold text-gray-500 leading-none mb-0.5">Name / <span dir="rtl">الاسم</span></p>
                                                <p className="text-xs font-black uppercase text-black leading-none">{userData.fullName}</p>
                                            </div>
                                            
                                            <div className="flex justify-between border-t border-gray-300/50 pt-1">
                                                <div className="w-1/2">
                                                    <p className="text-[6px] font-bold text-gray-500 leading-none mb-0.5">Nationality / <span dir="rtl">الجنسية</span></p>
                                                    <p className="text-[9px] font-black uppercase text-black leading-none">{userData.nationality}</p>
                                                </div>
                                                <div className="w-1/2">
                                                    <p className="text-[6px] font-bold text-gray-500 leading-none mb-0.5 text-right">Status / <span dir="rtl">الحالة</span></p>
                                                    <p className={`text-[9px] font-black uppercase text-right leading-none ${userData.expiryPassport && userData.expiryPassport !== 'N/A' && new Date(userData.expiryPassport) > new Date() ? 'text-green-700' : 'text-red-700'}`}>
                                                        {userData.expiryPassport === 'N/A' ? 'N/A' : (new Date(userData.expiryPassport) > new Date() ? 'ACTIVE' : 'EXPIRED')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between border-t border-gray-300/50 pt-1">
                                                <div className="w-1/3">
                                                    <p className="text-[6px] font-bold text-gray-500 leading-none">Date of Birth</p>
                                                    <p className="text-[10px] font-black font-mono text-black mt-0.5">{userData.dob && userData.dob !== 'N/A' ? new Date(userData.dob).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                                                </div>
                                                <div className="w-1/3 text-center">
                                                    <p className="text-[6px] font-bold text-gray-500 leading-none">Gender</p>
                                                    <p className="text-[10px] font-black font-mono text-black mt-0.5">{userData.gender && userData.gender !== 'N/A' ? userData.gender.charAt(0).toUpperCase() : 'N/A'}</p>
                                                </div>
                                                <div className="w-1/3 text-right">
                                                    <p className="text-[6px] font-bold text-gray-500 leading-none">Place of Birth</p>
                                                    <p className="text-[9px] font-black uppercase text-black mt-0.5">{userData.pob && userData.pob !== 'N/A' ? userData.pob : 'SOMALIA'}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between border-t border-gray-300/50 pt-1">
                                                <div className="w-1/3">
                                                    <p className="text-[6px] font-bold text-gray-500 leading-none">Date of Issue</p>
                                                    <p className="text-[10px] font-black font-mono text-black mt-0.5">
                                                        {userData.expiryPassport && userData.expiryPassport !== 'N/A' ? new Date(new Date(userData.expiryPassport).setFullYear(new Date(userData.expiryPassport).getFullYear() - 5)).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="w-1/3 text-center">
                                                    <p className="text-[6px] font-bold text-gray-500 leading-none">Authority</p>
                                                    <p className="text-[9px] font-black uppercase text-black mt-0.5">Immigration HQ</p>
                                                </div>
                                                <div className="w-1/3 text-right">
                                                    <p className="text-[6px] font-bold text-gray-500 leading-none">Date of expiry</p>
                                                    <p className="text-[10px] font-black font-mono text-black mt-0.5">{userData.expiryPassport && userData.expiryPassport !== 'N/A' ? new Date(userData.expiryPassport).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute right-5 bottom-[48px] border-t border-black/40 pt-0.5 z-20">
                                         <p className="font-['Brush_Script_MT',cursive] text-lg text-slate-800 -rotate-6 px-4">{userData.firstName}</p>
                                         <p className="text-[5px] font-bold text-slate-600 text-center uppercase tracking-widest pl-2">Signature / توقيع</p>
                                    </div>
                                </div>

                                {/* MRZ Footer */}
                                <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-white opacity-95 border-t border-gray-300 px-4 flex flex-col justify-center font-['OCR_A_Std','Courier_New',monospace] text-black font-black tracking-[0.1em] text-[10px] leading-tight z-10 whitespace-nowrap overflow-hidden">
                                    <p>P&lt;SOM{userData.lastName?.toUpperCase()}&lt;&lt;{userData.firstName?.toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                                    <p>{userData.passportNumber}&lt;3SOM{userData.dob !== 'N/A' ? new Date(userData.dob).toISOString().split('T')[0].replace(/-/g, '').slice(2) : '000000'}M{userData.expiryPassport !== 'N/A' ? new Date(userData.expiryPassport).toISOString().split('T')[0].replace(/-/g, '').slice(2) : '000000'}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>




            </div>
        </div>
    );
};

export default Profile;
