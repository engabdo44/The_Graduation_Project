
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, Globe, ChevronRight, Fingerprint, ScanFace, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const ForgotPassword = () => {
    const { t, dir, language, setLanguage } = useLanguage();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowRight;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row relative bg-[#0f172a]">

            {/* Absolute Language Switcher - Dynamic Position */}
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

                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/30 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-600/20 rounded-full blur-[100px] animate-float"></div>

                <div className="relative z-10 text-center space-y-10 max-w-xl backdrop-blur-sm bg-white/5 p-12 rounded-[3rem] border border-white/10 shadow-2xl">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 bg-gold-500 blur-[40px] opacity-30 rounded-full"></div>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png"
                            alt="Somalia Coat of Arms"
                            className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                            {t.portalName}
                        </h2>
                        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto rounded-full opacity-80"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
                            <Fingerprint className="text-gold-400" size={24} />
                            <span className="text-xs text-primary-200 font-medium uppercase tracking-wider">Secure Recovery</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
                            <ScanFace className="text-gold-400" size={24} />
                            <span className="text-xs text-primary-200 font-medium uppercase tracking-wider">Identity Check</span>
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

                <div className="w-full max-w-[480px] space-y-8 bg-white/90 lg:bg-white backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] lg:shadow-none border border-white/50 relative z-10 transition-all duration-500">

                    {!isSubmitted ? (
                        <>
                            <div className="text-center lg:text-start">
                                {/* Mobile Logo */}
                                <div className="lg:hidden w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-lg">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png"
                                        alt="Somalia Coat of Arms"
                                        className="w-10 h-10 object-contain drop-shadow-md"
                                    />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{t.resetPassword}</h1>
                                <p className="text-gray-500 mt-2 font-medium leading-relaxed">{t.resetSubtitle}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                                <div className="space-y-1.5 group">
                                    <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">{t.emailOrId}</label>
                                    <div className="relative">
                                        <div className="absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-14 flex items-center justify-center z-10">
                                            <Mail className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={22} />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full ltr:pl-14 rtl:pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold text-gray-900 placeholder-gray-400"
                                            placeholder="example@gov.so"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-primary-800 to-primary-600 hover:from-primary-900 hover:to-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-900/20 hover:shadow-primary-900/40 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg group/btn mt-4"
                                >
                                    {t.sendLink}
                                    <ArrowIcon size={22} className={`transition-transform duration-300 ${dir === 'rtl' ? 'rotate-180 group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`} />
                                </button>
                            </form>

                            <div className="text-center pt-4">
                                <Link to="/" className="text-gray-500 font-bold hover:text-primary-700 hover:underline transition">
                                    {t.backToLogin}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 animate-fade-in-up">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                                <CheckCircle2 size={48} className="text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">{t.emailSent}</h2>
                            <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                {t.checkEmail}
                            </p>
                            <Link
                                to="/"
                                className="w-full block bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-primary-700 border border-gray-200 font-bold py-4 rounded-2xl transition-all duration-300"
                            >
                                {t.backToLogin}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
