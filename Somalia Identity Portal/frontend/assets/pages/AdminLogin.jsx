
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight, UserCheck, Key, Globe, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const AdminLogin = () => {
    const { t, dir, language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const [staffId, setStaffId] = useState('');
    const [accessKey, setAccessKey] = useState('');

    const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowRight;

    const handleAdminLogin = (e) => {
        e.preventDefault();
        // Simulate internal staff validation
        navigate('/admin');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">

            {/* Absolute Tech Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                {/* Moving Orbs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-[500px] relative z-10">

                {/* Ministry Branding */}
                <div className="text-center mb-10 animate-fade-in">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png"
                        alt="Somalia Logo"
                        className="w-24 h-24 mx-auto mb-6 drop-shadow-glow-gold filter brightness-125"
                    />
                    <h1 className="text-white text-3xl font-black tracking-tight mb-2 uppercase">{t.adminLoginTitle}</h1>
                    <p className="text-primary-300/60 font-medium text-sm">{t.adminLoginSubtitle}</p>
                </div>

                {/* Login Box */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>

                    <form onSubmit={handleAdminLogin} className="space-y-8">
                        <div className="space-y-3 group">
                            <label className="text-xs font-black text-primary-200 uppercase tracking-widest ml-1">{t.staffId}</label>
                            <div className="relative">
                                <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-14 flex items-center justify-center">
                                    <UserCheck size={22} className="text-primary-400 group-focus-within:text-gold-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full ltr:pl-14 rtl:pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-gold-500 focus:bg-white/10 transition-all font-mono tracking-widest"
                                    placeholder="EMP-XXXX-XXXX"
                                    required
                                    value={staffId}
                                    onChange={(e) => setStaffId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 group">
                            <label className="text-xs font-black text-primary-200 uppercase tracking-widest ml-1">{t.accessKey}</label>
                            <div className="relative">
                                <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-14 flex items-center justify-center">
                                    <Key size={22} className="text-primary-400 group-focus-within:text-gold-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    className="w-full ltr:pl-14 rtl:pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-gold-500 focus:bg-white/10 transition-all font-mono"
                                    placeholder="••••••••••••"
                                    required
                                    value={accessKey}
                                    onChange={(e) => setAccessKey(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-gold-500 hover:bg-gold-600 text-primary-950 font-black py-4 rounded-2xl shadow-glow-gold transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
                            >
                                {t.signIn}
                                <LayoutDashboard size={20} />
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <Link to="/" className="text-primary-400 hover:text-white text-sm font-bold flex items-center justify-center gap-2 group transition-colors">
                            <ArrowIcon size={16} className={`rotate-180 group-hover:-translate-x-1 transition-transform ${dir === 'rtl' ? 'rotate-0' : ''}`} />
                            {t.backToLogin}
                        </Link>
                    </div>
                </div>

                {/* Restricted Warning */}
                <div className="mt-8 flex items-center justify-center gap-3 text-red-400/80 animate-pulse">
                    <Lock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.restrictedArea}</span>
                </div>

            </div>
        </div>
    );
};

export default AdminLogin;
