
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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

                        <div className="group relative">
                            <button className="w-11 h-11 rounded-full bg-primary-900 border-2 border-gold-500/30 flex items-center justify-center text-gold-400 shadow-lg hover:scale-105 transition-transform active:scale-95 overflow-hidden">
                                <UserCircle size={28} />
                            </button>
                            <div className={`absolute top-full ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-3 w-60 bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-[2rem] border border-gray-100 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-3 overflow-hidden backdrop-blur-xl animate-fade-in-up`}>
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white rounded-xl text-[13px] font-bold text-gray-800 dark:text-white transition-all group/prof">
                                    <User size={18} className="text-primary-600 dark:text-gold-500 group-hover:text-white transition-colors" />
                                    {t.profile}
                                </Link>
                                <Link to="/notifications" className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 dark:hover:text-white rounded-xl text-[13px] font-bold text-gray-800 dark:text-white transition-all group/notif">
                                    <Bell size={18} className="text-primary-600 dark:text-gold-500 group-hover:text-white transition-colors" />
                                    {t.notifications}
                                    <span className="ltr:ml-auto rtl:mr-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span>
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
