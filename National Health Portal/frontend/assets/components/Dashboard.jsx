import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { translations } from '../translations';

const data = [
  { name: 'JAN', births: 400, deaths: 240 },
  { name: 'FEB', births: 300, deaths: 139 },
  { name: 'MAR', births: 200, deaths: 980 },
  { name: 'APR', births: 278, deaths: 390 },
  { name: 'MAY', births: 189, deaths: 480 },
  { name: 'JUN', births: 239, deaths: 380 },
];

const Dashboard = ({ user, lang }) => {
  const t = translations[lang].dashboard;

  return (
    <div className={`space-y-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <motion.header 
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-center bg-white p-8 rounded-[1.5rem] ${lang === 'ar' ? 'border-r-[8px]' : 'border-l-[8px]'} border-gov-blue shadow-lg shadow-slate-100 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 p-3 opacity-[0.03] pointer-events-none">
           <i className="fa-solid fa-dna text-7xl"></i>
        </div>
        <div className={`relative z-10 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-3xl font-black text-gov-navy gov-serif uppercase tracking-tight leading-none">{t.header.secureLink}</h2>
          <p className="text-gov-blue font-bold text-[10px] uppercase tracking-[0.3em] mt-2 pl-0.5">{translations[lang].login.subtitle}</p>
        </div>
        <div className={`${lang === 'ar' ? 'text-left' : 'text-right'} flex flex-col items-end gap-2 relative z-10`}>
           <div className="inline-flex items-center gap-2 bg-gov-gold/5 text-gov-gold px-4 py-2 rounded-xl border border-gov-gold/10 font-black text-[9px] uppercase tracking-widest">
             <i className="fa-solid fa-shield text-[10px]"></i>
             {t.header.level}
           </div>
           <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{t.header.node}: {user.node}</div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard index={0} icon="fa-baby" label={t.stats.registrations} value="1,248" change="+12.4%" color="bg-gov-blue" lang={lang} />
        <StatCard index={1} icon="fa-dna" label={t.stats.critical} value="98.2" change="+0.4%" color="bg-gov-navy" lang={lang} />
        <StatCard index={2} icon="fa-users" label={t.stats.facility} value="18.2M" change="+2.1%" color="bg-gov-gold" lang={lang} />
        <StatCard index={3} icon="fa-hospital" label={t.stats.response} value="94%" change="+1%" color="bg-gov-blue" lang={lang} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/30 border border-slate-100 border-t-8 border-t-gov-blue relative ${lang === 'ar' ? 'text-right' : 'text-left'}`}
        >
          <div className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mb-10`}>
            <h3 className={`text-lg font-black text-gov-navy flex items-center gap-4 uppercase tracking-tighter ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-8 h-8 rounded-xl bg-gov-gold/10 flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-gov-gold text-[10px]"></i>
              </div>
              {t.charts.title}
            </h3>
            <div className={`flex gap-1.5 font-mono ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
               <button className="px-3.5 py-1.5 rounded-lg bg-slate-50 text-gov-navy font-bold text-[9px] uppercase tracking-widest border border-slate-100 hover:border-gov-blue/30 transition-colors">Export</button>
               <button className="px-3.5 py-1.5 rounded-lg bg-gov-navy text-white font-bold text-[9px] uppercase tracking-widest shadow-lg shadow-gov-navy/10">Live</button>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                   orientation={lang === 'ar' ? 'right' : 'left'}
                   axisLine={false} 
                   tickLine={false}
                   tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 8}}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                    padding: '12px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    textAlign: lang === 'ar' ? 'right' : 'left'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  labelStyle={{ fontWeight: 800, marginBottom: '6px', color: '#f59e0b', fontSize: '11px' }}
                />
                <Bar dataKey="births" radius={[8, 8, 8, 8]} barSize={24}>
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#64748b'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`bg-gov-navy p-8 rounded-[2rem] shadow-xl shadow-gov-navy/20 text-white relative overflow-hidden border-b-[8px] border-b-gov-gold ${lang === 'ar' ? 'text-right' : 'text-left'}`}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gov-blue/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
          <h3 className={`text-sm font-black mb-8 flex items-center gap-4 uppercase tracking-[0.15em] border-b border-white/5 pb-5 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <i className="fa-solid fa-satellite-dish text-gov-gold text-xs"></i>
            {t.regions.title}
          </h3>
          <div className="space-y-6 relative z-10">
            <RegionItem name="Banaadir Central" value={98.4} status="Active" lang={lang} />
            <RegionItem name="Puntland Sector" value={76.2} status="Stable" lang={lang} />
            <RegionItem name="Jubaland Segment" value={62.8} status="Syncing" lang={lang} />
            <RegionItem name="Somaliland Hub" value={88.9} status="Encrypted" lang={lang} />
          </div>
          <div className="mt-10 p-5 bg-white/[0.03] rounded-2xl border border-white/5 backdrop-blur-sm">
             <div className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end mb-1.5 px-0.5`}>
               <p className="text-[9px] text-gov-blue font-black uppercase tracking-[0.15em]">Integrity Index</p>
               <span className="text-[8px] text-emerald-400/80 font-bold uppercase">Online</span>
             </div>
             <div className="text-3xl font-black text-gov-gold gov-mono tracking-tighter">99.9%</div>
             <p className="text-[7px] text-slate-500 mt-1.5 font-mono opacity-50 uppercase tracking-widest">HASH: SYNC-2024-MOG</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, change, color, index, lang }) => (
  <motion.div 
    initial={{ y: 10, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.1 * index }}
    className={`bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 relative overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}
  >
    <div className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-start mb-5 relative z-10`}>
      <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-100 transition-transform duration-300 group-hover:scale-110`}>
        <i className={`fa-solid ${icon} text-base`}></i>
      </div>
      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {change}
      </span>
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-black text-gov-navy tracking-tighter">{value}</h4>
    </div>
  </motion.div>
);

const RegionItem = ({ name, value, status, lang }) => (
  <div className="space-y-2 group cursor-default">
    <div className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end px-0.5`}>
      <div className={`flex flex-col ${lang === 'ar' ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] font-black uppercase tracking-widest text-gov-gold/80">{name}</span>
        <span className="text-[8px] text-slate-500 uppercase font-black">{status}</span>
      </div>
      <span className="text-base font-black text-white/90">{Math.floor(value)}%</span>
    </div>
    <div className="w-full bg-white/[0.02] h-2 rounded-full overflow-hidden p-[2px] border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`h-full rounded-full bg-gradient-to-r from-gov-blue to-gov-gold brightness-90 group-hover:brightness-110 transition-all ${lang === 'ar' ? 'float-right' : ''}`} 
      />
    </div>
  </div>
);

export default Dashboard;
