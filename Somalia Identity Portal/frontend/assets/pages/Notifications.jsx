
import React from 'react';
import { Bell, Info, CheckCircle2, AlertTriangle, Clock, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();

    const notifications = [
        {
            id: 1,
            title: dir === 'rtl' ? 'تمت الموافقة على طلب الجواز' : 'Passport Application Approved',
            desc: dir === 'rtl' ? 'تم التحقق من بياناتك بنجاح، جاري الآن عملية الطباعة.' : 'Your data has been successfully verified, printing is now in progress.',
            time: '2h ago',
            type: 'success',
            icon: ShieldCheck
        },
        {
            id: 2,
            title: dir === 'rtl' ? 'تذكير بموعد البصمة' : 'Biometrics Appointment Reminder',
            desc: dir === 'rtl' ? 'موعدك غداً في تمام الساعة 10:00 صباحاً في مقر الوزارة.' : 'Your appointment is tomorrow at 10:00 AM at the Ministry headquarters.',
            time: '1d ago',
            type: 'info',
            icon: Clock
        },
        {
            id: 3,
            title: dir === 'rtl' ? 'تحديث أمني' : 'Security Update',
            desc: dir === 'rtl' ? 'تم تسجيل الدخول إلى حسابك من جهاز جديد في مقديشو.' : 'Your account was logged in from a new device in Mogadishu.',
            time: '3d ago',
            type: 'warning',
            icon: AlertTriangle
        }
    ];

    const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-primary-950 py-16 px-4 transition-colors duration-500">
            <div className="container mx-auto max-w-3xl">
                <div className="flex items-center gap-6 mb-12">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white hover:bg-primary-600 hover:text-white transition-all">
                        <BackIcon size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.notifications}</h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">مركز التنبيهات الموحد</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <div key={n.id} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-white dark:border-white/5 shadow-premium hover:border-primary-100 dark:hover:border-gold-500/20 transition-all group cursor-pointer">
                                <div className="flex gap-6 items-start">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400' :
                                            n.type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                                                'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                        }`}>
                                        <n.icon size={24} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-black text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-gold-400 transition-colors">{n.title}</h3>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{n.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{n.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
                            <Bell size={48} className="text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">{t.noNotifications}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
