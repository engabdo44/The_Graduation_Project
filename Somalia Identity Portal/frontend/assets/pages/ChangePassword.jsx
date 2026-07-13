import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Shield, Key } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

const PasswordInput = ({ label, value, setter, show, setShow, dir }) => (
    <div className="space-y-2">
        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>
        <div className="relative group/input">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within/input:text-primary-600 transition-colors">
                <Key size={18} />
            </div>
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className={`w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 py-4 ${dir === 'rtl' ? 'pr-12 pl-12' : 'pl-12 pr-12'} rounded-2xl outline-none font-bold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all`}
                placeholder="••••••••"
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer outline-none ${dir === 'rtl' ? 'left-0 pr-0 pl-4 right-auto' : ''}`}
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    </div>
);

const ChangePassword = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const isAr = dir === 'rtl';

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation Requirements
    const reqLength = newPassword.length >= 8;
    const reqUpper = /[A-Z]/.test(newPassword);
    const reqLower = /[a-z]/.test(newPassword);
    const reqNumber = /[0-9]/.test(newPassword);
    const reqSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(newPassword);

    const isStrongPassword = reqLength && reqUpper && reqLower && reqNumber && reqSpecial;

    const calculateStrength = () => {
        if (!newPassword) return null;
        let score = 0;
        if (reqLength) score++;
        if (reqUpper) score++;
        if (reqLower) score++;
        if (reqNumber) score++;
        if (reqSpecial) score++;

        if (score <= 2) return { label: isAr ? 'ضعيف' : 'Weak', color: 'bg-red-500', text: 'text-red-500', percent: '33%' };
        if (score <= 4) return { label: isAr ? 'متوسط' : 'Medium', color: 'bg-yellow-500', text: 'text-yellow-500', percent: '66%' };
        return { label: isAr ? 'قوي' : 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500', percent: '100%' };
    };

    const strength = calculateStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!currentPassword) {
            setErrorMsg(isAr ? 'كلمة المرور الحالية مطلوبة.' : 'Current password is required.');
            return;
        }
        
        if (!isStrongPassword) {
            setErrorMsg(isAr ? 'كلمة المرور لا تلبي متطلبات الأمان.' : 'Password does not meet security requirements.');
            return;
        }
        
        if (newPassword === currentPassword) {
            setErrorMsg(isAr ? 'يجب أن تكون كلمة المرور الجديدة مختلفة عن كلمة المرور الحالية.' : 'New password must be different from the current password.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setErrorMsg(isAr ? 'كلمة المرور الجديدة وكلمة مرور التأكيد غير متطابقتين.' : 'Passwords do not match.');
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const accId = storedUser.user_id;

        if (!accId) {
            setErrorMsg('User not authenticated.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: accId,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSuccessMsg(isAr ? 'تم تغيير كلمة المرور بنجاح.' : 'Password changed successfully.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                
                setTimeout(() => navigate('/home'), 3000);
            } else {
                setErrorMsg(data.message || (isAr ? 'فشل في تغيير كلمة المرور' : 'Failed to change password.'));
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(isAr ? 'خطأ في الاتصال بالخادم.' : 'Server connection error.');
        }
        setLoading(false);
    };

    const ValidationItem = ({ met, text }) => (
        <div className={`flex items-center gap-2 text-xs font-bold transition-colors ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
            <CheckCircle2 size={14} className={met ? 'text-emerald-500' : 'opacity-30'} />
            <span>{text}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-primary-950 py-16 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-white dark:bg-slate-900 shadow-premium rounded-[3rem] p-10 md:p-16 border border-gray-100 dark:border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-900"></div>

                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-gold-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary-100 dark:border-primary-900/50">
                            <Lock size={36} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
                        </h1>
                        <p className="text-gray-500 font-bold mt-2">
                            {isAr ? 'قم بتحديث كلمة المرور الخاصة بك لتأمين حسابك.' : 'Update your password to keep your account secure.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {errorMsg && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-5 rounded-2xl flex items-start gap-4 animate-fade-in">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                <p className="text-red-800 dark:text-red-400 font-bold text-sm">{errorMsg}</p>
                            </div>
                        )}
                        
                        {successMsg && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-5 rounded-2xl flex items-start gap-4 animate-fade-in">
                                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                                <p className="text-emerald-800 dark:text-emerald-400 font-bold text-sm">{successMsg}</p>
                            </div>
                        )}

                        <div className="space-y-6 bg-gray-50/50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5">
                            <PasswordInput 
                                label={isAr ? 'كلمة المرور الحالية' : 'Current Password'} 
                                value={currentPassword} 
                                setter={setCurrentPassword} 
                                show={showCurrent} 
                                setShow={setShowCurrent}
                                dir={dir}
                            />
                        </div>

                        <div className="space-y-6 bg-primary-50/30 dark:bg-primary-900/10 p-8 rounded-[2rem] border border-primary-100 dark:border-primary-900/30">
                            <PasswordInput 
                                label={isAr ? 'كلمة المرور الجديدة' : 'New Password'} 
                                value={newPassword} 
                                setter={setNewPassword} 
                                show={showNew} 
                                setShow={setShowNew}
                                dir={dir} 
                            />
                            
                            {/* Real-time Validation Feedback */}
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-white/5 space-y-2">
                                <ValidationItem met={reqLength} text={isAr ? '8 أحرف على الأقل' : 'At least 8 characters'} />
                                <ValidationItem met={reqUpper} text={isAr ? 'يحتوي على حرف كبير' : 'Contains uppercase letter'} />
                                <ValidationItem met={reqLower} text={isAr ? 'يحتوي على حرف صغير' : 'Contains lowercase letter'} />
                                <ValidationItem met={reqNumber} text={isAr ? 'يحتوي على رقم' : 'Contains number'} />
                                <ValidationItem met={reqSpecial} text={isAr ? 'يحتوي على حرف خاص' : 'Contains special character'} />
                            </div>

                            {/* Strength Indicator */}
                            {strength && (
                                <div className="space-y-2 animate-fade-in">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-gray-500">{isAr ? 'قوة كلمة المرور:' : 'Password Strength:'}</span>
                                        <span className={strength.text}>{strength.label}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                        <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: strength.percent }}></div>
                                    </div>
                                </div>
                            )}

                            <PasswordInput 
                                label={isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} 
                                value={confirmPassword} 
                                setter={setConfirmPassword} 
                                show={showConfirm} 
                                setShow={setShowConfirm}
                                dir={dir}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !!successMsg}
                            className="w-full bg-primary-900 hover:bg-primary-950 text-white dark:bg-gold-500 dark:hover:bg-gold-600 dark:text-primary-950 py-5 rounded-2xl font-black text-lg transition-all shadow-glow-blue dark:shadow-glow-gold active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                        >
                            <Shield size={20} />
                            {loading ? (isAr ? 'جاري التحديث...' : 'Updating...') : (isAr ? 'تغيير كلمة المرور' : 'Change Password')}
                        </button>
                        
                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm font-bold text-primary-600 hover:text-primary-800 transition"
                            >
                                {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
