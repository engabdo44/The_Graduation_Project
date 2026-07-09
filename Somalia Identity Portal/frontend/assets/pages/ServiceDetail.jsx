
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, Users, Globe, Coins, PlayCircle, Shield,
    ChevronLeft, ChevronRight, FileCheck, CheckCircle2,
    HelpCircle, Info, Landmark, ArrowLeft, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { getServices } from '../data/servicesData';

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const [activeTab, setActiveTab] = useState('details');

    const services = getServices(t);
    const service = services.find(s => s.id === id);

    if (!service) {
        return (
            <div className="container mx-auto py-20 text-center animate-fade-in dark:text-white">
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                    <Info size={40} />
                </div>
                <h2 className="text-2xl font-black mb-4 tracking-tight">الخدمة غير متوفرة</h2>
                <button onClick={() => navigate('/services')} className="text-primary-600 dark:text-gold-400 font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
                    العودة لدليل الخدمات <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    const isPassport = id?.includes('passport');
    const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

    // Dynamic labels and steps based on service category
    const steps = isPassport ? t.services.pptRenewSteps : t.services.idRenewSteps;

    return (
        <div className="bg-[#f8fafc] dark:bg-primary-950 min-h-screen pb-24 overflow-x-hidden transition-colors duration-500">

            <div className="relative pt-12 pb-32 overflow-hidden bg-primary-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-800/40 via-transparent to-transparent"></div>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <button
                        onClick={() => navigate('/services')}
                        className="group flex items-center gap-2 text-primary-200 hover:text-white transition-all mb-8 font-bold text-sm bg-white/5 px-4 py-2 rounded-full border border-white/10"
                    >
                        <BackIcon size={18} className="group-hover:-translate-x-1 transition-transform" />
                        {t.allServices}
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div className="max-w-3xl space-y-6 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/20 text-gold-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gold-500/30">
                                <Landmark size={12} />
                                {t.ministry}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                                {service.title}
                            </h1>
                            <p className="text-lg md:text-xl text-primary-200/80 leading-relaxed font-light">
                                {service.description}
                            </p>
                        </div>

                        <div className="shrink-0 animate-fade-in-up delay-100">
                            <button
                                onClick={() => {
                                    if (id === 'criminal-record') {
                                        navigate('/criminal-certificate');
                                    } else {
                                        navigate(`/apply/${id}`);
                                    }
                                }}
                                className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-primary-950 px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-glow-gold hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                            >

                                {t.startService}
                                <ChevronRight size={22} className={dir === 'rtl' ? 'rotate-180' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    <div className="flex-1 space-y-8">

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Users, label: t.targetAudience, val: t.targetValue, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { icon: Clock, label: t.durationLabel, val: t.durationValue, color: 'text-gold-600', bg: 'bg-gold-50' },
                                { icon: Globe, label: t.channelLabel, val: t.channelValue, color: 'text-green-600', bg: 'bg-green-50' },
                                { icon: Coins, label: t.feesLabel, val: id === 'criminal-record' || id === 'birth-cert-pdf' ? '$0.00' : (id === 'birth-cert-reprint' ? '$10.00' : (id?.includes('replace') ? '$50.00' : '$100.00')), color: 'text-purple-600', bg: 'bg-purple-50' },
                            ].map((item, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] shadow-premium border border-white dark:border-white/5 flex flex-col items-center text-center group hover:border-primary-100 dark:hover:border-gold-500/30 transition-colors">
                                    <div className={`w-12 h-12 ${item.bg} dark:bg-white/10 ${item.color} dark:text-gold-400 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                                        <item.icon size={24} />
                                    </div>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest mb-1">{item.label}</span>
                                    <span className="text-gray-900 dark:text-white font-black text-lg">{item.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] shadow-premium border border-white dark:border-white/5 overflow-hidden">
                            <div className="flex border-b border-gray-100 dark:border-white/5">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`flex-1 py-6 px-4 font-black text-lg transition-all relative ${activeTab === 'details' ? 'text-primary-900 dark:text-gold-400 bg-gray-50/50 dark:bg-white/5' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {t.details}
                                    {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-800 dark:bg-gold-500 rounded-full"></div>}
                                </button>
                                <button
                                    onClick={() => setActiveTab('requirements')}
                                    className={`flex-1 py-6 px-4 font-black text-lg transition-all relative ${activeTab === 'requirements' ? 'text-primary-900 dark:text-gold-400 bg-gray-50/50 dark:bg-white/5' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {t.requirements}
                                    {activeTab === 'requirements' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-800 dark:bg-gold-500 rounded-full"></div>}
                                </button>
                            </div>

                            <div className="p-8 md:p-12">
                                {activeTab === 'details' ? (
                                    <div className="space-y-12 animate-fade-in">
                                        <div className="space-y-8">
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                                <div className="w-1.5 h-8 bg-gold-500 rounded-full"></div>
                                                {t.process}
                                            </h3>
                                            <div className="grid gap-6">
                                                {(steps || []).map((step, idx) => (
                                                    <div key={idx} className="flex gap-6 items-start group">
                                                        <div className="w-10 h-10 shrink-0 bg-primary-50 dark:bg-white/10 text-primary-900 dark:text-gold-400 rounded-xl flex items-center justify-center font-black text-lg border border-primary-100 dark:border-white/5 group-hover:bg-primary-900 dark:group-hover:bg-gold-500 group-hover:text-white dark:group-hover:text-primary-950 transition-all shadow-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="pt-2">
                                                            <p className="text-gray-600 dark:text-gray-300 font-bold leading-relaxed">{step}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8 animate-fade-in">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 mb-8">
                                            <div className="w-1.5 h-8 bg-gold-500 rounded-full"></div>
                                            {t.requirements}
                                        </h3>
                                        {service.requirements && service.requirements.length > 0 ? (
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                {service.requirements.map((req, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 p-6 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 group hover:bg-white dark:hover:bg-white/10 hover:shadow-premium transition-all">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 shadow-sm">
                                                            <CheckCircle2 size={18} />
                                                        </div>
                                                        <span className="text-gray-700 dark:text-gray-200 font-black text-sm">{req}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10">
                                                <Info size={40} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                                <p className="text-gray-500 font-bold">لا توجد متطلبات خاصة مدرجة لهذه الخدمة حالياً.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-96 space-y-6">
                        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-white dark:border-white/5 shadow-premium sticky top-28 space-y-8">
                            <div className="space-y-4">
                                <h4 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <HelpCircle size={18} className="text-gold-500" />
                                    هل تحتاج للمساعدة؟
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                    فريق الدعم الفني متاح على مدار الساعة للإجابة على استفساراتكم المتعلقة بالخدمة باللغات الثلاث.
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50 dark:border-white/5">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl group hover:bg-primary-900 transition-all cursor-pointer">
                                    <div className="w-10 h-10 bg-white dark:bg-primary-950 rounded-xl flex items-center justify-center text-primary-900 dark:text-gold-400 group-hover:bg-gold-500 dark:group-hover:bg-gold-500 group-hover:text-primary-950 transition-all">
                                        <Shield size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter group-hover:text-primary-200 transition-colors">مستوى الأمان</p>
                                        <p className="text-gray-900 dark:text-white font-black text-sm group-hover:text-white transition-colors">عالي جداً (مشفر)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;
