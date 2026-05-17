
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, FileText, ArrowRight, Shield, Globe, ChevronRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

import API_URL from '../config';

const SignUp = () => {
    const { t, dir, language, setLanguage } = useLanguage();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        nationalId: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowRight;

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError(t.passwordMismatch || 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password,
                    fullName: form.fullName,
                    email: form.email,
                    phoneNumber: form.phone,
                    nationalId: form.nationalId
                })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/home');
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative bg-[#0f172a]">

            {/* Absolute Language Switcher - Dynamic Position */}
            {/* Changed ltr:right-6/rtl:left-6 TO ltr:left-6/rtl:right-6 */}
            <div className="absolute top-6 ltr:left-6 rtl:right-6 z-50 transition-all duration-300">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
                    <Globe size={16} className="text-gold-400" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent text-sm text-white font-bold outline-none cursor-pointer appearance-none text-center min-w-[70px] [&>option]:text-gray-900"
                    >
                        <option value="ar">العربية</option>
                        <option value="so">Somali</option>
                        <option value="en">English</option>
                    </select>
                    <ChevronRight size={14} className="text-white/60 rotate-90" />
                </div>
            </div>

            {/* Left Side (Visuals) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-primary-950">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary-900 via-primary-950 to-black z-0"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                {/* Animated Orbs */}
                <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gold-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-float"></div>

                <div className="relative z-10 text-center space-y-10 max-w-xl backdrop-blur-sm bg-white/5 p-12 rounded-[3rem] border border-white/10 shadow-2xl">
                    <div className="relative w-28 h-28 mx-auto">
                        <div className="absolute inset-0 bg-primary-400 blur-[40px] opacity-20 rounded-full"></div>
                        <img
                            src="/logo.svg"
                            alt="Somalia Coat of Arms"
                            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                        />

                    </div>
                    <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
                        {t.createAccount}
                    </h2>
                    <p className="text-primary-200 text-lg font-light leading-relaxed">
                        {t.heroSubtitle}
                    </p>

                    <div className="pt-6">
                        <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 text-gold-400 text-xs font-bold uppercase tracking-widest">
                            <Shield size={14} /> Official Registration
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">

                {/* Mobile Background */}
                <div className="lg:hidden absolute inset-0 bg-primary-950 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/50 to-primary-950 z-0"></div>
                </div>

                <div className="w-full max-w-[550px] space-y-8 bg-white/90 lg:bg-white backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] lg:shadow-none border border-white/50 relative z-10">
                    <div className="text-center lg:text-start">
                        {/* Mobile Logo */}
                        <div className="lg:hidden w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-lg">
                            <img
                                src="/logo.svg"
                                alt="Somalia Coat of Arms"
                                className="w-10 h-10 object-contain drop-shadow-md"
                            />

                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{t.createAccount}</h1>
                        <p className="text-gray-500 mt-2 font-medium">{t.signupSubtitle}</p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-5 mt-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-sm font-bold animate-shake text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5 group">
                            <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">{t.fullName}</label>
                            <div className="relative">
                                <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                                    <User className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full ltr:pl-12 rtl:pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold text-gray-900"
                                    placeholder="Ahmed Mohamed"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 group">
                                <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">{t.nationalIdOptional}</label>
                                <div className="relative">
                                    <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                                        <FileText className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full ltr:pl-12 rtl:pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold"
                                        placeholder="SO-123-456"
                                        value={form.nationalId}
                                        onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 group">
                                <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">{t.phoneNumber}</label>
                                <div className="relative">
                                    <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                                        <Phone className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="tel"
                                        className="w-full ltr:pl-12 rtl:pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold"
                                        placeholder="+252 61 XXX"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 group">
                                <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">Username</label>
                                <div className="relative">
                                    <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                                        <User className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full ltr:pl-12 rtl:pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold"
                                        placeholder="username"
                                        value={form.username}
                                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 group">
                                <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">Email</label>
                                <div className="relative">
                                    <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                                        <Mail className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full ltr:pl-12 rtl:pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold"
                                        placeholder="example@gov.so"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 group">
                                <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">{t.password}</label>
                                <div className="relative">
                                    <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                                        <Lock className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full ltr:pl-12 rtl:pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 group">
                                <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">{t.confirmPassword}</label>
                                <div className="relative">
                                    <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10">
                                        <Lock className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full ltr:pl-12 rtl:pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold"
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                            <input type="checkbox" id="terms" className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 cursor-pointer" required />
                            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none font-medium">{t.agreeToTerms}</label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-600 hover:to-gold-600 text-white font-black py-4 rounded-xl shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 mt-4 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : t.signUp}
                            <ArrowIcon size={20} className={`transition-transform duration-300 ${dir === 'rtl' ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-gray-600 font-medium">
                            Already have an account?
                            <Link to="/" className="font-bold text-primary-700 hover:text-primary-900 hover:underline mx-2 transition">
                                {t.signIn}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
