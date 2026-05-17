
import React from 'react';
import { History, Search, Filter, ArrowLeft, ArrowRight, CheckCircle2, Clock, Printer, Plane, CreditCard, ChevronRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

const RequestsHistory = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();

    const requests = [
        {
            id: 'REQ-88210',
            service: t.services.pptRenew,
            date: '12 May 2024',
            status: 'approved',
            progress: 60,
            icon: Plane,
            color: 'blue'
        },
        {
            id: 'REQ-77412',
            service: t.services.idRenew,
            date: '05 May 2024',
            status: 'printing',
            progress: 85,
            icon: CreditCard,
            color: 'gold'
        }
    ];

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
                            <input type="text" className="bg-transparent border-none text-xs font-bold outline-none ltr:pl-10 rtl:pr-10 py-2 w-48 text-gray-900 dark:text-white" placeholder="رقم الطلب..." />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-primary-600"><Filter size={18} /></button>
                    </div>
                </div>

                <div className="space-y-6">
                    {requests.map((r) => (
                        <div key={r.id} className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-white dark:border-white/5 shadow-premium hover:border-primary-100 dark:hover:border-gold-500/20 transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${r.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400'
                                        }`}>
                                        <r.icon size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-gray-900 dark:text-white">{r.service}</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: {r.id} • {r.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${r.status === 'approved' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                        }`}>
                                        {r.status === 'approved' ? t.statusApproved : t.statusPrinting}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مرحلة الإنجاز</span>
                                    <span className="text-lg font-black text-primary-900 dark:text-gold-400">{r.progress}%</span>
                                </div>
                                <div className="h-3 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-gray-100 dark:border-white/5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${r.color === 'blue' ? 'bg-primary-600 shadow-glow-blue' : 'bg-gold-500 shadow-glow-gold'
                                            }`}
                                        style={{ width: `${r.progress}%` }}
                                    ></div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 pt-4">
                                    {[t.statusReview, t.statusApproved, t.statusPrinting, t.statusReady].map((step, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${idx <= (r.progress / 25) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                                            <span className="text-[8px] font-black text-gray-400 uppercase whitespace-nowrap">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 flex justify-end">
                                <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-white/5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 rounded-xl text-xs font-black transition-all">
                                    <Printer size={16} /> طباعة الإيصال
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RequestsHistory;
