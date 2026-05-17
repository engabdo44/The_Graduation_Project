
import React, { useState } from 'react';
import {
    Users, FileText, CheckCircle2, XCircle, Clock,
    TrendingUp, DollarSign, ShieldAlert, MoreVertical,
    Search, Filter, Download, LayoutDashboard, Database,
    Settings, Activity, Eye, Check, X, UserPlus, Plane,
    Globe, LogOut, UserCircle, Briefcase, ChevronRight, Menu,
    ScanFace, Fingerprint, ShieldCheck, CreditCard, Landmark,
    Sparkles, Cpu, MapPin, Shield, Award, AlertCircle, Trash2,
    FileSearch, Moon, Sun, ArrowUpRight, ArrowDownRight, Send, Camera, BookOpen, RotateCw, RefreshCcw
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { Link, useNavigate, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';

// --- Sub-component: AdminSidebar ---
const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const { t, dir } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/admin', label: t.sideDashboard, icon: LayoutDashboard },
        { path: '/admin/requests', label: t.sideRequests, icon: FileSearch, badge: '12' },
        { path: '/admin/register', label: 'Register Citizen', icon: UserPlus },
        { path: '/admin/register-resident', label: 'Register Resident', icon: Globe },
        { path: '/admin/issue-id', label: 'Issue ID Card', icon: Landmark },
        { path: '/admin/renew-id', label: dir === 'rtl' ? 'تجديد الهوية' : 'Renew Identity', icon: RotateCw },
        { path: '/admin/passports', label: t.sidePassports, icon: Plane },
        { path: '/admin/renew-passport', label: dir === 'rtl' ? 'تجديد الجواز' : 'Renew Passport', icon: RefreshCcw },
        { path: '/admin/search-id', label: dir === 'rtl' ? 'البحث عن الهوية' : 'Search Identity', icon: ScanFace },
        { path: '/admin/search-passport', label: dir === 'rtl' ? 'البحث عن الجواز' : 'Search Passport', icon: BookOpen },
        { path: '/admin/profile', label: t.sideStaffProfile, icon: Briefcase },
    ];

    const handleLogout = () => navigate('/');

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

// --- Sub-component: Requests Approval View ---
const RequestsApproval = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);

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

    const handleAction = async (id, action) => {
        try {
            const status = action === 'approve' ? 'approved' : 'rejected';
            const res = await fetch(`http://localhost:5000/api/admin/requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                setRequests(prev => prev.map(r => r.application_id.toString() === id.toString() ? { ...r, status } : r));
            }
        } catch (e) { console.error(e); }
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
                    <button className="p-2.5 bg-white dark:bg-primary-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 dark:text-gray-400 hover:text-primary-600 shadow-sm">
                        <Filter size={16} />
                    </button>
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
                            {requests.map((req) => {
                                const reqName = req.citizen?.full_name || req.resident?.full_name || 'Unknown';
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
                                        <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md border border-gray-200 dark:border-white/10 lowercase">{req.service_type.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border ${
                                            req.status === 'under_review' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' :
                                            req.status === 'approved' ? 'bg-green-50 border-green-100 text-green-600 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' :
                                            req.status === 'completed' ? 'bg-teal-50 border-teal-100 text-teal-600 dark:bg-teal-500/10 dark:border-teal-500/20 dark:text-teal-400' :
                                            'bg-red-50 border-red-100 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'under_review' ? 'bg-blue-500 animate-pulse' : req.status === 'completed' ? 'bg-teal-500' : req.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-[9px] font-black uppercase">{req.status.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            {req.status === 'under_review' ? (
                                                <>
                                                    <button onClick={() => handleAction(req.application_id, 'approve')} className="w-8 h-8 bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-600 hover:text-white rounded-lg flex items-center justify-center transition-all border border-green-200 dark:border-green-500/20"><Check size={16} /></button>
                                                    <button onClick={() => handleAction(req.application_id, 'reject')} className="w-8 h-8 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center transition-all border border-red-200 dark:border-red-500/20"><X size={16} /></button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-500">{req.status === 'approved' ? 'Accepted' : req.status === 'completed' ? 'Finalized' : 'Rejected'}</span>
                                                    {req.status === 'approved' && (
                                                        <button 
                                                            onClick={() => {
                                                                const refNum = req.citizen?.national_number || req.resident?.residence_number || '';
                                                                const path = req.service_type.includes('passport') ? '/admin/renew-passport' : '/admin/renew-id';
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
        </div>
    );
};

// --- Sub-component: Dashboard Overview ---
const DashboardOverview = () => {
    const { t } = useLanguage();
    const stats = [
        { label: 'Total Requests', val: '14,284', trend: '+12%', up: true, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Verification', val: '286', trend: '-5%', up: false, icon: Clock, color: 'text-gold-600', bg: 'bg-gold-50' },
        { label: 'Today Approvals', val: '156', trend: '+24%', up: true, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Gov Revenue', val: '$148k', trend: '+8%', up: true, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-primary-900 p-6 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-10 h-10 ${s.bg} dark:bg-white/5 ${s.color} dark:text-white rounded-xl flex items-center justify-center shadow-sm border dark:border-white/10`}>
                                <s.icon size={20} />
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${s.up ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'}`}>
                                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {s.trend}
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest mb-1">{s.label}</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{s.val}</h3>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-black/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-md">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Infrastructure Monitor</h2>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase mt-0.5">Real-time status</p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 bg-white dark:bg-white/5 text-gray-600 dark:text-white rounded-lg text-[10px] font-black border border-gray-200 dark:border-white/10 uppercase tracking-widest">Logs</button>
                    </div>

                    <div className="flex-grow p-12 text-center flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-full border-[6px] border-primary-50 dark:border-white/5 border-t-primary-600 dark:border-t-gold-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Cpu size={32} className="text-primary-600 dark:text-gold-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">Optimizing Data Flows</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-xs max-w-xs leading-relaxed">Processing 1,248 p/s across 12 biometric hubs.</p>
                    </div>
                </div>

                <div className="bg-[#020617] rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border border-white/5">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-xl flex items-center justify-center mb-6 border border-white/10">
                            <Award size={24} className="text-gold-500" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 leading-tight">Identity Guard</h3>
                        <p className="text-primary-100 text-[13px] font-medium leading-relaxed opacity-80">Encryption: <span className="text-gold-400 font-bold">AES-256</span> active on all terminals.</p>
                    </div>
                    <div className="relative z-10 pt-8">
                        <button className="w-full bg-white text-primary-950 font-black py-4 rounded-xl shadow-xl hover:bg-gold-500 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-[0.15em]">
                            Start Security Audit
                        </button>
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

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/admin/issue-passport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceNumber, passportType: passportType.charAt(0) === 'P' ? 'regular' : 'diplomatic' })
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

    const handleNext = () => {
        if (step === 2) {
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
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{t.issuePassport}</h2>
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
                        <div className="space-y-8 animate-fade-in text-center py-6">
                            <h3 className="text-base font-black text-gray-900 dark:text-white mb-6">Biometric Data Capture</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl group hover:border-primary-500 transition-all cursor-pointer bg-gray-50/50 dark:bg-white/5">
                                    <Camera size={32} className="text-primary-600 dark:text-gold-400 mx-auto mb-4" />
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tighter">Live Face Scan</h4>
                                </div>
                                <div className="p-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl group hover:border-primary-500 transition-all cursor-pointer bg-gray-50/50 dark:bg-white/5">
                                    <Fingerprint size={32} className="text-primary-600 dark:text-gold-400 mx-auto mb-4" />
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tighter">10-Fingerprint Sync</h4>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
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
                                                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Holder" />
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
                                                            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Profile" />
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
        maritalStatus: 'single'
    });
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const response = await fetch('http://localhost:5000/api/admin/register-citizen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData(data.citizen);
                // clear form
                setFormData({
                    fullName: '', dob: '', gender: 'male', phone: '', email: '', address: '', maritalStatus: 'single'
                });
            } else {
                setError(data.message || 'Error saving citizen.');
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
                                    <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">System Username:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{successData.generated_username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Temporary Password:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{successData.generated_password}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSuccessData(null)} className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md">
                                    Register Another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
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
                                    {loading ? 'Processing...' : 'Submit & Generate ID'}
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
        email: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const response = await fetch('http://localhost:5000/api/admin/register-resident', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData(data.resident);
                // clear form
                setFormData({
                    fullName: '', dob: '', gender: 'male', nationality: '', passportNumber: '', visaType: '', sponsorName: '', phone: '', email: '', address: ''
                });
            } else {
                setError(data.message || 'Error saving resident.');
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
                                    <div className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">System Username:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{successData.generated_username}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Temporary Password:</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{successData.generated_password}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSuccessData(null)} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-md">
                                    Register Another
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
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
                                    <input required name="nationality" value={formData.nationality} onChange={handleChange} type="text" className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 p-3.5 rounded-xl font-bold text-sm focus:border-primary-500 outline-none text-gray-900 dark:text-white transition-colors" placeholder="e.g. American" />
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
                                    {loading ? 'Processing...' : 'Submit & Generate ID'}
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const response = await fetch('http://localhost:5000/api/admin/issue-id-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceNumber })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData({
                    idCard: data.idCard,
                    person: data.person,
                    message: data.message
                });
                setReferenceNumber(''); // clear form
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
                                                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover grayscale" alt="Hologram" />
                                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Profile Picture & Signature */}
                                                <div className="w-28 flex flex-col items-center justify-between mt-1">
                                                    <div className="w-[100px] h-[130px] bg-slate-200 border border-slate-300 shadow-inner overflow-hidden rounded-sm">
                                                        <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover grayscale" alt="Profile" />
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
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-lg mx-auto border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block text-center">
                                    <ScanFace size={32} className="mx-auto mb-4 text-primary-500" />
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
                                <button type="submit" disabled={loading || !referenceNumber} className="w-full bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                    {loading ? 'Processing...' : 'Verify & Issue ID Card'}
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
                                                            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover grayscale" alt="Hologram" />
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-28 flex flex-col items-center justify-between mt-1">
                                                <div className="w-[100px] h-[130px] bg-slate-200 border border-slate-300 shadow-inner overflow-hidden rounded-sm">
                                                    <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover grayscale" alt="Profile" />
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
                                                <div key={i} onClick={() => setSelectedResult(r)} className="bg-gray-50 dark:bg-black/20 p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex gap-4 transition-all cursor-pointer hover:shadow-xl hover:border-primary-300 hover:scale-[1.02]">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 shadow-sm relative">
                                                        {(!r.idCards || r.idCards.length === 0) && (
                                                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                                                <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full rotate-[-15deg] shadow-lg">Unissued</span>
                                                            </div>
                                                        )}
                                                        <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" className={`w-full h-full object-cover ${(!r.idCards || r.idCards.length === 0) ? 'grayscale opacity-60' : ''}`} alt="Profile" />
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const response = await fetch('http://localhost:5000/api/admin/renew-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceNumber, applicationId: appId })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData(data);
                setReferenceNumber('');
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
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-lg mx-auto border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5">
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

                            <div className="flex justify-center pt-4">
                                <button type="submit" disabled={loading || !referenceNumber} className="w-full bg-primary-600 hover:bg-primary-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                                    {loading ? 'Processing...' : 'Verify & Renew Identity'}
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessData(null);

        try {
            const response = await fetch('http://localhost:5000/api/admin/renew-passport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referenceNumber, passportType, applicationId: appId })
            });

            const data = await response.json();

            if (data.success) {
                setSuccessData(data);
                setReferenceNumber('');
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
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in max-w-lg mx-auto border border-gray-200 dark:border-white/5 p-8 rounded-2xl bg-gray-50/50 dark:bg-white/5">
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
                                    {loading ? 'Processing...' : 'Verify & Renew Passport'}
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
                                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" alt="Holder" />
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
                                                <div key={i} onClick={() => setSelectedResult(r)} className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-4 transition-all cursor-pointer hover:shadow-xl hover:border-blue-300 hover:scale-[1.02]">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-blue-200 dark:border-white/10 shadow-sm">
                                                        <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover" alt="Profile" />
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

// --- Main Admin Dashboard ---
const AdminDashboard = () => {
    const { t, dir } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className={`min-h-screen flex transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0a101f]' : 'bg-[#f4f7f9]'}`}>
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

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

                    <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
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
                        <Route path="/requests" element={<RequestsApproval />} />
                        <Route path="/passports" element={<PassportIssuance />} />
                        <Route path="/register" element={<CitizenRegistration />} />
                        <Route path="/register-resident" element={<ResidentRegistration />} />
                        <Route path="/issue-id" element={<IssueIDCard />} />
                        <Route path="/renew-id" element={<IdentityRenewal />} />
                        <Route path="/passports" element={<PassportIssuance />} />
                        <Route path="/renew-passport" element={<PassportRenewal />} />
                        <Route path="/search-id" element={<IdentitySearch />} />
                        <Route path="/search-passport" element={<PassportSearch />} />
                        <Route path="/profile" element={<AdminProfile />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
