import React, { useState, useEffect } from 'react';
import { Bell, Info, CheckCircle2, AlertTriangle, Clock, ArrowLeft, ArrowRight, ShieldCheck, Check, Trash2, Search, Filter } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread
    const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

    const fetchNotifications = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const accId = storedUser.citizen_id || storedUser.resident_id || storedUser.user_id;

        try {
            const res = await fetch(`http://localhost:5000/api/notifications?user_id=${accId}&account_type=${storedUser.account_type}`);
            const data = await res.json();
            if (data.success) setNotifications(data.notifications || []);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.notification_id !== id));
        } catch (error) {
            console.error("Failed to delete notification");
        }
    };

    const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' ? true : filterStatus === 'read' ? n.is_read : !n.is_read;
        const matchesDate = dateFilter ? new Date(n.created_at).toISOString().split('T')[0] === dateFilter : true;
        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-primary-950 py-16 px-4 transition-colors duration-500">
            <div className="container mx-auto max-w-4xl">
                <div className="flex items-center gap-6 mb-8">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white hover:bg-primary-600 hover:text-white transition-all">
                        <BackIcon size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t.notifications}</h1>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">مركز التنبيهات وإدارة الرصيد</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-premium mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="البحث في الإشعارات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none text-gray-900 dark:text-white font-bold"
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-gray-900 dark:text-white font-bold cursor-pointer"
                        >
                            <option value="all">كل الحالات</option>
                            <option value="unread">غير مقروءة</option>
                            <option value="read">مقروءة</option>
                        </select>
                        <input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-gray-900 dark:text-white font-bold cursor-pointer uppercase"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((n) => (
                            <div key={n.notification_id} onClick={() => !n.is_read && markAsRead(n.notification_id)} className={`relative bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border shadow-premium hover:border-primary-100 dark:hover:border-gold-500/20 transition-all group overflow-hidden ${n.is_read ? 'border-transparent dark:border-transparent opacity-80' : 'border-primary-200 dark:border-gold-500/20 cursor-pointer'}`}>
                                {!n.is_read && (
                                    <div className="absolute top-0 right-0 w-2 h-full bg-primary-500 dark:bg-gold-500"></div>
                                )}
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary-50 text-primary-600 dark:bg-gold-500/10 dark:text-gold-400">
                                        <Bell size={24} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-black text-gray-900 dark:text-white text-lg">{n.title}</h3>
                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{new Date(n.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{n.message}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!n.is_read && (
                                            <button onClick={(e) => { e.stopPropagation(); markAsRead(n.notification_id); }} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="Mark as Read">
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button onClick={(e) => deleteNotification(n.notification_id, e)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
                            <Bell size={48} className="text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold">لا توجد إشعارات تطابق بحثك أو لم يصلك أي إشعار بعد.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
