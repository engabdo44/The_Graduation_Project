
import React from 'react';
import { Users, FileText, Shield, UserCheck, Plane, ArrowRight, Activity, ChevronRight, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { useLanguage } from '../LanguageContext';
import { getServices } from '../data/servicesData';
import API_URL from '../config';

const Home = () => {
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const [backendStatus, setBackendStatus] = React.useState(null);

    React.useEffect(() => {
        fetch(`${API_URL}/status`)
            .then(res => res.json())
            .then(data => setBackendStatus(data.message))
            .catch(err => setBackendStatus('Backend Offline'));
    }, []);

    const allServices = getServices(t);
    const featuredServices = allServices.filter(s => ['id-renew', 'passport-renew', 'criminal-record'].includes(s.id));

    const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowRight;

    return (
        <div className="flex flex-col gap-0 pb-20 bg-mesh dark:bg-primary-950 overflow-hidden transition-colors duration-500">

            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-12">
                <div className="absolute inset-0 bg-primary-950 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-800/40 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold text-gold-400">
                                <Shield size={14} className="animate-pulse" />
                                <span className="tracking-widest uppercase">{t.ministry}</span>
                            </div>
                            {backendStatus && (
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${backendStatus === 'Database connected successfully' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'Database connected successfully' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    {backendStatus}
                                </div>
                            )}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-white tracking-tight">
                            {t.heroTitle}
                        </h1>

                        <div className="space-y-4">
                            <p className="text-2xl md:text-3xl text-gold-400 font-black leading-tight tracking-tight uppercase">
                                {t.heroSubtitle}
                            </p>
                            <p className="text-lg md:text-xl text-primary-200/80 max-w-xl leading-relaxed font-light ltr:border-l-2 rtl:border-r-2 border-gold-500/50 ltr:pl-6 rtl:pr-6">
                                {t.heroDesc}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                            <button
                                onClick={() => navigate('/services')}
                                className="bg-gold-500 hover:bg-gold-600 text-primary-950 px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-glow-gold hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                            >
                                {t.startService}
                                <ChevronRight size={20} className={dir === 'rtl' ? 'rotate-180' : ''} />
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="bg-white/5 border border-white/10 text-white hover:bg-white/10 px-10 py-4 rounded-2xl font-bold text-lg transition-all backdrop-blur-md flex items-center justify-center gap-3"
                            >
                                <Activity size={20} className="text-gold-400" />
                                {t.citizenDashboard}
                            </button>
                        </div>
                    </div>

                    <div className="relative hidden lg:block animate-fade-in">
                        <div className="relative z-20 group">
                            <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white/10">
                                <img
                                    src="/passprt.png"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=1000";
                                    }}
                                    alt="Somalia Identity & Passport"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 shadow-dark-premium opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent"></div>
                            </div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-500/20 rounded-full blur-3xl animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="container mx-auto px-4 relative z-30 mt-12">
                <div className="glass-header dark:card-premium rounded-[2.5rem] p-8 md:p-12 border border-white dark:border-white/5 shadow-premium">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-gray-100 dark:divide-white/5">
                        {[
                            { val: '15M+', label: t.statsBeneficiaries, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
                            { val: '4M+', label: t.statsPassports, icon: Plane, color: 'text-gold-600', bg: 'bg-gold-50' },
                            { val: '98%', label: t.statsSatisfaction, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
                            { val: '24/7', label: t.statsSupport, icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
                        ].map((stat, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center group">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 shadow-sm ${stat.bg} dark:bg-white/10 ${stat.color} dark:text-gold-400`}>
                                    <stat.icon size={28} />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.val}</h3>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Services Grid */}
            <section className="container mx-auto px-4 mt-32">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-xl">
                        <div className="inline-block px-3 py-1 bg-gold-100 dark:bg-gold-500/10 text-gold-700 dark:text-gold-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-md mb-4">Official Services</div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{t.categories.identity}</h2>
                    </div>
                    <button
                        onClick={() => navigate('/services')}
                        className="flex items-center gap-2 text-primary-700 dark:text-gold-400 font-black hover:text-white hover:bg-primary-600 dark:hover:bg-primary-600 transition-all group px-6 py-3 rounded-xl border border-primary-100 dark:border-white/10"
                    >
                        {t.allServices}
                        <ArrowIcon size={18} className={`transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredServices.map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            onClick={() => navigate(`/service/${service.id}`)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
