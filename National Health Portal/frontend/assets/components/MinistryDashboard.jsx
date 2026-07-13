import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { translations } from '../translations';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MinistryDashboard = ({ user, lang }) => {
  const [statsData, setStatsData] = useState({ 
      totalBirths: 0, totalDeaths: 0, totalReprintsRevenue: 0, 
      totalGeneratedRevenue: 0, activeFacilities: 0, chartData: [] 
  });

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/dashboard/stats');
        const data = await res.json();
        if(data.success) {
          setStatsData(data);
        }
      } catch (err) {
        console.error('Failed to fetch revenue', err);
      }
    };
    fetchRevenue();
  }, []);
  const t = translations[lang].ministry || translations[lang].dashboard;
  const common = translations[lang].common;

  const stats = [
    { label: lang === 'ar' ? 'إجمالي المواليد' : 'Total Births', value: statsData.totalBirths, icon: 'fa-baby', color: 'bg-emerald-500' },
    { label: lang === 'ar' ? 'إجمالي الوفيات' : 'Total Deaths', value: statsData.totalDeaths, icon: 'fa-ribbon', color: 'bg-rose-500' },
    { label: lang === 'ar' ? 'العوائد المولدة' : 'Total Generated Revenue', value: `$${statsData.totalGeneratedRevenue}`, icon: 'fa-sack-dollar', color: 'bg-amber-500' },
    { label: lang === 'ar' ? 'المنشآت النشطة' : 'Active Facilities', value: statsData.activeFacilities, icon: 'fa-hospital', color: 'bg-blue-500' },
  ];

  const pieData = [
    { name: 'Birth Printed', value: statsData.chartData.reduce((acc, curr) => acc + curr.births, 0) || 10 },
    { name: 'Death Printed', value: statsData.chartData.reduce((acc, curr) => acc + curr.deaths, 0) || 5 },
    { name: 'Reprints', value: statsData.totalReprintsRevenue / 10 || 2 }
  ];
  const COLORS = ['#10b981', '#f43f5e', '#3b82f6'];

  return (
    <div className={`space-y-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <motion.header 
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end border-b-2 border-gov-gold pb-4`}
      >
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black text-gov-navy uppercase tracking-tighter gov-serif">
            {lang === 'ar' ? 'لوحة تحكم الوزارة' : 'Ministry Dashboard'}
          </h2>
          <div className={`flex items-center gap-2 mt-1 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-gov-blue font-black text-[9px] tracking-[0.3em] uppercase opacity-80">
              {lang === 'ar' ? 'وزارة الصحة' : 'Ministry of Health'}
            </span>
            <div className="h-3 w-px bg-slate-300"></div>
            <span className="text-slate-400 font-bold text-[8px] uppercase">
              {lang === 'ar' ? 'مشرف صحي' : 'Health Admin'}
            </span>
          </div>
        </div>
        <div className={`flex items-center gap-2 bg-gov-navy/5 px-4 py-2 rounded-xl border border-gov-navy/10 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-gov-navy font-black text-[10px] uppercase tracking-wider">
            {lang === 'ar' ? 'متصل' : 'Online'}
          </span>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-shadow"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg ${stat.color}/20`}>
              <i className={`fa-solid ${stat.icon} text-white text-xl`}></i>
            </div>
            <p className={`text-slate-400 font-black text-[9px] uppercase tracking-widest mb-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {stat.label}
            </p>
            <p className="text-2xl font-black text-gov-navy gov-serif tracking-tight">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-blue-50 rounded-2xl p-6 border border-blue-100/50 shadow-sm relative overflow-hidden">
            <i className="fa-solid fa-copy text-5xl absolute -right-4 -bottom-4 text-blue-500/10"></i>
            <p className="text-blue-600/80 font-black text-[9px] uppercase tracking-widest mb-1">Total Reprints Revenue</p>
            <p className="text-3xl font-black text-blue-700 gov-serif tracking-tight">${statsData.totalReprintsRevenue}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-amber-50 rounded-2xl p-6 border border-amber-100/50 shadow-sm relative overflow-hidden">
            <i className="fa-solid fa-sack-dollar text-5xl absolute -right-4 -bottom-4 text-amber-500/10"></i>
            <p className="text-amber-600/80 font-black text-[9px] uppercase tracking-widest mb-1">Total Generated Revenue</p>
            <p className="text-3xl font-black text-amber-700 gov-serif tracking-tight">${statsData.totalGeneratedRevenue}</p>
          </motion.div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Birth/Death Trend Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow border border-slate-100">
           <h3 className="text-lg font-black text-gov-navy uppercase tracking-tight mb-4">Registration Trends</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={statsData.chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                 <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                 <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                 <Tooltip />
                 <Legend wrapperStyle={{fontSize: 10, fontWeight: 'bold'}}/>
                 <Line type="monotone" dataKey="births" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                 <Line type="monotone" dataKey="deaths" stroke="#f43f5e" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </motion.div>
        
        {/* Revenue/Prints Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow border border-slate-100">
           <h3 className="text-lg font-black text-gov-navy uppercase tracking-tight mb-4">Revenue & Output Analytics</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={statsData.chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                 <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                 <YAxis yAxisId="left" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                 <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                 <Tooltip cursor={{fill: '#f8fafc'}}/>
                 <Legend wrapperStyle={{fontSize: 10, fontWeight: 'bold'}}/>
                 <Bar yAxisId="left" dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                 <Bar yAxisId="right" dataKey="prints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Distribution Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow border border-slate-100 lg:col-span-2 flex flex-col items-center">
           <h3 className="text-lg font-black text-gov-navy uppercase tracking-tight mb-4 self-start w-full">Certificate Printing Distribution</h3>
           <div className="h-64 w-full md:w-1/2">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend wrapperStyle={{fontSize: 10, fontWeight: 'bold'}}/>
               </PieChart>
             </ResponsiveContainer>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MinistryDashboard;
