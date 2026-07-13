import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Key, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import API_URL from '../config';

const ForgotPassword = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const isAr = dir === 'rtl';

    const [step, setStep] = useState(1);
    
    // Step 1 state
    const [email, setEmail] = useState('');
    
    // Step 2 state
    const [otp, setOtp] = useState('');
    
    // Step 3 state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowRight;

    // Send OTP handler
    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/forgot-password/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (data.success) {
                if (step === 2) {
                    setSuccessMsg(isAr ? 'تم إرسال رمز تحقق جديد.' : 'A new verification code has been sent.');
                } else {
                    setSuccessMsg(data.message || (isAr ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.' : 'A verification code has been sent to your email address.'));
                    setStep(2); // Move to verify code step
                }
            } else {
                setErrorMsg(data.message || (isAr ? 'هذا البريد غير مسجل في نظامنا.' : 'This email is not registered in our system.'));
            }
        } catch (err) {
            setErrorMsg(isAr ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'Server connection error.');
        }
        setLoading(false);
    };

    // Verify OTP handler
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/forgot-password/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otp })
            });
            const data = await response.json();

            if (data.success) {
                setSuccessMsg('');
                setStep(3); // Move to reset password step
            } else {
                setErrorMsg(data.message || (isAr ? 'رمز التحقق غير صحيح.' : 'Invalid verification code.'));
            }
        } catch (err) {
            setErrorMsg(isAr ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'Server connection error.');
        }
        setLoading(false);
    };

    // Reset Password handler
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (newPassword.length < 8) {
            setErrorMsg(isAr ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل.' : 'Password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/forgot-password/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, new_password: newPassword })
            });
            const data = await response.json();

            if (data.success) {
                setSuccessMsg(data.message || (isAr ? 'تم إعادة تعيين كلمة المرور بنجاح.' : 'Password reset successfully.'));
                setStep(4); // Success step
                setTimeout(() => navigate('/'), 3000);
            } else {
                setErrorMsg(data.message || 'Error configuring new password.');
            }
        } catch (err) {
            setErrorMsg(isAr ? 'حدث خطأ أثناء الاتصال بالخادم.' : 'Server connection error.');
        }
        setLoading(false);
    };

    const PasswordInput = ({ label, value, setter, show, setShow }) => (
        <div className="space-y-1.5 group">
            <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                </div>
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className={`w-full bg-gray-50/50 focus:bg-white border border-gray-200 py-4 ${dir === 'rtl' ? 'pr-12 pl-12' : 'pl-12 pr-12'} rounded-2xl outline-none font-bold text-gray-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-300`}
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className={`absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer outline-none ${dir === 'rtl' ? 'left-0 pr-0 pl-4 right-auto' : ''}`}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#0f172a]">
            
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900 via-primary-950 to-black z-0"></div>

            <div className="w-full max-w-[480px] bg-white backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] border border-white/50 relative z-10 transition-all duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-100 shadow-sm">
                        <Lock size={30} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {step === 1 && (isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?')}
                        {step === 2 && (isAr ? 'التحقق من البريد' : 'Verify Code')}
                        {step === 3 && (isAr ? 'كلمة مرور جديدة' : 'Create New Password')}
                        {step === 4 && (isAr ? 'نجاح' : 'Success')}
                    </h1>
                </div>

                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 animate-shake">
                        <AlertCircle className="text-red-500 shrink-0" size={20} />
                        <p className="text-red-700 font-bold text-sm">{errorMsg}</p>
                    </div>
                )}
                
                {successMsg && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 animate-fade-in">
                        <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                        <p className="text-emerald-700 font-bold text-sm">{successMsg}</p>
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div className="space-y-1.5 group">
                            <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">
                                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 w-14 flex items-center justify-center z-10">
                                    <Mail className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={22} />
                                </div>
                                <input
                                    type="email"
                                    className="w-full pl-14 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-semibold text-gray-900"
                                    placeholder="example@gov.so"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-800 to-primary-600 hover:from-primary-900 hover:to-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال رمز التحقق' : 'Send Verification Code')}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
                        <div className="space-y-1.5 group">
                            <label className="text-sm font-bold text-gray-700 group-focus-within:text-primary-600 transition-colors ml-1">
                                {isAr ? 'رمز التحقق' : 'Verification Code'}
                            </label>
                            <div className="relative">
                                <div className="absolute flex inset-y-0 left-0 w-14 items-center justify-center z-10">
                                    <Key className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={22} />
                                </div>
                                <input
                                    type="text"
                                    maxLength="6"
                                    className="w-full pl-14 py-4 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 font-bold text-center tracking-[0.5em] text-gray-900 text-xl"
                                    placeholder="------"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-800 to-primary-600 hover:from-primary-900 hover:to-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (isAr ? 'جاري التحقق...' : 'Verifying...') : (isAr ? 'تحقق' : 'Verify')}
                        </button>

                        <div className="text-center pt-2">
                            <button 
                                type="button" 
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="text-sm font-bold text-primary-600 hover:text-primary-800 transition disabled:opacity-50"
                            >
                                {isAr ? 'إعادة إرسال الرمز' : 'Resend Code'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in">
                        <PasswordInput 
                            label={isAr ? 'كلمة المرور الجديدة' : 'New Password'} 
                            value={newPassword} 
                            setter={setNewPassword} 
                            show={showNew} 
                            setShow={setShowNew} 
                        />
                        <PasswordInput 
                            label={isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} 
                            value={confirmPassword} 
                            setter={setConfirmPassword} 
                            show={showConfirm} 
                            setShow={setShowConfirm} 
                        />

                        <button
                            type="submit"
                            disabled={loading || !newPassword || !confirmPassword}
                            className="w-full bg-gradient-to-r from-primary-800 to-primary-600 hover:from-primary-900 hover:to-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (isAr ? 'جاري التحديث...' : 'Updating...') : (isAr ? 'تأكيد التغيير' : 'Submit')}
                        </button>
                    </form>
                )}

                {step === 4 && (
                    <div className="text-center py-6 animate-fade-in">
                        <Link
                            to="/"
                            className="w-full block bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-primary-700 border border-gray-200 font-bold py-4 rounded-2xl transition-all duration-300"
                        >
                            {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                        </Link>
                    </div>
                )}

                {step !== 4 && (
                    <div className="text-center pt-6">
                        <Link to="/" className="text-gray-500 text-sm font-bold hover:text-primary-700 hover:underline transition">
                            {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
