
import React from 'react';
import { Twitter, Linkedin, Instagram, Facebook, Phone, Mail, MapPin, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Footer = () => {
    const { t, dir } = useLanguage();

    const ArrowIcon = dir === 'rtl' ? ChevronRight : ChevronRight; // Usually Chevrons don't flip for lists in same way arrows do, but keeping logic just in case

    return (
        <footer className="bg-primary-950 text-white pt-24 pb-12 relative overflow-hidden">

            {/* Top Border Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"></div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">

                    {/* Column 1: Brand (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-start gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gold-500 blur-[30px] opacity-20 rounded-full"></div>
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Coat_of_arms_of_Somalia.svg/200px-Coat_of_arms_of_Somalia.svg.png"
                                    alt="Somalia Coat of Arms"
                                    className="w-20 h-20 object-contain relative z-10 drop-shadow-2xl brightness-110"
                                />
                            </div>
                            <div className="flex flex-col pt-1">
                                <span className="font-black text-2xl tracking-tight text-white leading-none mb-1">SOMALIA</span>
                                <span className="text-[10px] text-gold-400 font-bold tracking-[0.2em] uppercase">Federal Republic</span>
                                <span className="text-xs text-primary-300 mt-2 font-medium">Ministry of Interior & <br /> Federal Affairs</span>
                            </div>
                        </div>
                        <p className="text-primary-200 text-sm leading-7 max-w-sm font-light">
                            {t.heroSubtitle}
                            <br />
                            Building a secure and digital future for all citizens.
                        </p>
                    </div>

                    {/* Column 2: Links (2 cols) */}
                    <div className="lg:col-span-2 lg:col-start-6">
                        <h3 className="font-bold text-lg mb-8 text-white flex items-center gap-3">
                            <span className="w-8 h-0.5 bg-gold-500 rounded-full"></span>
                            {t.footerOverview}
                        </h3>
                        <ul className="space-y-4 text-sm text-primary-200 font-medium">
                            <li><a href="#" className="hover:text-gold-400 hover:pl-2 transition-all duration-300 flex items-center gap-2 group"><ArrowIcon size={14} className={`text-gold-500 opacity-0 group-hover:opacity-100 transition ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {t.about}</a></li>
                            <li><a href="#" className="hover:text-gold-400 hover:pl-2 transition-all duration-300 flex items-center gap-2 group"><ArrowIcon size={14} className={`text-gold-500 opacity-0 group-hover:opacity-100 transition ${dir === 'rtl' ? 'rotate-180' : ''}`} /> Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-gold-400 hover:pl-2 transition-all duration-300 flex items-center gap-2 group"><ArrowIcon size={14} className={`text-gold-500 opacity-0 group-hover:opacity-100 transition ${dir === 'rtl' ? 'rotate-180' : ''}`} /> Terms of Use</a></li>
                            <li><a href="#" className="hover:text-gold-400 hover:pl-2 transition-all duration-300 flex items-center gap-2 group"><ArrowIcon size={14} className={`text-gold-500 opacity-0 group-hover:opacity-100 transition ${dir === 'rtl' ? 'rotate-180' : ''}`} /> Accessibility</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact (3 cols) */}
                    <div className="lg:col-span-3">
                        <h3 className="font-bold text-lg mb-8 text-white flex items-center gap-3">
                            <span className="w-8 h-0.5 bg-gold-500 rounded-full"></span>
                            {t.footerContact}
                        </h3>
                        <ul className="space-y-6 text-sm text-primary-100">
                            <li className="flex items-start gap-4 group">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10 group-hover:bg-gold-500 group-hover:text-primary-950 transition duration-300"><Phone size={18} /></div>
                                <div>
                                    <span className="block text-xs text-primary-400 uppercase font-bold tracking-wider mb-0.5">Hotline</span>
                                    <span className="font-bold text-lg font-mono">+252 61 000 000</span>
                                    <span className="block text-xs opacity-60 mt-0.5">Mon-Fri, 8am-4pm</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10 group-hover:bg-gold-500 group-hover:text-primary-950 transition duration-300"><Mail size={18} /></div>
                                <div>
                                    <span className="block text-xs text-primary-400 uppercase font-bold tracking-wider mb-0.5">Email Support</span>
                                    <span className="font-medium hover:text-gold-400 transition cursor-pointer">info@immigration.gov.so</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10 group-hover:bg-gold-500 group-hover:text-primary-950 transition duration-300"><MapPin size={18} /></div>
                                <div>
                                    <span className="block text-xs text-primary-400 uppercase font-bold tracking-wider mb-0.5">Headquarters</span>
                                    <span className="font-medium">{t.location}</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Social (3 cols - technically fills remaining space in grid visually) */}
                    <div className="lg:col-span-3 lg:col-start-10">
                        <h3 className="font-bold text-lg mb-8 text-white flex items-center gap-3">
                            <span className="w-8 h-0.5 bg-gold-500 rounded-full"></span>
                            {t.footerSocial}
                        </h3>
                        <div className="flex gap-4">
                            <a href="#" className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-gold-500 hover:text-primary-950 hover:border-gold-500 transition-all duration-300 hover:-translate-y-1"><Facebook size={20} /></a>
                            <a href="#" className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-gold-500 hover:text-primary-950 hover:border-gold-500 transition-all duration-300 hover:-translate-y-1"><Twitter size={20} /></a>
                            <a href="#" className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-gold-500 hover:text-primary-950 hover:border-gold-500 transition-all duration-300 hover:-translate-y-1"><Instagram size={20} /></a>
                            <a href="#" className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-gold-500 hover:text-primary-950 hover:border-gold-500 transition-all duration-300 hover:-translate-y-1"><Linkedin size={20} /></a>
                        </div>
                        <div className="mt-8 bg-gradient-to-br from-primary-800 to-primary-900 p-6 rounded-2xl border border-primary-700/50">
                            <p className="text-xs text-primary-300 mb-3">Subscribe to our newsletter for updates.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Email address" className="bg-primary-950/50 border border-primary-700 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-gold-500 text-white placeholder-primary-600" />
                                <button className="bg-gold-500 text-primary-950 p-2 rounded-lg hover:bg-gold-400 transition"><ArrowUpRight size={18} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-start">
                    <div className="text-xs text-primary-400 font-medium">
                        <p>{t.rights} © {new Date().getFullYear()}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-80">
                        <div className="h-px w-8 bg-gold-500/50"></div>
                        <span className="font-bold text-[10px] tracking-[0.3em] text-gold-500 uppercase">Official Govt Portal</span>
                        <div className="h-px w-8 bg-gold-500/50"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
