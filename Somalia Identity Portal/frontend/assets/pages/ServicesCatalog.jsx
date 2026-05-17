
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { getServices } from '../data/servicesData';
import ServiceCard from '../components/ServiceCard';
import { Search, Filter, LayoutGrid, CreditCard, Plane, ShieldAlert, Home, Smartphone, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';

const ServicesCatalog = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const services = getServices(t);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { key: 'all', label: t.home === 'الرئيسية' ? 'الكل' : (t.home === 'Bogga Hore' ? 'Dhammaan' : 'All'), icon: LayoutGrid },
        { key: 'identity', label: t.categories.identity, icon: CreditCard },
        { key: 'passport', label: t.categories.passport, icon: Plane },
        { key: 'legal', label: t.categories.legal, icon: ShieldAlert },
        { key: 'civil', label: t.categories.civil, icon: Home },
        { key: 'digital', label: t.categories.digital, icon: Smartphone },
        { key: 'admin', label: t.categories.admin, icon: Briefcase },
    ];

    const filteredServices = useMemo(() => {
        return services.filter(s => {
            const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, services]);

    const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

    return (
        <div className="bg-[#fcfdfe] min-h-screen pb-32">

            {/* Header Section */}
            <section className="relative pt-16 pb-24 overflow-hidden bg-primary-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-800/40 via-transparent to-transparent"></div>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-full text-gold-400 text-[10px] font-black uppercase tracking-widest animate-fade-in">
                            <Smartphone size={14} />
                            Digital Government Services
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight animate-fade-in-up">
                            {t.allServices}
                        </h1>

                        <p className="text-primary-200/70 text-lg max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up delay-100">
                            {t.heroSubtitle}
                        </p>

                        {/* Premium Search Bar */}
                        <div className="relative max-w-2xl mx-auto mt-12 animate-fade-in-up delay-200">
                            <div className="absolute ltr:left-5 rtl:right-5 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within:text-gold-500 transition-colors">
                                <Search size={24} />
                            </div>
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 ltr:pl-16 rtl:pr-16 py-6 rounded-[2rem] text-white placeholder-primary-300/50 outline-none focus:bg-white/15 focus:border-gold-500/50 focus:ring-8 focus:ring-gold-500/5 transition-all text-lg font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2">
                                <div className="bg-gold-500 text-primary-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hidden sm:block shadow-lg">
                                    {filteredServices.length} {filteredServices.length === 1 ? t.serviceCountSingle : t.serviceCountPlural}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Navigation - Sticky */}
            <div className="sticky top-20 z-40 bg-[#fcfdfe]/80 backdrop-blur-xl border-b border-gray-100 py-4 mb-16 shadow-sm">
                <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
                    <div className="flex items-center justify-center gap-3 min-w-max pb-2 md:pb-0">
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap border-2 ${activeCategory === cat.key
                                        ? 'bg-primary-900 border-primary-900 text-gold-400 shadow-glow-blue'
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-primary-100 hover:text-primary-700'
                                    }`}
                            >
                                <cat.icon size={18} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">

                {/* Dynamic Sections Grid */}
                <div className="space-y-24">
                    {categories.slice(1).map((cat) => {
                        const catServices = filteredServices.filter(s => s.category === cat.key);
                        if (catServices.length === 0) return null;

                        return (
                            <div key={cat.key} className="animate-fade-in-up">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-900 shadow-sm border border-primary-100">
                                            <cat.icon size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{cat.label}</h2>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{t.officialCatalogSection}</p>
                                        </div>
                                    </div>
                                    <div className="h-px flex-1 bg-gray-100 hidden md:block mx-10"></div>
                                    <div className="flex items-center gap-2 text-primary-400 text-sm font-bold">
                                        <Filter size={16} /> {catServices.length} {t.availableServices}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {catServices.map((service) => (
                                        <ServiceCard
                                            key={service.id}
                                            service={service}
                                            onClick={() => navigate(`/service/${service.id}`)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredServices.length === 0 && (
                    <div className="text-center py-32 animate-fade-in">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-dashed border-gray-200">
                            <Search size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">{t.noResultsTitle}</h3>
                        <p className="text-gray-400 font-medium mb-10">{t.noResultsSubtitle}</p>
                        <button
                            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                            className="bg-primary-900 text-white px-10 py-4 rounded-2xl font-black transition-all hover:bg-primary-950 shadow-glow-blue"
                        >
                            {t.resetSearch}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesCatalog;
