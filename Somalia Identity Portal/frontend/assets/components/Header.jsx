
import React, { useState, useEffect, useRef } from 'react';
import { Globe, Menu, X, ChevronDown, UserCircle, Moon, Sun, CreditCard, Plane, LogOut, User, LayoutGrid, Check, Bell, History } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { t, language, setLanguage, dir } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const langRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);

    const fetchNotifications = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (!storedUser.account_type) return;
        const accId = storedUser.citizen_id || storedUser.resident_id || storedUser.user_id;

        try {
            const res = await fetch(`http://localhost:5000/api/notifications?user_id=${accId}&account_type=${storedUser.account_type}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Optional: Polling every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id, e) => {
        if(e) e.stopPropagation();
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    const markAllAsRead = async (e) => {
        if(e) e.stopPropagation();
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const accId = storedUser.citizen_id || storedUser.resident_id || storedUser.user_id;
        try {
            await fetch('http://localhost:5000/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: accId, account_type: storedUser.account_type })
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark all read");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const languages = [
        { key: 'ar', label: 'العربية', flag: '🇸🇦' },
        { key: 'so', label: 'Soomaali', flag: '🇸🇴' },
        { key: 'en', label: 'English', flag: '🇺🇸' },
    ];

    const NavItem = ({ to, label, icon: Icon, dropdownItems }) => (
        <div className="relative group px-1">
            <Link
                to={to}
                className="flex items-center gap-2 text-[13px] font-black text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-gold-400 transition-all py-2"
            >
                {Icon && <Icon size={16} className="text-primary-600 dark:text-gold-500" />}
                {label}
                {dropdownItems && <ChevronDown size={14} className="group-hover:rotate-180 transition-transform opacity-50" />}
            </Link>

            {dropdownItems && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-[1.5rem] border border-gray-100 dark:border-white/10 p-2 backdrop-blur-xl overflow-hidden animate-fade-in-up">
                        {dropdownItems.map((item, i) => (
                            <Link
                                key={i}
                                to={item.to}
                                className="flex items-center justify-between px-4 py-3 text-[11px] font-bold text-gray-700 dark:text-gray-200 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 rounded-xl transition-all group/item"
                            >
                                <span>{item.label}</span>
                                <div className="w-1.5 h-1.5 bg-gold-500 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'glass-header shadow-premium py-2' : 'bg-white dark:bg-primary-950 py-4'
            }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">

                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition lg:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu size={24} />
                        </button>

                        <Link to="/home" className="flex items-center gap-3 group">
                            <img src="/logo.png" alt="Somalia Logo" className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />


                            <div className="flex flex-col">

                                <span className="font-bold text-gray-900 dark:text-white text-sm md:text-base tracking-tight leading-tight">
                                    {t.portalName}
                                </span>
                                <span className="hidden md:block text-[8px] font-black text-gold-600 uppercase tracking-[0.2em]">
                                    Federal Republic of Somalia
                                </span>
                            </div>
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-6">
                        <NavItem
                            to="#"
                            label={t.idServices}
                            icon={CreditCard}
                            dropdownItems={[
                                { to: "/service/id-renew", label: t.services.idRenew },
                                { to: "/service/id-replace", label: t.replaceCombined }
                            ]}
                        />
                        <NavItem
                            to="#"
                            label={t.passportServices}
                            icon={Plane}
                            dropdownItems={[
                                { to: "/service/passport-renew", label: t.services.pptRenew },
                                { to: "/service/passport-replace", label: t.replaceCombined }
                            ]}
                        />
                        <NavItem
                            to="/services"
                            label={t.allServices}
                            icon={LayoutGrid}
                        />
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="p-3 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gold-400 border border-gray-200 dark:border-white/10 hover:bg-primary-50 transition-all shadow-sm flex items-center gap-2 group"
                            >
                                <Globe size={20} className="group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black uppercase hidden sm:block">{language}</span>
                            </button>

                            {isLangOpen && (
                                <div className={`absolute top-full ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-3 w-44 bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-[1.5rem] border border-gray-100 dark:border-white/10 p-2 backdrop-blur-xl animate-fade-in-up z-[100]`}>
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.key}
                                            onClick={() => {
                                                setLanguage(lang.key);
                                                setIsLangOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${language === lang.key
                                                ? 'bg-primary-900 text-gold-400 font-black'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 rounded-xl font-bold'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 text-xs">
                                                <span>{lang.flag}</span>
                                                <span>{lang.label}</span>
                                            </div>
                                            {language === lang.key && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-3 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gold-400 border border-gray-200 dark:border-white/10 hover:bg-primary-50 transition-all shadow-sm"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-3 rounded-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gold-400 border border-gray-200 dark:border-white/10 hover:bg-primary-50 transition-all shadow-sm"
                            >
                                <Bell size={20} />
                                {notifications.filter(n => !n.is_read).length > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-900 animate-pulse">
                                        {notifications.filter(n => !n.is_read).length}
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className={`absolute top-full ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-3 w-80 bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-[1.5rem] border border-gray-100 dark:border-white/10 overflow-hidden backdrop-blur-xl animate-fade-in-up z-[100]`}>
                                    <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                                        <h3 className="font-black text-gray-900 dark:text-white text-sm">الإشعارات</h3>
                                        <button onClick={markAllAsRead} className="text-[10px] text-primary-600 dark:text-gold-400 font-bold hover:underline">تحديد الكل كمقروء</button>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto no-scrollbar pb-2">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-gray-400 text-xs font-bold">لا توجد إشعارات جديدة</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.notification_id} onClick={() => !n.is_read && markAsRead(n.notification_id)} className={`p-4 border-b border-gray-50 dark:border-white/5 last:border-0 cursor-pointer transition-colors ${n.is_read ? 'opacity-60' : 'bg-primary-50/50 dark:bg-primary-900/20'}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[11px] font-black text-gray-900 dark:text-white">{n.title}</span>
                                                        <span className="text-[9px] text-gray-400 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-relaxed">{n.message}</p>
                                                    {!n.is_read && (
                                                        <div className="mt-2 flex justify-end">
                                                            <button onClick={(e) => markAsRead(n.notification_id, e)} className="text-[9px] text-primary-600 dark:text-gold-500 font-bold hover:underline border border-primary-200 dark:border-gold-500/30 px-2 py-0.5 rounded-full">مقروء</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-center">
                                        <Link to="/notifications" onClick={() => setIsNotifOpen(false)} className="text-[11px] font-black text-primary-900 dark:text-white hover:text-primary-600 transition-colors">عرض كل الإشعارات</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="group relative">
                            <button className="w-11 h-11 rounded-full bg-primary-900 border-2 border-gold-500/30 flex items-center justify-center text-gold-400 shadow-lg hover:scale-105 transition-transform active:scale-95 overflow-hidden">
                                <UserCircle size={28} />
                            </button>
                            <div className={`absolute top-full ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-3 w-60 bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-[2rem] border border-gray-100 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-3 overflow-hidden backdrop-blur-xl animate-fade-in-up`}>
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white rounded-xl text-[13px] font-bold text-gray-800 dark:text-white transition-all group/prof">
                                    <User size={18} className="text-primary-600 dark:text-gold-500 group-hover:text-white transition-colors" />
                                    {t.profile}
                                </Link>
                                <Link to="/notifications" className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white rounded-xl text-[13px] font-bold text-gray-800 dark:text-white transition-all group/notif">
                                    <div className="flex items-center gap-3">
                                        <Bell size={18} className="text-primary-600 dark:text-gold-500 group-hover:text-white transition-colors" />
                                        {t.notifications}
                                    </div>
                                    {notifications.filter(n => !n.is_read).length > 0 && (
                                        <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{notifications.filter(n => !n.is_read).length}</span>
                                    )}
                                </Link>
                                <Link to="/requests" className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white rounded-xl text-[13px] font-bold text-gray-800 dark:text-white transition-all group/hist">
                                    <History size={18} className="text-primary-600 dark:text-gold-500 group-hover:text-white transition-colors" />
                                    {t.myRequests}
                                </Link>
                                <hr className="border-gray-50 dark:border-white/5 my-2" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white rounded-xl text-[13px] font-bold text-red-600 transition-all group/out"
                                >
                                    <LogOut size={18} className="group-hover:text-white transition-colors" />
                                    {t.logout}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
