
import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const ServiceCard = ({ service, onClick }) => {
    const { t, dir } = useLanguage();
    const [expanded, setExpanded] = useState(false);
    const Icon = service.icon;

    const isLongDescription = service.description.length > 80;
    const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowRight;

    return (
        <div
            className="bg-white rounded-[2.5rem] p-8 shadow-premium hover:shadow-glow-blue transition-all duration-500 flex flex-col h-full group border border-gray-100 hover:border-primary-200/50 relative overflow-hidden hover:-translate-y-3 hover:scale-[1.02] cursor-pointer"
            onClick={onClick}
        >
            {/* Premium Shimmer Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_2s_infinite] transition-opacity duration-1000"></div>
            </div>

            {/* Decorative Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-white to-white opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>

            <div className="mb-8 flex justify-between items-start">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary-200 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-900 group-hover:text-gold-400 transition-all duration-500 shadow-sm relative z-10 group-hover:rotate-6 group-hover:scale-110">
                        <Icon size={32} strokeWidth={1.5} />
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black tracking-widest text-primary-400 uppercase group-hover:text-primary-600 transition-colors">{service.type}</span>
                    {service.category === 'essential' && (
                        <div className="flex items-center gap-1 text-[8px] font-bold text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full border border-gold-100 animate-pulse">
                            <Sparkles size={8} />
                            <span>PRIORITY</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-grow space-y-4">
                <h3 className="text-xl font-black text-gray-900 group-hover:text-primary-900 transition-colors leading-tight tracking-tight">
                    {service.title}
                </h3>

                <div className="relative">
                    <p className={`text-gray-500 text-sm leading-relaxed font-medium transition-all duration-300 ${expanded ? '' : 'line-clamp-2'} group-hover:text-gray-600`}>
                        {service.description}
                    </p>
                    {isLongDescription && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                            className="mt-3 text-[10px] font-black text-primary-600 hover:text-primary-800 uppercase tracking-widest flex items-center gap-1 transition-colors relative z-10"
                        >
                            {expanded ? t.showLess : t.readMore}
                            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                    <Layers size={14} className="text-primary-300 group-hover:text-primary-600" />
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-primary-500 uppercase tracking-tighter">Verified Process</span>
                </div>
                <button
                    className="bg-gray-950 text-white w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-primary-900 group-hover:shadow-glow-blue transition-all duration-500 group-hover:w-40 group-hover:gap-2 overflow-hidden relative shadow-lg"
                >
                    <span className="hidden group-hover:inline font-black text-xs uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{t.startService}</span>
                    <ArrowIcon size={18} className={`transition-transform duration-300 ${dir === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </button>
            </div>
        </div>
    );
};

export default ServiceCard;
