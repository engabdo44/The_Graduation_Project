
import React from 'react';
import { History, Search, Filter, ArrowLeft, ArrowRight, CheckCircle2, Clock, Printer, Plane, CreditCard, ChevronRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

const RequestsHistory = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();

    const [requests, setRequests] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('');

    React.useEffect(() => {
        const fetchRequests = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (!storedUser.account_type) return;
            const accId = storedUser.citizen_id || storedUser.resident_id || storedUser.user_id;
            try {
                const res = await fetch(`http://localhost:5000/api/user/requests?type=${storedUser.account_type}&id=${accId}`);
                const data = await res.json();
                if (data.success) {
                    setRequests(data.requests || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const filteredRequests = requests.filter(r => {
        const matchSearch = String(r.application_id || '').toLowerCase().includes(search.toLowerCase()) || String(r.service_type || '').replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus ? r.status === filterStatus : true;
        return matchSearch && matchStatus;
    });

    const getProgress = (status) => {
        if (status === 'pending') return 25;
        if (status === 'approved') return 50;
        if (status === 'printing_queue') return 75;
        if (status === 'completed' || status === 'printed') return 100;
        return 0; // rejected and others
    };

    const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-primary-950 py-16 px-4 transition-colors duration-500">
            <div className="container mx-auto max-w-4xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white hover:bg-primary-600 hover:text-white transition-all">
                            <BackIcon size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.myRequests}</h1>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">تتبع نشاط الخدمات والطلبات</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-2xl border border-gray-100 dark:border-white/10">
                        <div className="relative">
                            <Search size={16} className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                className="bg-transparent border-none text-xs font-bold outline-none ltr:pl-10 rtl:pr-10 py-2 w-48 text-gray-900 dark:text-white" 
                                placeholder="Search requests..." 
                            />
                        </div>
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer ltr:pr-2 rtl:pl-2"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="printing_queue">Printing Queue</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400 font-bold">Loading requests...</div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 font-bold">No requests found.</div>
                    ) : (
                        filteredRequests.map((r) => {
                            const isPassport = r.service_type?.includes('PASSPORT');
                            const isBirthCert = r.service_type?.includes('BIRTH');
                            const IconCmp = isPassport ? Plane : (isBirthCert ? FileText : CreditCard);
                            const color = isPassport ? 'blue' : (isBirthCert ? 'green' : 'gold');
                            const progress = getProgress(r.status);
                            
                            return (
                                <div key={r.application_id} className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-white dark:border-white/5 shadow-premium hover:border-primary-100 dark:hover:border-gold-500/20 transition-all">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : (color === 'green' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400')}`}>
                                                <IconCmp size={28} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase">{r.service_type?.replace(/_/g, ' ')}</h3>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: REQ-{r.application_id} • {new Date(r.request_date).toLocaleDateString()} • {r.approval_date ? new Date(r.approval_date).toLocaleDateString() : 'N/A'}</p>
                                                <p className="text-xs font-bold text-primary-600 dark:text-gold-400 mt-1 uppercase tracking-widest">Fee: {r.service_type === 'BIRTH_CERTIFICATE_PDF' ? 'Free' : (r.service_type === 'BIRTH_CERTIFICATE_REPRINT' ? '$10.00' : (r.service_type?.includes('REPLACEMENT') ? '$50.00' : '$100.00'))}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                r.status === 'approved' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 
                                                r.status === 'rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                                                'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                            }`}>
                                                {r.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress Stage</span>
                                            <span className="text-lg font-black text-primary-900 dark:text-gold-400">{progress}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-gray-100 dark:border-white/5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${color === 'blue' ? 'bg-primary-600 shadow-glow-blue' : (color === 'green' ? 'bg-green-500 shadow-glow-green' : 'bg-gold-500 shadow-glow-gold')}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 pt-4">
                                            {['Pending', 'Approved', 'Printing Queue', 'Completed'].map((step, idx) => {
                                                const stepProgress = (idx + 1) * 25;
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-2 text-center">
                                                        <div className={`w-3 h-3 rounded-full ${progress >= stepProgress ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                                                        <span className="text-[8px] font-black text-gray-400 uppercase leading-tight">{step}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* (Print receipt button removed or kept if required elsewhere, but simply maintaining existing box layout below) */}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestsHistory;
