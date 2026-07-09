
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ChevronRight, Globe, Check, UserCheck } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

import API_URL from '../config';

const Login = () => {
    const { t, dir, language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLangOpen, setIsLangOpen] = useState(false);
    const langRef = useRef(null);

    const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowRight;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langRef.current && !langRef.current.contains(event.target)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password }) // Using the email state field as username
            });

            const data = await response.json();

            if (data.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));

                const adminRoles = ['Printing_Officer', 'Immigration_Officer', 'Immigration_Department_Manager', 'admin'];
                if (adminRoles.includes(data.user.account_type)) {
                    navigate('/admin');
                } else if (['citizen', 'resident'].includes(data.user.account_type)) {
                    navigate('/home');
                } else {
                    setError('Unauthorized account type.');
                }
            } else {
                setError(data.message || t.invalidCredentials || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection error');
        }
    };

    const languages = [
        { key: 'ar', label: 'العربية', flag: '🇸🇦' },
        { key: 'so', label: 'Soomaali', flag: '🇸🇴' },
        { key: 'en', label: 'English', flag: '🇺🇸' },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative bg-[#0f172a] transition-colors duration-500">

            {/* Premium Language Switcher */}
            <div className="absolute top-6 ltr:left-6 rtl:right-6 z-50" ref={langRef}>
                <button
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300 group"
                >
                    <Globe size={18} className="text-gold-400 group-hover:rotate-12 transition-transform" />
                    <span className="text-xs text-white font-black uppercase tracking-widest">{language}</span>
                    <ChevronRight size={14} className={`text-white/60 transition-transform ${isLangOpen ? 'rotate-90' : ''}`} />
                </button>

                {isLangOpen && (
                    <div className="absolute top-full ltr:left-0 rtl:right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-2 animate-fade-in-up">
                        {languages.map((lang) => (
                            <button
                                key={lang.key}
                                onClick={() => {
                                    setLanguage(lang.key);
                                    setIsLangOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${language === lang.key ? 'bg-primary-900 text-gold-400 font-black' : 'text-gray-700 hover:bg-primary-600 hover:text-white font-bold'
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

            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-primary-950">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900 via-primary-950 to-black z-0"></div>
                <div className="relative z-10 text-center space-y-10 max-w-xl backdrop-blur-sm bg-white/5 p-12 rounded-[3rem] border border-white/10 shadow-2xl">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 bg-gold-500 blur-[40px] opacity-30 rounded-full animate-pulse"></div>
                        <img src="/logo.png" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" alt="Logo" />

                    </div>

                    <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white tracking-tight leading-tight">{t.heroTitle}</h2>
                        <div className="h-1 w-24 bg-gold-500 mx-auto rounded-full"></div>
                        <p className="text-primary-200 text-lg font-light leading-relaxed">{t.heroSubtitle}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                <div className="w-full max-w-[480px] space-y-8 bg-white backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/50 relative z-10 shadow-premium">
                    <div className="text-center lg:text-start">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t.welcomeBack}</h1>
                        <p className="text-gray-500 mt-3 text-base font-medium">{t.loginSubtitle}</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 mt-8">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-sm font-bold animate-shake">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2 group">
                            <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">{t.emailOrId}</label>
                            <div className="relative">
                                <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-14 flex items-center justify-center z-10">
                                    <UserCheck className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={22} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full ltr:pl-14 rtl:pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold text-gray-900"
                                    placeholder="username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center ml-1 mr-1">
                                <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors">{t.password}</label>
                                <Link to="/forgot-password" className="text-xs font-bold text-primary-600 hover:text-primary-800 transition">{t.forgotPassword}</Link>
                            </div>
                            <div className="relative">
                                <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-14 flex items-center justify-center z-10">
                                    <Lock className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={22} />
                                </div>
                                <input type="password" className="w-full ltr:pl-14 rtl:pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold text-gray-900" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-primary-900 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg group/btn">
                            {t.signIn}
                            <ArrowIcon size={22} className={`transition-transform duration-300 ${dir === 'rtl' ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
                        </button>
                    </form>

                    <div className="text-center">
                        <p className="text-gray-600 font-medium">
                            {t.dontHaveAccount}
                            <Link to="/signup" className="font-bold text-primary-700 hover:text-primary-950 mx-2 transition">{t.createAccount}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
