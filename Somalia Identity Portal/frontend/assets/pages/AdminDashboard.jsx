
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Users, FileText, CheckCircle2, XCircle, Clock,
    TrendingUp, DollarSign, ShieldAlert, MoreVertical,
    Search, Filter, Download, LayoutDashboard, Database,
    Settings, Activity, Eye, Check, X, UserPlus, Plane,
    Globe, LogOut, UserCircle, Briefcase, ChevronRight, Menu,
    ScanFace, Fingerprint, ShieldCheck, CreditCard, Landmark,
    Sparkles, Cpu, MapPin, Shield, Award, AlertCircle, Trash2,
    FileSearch, Moon, Sun, ArrowUpRight, ArrowDownRight, Send, Camera, BookOpen, RotateCw, RefreshCcw, Upload, Printer,
    BarChart2, ScrollText, ChevronLeft, ChevronDown, ChevronUp, Terminal
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Link, useNavigate, Routes, Route, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { NationalIDReport, PassportReport, RevenueReport, PrintingReport, UserReport, ActivityLogReport } from './Reports';
import BirthCertificateServices from './BirthCertificateServices';

// --- Sub-component: AdminSidebar ---
const AdminSidebar = ({ isOpen, setIsOpen, pendingCount = 0 }) => {
    const { t, dir } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [reportsOpen, setReportsOpen] = useState(false);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUserRole(JSON.parse(u).account_type);
    }, []);

    // Auto-expand Reports submenu when on a report page
    useEffect(() => {
        if (location.pathname.startsWith('/admin/reports')) setReportsOpen(true);
    }, [location.pathname]);

    const reportSubItems = [
        { path: '/admin/reports/national-id', label: dir === 'rtl' ? 'تقارير الهوية الوطنية' : 'National ID Reports', icon: FileText },
        { path: '/admin/reports/passport', label: dir === 'rtl' ? 'تقارير الجوازات' : 'Passport Reports', icon: Plane },
        { path: '/admin/reports/revenue', label: dir === 'rtl' ? 'تقارير الإيرادات' : 'Revenue Reports', icon: DollarSign },
        { path: '/admin/reports/printing', label: dir === 'rtl' ? 'تقارير الطباعة' : 'Printing Reports', icon: Printer },
        { path: '/admin/reports/users', label: dir === 'rtl' ? 'تقارير المستخدمين' : 'User Reports', icon: Users },
        { path: '/admin/reports/activity-logs', label: dir === 'rtl' ? 'سجلات النشاط' : 'Activity Log Reports', icon: ScrollText },
    ];

    let menuItems = [
        { path: '/admin', label: t.sideDashboard, icon: LayoutDashboard },
        { path: '/admin/requests', label: t.sideRequests, icon: FileSearch, badge: pendingCount > 0 ? String(pendingCount) : null },
        { path: '/admin/register', label: 'Register Citizen', icon: UserPlus },
        { path: '/admin/register-resident', label: 'Register Resident', icon: Globe },
        { path: '/admin/issue-id', label: 'Issue ID Card', icon: Landmark },
        { path: '/admin/renew-id', label: dir === 'rtl' ? 'تجديد الهوية' : 'Renew Identity', icon: RotateCw },
        { path: '/admin/passports', label: t.sidePassports, icon: Plane },
        { path: '/admin/renew-passport', label: dir === 'rtl' ? 'تجديد الجواز' : 'Renew Passport', icon: RefreshCcw },
        { path: '/admin/search-id', label: dir === 'rtl' ? 'البحث عن الهوية' : 'Search Identity', icon: ScanFace },
        { path: '/admin/search-passport', label: dir === 'rtl' ? 'البحث عن الجواز' : 'Search Passport', icon: BookOpen },
        { path: '/admin/birth-certificates', label: dir === 'rtl' ? 'شهادات الميلاد' : 'Birth Certificate Services', icon: FileText },
        { path: '/admin/print-id', label: dir === 'rtl' ? 'طباعة الهوية' : 'Print National ID', icon: Printer },
        { path: '/admin/print-passport', label: dir === 'rtl' ? 'طباعة الجواز' : 'Print Passport', icon: Printer },
        { path: '/admin/printing-queue', label: 'Printing Queue', icon: Printer },
        { path: '/admin/printing-history', label: 'Printing History', icon: FileText },
        { path: '/admin/revenue', label: dir === 'rtl' ? 'لوحة الإيرادات' : 'Revenue Dashboard', icon: BarChart2 },
        { path: '/admin/logs', label: dir === 'rtl' ? 'سجلات النظام' : 'Activity Logs', icon: ScrollText },
        { path: '/admin/users', label: 'User Management', icon: Users },
        { path: '/admin/email-diagnostics', label: 'Email Diagnostics', icon: Send },
        { path: '/admin/profile', label: t.sideStaffProfile, icon: Briefcase },
    ];

    if (userRole === 'Printing_Officer') {
        menuItems = menuItems.filter(i => ['/admin', '/admin/print-id', '/admin/print-passport', '/admin/printing-queue', '/admin/printing-history', '/admin/profile'].includes(i.path));
    } else if (userRole === 'Immigration_Officer') {
        menuItems = menuItems.filter(i => ['/admin', '/admin/requests', '/admin/passports', '/admin/renew-passport', '/admin/search-passport', '/admin/profile'].includes(i.path));
    } else if (userRole === 'Immigration_Department_Manager') {
        menuItems = menuItems.filter(i => ['/admin', '/admin/requests', '/admin/register', '/admin/register-resident', '/admin/search-id', '/admin/search-passport', '/admin/profile'].includes(i.path));
    }

    const handleLogout = () => navigate('/');
    const isReportsActive = location.pathname.startsWith('/admin/reports');

    return (
        <aside className={`fixed top-0 bottom-0 z-50 w-72 bg-[#020617] text-white border-r border-white/5 transition-transform duration-500 ease-in-out shadow-2xl flex flex-col
      ${dir === 'rtl' ? (isOpen ? 'right-0' : 'translate-x-full') : (isOpen ? 'left-0' : '-translate-x-full')} lg:translate-x-0 
      ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>

            <div className="p-8 border-b border-white/5 relative shrink-0 bg-[#0f172a]/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gold-500 blur-[20px] opacity-20"></div>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png"
                            alt="Somalia Emblem"
                            className="w-14 h-auto relative z-10 drop-shadow-xl"
                        />
                    </div>
                    <div className="text-center">
                        <h2 className="text-[11px] font-black tracking-[0.2em] text-white uppercase">{t.portalName}</h2>
                        <p className="text-[9px] text-gold-400 font-bold tracking-[0.3em] mt-1 opacity-70 uppercase">Administration</p>
                    </div>
                </div>
            </div>

            <nav className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 group border ${isActive
                                ? 'bg-primary-600/90 text-white border-primary-500 shadow-lg'
                                : 'hover:bg-white/5 text-gray-300 border-transparent'
                                }`}
                        >
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-gold-500'} />
                            <span className="text-[13px] font-bold flex-1">{item.label}</span>
                            {item.badge && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isActive ? 'bg-white text-primary-900' : 'bg-red-500 text-white'}`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* ─── Reports Group ───────────────────────────────── */}
                {userRole === 'admin' && (
                    <div>
                        <button
                            onClick={() => setReportsOpen(v => !v)}
                            className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 border ${isReportsActive
                                ? 'bg-primary-600/90 text-white border-primary-500 shadow-lg'
                                : 'hover:bg-white/5 text-gray-300 border-transparent'
                                }`}
                        >
                            <BarChart2 size={18} className={isReportsActive ? 'text-white' : 'text-gold-500'} />
                            <span className="text-[13px] font-bold flex-1 text-left">
                                {dir === 'rtl' ? 'التقارير' : 'Reports'}
                            </span>
                            {reportsOpen
                                ? <ChevronUp size={14} className="text-gray-400" />
                                : <ChevronDown size={14} className="text-gray-400" />
                            }
                        </button>

                        {reportsOpen && (
                            <div className="mt-1 ms-4 ps-4 border-s border-white/10 space-y-1">
                                {reportSubItems.map(sub => {
                                    const isSubActive = location.pathname === sub.path;
                                    return (
                                        <Link
                                            key={sub.path}
                                            to={sub.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 border ${isSubActive
                                                ? 'bg-primary-600/80 text-white border-primary-500'
                                                : 'hover:bg-white/5 text-gray-400 border-transparent hover:text-gray-200'
                                                }`}
                                        >
                                            <sub.icon size={15} className={isSubActive ? 'text-white' : 'text-gold-400/70'} />
                                            <span className="text-[12px] font-bold">{sub.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </nav>

            <div className="p-4 bg-black/20 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-400 font-bold text-[12px] hover:bg-red-500/10 hover:text-red-300 border border-red-500/20 transition-all"
                >
                    <LogOut size={16} />
                    {t.sideLogout}
                </button>
            </div>
        </aside>
    );
};


// --- Sub-component: PhotoCapture ---
const PhotoCapture = ({ photo, setPhoto, label = "Upload or Capture Photo" }) => {
    const [mode, setMode] = useState('upload');
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setMode('camera');
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            alert('Camera access denied or unavailable.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setMode('upload');
    };

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setPhoto(canvas.toDataURL('image/jpeg', 0.8));
            stopCamera();
        }
    };

    return (
        <div className="w-full bg-gray-50/50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[220px]">
            {photo ? (
                <div className="w-full flex flex-col items-center animate-fade-in text-center relative z-10">
                    <img src={photo} alt="Result" className="w-32 h-32 object-cover rounded-xl shadow-lg border border-primary-500 mb-4" />
                    <button type="button" onClick={() => setPhoto('')} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-lg border border-red-200 transition-all">Retake / Remove</button>
                </div>
            ) : mode === 'camera' ? (
                <div className="w-full flex flex-col items-center animate-fade-in relative z-10">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-[200px] aspect-square object-cover rounded-xl shadow-lg mb-4 bg-black border border-gray-300 dark:border-white/20" />
                    <div className="flex gap-2">
                        <button type="button" onClick={capturePhoto} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-md">Capture</button>
                        <button type="button" onClick={stopCamera} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all">Cancel</button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center relative z-10">
                    <label className="flex-1 sm:max-w-[160px] aspect-square flex flex-col items-center justify-center bg-white hover:bg-gray-50 dark:bg-black/20 dark:hover:bg-black/40 rounded-xl cursor-pointer transition-all border border-gray-200 dark:border-white/10 shadow-sm gap-2 group">
                        <input type="file" accept="image/jpeg, image/png, image/jpg" className="hidden" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setPhoto(reader.result);
                                reader.readAsDataURL(file);
                            }
                        }} />
                        <Upload size={24} className="text-primary-500 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-[10px] text-center uppercase tracking-wider text-gray-600 dark:text-gray-300">Upload<br/>File</span>
                    </label>
                    <button type="button" onClick={startCamera} className="flex-1 sm:max-w-[160px] aspect-square flex flex-col items-center justify-center bg-white hover:bg-gray-50 dark:bg-black/20 dark:hover:bg-black/40 rounded-xl cursor-pointer transition-all border border-gray-200 dark:border-white/10 shadow-sm gap-2 group">
                        <Camera size={24} className="text-primary-500 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-[10px] text-center uppercase tracking-wider text-gray-600 dark:text-gray-300">Open<br/>Camera</span>
                    </button>
                </div>
            )}
            {!photo && mode !== 'camera' && (
               <h4 className="absolute top-4 w-full text-center font-bold text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{label}</h4>
            )}
        </div>
    );
};

// --- Sub-component: Requests Approval View ---
const RequestsApproval = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, action: null });

    React.useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/requests');
                const data = await res.json();
                if (data.success) setRequests(data.requests);
            } catch (e) { console.error(e); }
        };
        fetchRequests();
    }, []);

    const handleActionClick = (id, action) => {
        setConfirmModal({ isOpen: true, id, action });
    };

    const confirmAction = async () => {
        const { id, action } = confirmModal;
        if (!id || !action) return;

        try {
            const status = action === 'approve' ? 'approved' : 'rejected';
            const res = await fetch(`http://localhost:5000/api/admin/requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                // Use the actual status returned by backend (replacements become 'printing_queue')
                const actualStatus = data.request?.status || status;
                setRequests(prev => prev.map(r => r.application_id.toString() === id.toString() ? { ...r, status: actualStatus } : r));
                if (data.auto_queued) {
                    alert('✅ ' + (dir === 'rtl' ? 'تمت الموافقة وتم إرسال الطلب تلقائياً إلى طابور الطباعة.' : 'Approved! Request automatically sent to the Printing Queue.'));
                }
            } else {
                alert(dir === 'rtl' ? 'حدث خطأ أثناء معالجة الطلب.' : 'An error occurred while processing the request.');
            }
        } catch (e) {
            console.error(e);
            alert(dir === 'rtl' ? 'فشل الاتصال بالخادم.' : 'Failed to communicate with server.');
        } finally {
            setConfirmModal({ isOpen: false, id: null, action: null });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t.sideRequests}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 uppercase tracking-wider">Queue Management System</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input type="text" placeholder="Search..." className="ltr:pl-9 rtl:pr-9 pr-4 py-2 bg-white dark:bg-primary-900 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-primary-500 w-56 text-gray-900 dark:text-white transition-all" />
                    </div>
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shrink-0 overflow-x-auto">
                        {['all', 'under_review', 'approved', 'printing_queue', 'rejected', 'completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilterStatus(f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === f ? 'bg-white dark:bg-primary-600 text-primary-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}
                            >
                                {f === 'all' ? 'All' : f === 'under_review' ? 'Pending' : f === 'printing_queue' ? 'In Queue' : f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-primary-900/30 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-black/20 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] border-b border-gray-100 dark:border-white/5">
                                <th className="px-6 py-4 text-start">ID</th>
                                <th className="px-4 py-4 text-start">Citizen</th>
                                <th className="px-4 py-4 text-start">Service</th>
                                <th className="px-4 py-4 text-start">Status</th>
                                <th className="px-6 py-4 text-end">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {requests.filter(r => filterStatus === 'all' ? true : r.status === filterStatus).map((req) => {
                                const reqName = req.citizen?.full_name || req.resident?.full_name || 'Unknown';
                                const isRenewal = req.service_type === 'PASSPORT_RENEWAL' || req.service_type === 'ID_RENEWAL';
                                const isPassportService = req.service_type?.includes('PASSPORT');
                                return (
                                <tr key={req.application_id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                    <td className="px-6 py-3.5">
                                        <span className="font-mono font-bold text-primary-900 dark:text-gold-500 text-[11px] bg-primary-50 dark:bg-gold-500/10 px-2 py-0.5 rounded-md border border-primary-100 dark:border-gold-500/20">{req.application_id}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center font-black text-[10px] text-gray-600 dark:text-white border border-gray-200 dark:border-white/10 uppercase">
                                                {reqName.substring(0, 2)}
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white text-xs whitespace-nowrap">{reqName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md border border-gray-200 dark:border-white/10 lowercase">{req.service_type.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border ${
                                            req.status === 'under_review' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' :
                                            req.status === 'approved' ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' :
                                            req.status === 'printing_queue' ? 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400' :
                                            req.status === 'printed' ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400' :
                                            req.status === 'completed' ? 'bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400' :
                                            'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                req.status === 'under_review' ? 'bg-blue-500 animate-pulse' :
                                                req.status === 'printing_queue' ? 'bg-purple-500 animate-pulse' :
                                                req.status === 'printed' ? 'bg-indigo-500' :
                                                req.status === 'completed' ? 'bg-teal-500' :
                                                req.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                                            }`}></div>
                                            <span className="text-[9px] font-black uppercase">{req.status.replace(/_/g, ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            {req.status === 'under_review' ? (
                                                <>
                                                    <button onClick={() => handleActionClick(req.application_id, 'approve')} className="w-8 h-8 bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-600 hover:text-white rounded-lg flex items-center justify-center transition-all border border-green-200 dark:border-green-500/20"><Check size={16} /></button>
                                                    <button onClick={() => handleActionClick(req.application_id, 'reject')} className="w-8 h-8 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center transition-all border border-red-200 dark:border-red-500/20"><X size={16} /></button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        {req.status === 'approved' ? 'Approved' :
                                                         req.status === 'printing_queue' ? '🖨️ In Queue' :
                                                         req.status === 'printed' ? 'Printed' :
                                                         req.status === 'completed' ? 'Finalized' : 'Rejected'}
                                                    </span>
                                                    {/* Proceed button: only for RENEWAL types awaiting processing */}
                                                    {req.status === 'approved' && isRenewal && (
                                                        <button
                                                            onClick={() => {
                                                                const refNum = req.citizen?.national_number || req.resident?.residence_number || '';
                                                                const path = isPassportService ? '/admin/renew-passport' : '/admin/renew-id';
                                                                navigate(`${path}?appId=${req.application_id}&ref=${refNum}`);
                                                            }}
                                                            className="px-2 py-1 bg-primary-600 text-white rounded text-[9px] font-black uppercase flex items-center gap-1 hover:bg-primary-700 transition-all"
                                                        >
                                                            Proceed <ChevronRight size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-primary-900 p-8 rounded-[2rem] shadow-premium max-w-sm w-full border border-gray-200 dark:border-white/10 animate-fade-in-up text-center">
                        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg ${confirmModal.action === 'approve' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30'}`}>
                            {confirmModal.action === 'approve' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                            {dir === 'rtl' ? 'تأكيد العملية' : 'Confirm Action'}
                        </h3>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8">
                            {confirmModal.action === 'approve'
                                ? (dir === 'rtl' ? 'هل أنت متأكد من قبول هذا الطلب؟' : 'Are you sure you want to approve this request?')
                                : (dir === 'rtl' ? 'هل أنت متأكد من رفض هذا الطلب؟' : 'Are you sure you want to reject this request?')}
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmModal({ isOpen: false, id: null, action: null })} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-transparent dark:border-white/5">
                                {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button onClick={confirmAction} className={`flex-1 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md text-white ${confirmModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                {dir === 'rtl' ? 'تأكيد' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-component: Dashboard Overview ---
const DashboardOverview = () => {
    const { dir } = useLanguage();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trendPeriod, setTrendPeriod] = useState('daily');

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/dashboard-stats');
            const data = await res.json();
            if (data.success) setStats(data.stats);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchStats();
        const iv = setInterval(fetchStats, 60000);
        return () => clearInterval(iv);
    }, []);

    const fmt = (n) => {
        if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
        return `$${n.toFixed(2)}`;
    };

    const serviceLabels = {
        NATIONAL_ID: dir === 'rtl' ? 'هوية جديدة' : 'New ID',
        RENEWAL: dir === 'rtl' ? 'تجديد' : 'Renewal',
        ID_REPLACEMENT: dir === 'rtl' ? 'بدل هوية' : 'ID Replacement',
        PASSPORT: dir === 'rtl' ? 'جواز جديد' : 'New Passport',
        PASSPORT_RENEWAL: dir === 'rtl' ? 'تجديد جواز' : 'Passport Renewal',
        PASSPORT_REPLACEMENT: dir === 'rtl' ? 'بدل جواز' : 'Passport Replacement',
    };

    const statusColors = {
        pending: '#f59e0b',
        approved: '#10b981',
        rejected: '#ef4444',
        completed: '#3b82f6',
        printing_queue: '#8b5cf6',
    };

    const statusLabels = {
        pending: dir === 'rtl' ? 'انتظار' : 'Pending',
        approved: dir === 'rtl' ? 'موافق' : 'Approved',
        rejected: dir === 'rtl' ? 'مرفوض' : 'Rejected',
        completed: dir === 'rtl' ? 'مكتمل' : 'Completed',
        printing_queue: dir === 'rtl' ? 'طباعة' : 'Printing',
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-primary-900 p-6 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-white/5 rounded-xl mb-6" />
                            <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-3/4 mb-3" />
                            <div className="h-8 bg-gray-200 dark:bg-white/5 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const totalReqs = stats?.totalRequests || 0;
    const pending = stats?.pendingRequests || 0;
    const todayApp = stats?.todayApprovals || 0;
    const revenue = stats?.totalRevenue || 0;

    const statCards = [
        {
            label: dir === 'rtl' ? 'إجمالي الطلبات' : 'Total Requests',
            val: totalReqs.toLocaleString(),
            icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10',
            subtext: dir === 'rtl' ? 'هوية + جواز + تجديد + بدل' : 'ID + Passport + Renewal + Lost'
        },
        {
            label: dir === 'rtl' ? 'قيد التحقق' : 'Pending Verification',
            val: pending.toLocaleString(),
            icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10',
            subtext: dir === 'rtl' ? 'تنتظر المراجعة' : 'Awaiting review'
        },
        {
            label: dir === 'rtl' ? 'موافقات اليوم' : 'Today Approvals',
            val: todayApp.toLocaleString(),
            icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10',
            subtext: dir === 'rtl' ? 'تمت المعالجة اليوم' : 'Processed today'
        },
        {
            label: dir === 'rtl' ? 'إيرادات الحكومة' : 'Gov Revenue',
            val: fmt(revenue),
            icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10',
            subtext: dir === 'rtl' ? 'من المعاملات المكتملة' : 'From completed transactions'
        },
    ];

    // Trend chart data
    const trend = stats?.dailyTrend || [];
    const maxTrend = Math.max(...trend.map(d => d.submitted), 1);

    // Status donut chart
    const statusDist = stats?.statusDistribution || [];
    const totalStatus = statusDist.reduce((acc, s) => acc + s.count, 0) || 1;
    let cumulative = 0;
    const donutSegments = statusDist.map(s => {
        const pct = (s.count / totalStatus) * 100;
        const seg = { ...s, pct, offset: cumulative, color: statusColors[s.status] || '#94a3b8' };
        cumulative += pct;
        return seg;
    });

    // Service usage
    const svcUsage = stats?.serviceUsage || [];
    const maxSvc = Math.max(...svcUsage.map(s => s.count), 1);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-primary-900 p-6 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 group relative overflow-hidden hover:border-primary-200 dark:hover:border-white/10 transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 dark:to-white/[0.02] pointer-events-none" />
                        <div className="flex justify-between items-start mb-5 relative">
                            <div className={`w-11 h-11 ${s.bg} ${s.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                <s.icon size={22} />
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1 relative">{s.label}</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight relative">{s.val}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold relative">{s.subtext}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row 1: Trend + Status */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* 7-Day Trend Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-md">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                                    {dir === 'rtl' ? 'اتجاه الطلبات (آخر 7 أيام)' : 'Request Trend (Last 7 Days)'}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                    {dir === 'rtl' ? 'مقدمة • موافقة • مرفوضة' : 'Submitted • Approved • Rejected'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1.5">
                            {[
                                { key: 'submitted', color: 'bg-primary-500' },
                                { key: 'approved', color: 'bg-green-500' },
                                { key: 'rejected', color: 'bg-red-400' },
                            ].map(l => (
                                <div key={l.key} className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${l.color}`} />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{l.key.slice(0, 3)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-6">
                        {trend.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-gray-400 text-sm font-bold">
                                {dir === 'rtl' ? 'لا توجد بيانات' : 'No data available'}
                            </div>
                        ) : (
                            <div className="flex items-end gap-2 h-48 w-full">
                                {trend.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                                        <div className="w-full flex flex-col-reverse gap-0.5 items-center" style={{ height: '160px' }}>
                                            {/* Submitted bar */}
                                            <div
                                                title={`Submitted: ${day.submitted}`}
                                                className="w-full bg-primary-500/80 hover:bg-primary-500 rounded-sm transition-all cursor-pointer relative"
                                                style={{ height: `${(day.submitted / maxTrend) * 140}px`, minHeight: day.submitted > 0 ? '4px' : '0' }}
                                            />
                                        </div>
                                        {/* Approved dot */}
                                        <div className="flex gap-1 mt-1">
                                            {day.approved > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-500" title={`Approved: ${day.approved}`} />}
                                            {day.rejected > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-400" title={`Rejected: ${day.rejected}`} />}
                                        </div>
                                        <span className="text-[8px] text-gray-400 font-bold">{day.date.slice(5)}</span>
                                        <span className="text-[9px] font-black text-gray-600 dark:text-gray-300">{day.submitted}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Donut */}
                <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                                    {dir === 'rtl' ? 'توزيع الحالات' : 'Status Distribution'}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                    {dir === 'rtl' ? 'النسب المئوية' : 'Percentages & Totals'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {statusDist.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-gray-400 text-sm font-bold">
                                {dir === 'rtl' ? 'لا توجد بيانات' : 'No data yet'}
                            </div>
                        ) : (
                            <>
                                {/* SVG Donut */}
                                <div className="flex justify-center mb-4">
                                    <svg viewBox="0 0 120 120" className="w-32 h-32">
                                        {donutSegments.map((seg, i) => {
                                            const r = 45;
                                            const circ = 2 * Math.PI * r;
                                            const strokeDash = (seg.pct / 100) * circ;
                                            const strokeOffset = circ - (seg.offset / 100) * circ;
                                            return (
                                                <circle key={i}
                                                    cx="60" cy="60" r={r}
                                                    fill="none"
                                                    stroke={seg.color}
                                                    strokeWidth="18"
                                                    strokeDasharray={`${strokeDash} ${circ - strokeDash}`}
                                                    strokeDashoffset={strokeOffset}
                                                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                                />
                                            );
                                        })}
                                        <text x="60" y="64" textAnchor="middle" className="text-xs font-black" fontSize="14" fontWeight="900" fill="currentColor" style={{ fill: '#6b7280' }}>
                                            {totalStatus}
                                        </text>
                                    </svg>
                                </div>
                                <div className="space-y-2">
                                    {donutSegments.map((seg, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: seg.color }} />
                                                <span className="font-bold text-gray-600 dark:text-gray-300">{statusLabels[seg.status] || seg.status}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-gray-900 dark:text-white">{seg.count}</span>
                                                <span className="text-gray-400 text-[10px]">{seg.pct.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Service Usage + Revenue Breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Service Usage */}
                <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-md">
                            <BarChart2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                                {dir === 'rtl' ? 'إحصاءات استخدام الخدمات' : 'Service Usage Analytics'}
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                {dir === 'rtl' ? 'الأكثر استخداماً' : 'Most Used Services'}
                            </p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        {svcUsage.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm font-bold py-8">
                                {dir === 'rtl' ? 'لا توجد بيانات' : 'No data yet'}
                            </p>
                        ) : svcUsage.map((svc, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                                        {serviceLabels[svc.service_type] || svc.service_type}
                                    </span>
                                    <span className="text-xs font-black text-gray-900 dark:text-white">{svc.count}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-700"
                                        style={{ width: `${(svc.count / maxSvc) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-md">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                                {dir === 'rtl' ? 'ملخص الإيرادات' : 'Revenue Summary'}
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                {dir === 'rtl' ? 'من المعاملات المكتملة' : 'From completed transactions'}
                            </p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                {dir === 'rtl' ? 'الإجمالي الكلي' : 'Grand Total'}
                            </p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white">{fmt(revenue)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: dir === 'rtl' ? 'هوية وطنية' : 'National ID', color: 'bg-blue-500', subLabel: dir === 'rtl' ? 'جديدة + تجديد + بدل' : 'New + Renewal + Lost' },
                                { label: dir === 'rtl' ? 'جواز سفر' : 'Passport', color: 'bg-purple-500', subLabel: dir === 'rtl' ? 'جديد + تجديد + بدل' : 'New + Renewal + Lost' },
                                { label: dir === 'rtl' ? 'تجديدات' : 'Renewals', color: 'bg-teal-500', subLabel: dir === 'rtl' ? 'هوية + جواز' : 'ID + Passport' },
                                { label: dir === 'rtl' ? 'استبدالات' : 'Replacements', color: 'bg-amber-500', subLabel: dir === 'rtl' ? 'بدل فاقد' : 'Lost/Damaged' },
                            ].map((item, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                    <div className={`w-6 h-1 rounded-full ${item.color} mb-2`} />
                                    <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase">{item.label}</p>
                                    <p className="text-[9px] text-gray-400 font-bold mt-0.5">{item.subLabel}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 text-center">
                            <p className="text-[10px] text-gray-400 font-bold">
                                {dir === 'rtl' ? 'يتم التحديث تلقائياً كل دقيقة' : 'Auto-refreshes every 60 seconds'}
                                {' '}• <span className="text-green-500">●</span>{' '}
                                {dir === 'rtl' ? 'بيانات حية' : 'Live Data'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Sub-component: Passport Issuance ---
const PassportIssuance = () => {
    const { t, dir } = useLanguage();
    const [step, setStep] = useState(1);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [passportType, setPassportType] = useState('P-Ordinary (Blue)');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);
    const [personalPhoto, setPersonalPhoto] = useState('');
    const [fetchedCitizen, setFetchedCitizen] = useState(null);

    const [searchParams] = useSearchParams();
    const isRenewal = location.pathname.includes('renew');
    
    React.useEffect(() => {
        if (searchParams.get('ref')) {
            setReferenceNumber(searchParams.get('ref'));
        }
    }, [searchParams]);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiEndpoint = isRenewal ? 'http://localhost:5000/api/admin/renew-passport' : 'http://localhost:5000/api/admin/issue-passport';
            
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    referenceNumber, 
                    passportType: passportType.charAt(0) === 'P' ? 'regular' : 'diplomatic',
                    applicationId: searchParams.get('appId'),
                    personal_photo: personalPhoto
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData({
                    passport: data.passport,
                    person: data.person,
                    idCard: data.idCard,
                    message: data.message
                });
                setStep(4); // success step
            } else {
                setError(data.message || 'Error processing passport.');
            }
        } catch (err) {
            setError('Server connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            setLoading(true);
            setError(null);
            try {
                const searchRes = await fetch(`http://localhost:5000/api/admin/search-id?query=${encodeURIComponent(referenceNumber)}`);
                const data = await searchRes.json();
                const matchedCitizen = data.results?.find(r => r.type === 'citizen' && r.id_number === referenceNumber);
                if (!matchedCitizen) {
                    setError('Citizen not found or National ID is invalid. Passports can only be issued to valid Citizens.');
                    return;
                }
                setFetchedCitizen(matchedCitizen);
                setStep(2);
            } catch(e) {
                setError('Failed to retrieve citizen database details.');
            } finally {
                setLoading(false);
            }
        }
        else if (step === 3) {
            handleSubmit();
        } else {
            setStep(step + 1);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg border border-primary-400">
                            <Plane size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{isRenewal ? (dir === 'rtl' ? 'تجديد الجواز' : 'Renew Passport') : t.issuePassport}</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gold-400 font-black uppercase tracking-[0.2em] mt-2">Issuance Protocol 5.2</p>
                        </div>
                    </div>
                    {step < 4 && (
                        <div className="flex gap-2">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all border ${step >= s ? 'bg-primary-600 text-white border-primary-500' : 'bg-gray-100 text-gray-400 border-transparent'}`}>
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative z-10 min-h-[300px]">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3 mb-6">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <div className="w-1 h-6 bg-gold-500 rounded-full"></div>
                                Verify Citizen Identity Data
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Full Legal Name</label>
                                    <input type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white" placeholder="Leave blank if unknown" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">National ID Reference *</label>
                                    <input required value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} type="text" className="w-full bg-white dark:bg-black/20 border-2 border-primary-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none font-mono text-gray-900 dark:text-white" placeholder="e.g. 12345678901" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Passport Modality</label>
                                    <select value={passportType} onChange={(e) => setPassportType(e.target.value)} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white">
                                        <option>P-Ordinary (Blue)</option>
                                        <option>D-Diplomatic (Red)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in py-6">
                            <h3 className="text-base font-black text-gray-900 dark:text-white mb-6">Biometric Data Capture</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Personal Photo</label>
                                    <PhotoCapture photo={personalPhoto} setPhoto={setPersonalPhoto} label="Upload or Capture Passport Photo" />
                                </div>
                                <div className="p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl group hover:border-primary-500 transition-all cursor-pointer bg-gray-50/50 dark:bg-white/5 flex flex-col items-center justify-center">
                                    <Fingerprint size={32} className="text-primary-600 dark:text-gold-400 mx-auto mb-4" />
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tighter">10-Fingerprint Sync</h4>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-fade-in text-center py-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Review & Confirm Request</h3>
                            <div className="text-left space-y-4 max-w-lg mx-auto">
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reference Number / Type</p>
                                    <p className="text-lg font-black font-mono text-gray-900 dark:text-white">{referenceNumber} - {passportType}</p>
                                </div>
                                {fetchedCitizen && (
                                    <>
                                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{fetchedCitizen.full_name}</span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DOB / Gender</span>
                                            <span className="text-sm font-black font-mono text-gray-900 dark:text-white">{new Date(fetchedCitizen.dob).toISOString().split('T')[0]} - {fetchedCitizen.gender.toUpperCase()}</span>
                                        </div>
                                    </>
                                )}
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Photo</p>
                                    {personalPhoto ? (
                                        <img src={personalPhoto} className="w-32 h-32 object-cover rounded-xl" alt="Preview" />
                                    ) : (
                                        <p className="text-sm font-bold text-gray-500">No new photo uploaded</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && loading && (
                        <div className="space-y-8 animate-fade-in text-center py-12">
                            <div className="w-24 h-24 mx-auto border-[6px] border-primary-50 dark:border-white/5 border-t-primary-600 dark:border-t-gold-500 rounded-full animate-spin"></div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-6">Processing Issuance...</h3>
                            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Communicating with the Command Center</p>
                        </div>
                    )}

                    {step === 4 && successData && (
                        <div className="animate-fade-in space-y-8 bg-gray-50/50 dark:bg-black/20 p-8 rounded-3xl border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/5 pb-4">Preview</h3>
                            
                            <div className="space-y-4">
                                <h4 className="font-black text-gray-800 dark:text-gray-200 text-sm">Passport:</h4>
                                <div className="flex justify-center">
                                    {/* Passport Graphical Representation */}
                                    <div className="w-[800px] h-auto min-h-[540px] bg-white border-x-4 border-slate-300 shadow-xl overflow-hidden relative flex flex-col font-sans mb-4" style={{ backgroundImage: 'radial-gradient(circle at center, #fdfdfd 0%, #f0ebd8 100%)' }}>
                                        {/* Watermarks */}
                                        <div className="absolute inset-0 opacity-10 flex items-center justify-center -z-1 pointer-events-none">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/400px-Coat_of_arms_of_Somalia.svg.png" className="w-[300px] h-auto opacity-40 mix-blend-multiply" alt="Watermark" />
                                        </div>
                                        
                                        {/* Header area */}
                                        <div className="flex justify-between items-center px-8 pt-6 pb-2 border-b border-gray-300/60 shrink-0">
                                            <div className="text-center w-64">
                                                <h2 className="text-lg font-black tracking-widest text-[#1e3a8a] whitespace-nowrap">JAMHUURIYADDA SOOMAALIYA</h2>
                                                <div className="flex items-center justify-between text-[#1e3a8a] font-black text-sm mt-1">
                                                    <span>BAASABOOR</span>
                                                    <span className="font-normal mx-2 text-gray-500">|</span>
                                                    <span dir="rtl" className="text-base leading-none">جواز سفر</span>
                                                    <span className="font-normal mx-2 text-gray-500">|</span>
                                                    <span>PASSPORT</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mx-4 mt-2">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png" className="w-16 h-auto drop-shadow-md" alt="Somalia" />
                                            </div>
                                            
                                            <div className="text-center w-64">
                                                <h2 dir="rtl" className="text-2xl font-black text-[#1e3a8a] mb-2 leading-none">جمهورية الصومال</h2>
                                                <h2 className="text-lg font-black tracking-widest text-[#1e3a8a] whitespace-nowrap">SOMALI REPUBLIC</h2>
                                            </div>
                                        </div>

                                        {/* Content area */}
                                        <div className="flex flex-1 px-8 py-4 gap-8">
                                            {/* Photo column */}
                                            <div className="w-[180px] shrink-0">
                                                <div className="w-full h-[240px] bg-white border border-gray-300 p-1 shadow-sm mb-4">
                                                    <img src={successData.person.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover" alt="Holder" />
                                                </div>
                                            </div>
                                            
                                            {/* Data grid */}
                                            <div className="flex-1 text-[#1e3a8a]">
                                                {/* Top row */}
                                                <div className="flex gap-4 mb-2 pb-2">
                                                    <div className="w-1/4">
                                                        <p className="text-[10px] font-bold text-gray-600">Type / <span dir="rtl">النوع</span></p>
                                                        <p className="text-lg font-bold font-mono text-black">{successData.passport.type === 'regular' ? 'P' : 'D'}</p>
                                                    </div>
                                                    <div className="w-1/4">
                                                        <p className="text-[10px] font-bold text-gray-600">Country code / <span dir="rtl">رمز البلد</span></p>
                                                        <p className="text-lg font-bold font-mono text-black">SOM</p>
                                                    </div>
                                                    <div className="flex-1 mt-1 text-right border-l-2 border-gray-300 pl-4">
                                                        <p className="text-[10px] font-bold text-gray-600">Passport No / <span dir="rtl">رقم الجواز</span></p>
                                                        <p className="text-2xl font-black font-mono tracking-widest text-black">{successData.passport.passport_number}</p>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="space-y-3 mt-4">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-600">Magaca / <span dir="rtl">الاسم</span> / Name</p>
                                                        <p className="text-lg font-black uppercase text-black">{successData.person.full_name}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-600">Magaca Hooyada / <span dir="rtl">اسم الأم</span> / Mother's Name</p>
                                                        <p className="text-lg font-black uppercase text-black">SADIA OSMAN MAANI</p>
                                                    </div>

                                                    <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                        <div className="w-1/2">
                                                            <p className="text-[10px] font-bold text-gray-600">Jinsiyadda / <span dir="rtl">الجنسية</span> / Nationality</p>
                                                            <p className="text-sm font-black uppercase text-black">{successData.person.nationality || 'SOMALI'}</p>
                                                        </div>
                                                        <div className="w-1/2">
                                                            <p className="text-[10px] font-bold text-gray-600">Shaqada / <span dir="rtl">المهنة</span> / Occupation</p>
                                                            <p className="text-sm font-black uppercase text-black"></p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                        <div className="w-1/3">
                                                            <p className="text-[10px] font-bold text-gray-600 leading-tight">Taariikhda Dhalashada / <span dir="rtl">تاريخ الميلاد</span><br/>Date of Birth</p>
                                                            <p className="text-base font-black font-mono text-black mt-1">{new Date(successData.person.dob).toISOString().split('T')[0]}</p>
                                                        </div>
                                                        <div className="w-1/3 text-center">
                                                            <p className="text-[10px] font-bold text-gray-600 leading-tight">Jinsiga / <span dir="rtl">الجنس</span><br/>Gender</p>
                                                            <p className="text-base font-black font-mono text-black mt-1">{successData.person.gender.charAt(0).toUpperCase()}</p>
                                                        </div>
                                                        <div className="w-1/3 text-right">
                                                            <p className="text-[10px] font-bold text-gray-600 leading-tight">Meesha Dhalashada / <span dir="rtl">مكان الميلاد</span><br/>Place of Birth</p>
                                                            <p className="text-sm font-black uppercase text-black mt-1">SOMALIA</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                        <div className="w-1/3">
                                                            <p className="text-[10px] font-bold text-gray-600 leading-tight">Taariikhda la bixiyay / <span dir="rtl">تاريخ الإصدار</span><br/>Date of Issue</p>
                                                            <p className="text-base font-black font-mono text-black mt-1">{new Date(successData.passport.issue_date).toISOString().split('T')[0]}</p>
                                                        </div>
                                                        <div className="w-1/3 text-center">
                                                            <p className="text-[10px] font-bold text-gray-600 leading-tight">Hey'adda bixisay / <span dir="rtl">جهة الإصدار</span><br/>Issuing Authority</p>
                                                            <p className="text-sm font-black uppercase text-black mt-1">Immigration HQ</p>
                                                        </div>
                                                        <div className="w-1/3 text-right">
                                                            <p className="text-[10px] font-bold text-gray-600 leading-tight">Meesha bixinta / <span dir="rtl">مكان الإصدار</span><br/>Place of Issue</p>
                                                            <p className="text-sm font-black uppercase text-black mt-1">MOGADISHU</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                        <div className="w-1/3">
                                                            <p className="text-[10px] font-bold text-gray-600 leading-tight">Taariikhda dhicitaanka / <span dir="rtl">تاريخ الانتهاء</span><br/>Date of expiry</p>
                                                            <p className="text-base font-black font-mono text-black mt-1">{new Date(successData.passport.expiry_date).toISOString().split('T')[0]}</p>
                                                        </div>
                                                        <div className="w-2/3 text-right pt-2 border-t-0">
                                                            <p className="text-[10px] font-bold text-gray-600 border-t border-gray-400 inline-block pt-1 ml-auto relative">
                                                                <span className="absolute bottom-4 right-0 font-['Brush_Script_MT',cursive] text-2xl opacity-80 text-black -rotate-6 whitespace-nowrap">Holder's Signature</span>
                                                                Saxiixa qofka leh / <span dir="rtl">توقيع حامل الجواز</span> / Holder's Signature
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* MRZ Area at Bottom */}
                                        <div className="mt-auto h-16 bg-white shrink-0 px-6 py-2 border-t font-['OCR_A_Std','Courier_New',monospace] text-black font-black tracking-[0.2em] text-[15px] flex flex-col justify-center leading-tight z-10">
                                            <p>P&lt;SOM{successData.person.full_name.split(' ')[0].toUpperCase()}&lt;&lt;{successData.person.full_name.split(' ').slice(1).join('<').toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                                            <p>{successData.passport.passport_number}&lt;3SOM{new Date(successData.person.dob).toISOString().split('T')[0].replace(/-/g, '').slice(2)}M{new Date(successData.passport.expiry_date).toISOString().split('T')[0].replace(/-/g, '').slice(2)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {successData.idCard && (
                                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-white/10">
                                    <h4 className="font-black text-gray-800 dark:text-gray-200 text-sm">Identity Card:</h4>
                                    <div className="flex justify-center">
                                        {/* Identity Card Graphical Representation matching user mockup */}
                                        <div dir="ltr" className="relative w-[520px] h-[330px] rounded-xl overflow-hidden shadow-2xl border border-white/40 font-sans text-left" style={{ background: 'repeating-linear-gradient(45deg, #eef7ee, #eef7ee 10px, #e2f0e2 10px, #e2f0e2 20px)' }}>
                                            {/* Somalia overlay map watermark in green */}
                                            <div className="absolute inset-0 opacity-40 flex items-center justify-center">
                                                <svg className="w-full h-full text-green-300" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                    <path fill="currentColor" d="M30,10 Q50,0 70,20 Q90,40 80,70 Q60,100 30,90 Q0,70 10,40 Z"></path>
                                                </svg>
                                            </div>

                                            <div className="absolute inset-0 p-5 flex flex-col z-10 text-slate-900 border-x-[15px] border-t-[10px] border-b-[20px] border-green-200/50" style={{ borderImage: 'repeating-linear-gradient(90deg, #6ee7b7, #10b981 10px, #ffffff 10px, #ffffff 20px) 20' }}>
                                                {/* Header */}
                                                <div className="text-center w-full mt-2">
                                                    <h3 className="text-[12px] font-black text-green-800 leading-tight uppercase tracking-widest">Jamhuuriyadda Soomaaliya</h3>
                                                    <h3 className="text-[16px] font-black text-green-900 leading-tight my-0.5" dir="rtl">جمهورية الصومال</h3>
                                                    <h3 className="text-[12px] font-black text-green-800 leading-tight uppercase tracking-widest">Somali Republic</h3>
                                                    <h4 className="text-[8px] font-black text-slate-800 leading-tight mt-1 uppercase tracking-widest">Warqadda Aqoonsiga</h4>
                                                    <h4 className="text-[10px] font-black text-slate-900 leading-tight"><span dir="rtl">البطاقة الشخصية</span></h4>
                                                    <h4 className="text-[10px] font-black text-slate-900 leading-tight mt-0.5 uppercase tracking-[0.2em]">Identity Card</h4>
                                                </div>

                                                {/* Body  */}
                                                <div className="flex gap-4 flex-1 flex-row mt-4 px-2">
                                                    {/* Chip and Details */}
                                                    <div className="flex-1 space-y-3 relative z-10">
                                                        {/* Smart Chip Image */}
                                                        <div className="w-16 h-12 bg-yellow-600 rounded-md border-2 border-yellow-700 shadow-sm relative overflow-hidden mb-6 mt-2 ml-2 opacity-90 mix-blend-multiply">
                                                            <div className="absolute inset-x-0 h-px bg-yellow-800 top-1/2"></div>
                                                            <div className="absolute inset-y-0 w-px bg-yellow-800 left-1/3"></div>
                                                            <div className="absolute inset-y-0 w-px bg-yellow-800 right-1/3"></div>
                                                            <div className="absolute w-6 h-6 border border-yellow-800 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                                        </div>

                                                        <div>
                                                            <p className="text-[11px] font-black text-green-950 leading-none">Magaca / <span dir="rtl">الاسم</span> / Name</p>
                                                            <p className="text-[14px] font-black text-slate-900 uppercase mt-0.5">{successData.person.full_name}</p>
                                                        </div>
                                                        
                                                        <div className="flex justify-between w-[120%]">
                                                            <div>
                                                                <p className="text-[11px] font-black text-green-950 leading-none">Taariikhda dhalashada / <span dir="rtl">تاريخ الميلاد</span> / Date of Birth</p>
                                                                <p className="text-[14px] font-black text-slate-900 mt-0.5 text-center">{new Date(successData.person.dob).toISOString().split('T')[0]}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between w-[120%]">
                                                            <div>
                                                                <p className="text-[11px] font-black text-green-950 leading-none">Meesha dhalashada / <span dir="rtl">مكان الميلاد</span> / Place of Birth</p>
                                                                <p className="text-[14px] font-black text-slate-900 mt-0.5 uppercase">Somalia</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between w-[120%] pb-2">
                                                            <div>
                                                                <p className="text-[11px] font-black text-green-950 leading-none">Taariikhda la bixiyay / <span dir="rtl">تاريخ الإصدار</span> / Date of Issue</p>
                                                                <p className="text-[14px] font-black text-slate-900 mt-0.5 text-center">{new Date(successData.idCard.issue_date).toISOString().split('T')[0]}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Profile Picture & Gender */}
                                                    <div className="w-[140px] flex flex-col items-center pt-2 relative z-20">
                                                        <div className="w-[120px] h-[155px] bg-white border-2 border-slate-300 shadow-sm overflow-hidden rounded-sm mb-2">
                                                            <img src={successData.person.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover" alt="Profile" />
                                                        </div>
                                                        <div className="text-center w-full bg-white/40 p-1 rounded backdrop-blur-sm">
                                                            <p className="text-[11px] font-black text-green-950 leading-none">Lab/Dheddig / <span dir="rtl">الجنس</span> / Gender</p>
                                                            <p className="text-[14px] font-black text-green-900 mt-0.5">{successData.person.gender.charAt(0).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Top-level Glossy Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-white/10 z-30 pointer-events-none mix-blend-overlay"></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center pt-8">
                                <button onClick={() => { setStep(1); setReferenceNumber(''); setSuccessData(null); }} className="bg-primary-900 dark:bg-gold-500 text-white dark:text-primary-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg">
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {step < 4 && (
                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                        <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || loading} className="px-6 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white rounded-xl font-black text-xs disabled:opacity-20 flex items-center gap-2 transition-all">Back</button>
                        <button onClick={handleNext} disabled={loading || (step === 1 && !referenceNumber)} className="bg-primary-900 dark:bg-gold-500 text-white dark:text-primary-950 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center gap-2">
                            {loading ? 'Processing...' : step === 3 ? t.sendToSupervisor : 'Continue'}
                            <Send size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-component: Citizen Registration ---
const CitizenRegistration = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: 'male',
        phone: '',
        email: '',
        address: '',
        maritalStatus: 'single',
        personal_photo: ''
    });
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);

    const [step, setStep] = useState(1);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log('[Dev Debug] Citizen Registration review page loaded');
        setStep(2);
    };

    const confirmSubmit = async () => {
        console.log('[Dev Debug] Citizen Registration Confirm button clicked');
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            console.log('[Dev Debug] Sending API request to /api/admin/register-citizen', formData);
            const response = await fetch('http://localhost:5000/api/admin/register-citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('[Dev Debug] API response received for Citizen Registration:', data);

            if (data.success) {
                console.log('[Dev Debug] Database insert success: Citizen saved.', data.citizen);
                setSuccessData(data.citizen);
                // clear form
                setFormData({
                    fullName: '', dob: '', gender: 'male', phone: '', email: '', address: '', maritalStatus: 'single', personal_photo: ''
                });
                setStep(1);
            } else {
                console.error('[Dev Debug] Database insert failure / Validation error:', data.message);
                setError(data.message || 'Error saving citizen.');
            }
        } catch (err) {
            console.error('[Dev Debug] Client network error or server unavailable:', err);
            setError('Server connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg border border-green-400">
                            <UserPlus size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Citizen Registration Hub</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gold-400 font-black uppercase tracking-[0.2em] mt-2">New Identity Enrollment</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {successData ? (
                        <div className="animate-fade-in text-center space-y-6">
                            <div className="bg-green-50 dark:bg-green-500/10 p-10 rounded-2xl border border-green-200 dark:border-green-500/20 max-w-lg mx-auto">
                                <ShieldCheck size={48} className="text-green-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-green-900 dark:text-green-400 mb-2">Registration Successful!</h3>
                                <p className="text-sm font-bold text-green-800 dark:text-gray-300 mb-6">
                                    The new citizen has been enrolled and an 11-digit National ID has been automatically generated.
                                </p>
                                <div className="bg-white dark:bg-black/30 p-6 rounded-xl space-y-4 shadow-sm border border-green-100 dark:border-green-500/10 ltr:text-left rtl:text-right">
                                    <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">National ID (11 Digits):</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-gold-400 font-mono tracking-widest">{successData.national_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Account Setup:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">Credentials will be generated upon ID Card Issuance</span>
                                    </div>
                                </div>
                                <button onClick={() => setSuccessData(null)} className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md">
                                    Register Another
                                </button>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-8 animate-fade-in max-w-lg mx-auto bg-gray-50/50 dark:bg-white/5 p-8 rounded-2xl border border-gray-200 dark:border-white/5">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 text-center">Review Citizen Details</h3>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{formData.fullName}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date of Birth</span>
                                    <span className="text-sm font-black font-mono text-gray-900 dark:text-white">{formData.dob}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gender</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white capitalize">{formData.gender}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Marital Status</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white capitalize">{formData.maritalStatus}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{formData.email || 'N/A'}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact Info</span>
                                    <span className="text-sm font-black font-mono text-gray-900 dark:text-white">{formData.phone}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between flex-col md:flex-row md:items-center">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Address</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{formData.address || 'N/A'}</span>
                                </div>

                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setStep(1)} type="button" className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all">Edit Details</button>
                                <button onClick={confirmSubmit} disabled={loading} type="button" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all">{loading ? 'Processing...' : 'Confirm'}</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-8 animate-fade-in">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
                                <div className="w-1 h-5 bg-primary-500 rounded-full"></div>
                                Personal Demographics
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Full Name *</label>
                                    <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="e.g. Ali Ahmed Yare" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Date of Birth *</label>
                                    <input required name="dob" value={formData.dob} onChange={handleChange} type="date" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Gender *</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Marital Status *</label>
                                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors">
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">Divorced</option>
                                        <option value="widowed">Widowed</option>
                                    </select>
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3 pt-6">
                                <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
                                Contact Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Phone Number *</label>
                                    <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="+252 61 0000000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                                    <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="optional@example.com" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Physical Address *</label>
                                    <input required name="address" value={formData.address} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="e.g. Maka Al Mukarama St, Hodan, Mogadishu" />
                                </div>
                            </div>



                            <div className="flex justify-end pt-8">
                                <button type="submit" disabled={loading} className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                    Review Details
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: Resident Registration ---
const ResidentRegistration = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        gender: 'male',
        nationality: '',
        passportNumber: '',
        visaType: '',
        sponsorName: '',
        phone: '',
        responsiblePersonPhone: '',
        email: '',
        address: '',
        personal_photo: ''
    });
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);

    const [step, setStep] = useState(1);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log('[Dev Debug] Resident Registration review page loaded');
        setStep(2);
    };

    const confirmSubmit = async () => {
        console.log('[Dev Debug] Resident Registration Confirm button clicked');
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            console.log('[Dev Debug] Sending API request to /api/admin/register-resident', formData);
            const response = await fetch('http://localhost:5000/api/admin/register-resident', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('[Dev Debug] API response received for Resident Registration:', data);

            if (data.success) {
                console.log('[Dev Debug] Database insert success: Resident saved.', data.resident);
                setSuccessData(data.resident);
                setFormData({
                    fullName: '', dob: '', gender: 'male', nationality: '', passportNumber: '', visaType: '', sponsorName: '', phone: '', responsiblePersonPhone: '', email: '', address: '', personal_photo: ''
                });
                setStep(1);
            } else {
                console.error('[Dev Debug] Database insert failure / Validation error:', data.message);
                setError(data.message || 'Error saving resident.');
            }
        } catch (err) {
            console.error('[Dev Debug] Client network error or server unavailable:', err);
            setError('Server connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg border border-blue-400">
                            <Globe size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Resident Registration Hub</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gold-400 font-black uppercase tracking-[0.2em] mt-2">Foreign Expatriate Enrollment</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {successData ? (
                        <div className="animate-fade-in text-center space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-500/10 p-10 rounded-2xl border border-blue-200 dark:border-blue-500/20 max-w-lg mx-auto">
                                <ShieldCheck size={48} className="text-blue-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-blue-900 dark:text-blue-400 mb-2">Registration Successful!</h3>
                                <p className="text-sm font-bold text-blue-800 dark:text-gray-300 mb-6">
                                    The new resident has been enrolled and an 11-digit Residence Number has been automatically generated.
                                </p>
                                <div className="bg-white dark:bg-black/30 p-6 rounded-xl space-y-4 shadow-sm border border-blue-100 dark:border-blue-500/10 ltr:text-left rtl:text-right">
                                    <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Residence No. (11 Digits):</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-gold-400 font-mono tracking-widest">{successData.residence_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Account Setup:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">Credentials will be generated upon ID Card Issuance</span>
                                    </div>
                                </div>
                                <button onClick={() => setSuccessData(null)} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md">
                                    Register Another
                                </button>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-8 animate-fade-in max-w-lg mx-auto bg-gray-50/50 dark:bg-white/5 p-8 rounded-2xl border border-gray-200 dark:border-white/5">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 text-center">Review Resident Details</h3>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{formData.fullName}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nationality</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{formData.nationality}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date of Birth</span>
                                    <span className="text-sm font-black font-mono text-gray-900 dark:text-white">{formData.dob}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gender</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white capitalize">{formData.gender}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sponsor & Visa</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{formData.sponsorName || 'N/A'} ({formData.visaType || 'N/A'})</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact</span>
                                    <span className="text-sm font-black font-mono text-gray-900 dark:text-white">{formData.phone}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Emergency (Sponsor) Phone</span>
                                    <span className="text-sm font-black font-mono text-gray-900 dark:text-white">{formData.responsiblePersonPhone}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</span>
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{formData.email || 'N/A'}</span>
                                </div>

                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setStep(1)} type="button" className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all">Edit Details</button>
                                <button onClick={confirmSubmit} disabled={loading} type="button" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all">{loading ? 'Processing...' : 'Confirm'}</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-8 animate-fade-in">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
                                <div className="w-1 h-5 bg-primary-500 rounded-full"></div>
                                Personal Demographics
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Full Legal Name *</label>
                                    <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="e.g. John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Date of Birth *</label>
                                    <input required name="dob" value={formData.dob} onChange={handleChange} type="date" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Gender *</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors">
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Nationality *</label>
                                    <input required list="nationalities" name="nationality" value={formData.nationality} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="Choose nationality..." />
                                    <datalist id="nationalities">
                                        <option value="American" />
                                        <option value="British" />
                                        <option value="Canadian" />
                                        <option value="Ethiopian" />
                                        <option value="Kenyan" />
                                        <option value="Djiboutian" />
                                        <option value="Turkish" />
                                        <option value="Indian" />
                                        <option value="Pakistani" />
                                    </datalist>
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
                                <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
                                Visa & Sponsorship Requirements
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Passport Number</label>
                                    <input name="passportNumber" value={formData.passportNumber} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="Enter passport number" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Visa Type</label>
                                    <input name="visaType" value={formData.visaType} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="e.g. Employment, Student" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Sponsor Agency / Individual Name</label>
                                    <input name="sponsorName" value={formData.sponsorName} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="e.g. Hormuud Telecom" />
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3 pt-6">
                                <div className="w-1 h-5 bg-primary-500 rounded-full"></div>
                                Contact Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Phone Number *</label>
                                    <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="+252 61 0000000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Responsible Person Phone (Sponsor) *</label>
                                    <input required name="responsiblePersonPhone" value={formData.responsiblePersonPhone} onChange={handleChange} type="tel" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="+252 61 0000000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                                    <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="optional@example.com" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Physical Address in Somalia *</label>
                                    <input required name="address" value={formData.address} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="Local address..." />
                                </div>
                            </div>



                            <div className="flex justify-end pt-8">
                                <button type="submit" disabled={loading} className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                    Review Details
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: Issue ID Card ---
const IssueIDCard = () => {
    const { t } = useLanguage();
    const [referenceNumber, setReferenceNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);

    const [personalPhoto, setPersonalPhoto] = useState('');
    const [step, setStep] = useState(1); // 1 = Form, 2 = Review

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const confirmSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const response = await fetch('http://localhost:5000/api/admin/issue-id-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceNumber, personal_photo: personalPhoto })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData({
                    idCard: data.idCard,
                    person: data.person,
                    message: data.message
                });
                setReferenceNumber(''); // clear form
                setPersonalPhoto(''); // clear photo
                setStep(1); // Reset to step 1 for the next issuance
            } else {
                setError(data.message || 'Error processing ID card.');
            }
        } catch (err) {
            setError('Server connection error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gold-600 text-white rounded-2xl flex items-center justify-center shadow-lg border border-gold-400">
                            <CreditCard size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">ID Card Issuance</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gold-400 font-black uppercase tracking-[0.2em] mt-2">Generate Smart Identity Card</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {successData ? (
                        <div className="animate-fade-in text-center space-y-6">
                            <div className="bg-gold-50 dark:bg-gold-500/10 p-10 rounded-2xl border border-gold-200 dark:border-gold-500/20 max-w-xl mx-auto">
                                <ShieldCheck size={48} className="text-gold-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-gold-900 dark:text-gold-400 mb-2">Issue Successful!</h3>
                                <p className="text-sm font-bold text-gold-800 dark:text-gray-300 mb-6">
                                    {successData.message}
                                </p>

                                {/* Realistic ID Card Representation */}
                                <div className="flex justify-center my-8">
                                    <div dir="ltr" className="relative w-[520px] h-[330px] rounded-2xl overflow-hidden shadow-2xl border border-white/40 group font-sans text-left" style={{ background: successData.idCard.id_type === 'resident' ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #94a3b8 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)' }}>
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
                                                            <p className="text-xs font-black text-slate-900 font-mono tracking-wider mt-0.5">{successData.person.national_number || successData.person.residence_number}</p>
                                                        </div>
                                                        <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                            <p className="text-[8px] font-bold text-slate-600 leading-none mb-1">Tirada <span dir="rtl">رقم الإصدار /</span> Issue No.</p>
                                                            <span className="bg-slate-300 text-slate-900 text-xs font-black font-mono px-2 py-0.5 rounded shadow-sm border border-slate-400/50">
                                                                {successData.idCard.issue_number}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Magaca <span dir="rtl">الاسم /</span> Name</p>
                                                        <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{successData.person.full_name}</p>
                                                    </div>
                                                    <div className="flex justify-between w-full">
                                                        <div className="w-[45%]">
                                                            <p className="text-[8px] font-bold text-slate-600 leading-none">Jinsiga <span dir="rtl">الجنس /</span> Sex</p>
                                                            <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{successData.person.gender}</p>
                                                        </div>
                                                        <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                            <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda Dhalashada <span dir="rtl">الميلاد /</span> Date of Birth</p>
                                                            <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{new Date(successData.person.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between w-full pt-1.5 border-t border-slate-400/30">
                                                        <div className="w-[45%]">
                                                            <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda la bixiyey <span dir="rtl">الإصدار /</span> Date of Issue</p>
                                                            <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{new Date(successData.idCard.issue_date).toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                                                        </div>
                                                        <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                            <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda uu dhacayo <span dir="rtl">انتهاء /</span> Date of Expiry</p>
                                                            <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{new Date(successData.idCard.expiry_date).toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-end justify-between pt-1">
                                                        {/* Small Hologram Photo Placeholder */}
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-8 h-10 border border-slate-300 rounded overflow-hidden opacity-60 relative mix-blend-multiply mb-0.5">
                                                                <img src={successData.person.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150"} className="w-full h-full object-cover grayscale" alt="Hologram" />
                                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Profile Picture & Signature */}
                                                <div className="w-28 flex flex-col items-center justify-between mt-1">
                                                    <div className="w-[100px] h-[130px] bg-slate-200 border border-slate-300 shadow-inner overflow-hidden rounded-sm">
                                                        <img src={successData.person.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover grayscale" alt="Profile" />
                                                    </div>
                                                    <div className="text-center w-full mt-auto pb-1 relative z-20">
                                                        <div className="font-['Brush_Script_MT',cursive] text-xl text-slate-800 -rotate-3 mb-0.5">Holder</div>
                                                        <p className="text-[7px] font-bold text-slate-600 border-t border-slate-400/50 pt-1">Holder's Signature</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Glossy Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 z-20 pointer-events-none mix-blend-overlay"></div>
                                    </div>
                                </div>

                                <button onClick={() => setSuccessData(null)} className="mt-8 bg-gold-600 hover:bg-gold-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md">
                                    Issue Another
                                </button>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-8 animate-fade-in max-w-lg mx-auto border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 text-center">Review & Confirm</h3>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reference Number</p>
                                    <p className="text-lg font-black font-mono text-gray-900 dark:text-white">{referenceNumber}</p>
                                </div>
                                
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Personal Photo</p>
                                    {personalPhoto ? (
                                        <img src={personalPhoto} className="w-32 h-32 object-cover rounded-xl" alt="Preview" />
                                    ) : (
                                        <p className="text-sm font-bold text-gray-500">No photo uploaded (Will use existing)</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setStep(1)} type="button" className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all">
                                    Edit Details
                                </button>
                                <button onClick={confirmSubmit} disabled={loading} type="button" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                    {loading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-8 animate-fade-in max-w-lg mx-auto border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5">

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="space-y-2 mb-6">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Personal Photo (Optional)</label>
                                <PhotoCapture photo={personalPhoto} setPhoto={setPersonalPhoto} label="Upload or Capture ID Photo (Optional)" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block text-center">
                                    Enter 11-Digit Reference Number
                                </label>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold text-center mb-6">
                                    Provide the citizen's National Number or the resident's Residence Number down below to issue an ID card for them.
                                </p>
                                <input
                                    required
                                    name="referenceNumber"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    type="text"
                                    className="w-full bg-white dark:bg-black/20 border-2 border-primary-200 dark:border-white/10 p-5 rounded-2xl font-mono text-center text-2xl tracking-widest focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors placeholder:text-gray-300 dark:placeholder:text-white/10"
                                    placeholder="00000000000"
                                />
                            </div>

                            <div className="flex justify-center pt-4">
                                <button type="submit" disabled={!referenceNumber} className="w-full bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                    Review ID Card Request
                                </button>
                            </div>
                        </form>

                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: Identity Search ---
const IdentitySearch = () => {
    const { t, dir } = useLanguage();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSelectedResult(null);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/search-id?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success) {
                setResults(data.results);
            } else {
                setError(data.message || 'Error searching.');
            }
        } catch (err) {
            setError(dir === 'rtl' ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg border border-primary-400">
                            <ScanFace size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{dir === 'rtl' ? 'البحث عن الهوية' : 'Identity Search'}</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gold-400 font-black uppercase tracking-[0.2em] mt-2">{dir === 'rtl' ? 'البحث عن هوية مواطن أو مقيم' : 'Search Citizen or Resident Identity'}</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {selectedResult ? (
                        <div className="animate-fade-in space-y-6">
                            <button onClick={() => setSelectedResult(null)} className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10">
                                &larr; {dir === 'rtl' ? 'الرجوع للنتائج' : 'Back to Results'}
                            </button>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-4">
                                {dir === 'rtl' ? 'تفاصيل البطاقة' : 'Card Details'}
                            </h3>
                            
                            <div className="flex justify-center my-8">
                                <div dir="ltr" className="relative w-[520px] h-[330px] rounded-2xl overflow-hidden shadow-2xl border border-white/40 group font-sans text-left" style={{ background: selectedResult.type === 'resident' ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #94a3b8 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)' }}>
                                    <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                                        <Globe size={300} className="text-blue-900" />
                                    </div>

                                    <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 text-slate-900">
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

                                        <div className="flex gap-4 flex-1 flex-row-reverse">
                                            <div className="flex-1 space-y-2 flex flex-col justify-between">
                                                <div className="flex justify-between w-full">
                                                    <div className="w-[45%]">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Lambarka aqoonsiga <span dir="rtl">رقم الهوية /</span> Identity Number</p>
                                                        <p className="text-xs font-black text-slate-900 font-mono tracking-wider mt-0.5">{selectedResult.id_number}</p>
                                                    </div>
                                                    <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none mb-1">Tirada <span dir="rtl">رقم الإصدار /</span> Issue No.</p>
                                                        <span className="bg-slate-300 text-slate-900 text-xs font-black font-mono px-2 py-0.5 rounded shadow-sm border border-slate-400/50">
                                                            {selectedResult.idCards[0]?.issue_number || 1}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-600 leading-none">Magaca <span dir="rtl">الاسم /</span> Name</p>
                                                    <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{selectedResult.full_name}</p>
                                                </div>
                                                <div className="flex justify-between w-full">
                                                    <div className="w-[45%]">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Jinsiga <span dir="rtl">الجنس /</span> Sex</p>
                                                        <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{selectedResult.gender}</p>
                                                    </div>
                                                    <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda Dhalashada <span dir="rtl">الميلاد /</span> Date of Birth</p>
                                                        <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{new Date(selectedResult.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between w-full pt-1.5 border-t border-slate-400/30">
                                                    <div className="w-[45%]">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda la bixiyey <span dir="rtl">الإصدار /</span> Date of Issue</p>
                                                        <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{selectedResult.idCards[0] ? new Date(selectedResult.idCards[0].issue_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                                                    </div>
                                                    <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda uu dhacayo <span dir="rtl">انتهاء /</span> Date of Expiry</p>
                                                        <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{selectedResult.idCards[0] ? new Date(selectedResult.idCards[0].expiry_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between pt-1">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-8 h-10 border border-slate-300 rounded overflow-hidden opacity-60 relative mix-blend-multiply mb-0.5">
                                                            <img src={selectedResult.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150"} className="w-full h-full object-cover grayscale" alt="Hologram" />
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-28 flex flex-col items-center justify-between mt-1">
                                                <div className="w-[100px] h-[130px] bg-slate-200 border border-slate-300 shadow-inner overflow-hidden rounded-sm">
                                                    <img src={selectedResult.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover grayscale" alt="Profile" />
                                                </div>
                                                <div className="text-center w-full mt-auto pb-1 relative z-20">
                                                    <div className="font-['Brush_Script_MT',cursive] text-xl text-slate-800 -rotate-3 mb-0.5">Holder</div>
                                                    <p className="text-[7px] font-bold text-slate-600 border-t border-slate-400/50 pt-1">Holder's Signature</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 z-20 pointer-events-none mix-blend-overlay"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSearch} className="mb-8 flex gap-4">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={dir === 'rtl' ? 'أدخل الاسم أو رقم الهوية...' : 'Enter Name or ID Number...'}
                                    className="flex-1 bg-gray-50 dark:bg-black/20 border-2 border-primary-200 dark:border-white/10 p-4 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors"
                                />
                                <button type="submit" disabled={loading || !query} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl disabled:opacity-50">
                                    {loading ? (dir === 'rtl' ? 'جاري البحث...' : 'Searching...') : (dir === 'rtl' ? 'بحث' : 'Search')}
                                </button>
                            </form>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3 mb-6">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {results && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{dir === 'rtl' ? 'النتائج' : 'Results'} ({results.length})</h3>
                                    {results.length === 0 ? (
                                        <p className="text-gray-500 font-bold">{dir === 'rtl' ? 'لم يتم العثور على نتائج.' : 'No identities found.'}</p>
                                    ) : (
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {results.map((r, i) => (
                                                <div key={i} onClick={() => {
                                                    if (!r.idCards || r.idCards.length === 0) {
                                                        setError(dir === 'rtl' ? 'لم يتم إصدار بطاقة هوية وطنية لهذا المواطن.' : 'No National ID has been issued for this citizen.');
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    } else {
                                                        setSelectedResult(r);
                                                        setError(null);
                                                    }
                                                }} className="bg-gray-50 dark:bg-black/20 p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex gap-4 transition-all cursor-pointer hover:shadow-xl hover:border-primary-300 hover:scale-[1.02]">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 shadow-sm relative">
                                                        {(!r.idCards || r.idCards.length === 0) && (
                                                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                                                <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full rotate-[-15deg] shadow-lg">Unissued</span>
                                                            </div>
                                                        )}
                                                        <img src={r.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150"} className={`w-full h-full object-cover ${(!r.idCards || r.idCards.length === 0) ? 'grayscale opacity-60' : ''}`} alt="Profile" />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-black text-lg text-gray-900 dark:text-white uppercase leading-none">{r.full_name}</h4>
                                                                <p className="text-xs font-bold text-primary-600 dark:text-gold-400 font-mono mt-1">{r.id_number}</p>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.type === 'citizen' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                                {r.type === 'citizen' ? (dir === 'rtl' ? 'مواطن' : 'Citizen') : (dir === 'rtl' ? 'مقيم' : 'Resident')}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                                            <div className="text-gray-500 dark:text-gray-400">Gender: <span className="font-bold text-gray-900 dark:text-white capitalize">{r.gender === 'male' ? (dir === 'rtl' ? 'ذكر' : 'Male') : (dir === 'rtl' ? 'أنثى' : 'Female')}</span></div>
                                                            <div className="text-gray-500 dark:text-gray-400">DOB: <span className="font-bold text-gray-900 dark:text-white">{new Date(r.dob).toISOString().split('T')[0]}</span></div>
                                                            {(!r.idCards || r.idCards.length === 0) && <div className="col-span-2 text-[10px] text-red-500 font-bold">{dir === 'rtl' ? 'لم يتم إصدار بطاقة بعد' : 'No ID Card issued yet'}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: Identity Renewal ---
const IdentityRenewal = () => {
    const { t, dir } = useLanguage();
    const [searchParams] = useSearchParams();
    const [referenceNumber, setReferenceNumber] = useState(searchParams.get('ref') || '');
    const appId = searchParams.get('appId');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);

    const [personalPhoto, setPersonalPhoto] = useState('');
    const [fetchedCitizen, setFetchedCitizen] = useState(null);
    const [step, setStep] = useState(1);

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/search-id?query=${encodeURIComponent(referenceNumber)}`);
            const data = await response.json();
            if (data.success && data.results.length > 0) {
                const citizen = data.results[0];
                
                if (!citizen.idCards || citizen.idCards.length === 0) {
                    setError(dir === 'rtl' ? 'لا يتوفر تجديد الهوية الوطنية لعدم وجود سجل نشط.' : 'National ID renewal is not available because no active National ID record was found.');
                    setLoading(false);
                    return;
                }

                const activeCard = citizen.idCards[0];
                const now = new Date();
                const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
                if (new Date(activeCard.expiry_date) > twoYearsFromNow) {
                    setError(dir === 'rtl' ? 'يُسمح بتجديد الهوية الوطنية فقط عندما يتبقى أقل من عامين على انتهائها.' : 'National ID renewal is only allowed when the card has less than 2 years remaining before expiration.');
                    setLoading(false);
                    return;
                }
                
                setFetchedCitizen(citizen);
                setStep(2);
            } else {
                setError(dir === 'rtl' ? 'لم يتم العثور على بيانات لهذه الهوية.' : 'Could not find data for this ID.');
            }
        } catch (err) {
            setError(dir === 'rtl' ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    const confirmSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const response = await fetch('http://localhost:5000/api/admin/renew-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceNumber, applicationId: appId, personal_photo: personalPhoto })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData(data);
                setReferenceNumber('');
                setPersonalPhoto('');
            } else {
                setError(data.message || 'Error processing renewal.');
            }
        } catch (err) {
            setError('Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg border border-amber-400">
                            <RotateCw size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{dir === 'rtl' ? 'تجديد الهوية الوطنية' : 'Identity Card Renewal'}</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gold-400 font-black uppercase tracking-[0.2em] mt-2">Renew Existing Identity Credentials</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {successData ? (
                        <div className="animate-fade-in text-center space-y-6">
                            <div className="bg-green-50 dark:bg-green-500/10 p-10 rounded-2xl border border-green-200 dark:border-green-500/20 max-w-lg mx-auto">
                                <ShieldCheck size={48} className="text-green-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-green-900 dark:text-green-400 mb-2">Renewal Successful!</h3>
                                <p className="text-sm font-bold text-green-800 dark:text-gray-300 mb-6">
                                    The identity has been successfully renewed. New expiry date: {new Date(successData.idCard.expiry_date).toLocaleDateString()}
                                </p>
                                <button onClick={() => setSuccessData(null)} className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md">
                                    Renew Another
                                </button>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-8 animate-fade-in border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5 mx-auto w-fit">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 text-center pb-4 border-b border-gray-200 dark:border-white/10">{dir === 'rtl' ? 'مراجعة بيانات الهوية للبطاقة' : 'Review Identity Data'}</h3>
                            
                            <div className="flex justify-center mb-8 mt-4">
                                <div dir="ltr" className="relative w-[520px] h-[330px] rounded-2xl overflow-hidden shadow-2xl border border-white/40 group font-sans text-left" style={{ background: fetchedCitizen.type === 'resident' ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #94a3b8 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)' }}>
                                    <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                                        <Globe size={300} className="text-blue-900" />
                                    </div>
                                    <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 text-slate-900">
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
                                        <div className="flex gap-4 flex-1 flex-row-reverse">
                                            <div className="flex-1 space-y-2 flex flex-col justify-between">
                                                <div className="flex justify-between w-full">
                                                    <div className="w-[45%]">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Lambarka aqoonsiga <span dir="rtl">رقم الهوية /</span> Identity Number</p>
                                                        <p className="text-xs font-black text-slate-900 font-mono tracking-wider mt-0.5">{fetchedCitizen.id_number}</p>
                                                    </div>
                                                    <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none mb-1">Tirada <span dir="rtl">رقم الإصدار /</span> Issue No.</p>
                                                        <span className="bg-slate-300 text-slate-900 text-xs font-black font-mono px-2 py-0.5 rounded shadow-sm border border-slate-400/50">
                                                            {fetchedCitizen.idCards[0]?.issue_number || 1}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-600 leading-none">Magaca <span dir="rtl">الاسم /</span> Name</p>
                                                    <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{fetchedCitizen.full_name}</p>
                                                </div>
                                                <div className="flex justify-between w-full">
                                                    <div className="w-[45%]">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Jinsiga <span dir="rtl">الجنس /</span> Sex</p>
                                                        <p className="text-xs font-black text-slate-900 uppercase mt-0.5">{fetchedCitizen.gender}</p>
                                                    </div>
                                                    <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda Dhalashada <span dir="rtl">الميلاد /</span> Date of Birth</p>
                                                        <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{new Date(fetchedCitizen.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between w-full pt-1.5 border-t border-slate-400/30">
                                                    <div className="w-[45%]">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda la bixiyey <span dir="rtl">الإصدار /</span> Date of Issue</p>
                                                        <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{fetchedCitizen.idCards[0] ? new Date(fetchedCitizen.idCards[0].issue_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                                                    </div>
                                                    <div className="w-[50%] border-l border-slate-400/30 pl-3">
                                                        <p className="text-[8px] font-bold text-slate-600 leading-none">Taariikhda uu dhacayo <span dir="rtl">انتهاء /</span> Date of Expiry</p>
                                                        <p className="text-xs font-black text-slate-900 font-mono mt-0.5">{fetchedCitizen.idCards[0] ? new Date(fetchedCitizen.idCards[0].expiry_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-end justify-between pt-1">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-8 h-10 border border-slate-300 rounded overflow-hidden opacity-60 relative mix-blend-multiply mb-0.5">
                                                            <img src={(personalPhoto || fetchedCitizen.photo) || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150"} className="w-full h-full object-cover grayscale" alt="Hologram" />
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-28 flex flex-col items-center justify-between mt-1">
                                                <div className="w-[100px] h-[130px] bg-slate-200 border border-slate-300 shadow-inner overflow-hidden rounded-sm">
                                                    <img src={(personalPhoto || fetchedCitizen.photo) || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover grayscale" alt="Profile" />
                                                </div>
                                                <div className="text-center w-full mt-auto pb-1 relative z-20">
                                                    <div className="font-['Brush_Script_MT',cursive] text-xl text-slate-800 -rotate-3 mb-0.5">Holder</div>
                                                    <p className="text-[7px] font-bold text-slate-600 border-t border-slate-400/50 pt-1">Holder's Signature</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 z-20 pointer-events-none mix-blend-overlay"></div>
                                </div>
                            </div>
                            
                            <div className="flex justify-center gap-4 pt-4 mt-6 border-t border-gray-200 dark:border-white/10">
                                <button onClick={() => setStep(1)} type="button" className="px-8 py-4 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all">
                                    {dir === 'rtl' ? 'رجوع' : 'Back'}
                                </button>
                                <button onClick={confirmSubmit} disabled={loading} type="button" className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-md">
                                    {loading ? (dir === 'rtl' ? 'جاري التنفيذ...' : 'Processing...') : (dir === 'rtl' ? 'تأكيد وتجديد' : 'Confirm & Renew')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-8 animate-fade-in max-w-lg mx-auto border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block text-center">
                                    Enter 11-Digit Reference Number
                                </label>
                                <input
                                    required
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    type="text"
                                    className="w-full bg-white dark:bg-black/20 border-2 border-primary-200 dark:border-white/10 p-5 rounded-2xl font-mono text-center text-2xl tracking-widest focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors"
                                    placeholder="00000000000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Update Photo (Optional)</label>
                                <PhotoCapture photo={personalPhoto} setPhoto={setPersonalPhoto} label="Upload or Capture Updated ID Photo" />
                            </div>

                            <div className="flex justify-center pt-4">
                                <button type="submit" disabled={loading || !referenceNumber} className="w-full bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                                    Review Renewal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: Passport Renewal ---
const PassportRenewal = () => {
    const { t, dir } = useLanguage();
    const [searchParams] = useSearchParams();
    const [referenceNumber, setReferenceNumber] = useState(searchParams.get('ref') || '');
    const appId = searchParams.get('appId');
    const [passportType, setPassportType] = useState('regular');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);
    const [personalPhoto, setPersonalPhoto] = useState('');
    const [fetchedCitizen, setFetchedCitizen] = useState(null);
    const [step, setStep] = useState(1);

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (step === 1) {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:5000/api/admin/verify-passport-renewal/${encodeURIComponent(referenceNumber)}`);
                const data = await res.json();
                if (!data.success) {
                    setError(data.message || 'Validation failed. Proceeding blocked.');
                    return;
                }
                setFetchedCitizen(data.citizen);
                setStep(2);
            } catch (err) {
                setError('Failed to query database.');
            } finally {
                setLoading(false);
            }
        }
    };

    const confirmSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const response = await fetch('http://localhost:5000/api/admin/renew-passport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceNumber, passportType, applicationId: appId, personal_photo: personalPhoto })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData(data);
                setReferenceNumber('');
                setStep(1);
            } else {
                setError(data.message || 'Error processing renewal.');
            }
        } catch (err) {
            setError('Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg border border-blue-500">
                            <RefreshCcw size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{dir === 'rtl' ? 'تجديد جواز السفر' : 'Passport Renewal Hub'}</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gold-400 font-black uppercase tracking-[0.2em] mt-2">Re-issue Somalia Federal Passport</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {successData ? (
                        <div className="animate-fade-in text-center space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-500/10 p-10 rounded-2xl border border-blue-200 dark:border-blue-500/20 max-w-lg mx-auto">
                                <Plane size={48} className="text-blue-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-blue-900 dark:text-blue-400 mb-2">Passport Renewed!</h3>
                                <p className="text-sm font-bold text-blue-800 dark:text-gray-300 mb-2">
                                    Citizen: <span className="text-gray-900 dark:text-white underline">{successData.person.full_name}</span>
                                </p>
                                <p className="text-sm font-bold text-blue-800 dark:text-gray-300 mb-6 font-mono">
                                    New Passport No: {successData.passport.passport_number}
                                </p>
                                <button onClick={() => setSuccessData(null)} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md">
                                    Renew Another
                                </button>
                            </div>
                        </div>
                    ) : step === 2 ? (
                        <div className="space-y-8 animate-fade-in max-w-lg mx-auto border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 text-center">Review Passport Renewal</h3>
                            
                            <div className="space-y-4">
                                {fetchedCitizen && (
                                    <>
                                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{fetchedCitizen.full_name}</span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">National ID / Ref</span>
                                            <span className="text-sm font-black font-mono text-gray-900 dark:text-white uppercase">{fetchedCitizen.national_number}</span>
                                        </div>
                                        {fetchedCitizen.passports && fetchedCitizen.passports.length > 0 && (
                                            <>
                                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Passport</span>
                                                    <span className="text-sm font-black font-mono text-gray-900 dark:text-white uppercase">{fetchedCitizen.passports[0].passport_number}</span>
                                                </div>
                                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Issue / Expiry</span>
                                                    <span className="text-sm font-black font-mono text-red-600 dark:text-red-400 uppercase">{new Date(fetchedCitizen.passports[0].issue_date).toISOString().split('T')[0]} / {new Date(fetchedCitizen.passports[0].expiry_date).toISOString().split('T')[0]}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DOB / Gender / Nat</span>
                                            <span className="text-sm font-black font-mono text-gray-900 dark:text-white">{new Date(fetchedCitizen.dob).toISOString().split('T')[0]} - {fetchedCitizen.gender.toUpperCase()} - {fetchedCitizen.nationality}</span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone / Address</span>
                                            <span className="text-sm font-black font-mono text-gray-900 dark:text-white">{fetchedCitizen.phone} - {fetchedCitizen.address}</span>
                                        </div>
                                        <div className="p-4 bg-white dark:bg-black/20 rounded-xl">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Stored Profile Photo</p>
                                            {fetchedCitizen.photo ? (
                                                <img src={fetchedCitizen.photo} className="w-32 h-32 object-cover rounded-xl" alt="DB Preview" />
                                            ) : (
                                                <p className="text-sm font-bold text-gray-500">No previous photo on record</p>
                                            )}
                                        </div>
                                    </>
                                )}
                                <div className="p-4 bg-white dark:bg-black/20 rounded-xl mt-4">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">New Uploaded Photo</p>
                                    {personalPhoto ? (
                                        <img src={personalPhoto} className="w-32 h-32 object-cover rounded-xl border border-primary-500" alt="New Preview" />
                                    ) : (
                                        <p className="text-sm font-bold text-gray-500">No new photo uploaded</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setStep(1)} type="button" className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all">Edit Details</button>
                                <button onClick={confirmSubmit} disabled={loading} type="button" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2">{loading ? 'Processing...' : 'Confirm'}</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="space-y-8 animate-fade-in max-w-lg mx-auto border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block text-center mb-2">
                                    National ID Reference
                                </label>
                                <input
                                    required
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    type="text"
                                    className="w-full bg-white dark:bg-black/20 border-2 border-blue-200 dark:border-white/10 p-4 rounded-2xl font-mono text-center text-xl tracking-widest focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-colors"
                                    placeholder="00000000000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Update Photo (Optional)</label>
                                <PhotoCapture photo={personalPhoto} setPhoto={setPersonalPhoto} label="Upload or Capture Passport Photo" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block text-center mb-2">
                                    Passport Modality
                                </label>
                                <select 
                                    value={passportType} 
                                    onChange={(e) => setPassportType(e.target.value)}
                                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 p-4 rounded-2xl font-bold text-sm outline-none focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                                >
                                    <option value="regular">P-Ordinary (Blue)</option>
                                    <option value="diplomatic">D-Diplomatic (Red)</option>
                                </select>
                            </div>

                            <div className="flex justify-center pt-4">
                                <button type="submit" disabled={loading || !referenceNumber} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                                    Review Renewal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: AdminProfile ---
const PassportSearch = () => {
    const { t, dir } = useLanguage();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSelectedResult(null);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/search-passport?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success) {
                setResults(data.results);
            } else {
                setError(data.message || 'Error searching.');
            }
        } catch (err) {
            setError(dir === 'rtl' ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg border border-blue-400">
                            <BookOpen size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{dir === 'rtl' ? 'البحث عن الجواز' : 'Passport Search'}</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gold-400 font-black uppercase tracking-[0.2em] mt-2">{dir === 'rtl' ? 'البحث عن جوازات سفر المواطنين' : 'Search Citizen Passports'}</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    {selectedResult ? (
                        <div className="animate-fade-in space-y-6">
                            <button onClick={() => setSelectedResult(null)} className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10">
                                &larr; {dir === 'rtl' ? 'الرجوع للنتائج' : 'Back to Results'}
                            </button>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-4">
                                {dir === 'rtl' ? 'تفاصيل الجواز' : 'Passport Details'}
                            </h3>
                            
                            <div className="flex justify-center my-8">
                                <div className="w-[800px] h-auto min-h-[540px] bg-white border-x-4 border-slate-300 shadow-xl overflow-hidden relative flex flex-col font-sans mb-4" style={{ backgroundImage: 'radial-gradient(circle at center, #fdfdfd 0%, #f0ebd8 100%)' }}>
                                    <div className="absolute inset-0 opacity-10 flex items-center justify-center -z-1 pointer-events-none">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/400px-Coat_of_arms_of_Somalia.svg.png" className="w-[300px] h-auto opacity-40 mix-blend-multiply" alt="Watermark" />
                                    </div>
                                    
                                    <div className="flex justify-between items-center px-8 pt-6 pb-2 border-b border-gray-300/60 shrink-0">
                                        <div className="text-center w-64">
                                            <h2 className="text-lg font-black tracking-widest text-[#1e3a8a] whitespace-nowrap">JAMHUURIYADDA SOOMAALIYA</h2>
                                            <div className="flex items-center justify-between text-[#1e3a8a] font-black text-sm mt-1">
                                                <span>BAASABOOR</span>
                                                <span className="font-normal mx-2 text-gray-500">|</span>
                                                <span dir="rtl" className="text-base leading-none">جواز سفر</span>
                                                <span className="font-normal mx-2 text-gray-500">|</span>
                                                <span>PASSPORT</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mx-4 mt-2">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png" className="w-16 h-auto drop-shadow-md" alt="Somalia" />
                                        </div>
                                        
                                        <div className="text-center w-64">
                                            <h2 dir="rtl" className="text-2xl font-black text-[#1e3a8a] mb-2 leading-none">جمهورية الصومال</h2>
                                            <h2 className="text-lg font-black tracking-widest text-[#1e3a8a] whitespace-nowrap">SOMALI REPUBLIC</h2>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 px-8 py-4 gap-8">
                                        <div className="w-[180px] shrink-0">
                                            <div className="w-full h-[240px] bg-white border border-gray-300 p-1 shadow-sm mb-4">
                                                <img src={selectedResult.citizen?.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover" alt="Holder" />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 text-[#1e3a8a]">
                                            <div className="flex gap-4 mb-2 pb-2">
                                                <div className="w-1/4">
                                                    <p className="text-[10px] font-bold text-gray-600">Type / <span dir="rtl">النوع</span></p>
                                                    <p className="text-lg font-bold font-mono text-black">{selectedResult.type === 'regular' ? 'P' : 'D'}</p>
                                                </div>
                                                <div className="w-1/4">
                                                    <p className="text-[10px] font-bold text-gray-600">Country code / <span dir="rtl">رمز البلد</span></p>
                                                    <p className="text-lg font-bold font-mono text-black">SOM</p>
                                                </div>
                                                <div className="flex-1 mt-1 text-right border-l-2 border-gray-300 pl-4">
                                                    <p className="text-[10px] font-bold text-gray-600">Passport No / <span dir="rtl">رقم الجواز</span></p>
                                                    <p className="text-2xl font-black font-mono tracking-widest text-black">{selectedResult.passport_number}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mt-4">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-600">Magaca / <span dir="rtl">الاسم</span> / Name</p>
                                                    <p className="text-lg font-black uppercase text-black">{selectedResult.citizen?.full_name}</p>
                                                </div>
                                                
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-600">Magaca Hooyada / <span dir="rtl">اسم الأم</span> / Mother's Name</p>
                                                    <p className="text-lg font-black uppercase text-black">SADIA OSMAN MAANI</p>
                                                </div>

                                                <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                    <div className="w-1/2">
                                                        <p className="text-[10px] font-bold text-gray-600">Jinsiyadda / <span dir="rtl">الجنسية</span> / Nationality</p>
                                                        <p className="text-sm font-black uppercase text-black">{selectedResult.citizen?.nationality || 'SOMALI'}</p>
                                                    </div>
                                                    <div className="w-1/2">
                                                        <p className="text-[10px] font-bold text-gray-600">Shaqada / <span dir="rtl">المهنة</span> / Occupation</p>
                                                        <p className="text-sm font-black uppercase text-black"></p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                    <div className="w-1/3">
                                                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Taariikhda Dhalashada / <span dir="rtl">تاريخ الميلاد</span><br/>Date of Birth</p>
                                                        <p className="text-base font-black font-mono text-black mt-1">{new Date(selectedResult.citizen?.dob).toISOString().split('T')[0]}</p>
                                                    </div>
                                                    <div className="w-1/3 text-center">
                                                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Jinsiga / <span dir="rtl">الجنس</span><br/>Gender</p>
                                                        <p className="text-base font-black font-mono text-black mt-1">{selectedResult.citizen?.gender.charAt(0).toUpperCase()}</p>
                                                    </div>
                                                    <div className="w-1/3 text-right">
                                                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Meesha Dhalashada / <span dir="rtl">مكان الميلاد</span><br/>Place of Birth</p>
                                                        <p className="text-sm font-black uppercase text-black mt-1">SOMALIA</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                    <div className="w-1/3">
                                                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Taariikhda la bixiyay / <span dir="rtl">تاريخ الإصدار</span><br/>Date of Issue</p>
                                                        <p className="text-base font-black font-mono text-black mt-1">{new Date(selectedResult.issue_date).toISOString().split('T')[0]}</p>
                                                    </div>
                                                    <div className="w-1/3 text-center">
                                                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Hey'adda bixisay / <span dir="rtl">جهة الإصدار</span><br/>Issuing Authority</p>
                                                        <p className="text-sm font-black uppercase text-black mt-1">Immigration HQ</p>
                                                    </div>
                                                    <div className="w-1/3 text-right">
                                                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Meesha bixinta / <span dir="rtl">مكان الإصدار</span><br/>Place of Issue</p>
                                                        <p className="text-sm font-black uppercase text-black mt-1">MOGADISHU</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                    <div className="w-1/3">
                                                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Taariikhda dhicitaanka / <span dir="rtl">تاريخ الانتهاء</span><br/>Date of expiry</p>
                                                        <p className="text-base font-black font-mono text-black mt-1">{new Date(selectedResult.expiry_date).toISOString().split('T')[0]}</p>
                                                    </div>
                                                    <div className="w-2/3 text-right pt-2 border-t-0">
                                                        <p className="text-[10px] font-bold text-gray-600 border-t border-gray-400 inline-block pt-1 ml-auto relative">
                                                            <span className="absolute bottom-4 right-0 font-['Brush_Script_MT',cursive] text-2xl opacity-80 text-black -rotate-6 whitespace-nowrap">Holder's Signature</span>
                                                            Saxiixa qofka leh / <span dir="rtl">توقيع حامل الجواز</span> / Holder's Signature
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-auto h-16 bg-white shrink-0 px-6 py-2 border-t font-['OCR_A_Std','Courier_New',monospace] text-black font-black tracking-[0.2em] text-[15px] flex flex-col justify-center leading-tight z-10">
                                        <p>P&lt;SOM{selectedResult.citizen?.full_name.split(' ')[0].toUpperCase()}&lt;&lt;{selectedResult.citizen?.full_name.split(' ').slice(1).join('<').toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                                        <p>{selectedResult.passport_number}&lt;3SOM{new Date(selectedResult.citizen?.dob).toISOString().split('T')[0].replace(/-/g, '').slice(2)}M{new Date(selectedResult.expiry_date).toISOString().split('T')[0].replace(/-/g, '').slice(2)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSearch} className="mb-8 flex gap-4">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={dir === 'rtl' ? 'أدخل الاسم، رقم الهوية، أو رقم الجواز...' : 'Enter Name, National ID, or Passport Number...'}
                                    className="flex-1 bg-gray-50 dark:bg-black/20 border-2 border-blue-200 dark:border-white/10 p-4 rounded-xl font-bold text-sm focus:border-blue-500 outline-none text-gray-900 dark:text-white transition-colors"
                                />
                                <button type="submit" disabled={loading || !query} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl disabled:opacity-50">
                                    {loading ? (dir === 'rtl' ? 'جاري البحث...' : 'Searching...') : (dir === 'rtl' ? 'بحث' : 'Search')}
                                </button>
                            </form>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3 mb-6">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {results && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{dir === 'rtl' ? 'النتائج' : 'Results'} ({results.length})</h3>
                                    {results.length === 0 ? (
                                        <p className="text-gray-500 font-bold">{dir === 'rtl' ? 'لم يتم العثور على جوازات سفر.' : 'No passports found.'}</p>
                                    ) : (
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {results.map((r, i) => (
                                                <div key={i} onClick={() => {
                                                    if (!r._hasPassport) {
                                                        setError(dir === 'rtl' ? 'لم يتم إصدار جواز سفر لهذا المواطن.' : 'No Passport has been issued for this citizen.');
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    } else {
                                                        setSelectedResult(r);
                                                        setError(null);
                                                    }
                                                }} className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-4 transition-all cursor-pointer hover:shadow-xl hover:border-blue-300 hover:scale-[1.02]">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-blue-200 dark:border-white/10 shadow-sm relative">
                                                        {(!r._hasPassport) && (
                                                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                                                <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full rotate-[-15deg] shadow-lg">Unissued</span>
                                                            </div>
                                                        )}
                                                        <img src={r.citizen?.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150"} className={`w-full h-full object-cover ${!r._hasPassport ? 'grayscale opacity-60' : ''}`} alt="Profile" />
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-black text-lg text-gray-900 dark:text-white uppercase leading-none">{r.citizen?.full_name}</h4>
                                                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono mt-1">PP: {r.passport_number}</p>
                                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono mt-0.5">ID: {r.citizen?.national_number}</p>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${r.type === 'regular' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                {r.type === 'regular' ? 'P-Ordinary' : 'D-Diplomatic'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
                                                            <div className="text-gray-500 dark:text-gray-400">Issue Dt: <span className="font-bold text-gray-900 dark:text-white">{new Date(r.issue_date).toISOString().split('T')[0]}</span></div>
                                                            <div className="text-gray-500 dark:text-gray-400">Expiry Dt: <span className="font-bold text-gray-900 dark:text-white">{new Date(r.expiry_date).toISOString().split('T')[0]}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: Print Identity ---
const PrintIdentity = () => {
    const { dir } = useLanguage();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);

    const handlePrint = async () => {
        try {
            const admin = JSON.parse(localStorage.getItem('user') || '{}');
            await fetch('http://localhost:5000/api/admin/print-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin_name: admin.full_name || admin.username || 'Admin',
                    document_type: 'National ID',
                    document_number: selectedResult.id_number,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) { console.error('Failed to log print action', e); }
        window.print();
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null); setSelectedResult(null);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/search-id?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success && data.results.length > 0) {
                const citizen = data.results[0];
                if (!citizen.idCards || citizen.idCards.length === 0) {
                    setError('No ID Card issued for this citizen.');
                } else setSelectedResult(citizen);
            } else { setError('No identities found.'); }
        } catch (err) { setError('Server connection error.'); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up print-container">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 20px !important; width: 100% !important; }
                    aside, header, button { display: none !important; }
                    main { overflow: visible !important; }
                    @page { size: auto; margin: 0mm; }
                }
            `}</style>
            
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 print:shadow-none print:border-none print:p-0 print:bg-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 print:hidden">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Printer size={32} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{dir === 'rtl' ? 'طباعة الهوية' : 'Print National ID'}</h2>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-2">Generate ID Card Copy</p>
                        </div>
                    </div>
                </div>

                {selectedResult ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center print:hidden">
                            <button onClick={() => setSelectedResult(null)} className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs uppercase">Back to Search</button>
                            <button onClick={handlePrint} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase shadow-xl flex gap-2 items-center"><Printer size={18} /> Print ID Card</button>
                        </div>
                        
                        <div className="flex justify-center my-8 print-area">
                            <div dir="ltr" className="relative w-[520px] h-[330px] rounded-2xl overflow-hidden shadow-2xl border border-white/40 group font-sans text-left" style={{ background: selectedResult.type === 'resident' ? 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 50%, #94a3b8 100%)' : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                <div className="absolute inset-0 opacity-10 flex items-center justify-center"><Globe size={300} className="text-blue-900" /></div>
                                <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 text-slate-900">
                                    <div className="flex justify-between items-start mb-3">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png" alt="Coat of Arms" className="w-14 h-auto drop-shadow-md" />
                                        <div className="text-center flex-1 mx-2 mt-1">
                                            <h3 className="text-[10px] font-bold text-slate-800 leading-tight">Jamhuuriyadda Federaalka Soomaaliya</h3>
                                            <h3 className="text-[12px] font-black text-slate-900 leading-tight my-0.5" dir="rtl">جمهورية الصومال الفيدرالية</h3>
                                            <h3 className="text-[10px] font-bold text-slate-800 leading-tight">Federal Republic of Somalia</h3>
                                            <h4 className="text-[8px] font-bold text-slate-700 leading-tight mt-1.5">Kaarka Aqoonsiga</h4>
                                            <h4 className="text-[9px] font-black text-slate-900 leading-tight">IDENTITY CARD / <span dir="rtl" className="font-bold">بطاقة الهوية</span></h4>
                                        </div>
                                        <div className="w-14 h-9 bg-blue-500 border border-white/50 shadow-sm flex items-center justify-center relative mt-2"><div className="text-white"><svg width="16" height="16" viewBox="0 0 512 512"><path fill="#fff" d="M256 16l61.8 190.2h200L356.1 323.8 417.9 514 256 396.2 94.1 514l61.8-190.2L-4.2 206.2h200z" /></svg></div></div>
                                    </div>
                                    <div className="flex gap-4 flex-1 flex-row-reverse">
                                        <div className="flex-1 space-y-2 flex flex-col justify-between">
                                            <div className="flex justify-between w-full">
                                                <div className="w-[45%]"><p className="text-[8px] font-bold text-slate-600 leading-none">Lambarka/ID Number</p><p className="text-xs font-black text-slate-900 font-mono tracking-wider mt-0.5">{selectedResult.id_number}</p></div>
                                                <div className="w-[50%] border-l border-slate-400/30 pl-3"><p className="text-[8px] font-bold text-slate-600 leading-none mb-1">Issue No.</p><span className="bg-slate-300 text-slate-900 text-xs font-black font-mono px-2 py-0.5 rounded shadow-sm border border-slate-400/50">{selectedResult.idCards[0]?.issue_number || 1}</span></div>
                                            </div>
                                            <div><p className="text-[8px] font-bold text-slate-600 leading-none">Magaca/Name</p><p className="text-xs font-black text-slate-900 uppercase mt-0.5">{selectedResult.full_name}</p></div>
                                            <div className="flex justify-between w-full">
                                                <div className="w-[45%]"><p className="text-[8px] font-bold text-slate-600 leading-none">Sex</p><p className="text-xs font-black text-slate-900 uppercase mt-0.5">{selectedResult.gender}</p></div>
                                                <div className="w-[50%] border-l border-slate-400/30 pl-3"><p className="text-[8px] font-bold text-slate-600 leading-none">Date of Birth</p><p className="text-xs font-black text-slate-900 font-mono mt-0.5">{new Date(selectedResult.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</p></div>
                                            </div>
                                            <div className="flex justify-between w-full pt-1.5 border-t border-slate-400/30">
                                                <div className="w-[45%]"><p className="text-[8px] font-bold text-slate-600 leading-none">Date of Issue</p><p className="text-xs font-black text-slate-900 font-mono mt-0.5">{selectedResult.idCards[0] ? new Date(selectedResult.idCards[0].issue_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p></div>
                                                <div className="w-[50%] border-l border-slate-400/30 pl-3"><p className="text-[8px] font-bold text-slate-600 leading-none">Date of Expiry</p><p className="text-xs font-black text-slate-900 font-mono mt-0.5">{selectedResult.idCards[0] ? new Date(selectedResult.idCards[0].expiry_date).toLocaleDateString('en-GB').replace(/\//g, '-') : 'N/A'}</p></div>
                                            </div>
                                            <div className="flex items-end justify-between pt-1">
                                                <div className="flex flex-col items-center"><div className="w-8 h-10 border border-slate-300 rounded overflow-hidden opacity-60 relative mix-blend-multiply mb-0.5"><img src={selectedResult.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150"} className="w-full h-full object-cover grayscale" alt="Hologram" /><div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div></div></div>
                                            </div>
                                        </div>
                                        <div className="w-28 flex flex-col items-center justify-between mt-1">
                                            <div className="w-[100px] h-[130px] bg-slate-200 border border-slate-300 shadow-inner overflow-hidden rounded-sm"><img src={selectedResult.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover grayscale" alt="Profile" /></div>
                                            <div className="text-center w-full mt-auto pb-1 relative z-20"><div className="font-['Brush_Script_MT',cursive] text-xl text-slate-800 -rotate-3 mb-0.5">Holder</div><p className="text-[7px] font-bold text-slate-600 border-t border-slate-400/50 pt-1">Holder's Signature</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 z-20 pointer-events-none mix-blend-overlay"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="print:hidden animate-fade-in">
                        <form onSubmit={handleSearch} className="mb-8 flex gap-4">
                            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ID by name or numbers..." className="flex-1 bg-gray-50 dark:bg-black/20 border-2 border-primary-200 p-4 rounded-xl font-bold outline-none text-gray-900 dark:text-white" />
                            <button type="submit" disabled={loading || !query} className="bg-primary-600 hover:bg-primary-700 text-white px-8 rounded-xl font-black uppercase text-sm">{loading ? 'Searching...' : 'Search'}</button>
                        </form>
                        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold"><AlertCircle size={16} className="inline mr-2" />{error}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-component: Print Passport ---
const PrintPassport = () => {
    const { dir } = useLanguage();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);

    const handlePrint = async () => {
        try {
            const admin = JSON.parse(localStorage.getItem('user') || '{}');
            await fetch('http://localhost:5000/api/admin/print-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin_name: admin.full_name || admin.username || 'Admin',
                    document_type: 'Passport',
                    document_number: selectedResult.passport_number,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) { console.error('Failed to log print action', e); }
        window.print();
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null); setSelectedResult(null);
        try {
            const response = await fetch(`http://localhost:5000/api/admin/search-passport?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success && data.results.length > 0) {
                const resultsWithPassport = data.results.filter(r => r._hasPassport);
                if (resultsWithPassport.length > 0) setSelectedResult(resultsWithPassport[0]);
                else setError('No Passport has been issued for this citizen.');
            } else { setError('No passports found.'); }
        } catch (err) { setError('Server connection error.'); } finally { setLoading(false); }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up print-container">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 20px !important; width: 100% !important; }
                    aside, header, button { display: none !important; }
                    main { overflow: visible !important; }
                    @page { size: auto; margin: 0mm; }
                }
            `}</style>
            
            <div className="bg-white dark:bg-primary-900 p-8 md:p-12 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 print:shadow-none print:border-none print:p-0 print:bg-transparent">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5 print:hidden">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><BookOpen size={32} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{dir === 'rtl' ? 'طباعة الجواز' : 'Print Passport'}</h2>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-2">Generate Passport Copy</p>
                        </div>
                    </div>
                </div>

                {selectedResult ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center print:hidden">
                            <button onClick={() => setSelectedResult(null)} className="px-5 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs uppercase">Back to Search</button>
                            <button onClick={handlePrint} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase shadow-xl flex gap-2 items-center"><Printer size={18} /> Print Passport</button>
                        </div>
                        
                        <div className="flex justify-center my-8 print-area">
                            <div className="w-[800px] h-[540px] bg-white border-x-4 border-slate-300 shadow-xl overflow-hidden relative flex flex-col font-sans mb-4 print:shadow-none print:border-none" style={{ backgroundImage: 'radial-gradient(circle at center, #fdfdfd 0%, #f0ebd8 100%)', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                <div className="absolute inset-0 opacity-10 flex items-center justify-center -z-1 pointer-events-none"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/400px-Coat_of_arms_of_Somalia.svg.png" className="w-[300px] h-auto opacity-40 mix-blend-multiply" alt="Watermark" /></div>
                                
                                <div className="flex justify-between items-center px-8 pt-6 pb-2 border-b border-gray-300/60 shrink-0">
                                    <div className="text-center w-64"><h2 className="text-lg font-black tracking-widest text-[#1e3a8a] whitespace-nowrap">JAMHUURIYADDA SOOMAALIYA</h2><div className="flex items-center justify-between text-[#1e3a8a] font-black text-sm mt-1"><span>BAASABOOR</span><span className="font-normal mx-2 text-gray-500">|</span><span dir="rtl" className="text-base leading-none">جواز سفر</span><span className="font-normal mx-2 text-gray-500">|</span><span>PASSPORT</span></div></div>
                                    <div className="mx-4 mt-2"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png" className="w-16 h-auto drop-shadow-md" alt="Somalia" /></div>
                                    <div className="text-center w-64"><h2 dir="rtl" className="text-2xl font-black text-[#1e3a8a] mb-2 leading-none">جمهورية الصومال</h2><h2 className="text-lg font-black tracking-widest text-[#1e3a8a] whitespace-nowrap">SOMALI REPUBLIC</h2></div>
                                </div>

                                <div className="flex flex-1 px-8 py-4 gap-8">
                                    <div className="w-[180px] shrink-0"><div className="w-full h-[240px] bg-white border border-gray-300 p-1 shadow-sm mb-4"><img src={selectedResult.citizen?.photo || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover" alt="Holder" /></div></div>
                                    <div className="flex-1 text-[#1e3a8a]">
                                        <div className="flex gap-4 mb-2 pb-2">
                                            <div className="w-1/4"><p className="text-[10px] font-bold text-gray-600">Type / <span dir="rtl">النوع</span></p><p className="text-lg font-bold font-mono text-black">{selectedResult.type === 'regular' ? 'P' : 'D'}</p></div>
                                            <div className="w-1/4"><p className="text-[10px] font-bold text-gray-600">Code / <span dir="rtl">الرمز</span></p><p className="text-lg font-bold font-mono text-black">SOM</p></div>
                                            <div className="flex-1 mt-1 text-right border-l-2 border-gray-300 pl-4"><p className="text-[10px] font-bold text-gray-600">Passport No / <span dir="rtl">رقم الجواز</span></p><p className="text-2xl font-black font-mono tracking-widest text-black">{selectedResult.passport_number}</p></div>
                                        </div>
                                        <div className="space-y-3 mt-4">
                                            <div><p className="text-[10px] font-bold text-gray-600">Name / <span dir="rtl">الاسم</span></p><p className="text-lg font-black uppercase text-black">{selectedResult.citizen?.full_name}</p></div>
                                            <div className="flex justify-between border-t border-gray-300/50 pt-2"><div className="w-1/2"><p className="text-[10px] font-bold text-gray-600">Nationality / <span dir="rtl">الجنسية</span></p><p className="text-sm font-black uppercase text-black">{selectedResult.citizen?.nationality || 'SOMALI'}</p></div><div className="w-1/2"><p className="text-[10px] font-bold text-gray-600">Occupation / <span dir="rtl">المهنة</span></p><p className="text-sm font-black uppercase text-black"></p></div></div>
                                            <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                <div className="w-1/3"><p className="text-[10px] font-bold text-gray-600 leading-tight">Date of Birth</p><p className="text-base font-black font-mono text-black mt-1">{new Date(selectedResult.citizen?.dob).toISOString().split('T')[0]}</p></div>
                                                <div className="w-1/3 text-center"><p className="text-[10px] font-bold text-gray-600 leading-tight">Gender</p><p className="text-base font-black font-mono text-black mt-1">{selectedResult.citizen?.gender.charAt(0).toUpperCase()}</p></div>
                                                <div className="w-1/3 text-right"><p className="text-[10px] font-bold text-gray-600 leading-tight">Place of Birth</p><p className="text-sm font-black uppercase text-black mt-1">SOMALIA</p></div>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                <div className="w-1/3"><p className="text-[10px] font-bold text-gray-600 leading-tight">Date of Issue</p><p className="text-base font-black font-mono text-black mt-1">{new Date(selectedResult.issue_date).toISOString().split('T')[0]}</p></div>
                                                <div className="w-1/3 text-center"><p className="text-[10px] font-bold text-gray-600 leading-tight">Authority</p><p className="text-sm font-black uppercase text-black mt-1">Immigration HQ</p></div>
                                                <div className="w-1/3 text-right"><p className="text-[10px] font-bold text-gray-600 leading-tight">Place of Issue</p><p className="text-sm font-black uppercase text-black mt-1">MOGADISHU</p></div>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-300/50 pt-2">
                                                <div className="w-1/3"><p className="text-[10px] font-bold text-gray-600 leading-tight">Date of expiry</p><p className="text-base font-black font-mono text-black mt-1">{new Date(selectedResult.expiry_date).toISOString().split('T')[0]}</p></div>
                                                <div className="w-2/3 text-right pt-2 border-t-0"><p className="text-[10px] font-bold text-gray-600 border-t border-gray-400 inline-block pt-1 ml-auto relative"><span className="absolute bottom-4 right-0 font-['Brush_Script_MT',cursive] text-2xl opacity-80 text-black -rotate-6 whitespace-nowrap">Holder's Signature</span>Saxiixa qofka leh / Holder's Signature</p></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto h-16 bg-white shrink-0 px-6 py-2 border-t font-['OCR_A_Std','Courier_New',monospace] text-black font-black tracking-[0.2em] text-[15px] flex flex-col justify-center leading-tight z-10">
                                    <p>P&lt;SOM{selectedResult.citizen?.full_name.split(' ')[0].toUpperCase()}&lt;&lt;{selectedResult.citizen?.full_name.split(' ').slice(1).join('<').toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                                    <p>{selectedResult.passport_number}&lt;3SOM{new Date(selectedResult.citizen?.dob).toISOString().split('T')[0].replace(/-/g, '').slice(2)}M{new Date(selectedResult.expiry_date).toISOString().split('T')[0].replace(/-/g, '').slice(2)}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="print:hidden animate-fade-in">
                        <form onSubmit={handleSearch} className="mb-8 flex gap-4">
                            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Passport by Number, ID or Name..." className="flex-1 bg-gray-50 dark:bg-black/20 border-2 border-blue-200 p-4 rounded-xl font-bold outline-none text-gray-900 dark:text-white" />
                            <button type="submit" disabled={loading || !query} className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-black uppercase text-sm">{loading ? 'Searching...' : 'Search'}</button>
                        </form>
                        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold"><AlertCircle size={16} className="inline mr-2" />{error}</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-component: AdminProfile ---
const AdminProfile = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    const adminData = {
        fullName: storedUser.full_name || storedUser.username || 'Admin User',
        role: storedUser.role || 'System Administrator',
        department: storedUser.department || 'General Admin',
        email: storedUser.email || 'Not Provided',
        phone: storedUser.phone || storedUser.phone_number || 'Not Provided',
        status: storedUser.status || 'active',
        joinDate: storedUser.created_at ? new Date(storedUser.created_at).toLocaleDateString() : 'N/A'
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-primary-900 rounded-[2rem] shadow-premium border border-gray-200 dark:border-white/5 overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-primary-900 to-primary-700 dark:from-[#020617] dark:to-primary-950 relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>
                <div className="px-8 md:px-12 pb-12 relative -mt-16">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                        <div className="w-32 h-32 rounded-3xl bg-white dark:bg-primary-800 p-1.5 shadow-2xl relative border border-gray-200 dark:border-white/10 z-10">
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-primary-100 flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Admin Avatar" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-lg border-2 border-white dark:border-primary-900 flex items-center justify-center text-white shadow-lg">
                                <ShieldCheck size={16} />
                            </div>
                        </div>
                        <div className="text-center md:text-start flex-1">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{adminData.fullName}</h2>
                            <p className="text-primary-600 dark:text-gold-400 font-bold uppercase tracking-widest text-xs mt-1">{adminData.role} • {adminData.department}</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 font-black rounded-lg text-xs uppercase tracking-widest border border-green-200 dark:border-green-500/20 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Active Personnel
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-6 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <UserCircle size={16} className="text-primary-500" />
                                Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{adminData.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{adminData.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{adminData.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Briefcase size={16} className="text-primary-500" />
                                Operational Data
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Department</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{adminData.department}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Role Clearance</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{adminData.role}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Enrollment Date</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{adminData.joinDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sub-component: PrintingQueue ---
const PrintingQueue = () => {
    const { t, dir } = useLanguage();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState(null);
    const [filterStatus, setFilterStatus] = useState('pending');

    const fetchQueue = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/print-queue-all');
            const data = await res.json();
            if (data.success) setQueue(data.queue);
        } catch (error) {
            console.error('Failed to fetch queue', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const markPrinted = async (id) => {
        try {
            const admin = JSON.parse(localStorage.getItem('user') || '{}');
            await fetch(`http://localhost:5000/api/admin/mark-printed/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ printedBy: admin.fullName || admin.username })
            });
            fetchQueue();
            setConfirmModal(null);
        } catch (error) {
            console.error('Action failed');
        }
    };

    const filteredQueue = queue.filter(item => filterStatus === 'all' ? true : item.status === filterStatus);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{dir === 'rtl' ? 'طابور الطباعة' : 'Printing Queue'}</h2>
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shrink-0">
                    {['all', 'pending', 'printed'].map(f => (
                        <button key={f} onClick={() => setFilterStatus(f)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === f ? 'bg-white dark:bg-primary-600 text-primary-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Printed'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden">
                {loading ? <p>Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold text-sm text-gray-700 dark:text-gray-300">
                            <thead className="text-gray-400 border-b border-gray-100 dark:border-white/5 uppercase text-[10px] tracking-widest whitespace-nowrap">
                                <tr>
                                    <th className="pb-4 px-2">Applicant Name</th>
                                    <th className="pb-4 px-2">National ID Number</th>
                                    <th className="pb-4 px-2">Request Type</th>
                                    <th className="pb-4 px-2">Document Type</th>
                                    <th className="pb-4 px-2">Request #</th>
                                    <th className="pb-4 px-2">Approval Date</th>
                                    <th className="pb-4 px-2">Status</th>
                                    <th className="pb-4 px-2 font-mono">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQueue.map(item => {
                                    let reqType = 'Issuance';
                                    if (item.document_type?.includes('Replacement')) reqType = 'Replacement';
                                    else if (item.document_type?.includes('Renewal') || item.document_type?.includes('Re-issue')) reqType = 'Renewal';

                                    return (
                                    <tr key={item.print_id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-xs whitespace-nowrap">
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-primary-100 dark:bg-white/5 text-primary-700 dark:text-gold-400 flex items-center justify-center font-black text-[9px] uppercase">{item.applicant_name?.substring(0, 2) || '?'}</div>
                                                <span className="font-bold text-gray-900 dark:text-white">{item.applicant_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2 font-mono text-primary-700 dark:text-gold-400">{item.document_number}</td>
                                        <td className="py-4 px-2">
                                            <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-[10px] uppercase text-gray-600 dark:text-gray-400">{reqType}</span>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className="font-bold uppercase tracking-wider text-[10px]">{item.document_type}</span>
                                        </td>
                                        <td className="py-4 px-2 font-mono text-gray-500">#{item.request_number}</td>
                                        <td className="py-4 px-2 text-gray-500">{new Date(item.request_date).toLocaleDateString()}</td>
                                        <td className="py-4 px-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                                                item.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' 
                                                : 'bg-green-50 border-green-100 text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2">
                                            {item.status === 'pending' ? (
                                                <button onClick={() => setConfirmModal(item.print_id)} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-sm">Mark Printed</button>
                                            ) : (
                                                <span className="text-[10px] font-black uppercase text-gray-400">Printed</span>
                                            )}
                                        </td>
                                    </tr>
                                )})}
                                {filteredQueue.length === 0 && <tr><td colSpan="8" className="py-8 text-center text-gray-500 font-bold">No {filterStatus === 'all' ? '' : filterStatus} printing requests found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {confirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl shadow-premium border border-gray-200 dark:border-white/10 max-w-sm w-full relative">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600">
                            <Printer size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-4 text-center">Confirm Printing</h3>
                        <p className="text-sm font-bold text-gray-500 mb-8 text-center">Are you sure you want to mark this document as printed? This action cannot be undone.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-xl font-black text-xs uppercase">Cancel</button>
                            <button onClick={() => markPrinted(confirmModal)} className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs uppercase shadow-md">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-component: PrintingHistory ---
const PrintingHistory = () => {
    const { t, dir } = useLanguage();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/print-history');
            const data = await res.json();
            if (data.success) setHistory(data.history);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{dir === 'rtl' ? 'سجل الطباعة' : 'Printing History'}</h2>
            <div className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden text-left font-bold text-sm text-gray-700 dark:text-gray-300">
                {loading ? <p>Loading...</p> : (
                    <table className="w-full">
                        <thead className="text-gray-400 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="pb-4">Applicant Name</th>
                                <th className="pb-4">Document Details</th>
                                <th className="pb-4">Printed By</th>
                                <th className="pb-4">Date/Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(item => (
                                <tr key={item.print_id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4">{item.applicant_name}</td>
                                    <td className="py-4">
                                        <p className="uppercase">{item.document_type}</p>
                                        <p className="font-mono text-xs text-gray-500">#{item.document_number}</p>
                                    </td>
                                    <td className="py-4 text-xs">{item.printed_by}</td>
                                    <td className="py-4 text-xs font-mono">{new Date(item.print_date).toLocaleDateString()} {item.print_time}</td>
                                </tr>
                            ))}
                            {history.length === 0 && <tr><td colSpan="4" className="py-8 text-center">No printing history found.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

// --- Sub-component: UserManagement ---
const UserManagement = () => {
    const { t, dir } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState(null);

    const [accountType, setAccountType] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [password, setPassword] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users');
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${editUser.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account_type: accountType, is_active: isActive, password: password || undefined })
            });
            if (response.ok) {
                fetchUsers();
                setEditUser(null);
            }
        } catch (error) {
            console.error('Update failed');
        }
    };

    const resendCredentials = async (username) => {
        if (!confirm(dir === 'rtl' ? 'هل أنت متأكد من إعادة إرسال بيانات الدخول؟' : 'Are you sure you want to resend credentials? This will generate a new password.')) return;
        try {
            const res = await fetch('http://localhost:5000/api/admin/resend-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            if (data.success) {
                alert(dir === 'rtl' ? 'تم الرسال بنجاح' : 'Credentials regenerated and email sent successfully.');
            } else {
                alert(data.message || 'Failed to resend credentials.');
            }
        } catch(e) {
            alert('Error communicating with server.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{dir === 'rtl' ? 'إدارة المستخدمين' : 'User Management'}</h2>
            <div className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden text-left font-bold text-sm text-gray-700 dark:text-gray-300">
                {loading ? <p>Loading...</p> : (
                    <table className="w-full">
                        <thead className="text-gray-400 border-b border-gray-100 dark:border-white/5">
                            <tr>
                                <th className="pb-4">Username</th>
                                <th className="pb-4">Full Name</th>
                                <th className="pb-4">Account Type</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.user_id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-4 font-mono">{u.username}</td>
                                    <td className="py-4">{u.fullName}</td>
                                    <td className="py-4"><span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-[10px] uppercase tracking-widest">{u.account_type}</span></td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-widest ${u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {u.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="py-4 flex gap-2">
                                        <button onClick={() => {
                                            setEditUser(u);
                                            setAccountType(u.account_type);
                                            setIsActive(u.is_active);
                                            setPassword('');
                                        }} className="px-4 py-1.5 bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 rounded-lg text-xs transition-all">Edit</button>
                                        
                                        <button onClick={() => resendCredentials(u.username)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg text-xs transition-all"><Send size={12} /> Resend Credentials</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {editUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
                    <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl shadow-premium border border-gray-200 dark:border-white/10 w-full max-w-md relative">
                        <button onClick={() => setEditUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={20} /></button>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-6">Edit User: {editUser.username}</h3>
                        
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Account Type</label>
                                <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 rounded-xl font-bold text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500">
                                    <option value="citizen">Citizen</option>
                                    <option value="resident">Resident</option>
                                    <option value="employee">Employee</option>
                                    <option value="admin">System Admin</option>
                                    <option value="Ministry Health Admin">Ministry Health Admin</option>
                                    <option value="Police Officer">Police Officer</option>
                                    <option value="Printing Officer">Printing Officer</option>
                                    <option value="Immigration Officer">Immigration Officer</option>
                                    <option value="Immigration Department Manager">Immigration Manager</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Account Status</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                        <input type="radio" checked={isActive === true} onChange={() => setIsActive(true)} /> Active
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                                        <input type="radio" checked={isActive === false} onChange={() => setIsActive(false)} /> Disabled
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Change Password (Leave blank to keep)</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3 rounded-xl font-bold text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500" placeholder="New Password..." />
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-md transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-component: RevenueDashboard ---
const RevenueDashboard = () => {
    const { dir } = useLanguage();
    const [stats, setStats] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [txType, setTxType] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/revenue/stats');
            const data = await res.json();
            if (data.success) setStats(data.stats);
        } catch (e) { console.error(e); } finally { setStatsLoading(false); }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (search) params.set('search', search);
            if (txType) params.set('transaction_type', txType);
            if (fromDate) params.set('from', fromDate);
            if (toDate) params.set('to', toDate);
            const res = await fetch(`http://localhost:5000/api/admin/revenue?${params}`);
            const data = await res.json();
            if (data.success) { setRecords(data.records); setTotalPages(data.pages); setTotal(data.total); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchRecords(); }, [page, txType, fromDate, toDate]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchRecords(); };
    const fmt = (n) => `$${parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`;

    const statCards = [
        { label: dir === 'rtl' ? 'إجمالي الإيرادات' : 'Grand Total', value: fmt(stats?.grand_total), icon: DollarSign, color: 'gold' },
        { label: dir === 'rtl' ? 'هذا الشهر' : 'This Month', value: fmt(stats?.monthly), icon: TrendingUp, color: 'blue' },
        { label: dir === 'rtl' ? 'هذا العام' : 'This Year', value: fmt(stats?.yearly), icon: BarChart2, color: 'green' },
        { label: dir === 'rtl' ? 'إيرادات الهوية' : 'National ID Revenue', value: fmt(stats?.national_id_total), icon: CreditCard, color: 'purple' },
        { label: dir === 'rtl' ? 'إيرادات الجواز' : 'Passport Revenue', value: fmt(stats?.passport_total), icon: Plane, color: 'amber' },
        { label: dir === 'rtl' ? 'إيرادات التجديد' : 'Renewal Revenue', value: fmt(stats?.renewal_total), icon: RotateCw, color: 'teal' },
        { label: dir === 'rtl' ? 'إيرادات بدل فاقد' : 'Replacement Revenue', value: fmt(stats?.replacement_total), icon: RefreshCcw, color: 'red' },
    ];
    const colorMap = { gold: 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400', blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400', purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400', amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', teal: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400', red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{dir === 'rtl' ? 'لوحة الإيرادات' : 'Revenue Dashboard'}</h2>

            {/* Stats cards */}
            {statsLoading ? <p className="text-gray-500">Loading stats...</p> : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {statCards.map((card, i) => (
                        <div key={i} className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-primary-200 dark:hover:border-white/10 transition-all">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[card.color]}`}><card.icon size={22} /></div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{card.label}</p>
                                <p className="text-base font-black text-gray-900 dark:text-white truncate">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
                    <div className="relative flex-1 min-w-[160px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={dir === 'rtl' ? 'بحث...' : 'Search applicant, service...'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500" />
                    </div>
                    <select value={txType} onChange={e => { setTxType(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500">
                        <option value="">{dir === 'rtl' ? 'كل الأنواع' : 'All Types'}</option>
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                    </select>
                    <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500" />
                    <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500" />
                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">{dir === 'rtl' ? 'بحث' : 'Search'}</button>
                    <button type="button" onClick={() => { setSearch(''); setTxType(''); setFromDate(''); setToDate(''); setPage(1); fetchRecords(); }} className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">{dir === 'rtl' ? 'إعادة' : 'Reset'}</button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{total} {dir === 'rtl' ? 'معاملة' : 'Transactions'}</span>
                </div>
                {loading ? <p className="text-gray-500 text-sm font-bold py-8 text-center">Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold text-sm text-gray-700 dark:text-gray-300">
                            <thead className="text-gray-400 border-b border-gray-100 dark:border-white/5 text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'النوع' : 'Type'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'الخدمة' : 'Service'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'المبلغ' : 'Amount'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'المتقدم' : 'Applicant'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'رقم الهوية' : 'ID Number'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'التاريخ' : 'Date'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'الحالة' : 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(r => (
                                    <tr key={r.revenue_id} className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-xs">
                                        <td className="py-3.5 px-2"><span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-[9px] uppercase tracking-wider">{r.transaction_type}</span></td>
                                        <td className="py-3.5 px-2 font-bold text-gray-900 dark:text-white">{r.service_name}</td>
                                        <td className="py-3.5 px-2 font-black text-green-600 dark:text-green-400">${parseFloat(r.amount).toFixed(2)}</td>
                                        <td className="py-3.5 px-2">{r.applicant_name || '—'}</td>
                                        <td className="py-3.5 px-2 font-mono text-primary-600 dark:text-gold-400">{r.id_number || '—'}</td>
                                        <td className="py-3.5 px-2 text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                                        <td className="py-3.5 px-2"><span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{r.status}</span></td>
                                    </tr>
                                ))}
                                {records.length === 0 && <tr><td colSpan="7" className="py-8 text-center text-gray-400 font-bold">{dir === 'rtl' ? 'لا توجد سجلات إيرادات.' : 'No revenue records found.'}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{page} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-component: ActivityLogs ---
const ActivityLogs = () => {
    const { dir } = useLanguage();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ eventTypes: [], modules: [], accountTypes: [] });
    const [search, setSearch] = useState('');
    const [eventType, setEventType] = useState('');
    const [moduleName, setModuleName] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedLog, setSelectedLog] = useState(null);

    const eventColorMap = {
        REQUEST_APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        REQUEST_REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        REQUEST_UPDATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        DOCUMENT_PRINTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        LOGIN: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-400',
    };
    const getEventColor = (type) => eventColorMap[type] || 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400';

    const fetchMeta = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/logs/meta');
            const data = await res.json();
            if (data.success) setMeta(data);
        } catch (e) { console.error(e); }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 50 });
            if (search) params.set('search', search);
            if (eventType) params.set('event_type', eventType);
            if (moduleName) params.set('module_name', moduleName);
            if (fromDate) params.set('from', fromDate);
            if (toDate) params.set('to', toDate);
            const res = await fetch(`http://localhost:5000/api/admin/logs?${params}`);
            const data = await res.json();
            if (data.success) { setLogs(data.logs); setTotalPages(data.pages); setTotal(data.total); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchMeta(); }, []);
    useEffect(() => { fetchLogs(); }, [page, eventType, moduleName, fromDate, toDate]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchLogs(); };
    const handleReset = () => { setSearch(''); setEventType(''); setModuleName(''); setFromDate(''); setToDate(''); setPage(1); };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{dir === 'rtl' ? 'سجلات النظام' : 'Activity Logs'}</h2>
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                    <Terminal size={16} className="text-primary-500" />
                    {total} {dir === 'rtl' ? 'سجل' : 'Records'}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={dir === 'rtl' ? 'بحث في السجلات...' : 'Search logs...'} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500" />
                    </div>
                    <select value={eventType} onChange={e => { setEventType(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500">
                        <option value="">{dir === 'rtl' ? 'كل الأحداث' : 'All Events'}</option>
                        {meta.eventTypes.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <select value={moduleName} onChange={e => { setModuleName(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500">
                        <option value="">{dir === 'rtl' ? 'كل الوحدات' : 'All Modules'}</option>
                        {meta.modules.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500" />
                    <input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(1); }} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500" />
                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">{dir === 'rtl' ? 'بحث' : 'Search'}</button>
                    <button type="button" onClick={handleReset} className="bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">{dir === 'rtl' ? 'إعادة' : 'Reset'}</button>
                </form>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden">
                {loading ? <p className="text-center text-sm text-gray-500 font-bold py-8">Loading logs...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-bold text-sm text-gray-700 dark:text-gray-300">
                            <thead className="text-gray-400 border-b border-gray-100 dark:border-white/5 text-[10px] uppercase tracking-widest">
                                <tr>
                                    <th className="pb-4 px-2">ID</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'الحدث' : 'Event'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'الوحدة' : 'Module'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'المستخدم' : 'User'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'الوصف' : 'Description'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'التاريخ' : 'Date & Time'}</th>
                                    <th className="pb-4 px-2">{dir === 'rtl' ? 'عرض' : 'Detail'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.log_id} className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-xs">
                                        <td className="py-3 px-2 font-mono text-gray-400">#{log.log_id}</td>
                                        <td className="py-3 px-2"><span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${getEventColor(log.event_type)}`}>{log.event_type}</span></td>
                                        <td className="py-3 px-2 text-gray-500">{log.module_name}</td>
                                        <td className="py-3 px-2 text-gray-900 dark:text-white">{log.username || '—'}</td>
                                        <td className="py-3 px-2 max-w-xs truncate" title={log.description}>{log.description}</td>
                                        <td className="py-3 px-2 text-gray-400 whitespace-nowrap">{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</td>
                                        <td className="py-3 px-2">
                                            <button onClick={() => setSelectedLog(log)} className="p-1.5 bg-gray-100 dark:bg-white/5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 rounded-lg transition-all"><Eye size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && <tr><td colSpan="7" className="py-8 text-center text-gray-400 font-bold">{dir === 'rtl' ? 'لا توجد سجلات.' : 'No logs found.'}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 disabled:opacity-40"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{page} / {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 disabled:opacity-40"><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
                    <div className="bg-white dark:bg-primary-900 p-8 rounded-2xl shadow-premium border border-gray-200 dark:border-white/10 w-full max-w-lg relative">
                        <button onClick={() => setSelectedLog(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={20} /></button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-600"><ScrollText size={20} /></div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">{dir === 'rtl' ? 'تفاصيل السجل' : 'Log Detail'}</h3>
                                <p className="text-[10px] font-bold text-gray-400">#{selectedLog.log_id}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Event Type', value: selectedLog.event_type },
                                { label: 'Module', value: selectedLog.module_name },
                                { label: 'Description', value: selectedLog.description },
                                { label: 'User ID', value: selectedLog.user_id || '—' },
                                { label: 'Username', value: selectedLog.username || '—' },
                                { label: 'Account Type', value: selectedLog.account_type || '—' },
                                { label: 'IP Address', value: selectedLog.ip_address || '—' },
                                { label: 'Date & Time', value: selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString() : '—' },
                                { label: 'Metadata', value: selectedLog.metadata || '—' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-28 shrink-0 pt-0.5">{item.label}</span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white break-all">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-component: EmailDiagnostics ---
const EmailDiagnostics = () => {
    const { dir } = useLanguage();
    const [testEmail, setTestEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleTest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('http://localhost:5000/api/admin/email-diagnostics/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testEmail })
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ success: false, message: 'Server connection error.', error: err.message, diagnosticLogs: [] });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Email Diagnostics</h2>
            
            <div className="bg-white dark:bg-[#020617] border border-gray-200 dark:border-white/5 rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
                <form onSubmit={handleTest} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Send Test Email To</label>
                        <input required type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="admin@example.com" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary-500" />
                    </div>
                    <button disabled={loading || !testEmail} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                        <Send size={16} />
                        {loading ? 'Testing Server...' : 'Send Test Email'}
                    </button>
                </form>

                {result && (
                    <div className={`p-6 rounded-xl border ${result.success ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-500/20' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-500/20'} animate-fade-in`}>
                        <div className="flex items-center gap-3 mb-4">
                            {result.success ? <CheckCircle2 className="text-green-500" /> : <ShieldAlert className="text-red-500" />}
                            <h3 className={`text-lg font-black ${result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                {result.message}
                            </h3>
                        </div>
                        {result.error && (
                            <div className="mb-4 p-4 bg-white dark:bg-black/30 rounded-lg text-xs font-mono text-red-600 dark:text-red-400 overflow-x-auto">
                                <strong>Exact SMTP Error: </strong> {result.error}
                            </div>
                        )}
                        {result.diagnosticLogs && result.diagnosticLogs.length > 0 && (
                            <div>
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 dark:border-white/10 pb-2">Diagnostic Timeline</h4>
                                <ul className="space-y-2 mt-4 font-mono text-xs">
                                    {result.diagnosticLogs.map((log, i) => (
                                        <li key={i} className="flex gap-3 text-gray-600 dark:text-gray-300 items-start">
                                            <span className="text-primary-500">[{new Date().toLocaleTimeString()}]</span> 
                                            <span>{log}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

<<<<<<< HEAD
// --- RoleRoute guard for admin subroutes ---
const RoleRoute = ({ element, allowed }) => {
    const u = localStorage.getItem('user');
    const role = u ? JSON.parse(u).account_type : null;
    if (!role || !allowed.includes(role)) {
        return <Navigate to="/admin" replace />;
    }
    return element;
};

=======
>>>>>>> 4947b7bbaec0583c251108c81b38ddc676e71bd5
// --- Main Admin Dashboard ---
const AdminDashboard = () => {
    const { t, dir, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    // Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/me');
                const data = await res.json();
                if (data.success && data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    const adminRoles = ['Printing_Officer', 'Immigration_Officer', 'Immigration_Department_Manager', 'admin'];
                    if (!adminRoles.includes(data.user.account_type)) {
                        navigate('/home');
                    }
                } else {
                    localStorage.removeItem('user');
                    navigate('/');
                }
            } catch (err) {
                const u = localStorage.getItem('user');
                if (!u) {
                    navigate('/');
                    return;
                }
                const user = JSON.parse(u);
                const adminRoles = ['Printing_Officer', 'Immigration_Officer', 'Immigration_Department_Manager', 'admin'];
                if (!adminRoles.includes(user.account_type)) {
                    navigate('/home');
                }
            }
        };
        checkAuth();
    }, [navigate]);

    // Dynamic pending badge
    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/requests/pending-count');
                const data = await res.json();
                if (data.success) setPendingCount(data.count);
            } catch (e) { /* silent */ }
        };
        fetchPending();
        const interval = setInterval(fetchPending, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const languages = [
        { code: 'ar', label: 'العربية', flag: '🇸🇴' },
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'so', label: 'Soomaali', flag: '🇸🇴' },
    ];

    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a101f]' : 'bg-[#f4f7f9]'}`}>
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} pendingCount={pendingCount} />

            <div className={`flex-grow flex flex-col transition-all duration-500 ${dir === 'rtl' ? 'lg:mr-72' : 'lg:ml-72'}`}>

                <header className="bg-white/95 dark:bg-[#020617]/95 backdrop-blur-2xl border-b border-gray-200 dark:border-white/5 py-4 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-primary-900 dark:text-white bg-gray-100 dark:bg-white/5 rounded-lg transition-all"><Menu size={20} /></button>
                        <div>
                            <h1 className="text-sm font-black text-gray-900 dark:text-white tracking-widest uppercase">IMMIGRATION COMMAND</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                                <span className="text-[9px] font-black text-gray-500 dark:text-primary-200 uppercase tracking-widest">Secure Link Active</span>
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Language Switcher */}
                        <div className="relative">
                            <button
                                onClick={() => setLangMenuOpen(v => !v)}
                                className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gold-400 border border-transparent dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                title="Switch Language"
                            >
                                <Globe size={18} />
                                <span className="text-xs font-black hidden sm:block">{language.toUpperCase()}</span>
                                <ChevronDown size={12} />
                            </button>
                            {langMenuOpen && (
                                <div className={`absolute top-full mt-2 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-44 bg-white dark:bg-[#020617] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 p-2 z-50 animate-fade-in`}>
                                    {languages.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); localStorage.setItem('admin_lang', lang.code); }}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                                language === lang.code
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="text-base">{lang.flag}</span>
                                            {lang.label}
                                            {language === lang.code && <Check size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gold-400 border border-transparent dark:border-white/10 hover:bg-gray-200 transition-all">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
                        <div className="group relative">
                            <div className="bg-white/95 dark:bg-primary-900/20 p-1.5 ltr:pr-4 rtl:pl-4 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-3 cursor-pointer hover:border-primary-400 transition-all shadow-sm">
                                <div className="w-8 h-8 rounded-lg bg-primary-900 flex items-center justify-center text-gold-400 font-black shadow-lg overflow-hidden border border-white/10">
                                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" alt="Admin" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-[12px] font-black text-gray-900 dark:text-white leading-none">{userData.full_name || userData.username || 'System Admin'}</p>
                                    <p className="text-[9px] font-bold text-gray-500 dark:text-gold-400 uppercase tracking-widest mt-1">{userData.role || 'Administrator'}</p>
                                </div>
                            </div>
                            <div className={`absolute top-full ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-56 bg-white dark:bg-[#020617] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 z-50`}>
                                <Link to="/admin/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-600 hover:text-white rounded-lg text-xs font-bold text-gray-700 dark:text-white transition-all"><UserCircle size={16} /> Profile</Link>
                                <hr className="border-gray-100 dark:border-white/5 my-1.5" />
                                <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-red-600 transition-all"><LogOut size={16} /> Sign Out</button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8 md:p-10 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<DashboardOverview />} />
<<<<<<< HEAD
                        <Route path="/requests" element={<RoleRoute element={<RequestsApproval />} allowed={['admin', 'Immigration_Officer', 'Immigration_Department_Manager']} />} />
                        <Route path="/passports" element={<RoleRoute element={<PassportIssuance />} allowed={['admin', 'Immigration_Officer']} />} />
                        <Route path="/register" element={<RoleRoute element={<CitizenRegistration />} allowed={['admin', 'Immigration_Department_Manager']} />} />
                        <Route path="/register-resident" element={<RoleRoute element={<ResidentRegistration />} allowed={['admin', 'Immigration_Department_Manager']} />} />
                        <Route path="/issue-id" element={<RoleRoute element={<IssueIDCard />} allowed={['admin']} />} />
                        <Route path="/renew-id" element={<RoleRoute element={<IdentityRenewal />} allowed={['admin']} />} />
                        <Route path="/renew-passport" element={<RoleRoute element={<PassportRenewal />} allowed={['admin', 'Immigration_Officer']} />} />
                        <Route path="/search-id" element={<RoleRoute element={<IdentitySearch />} allowed={['admin', 'Immigration_Department_Manager']} />} />
                        <Route path="/search-passport" element={<RoleRoute element={<PassportSearch />} allowed={['admin', 'Immigration_Officer', 'Immigration_Department_Manager']} />} />
                        <Route path="/birth-certificates" element={<RoleRoute element={<BirthCertificateServices dir={dir} lang={language} />} allowed={['admin', 'Immigration_Officer', 'Immigration_Department_Manager']} />} />
                        <Route path="/print-id" element={<RoleRoute element={<PrintIdentity />} allowed={['admin', 'Printing_Officer']} />} />
                        <Route path="/print-passport" element={<RoleRoute element={<PrintPassport />} allowed={['admin', 'Printing_Officer']} />} />
                        <Route path="/printing-queue" element={<RoleRoute element={<PrintingQueue />} allowed={['admin', 'Printing_Officer']} />} />
                        <Route path="/printing-history" element={<RoleRoute element={<PrintingHistory />} allowed={['admin', 'Printing_Officer']} />} />
                        <Route path="/revenue" element={<RoleRoute element={<RevenueDashboard />} allowed={['admin']} />} />
                        <Route path="/logs" element={<RoleRoute element={<ActivityLogs />} allowed={['admin']} />} />
                        <Route path="/users" element={<RoleRoute element={<UserManagement />} allowed={['admin']} />} />
                        <Route path="/email-diagnostics" element={<RoleRoute element={<EmailDiagnostics />} allowed={['admin']} />} />
=======
                        <Route path="/requests" element={<RequestsApproval />} />
                        <Route path="/passports" element={<PassportIssuance />} />
                        <Route path="/register" element={<CitizenRegistration />} />
                        <Route path="/register-resident" element={<ResidentRegistration />} />
                        <Route path="/issue-id" element={<IssueIDCard />} />
                        <Route path="/renew-id" element={<IdentityRenewal />} />
                        <Route path="/renew-passport" element={<PassportRenewal />} />
                        <Route path="/search-id" element={<IdentitySearch />} />
                        <Route path="/search-passport" element={<PassportSearch />} />
                        <Route path="/birth-certificates" element={<BirthCertificateServices dir={dir} lang={language} />} />
                        <Route path="/print-id" element={<PrintIdentity />} />
                        <Route path="/print-passport" element={<PrintPassport />} />
                        <Route path="/printing-queue" element={<PrintingQueue />} />
                        <Route path="/printing-history" element={<PrintingHistory />} />
                        <Route path="/revenue" element={<RevenueDashboard />} />
                        <Route path="/logs" element={<ActivityLogs />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/email-diagnostics" element={<EmailDiagnostics />} />
>>>>>>> 4947b7bbaec0583c251108c81b38ddc676e71bd5
                        <Route path="/profile" element={<AdminProfile />} />
                        {/* ─── Reports Routes ─── */}
                        <Route path="/reports/national-id" element={<RoleRoute element={<NationalIDReport />} allowed={['admin']} />} />
                        <Route path="/reports/passport" element={<RoleRoute element={<PassportReport />} allowed={['admin']} />} />
                        <Route path="/reports/revenue" element={<RoleRoute element={<RevenueReport />} allowed={['admin']} />} />
                        <Route path="/reports/printing" element={<RoleRoute element={<PrintingReport />} allowed={['admin']} />} />
                        <Route path="/reports/users" element={<RoleRoute element={<UserReport />} allowed={['admin']} />} />
                        <Route path="/reports/activity-logs" element={<RoleRoute element={<ActivityLogReport />} allowed={['admin']} />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
