import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { translations } from '../translations';

const MinistryDashboard = ({ user, lang }) => {
  const [revenueData, setRevenueData] = useState({ totalRevenue: 0, monthlyRevenue: 0, annualRevenue: 0, issuanceCount: 0, reprintCount: 0 });

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/reports/revenue');
        const data = await res.json();
        if(data.success) {
          setRevenueData(data);
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
    { label: lang === 'ar' ? 'إجمالي المواليد' : 'Total Births', value: '12,847', icon: 'fa-baby', color: 'bg-emerald-500' },
    { label: lang === 'ar' ? 'إجمالي الوفيات' : 'Total Deaths', value: '3,421', icon: 'fa-ribbon', color: 'bg-rose-500' },
    { label: lang === 'ar' ? 'السجلات الصحية' : 'Health Records', value: '45,892', icon: 'fa-users-line', color: 'bg-blue-500' },
    { label: lang === 'ar' ? 'المنشطات النشطة' : 'Active Facilities', value: '156', icon: 'fa-hospital', color: 'bg-amber-500' },
  ];

  const recentActivities = [
    { id: 1, type: 'birth', desc: lang === 'ar' ? 'تسجيل ميلاد جديد' : 'New birth registration', time: '2 min ago' },
    { id: 2, type: 'death', desc: lang === 'ar' ? 'تسجيل وفاة' : 'Death certificate issued', time: '15 min ago' },
    { id: 3, type: 'record', desc: lang === 'ar' ? 'تحديث سجل صحي' : 'Health record updated', time: '1 hour ago' },
    { id: 4, type: 'birth', desc: lang === 'ar' ? 'تسجيل ميلاد جديد' : 'New birth registration', time: '2 hours ago' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100/50 shadow-sm relative overflow-hidden">
            <i className="fa-solid fa-file-signature text-5xl absolute -right-4 -bottom-4 text-emerald-500/10"></i>
            <p className="text-emerald-600/80 font-black text-[9px] uppercase tracking-widest mb-1">Total Free Issuance ($0)</p>
            <p className="text-3xl font-black text-emerald-700 gov-serif tracking-tight">{revenueData.issuanceCount}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-blue-50 rounded-2xl p-6 border border-blue-100/50 shadow-sm relative overflow-hidden">
            <i className="fa-solid fa-copy text-5xl absolute -right-4 -bottom-4 text-blue-500/10"></i>
            <p className="text-blue-600/80 font-black text-[9px] uppercase tracking-widest mb-1">Total Reprints ($10)</p>
            <p className="text-3xl font-black text-blue-700 gov-serif tracking-tight">{revenueData.reprintCount}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-amber-50 rounded-2xl p-6 border border-amber-100/50 shadow-sm relative overflow-hidden">
            <i className="fa-solid fa-sack-dollar text-5xl absolute -right-4 -bottom-4 text-amber-500/10"></i>
            <p className="text-amber-600/80 font-black text-[9px] uppercase tracking-widest mb-1">Total Generated Revenue</p>
            <p className="text-3xl font-black text-amber-700 gov-serif tracking-tight">${revenueData.totalRevenue}</p>
          </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100"
        >
          <h3 className={`text-lg font-black text-gov-navy uppercase tracking-tight mb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            {lang === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  activity.type === 'birth' ? 'bg-emerald-100 text-emerald-500' :
                  activity.type === 'death' ? 'bg-rose-100 text-rose-500' :
                  'bg-blue-100 text-blue-500'
                }`}>
                  <i className={`fa-solid ${
                    activity.type === 'birth' ? 'fa-baby' :
                    activity.type === 'death' ? 'fa-ribbon' :
                    'fa-file-medical'
                  }`}></i>
                </div>
                <div className={`flex-1 min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="text-gov-navy font-bold text-xs truncate">{activity.desc}</p>
                  <p className="text-slate-400 text-[9px] font-medium">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100"
        >
          <h3 className={`text-lg font-black text-gov-navy uppercase tracking-tight mb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            {lang === 'ar' ? 'حالة النظام' : 'System Status'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-slate-600 font-bold text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'قاعدة البيانات' : 'Database'}
              </span>
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                {lang === 'ar' ? 'متصل' : 'Connected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-slate-600 font-bold text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'الخادم' : 'Server'}
              </span>
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                {lang === 'ar' ? 'نشط' : 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-slate-600 font-bold text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'التزامن' : 'Sync'}
              </span>
              <span className="text-blue-500 font-black text-[10px] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                {lang === 'ar' ? 'محدث' : 'Updated'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-slate-600 font-bold text-xs ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {lang === 'ar' ? 'الأمان' : 'Security'}
              </span>
              <span className="text-emerald-500 font-black text-[10px] uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                {lang === 'ar' ? 'مؤمن' : 'Secured'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-gov-navy to-gov-blue rounded-2xl p-8 shadow-xl text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gov-gold rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <h3 className={`text-xl font-black gov-serif uppercase tracking-tight mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            {lang === 'ar' ? 'مرحباً بك في لوحة تحكم الوزارة' : 'Welcome to Ministry Dashboard'}
          </h3>
          <p className={`text-blue-100/80 font-medium text-sm leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            {lang === 'ar' 
              ? 'لديك صلاحيات كاملة لإدارة السجلات الصحية الوطنية ومراقبة النظام.'
              : 'You have full permissions to manage national health records and monitor the system.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default MinistryDashboard;
