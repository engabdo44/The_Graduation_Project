import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import API_URL from '../config';

const SetPassword = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isAr = dir === 'rtl';

    // 0 = Loading/Validating, 1 = Invalid Token, 2 = Set Password Form, 3 = Success
    const [step, setStep] = useState(0);
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (!urlToken) {
            setStep(1); // Invalid
            setErrorMsg('This password setup link is invalid or missing.');
            return;
        }
        setToken(urlToken);

        const validateToken = async () => {
            try {
                const response = await fetch(`${API_URL}/user/validate-setup-token?token=${urlToken}`);
                const data = await response.json();
                if (data.success) {
                    setUsername(data.username);
                    setStep(2); // Valid, show form
                } else {
                    setErrorMsg(data.message || 'This password setup link is no longer valid.');
                    setStep(1);
                }
            } catch (err) {
                setErrorMsg('Server connection error while validating token.');
                setStep(1);
            }
        };

        validateToken();
    }, [searchParams]);

    const handleSetupPassword = async (e) => {
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
            const response = await fetch(`${API_URL}/user/setup-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword })
            });
            const data = await response.json();

            if (data.success) {
                setSuccessMsg(data.message);
                setStep(3); // Success step
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
                        Account Setup
                    </h1>
                </div>

                {step === 0 && (
                     <div className="text-center py-6">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                         <p className="mt-4 text-gray-500 font-bold text-sm">Validating secure link...</p>
                     </div>
                )}

                {errorMsg && step !== 0 && (
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
                     <div className="text-center space-y-6 animate-fade-in">
                        <p className="text-gray-600 font-bold">This password setup link is no longer valid or has expired.</p>
                        <Link to="/forgot-password" className="w-full inline-block bg-gradient-to-r from-primary-800 to-primary-600 hover:from-primary-900 hover:to-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all duration-300">
                            Request New Password Setup Link
                        </Link>
                     </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSetupPassword} className="space-y-6 animate-fade-in">
                        <div className="p-4 bg-primary-50 text-primary-800 rounded-xl mb-6 font-bold text-sm text-center border border-primary-100">
                            Setting password for: <span className="font-mono bg-white px-2 py-1 rounded ml-1">{username}</span>
                        </div>

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
                            {loading ? (isAr ? 'جاري التحديث...' : 'Updating...') : 'Set Password'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center py-6 animate-fade-in">
                        <Link
                            to="/"
                            className="w-full block bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-primary-700 border border-gray-200 font-bold py-4 rounded-2xl transition-all duration-300"
                        >
                            {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                        </Link>
                    </div>
                )}

                {step !== 3 && step !== 0 && (
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

export default SetPassword;
