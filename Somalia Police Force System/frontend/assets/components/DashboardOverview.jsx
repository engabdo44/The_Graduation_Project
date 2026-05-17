import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { translations } from '../translations';
const weeklyData = [{
  name: 'Mon',
  active: 140,
  closed: 120
}, {
  name: 'Tue',
  active: 160,
  closed: 150
}, {
  name: 'Wed',
  active: 110,
  closed: 90
}, {
  name: 'Thu',
  active: 180,
  closed: 160
}, {
  name: 'Fri',
  active: 210,
  closed: 140
}, {
  name: 'Sat',
  active: 250,
  closed: 210
}, {
  name: 'Sun',
  active: 190,
  closed: 170
}];
const DashboardOverview = ({
  stats,
  lang
}) => {
  const t = translations[lang];
  return <div className="space-y-12 animate-in">
      {/* Official Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{
        label: t.totalCrimes,
        value: stats.totalCrimes,
        icon: '🚓',
        color: 'bg-blue-50/50 text-blue-900 border-blue-100'
      }, {
        label: t.wanted,
        value: stats.wantedPersons,
        icon: '🛑',
        color: 'bg-red-50/50 text-red-900 border-red-100'
      }, {
        label: t.investigations,
        value: stats.activeInvestigations,
        icon: '⚖️',
        color: 'bg-amber-50/50 text-amber-900 border-amber-100'
      }, {
        label: t.resolved,
        value: stats.resolvedCases,
        icon: '🛡️',
        color: 'bg-emerald-50/50 text-emerald-900 border-emerald-100'
      }].map((stat, i) => <div key={i} className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-lg hover:translate-y-[-2px] transition-all duration-500`}>
            <div className="absolute -top-4 -right-4 w-16 h-16 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-700">
               <img src="/logo.svg" alt="Seal" />
            </div>
            <div className="relative z-10">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                <span className="w-1 h-2 bg-slate-200 rounded-full"></span>
                {stat.label}
              </p>
              <h4 className="official-heading text-4xl font-black text-slate-900 tracking-tighter leading-none">{stat.value.toLocaleString()}</h4>
            </div>
          </div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 relative overflow-hidden group shadow-md border border-slate-100">
          <div className="official-seal-bg absolute inset-0 opacity-[0.01] group-hover:scale-105 transition-transform duration-[10s]"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
               <div>
                  <h3 className="official-heading text-lg font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    Monitoring Trend
                  </h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1.5">National Analytics Source // Federal Registry</p>
               </div>
               <div className="flex gap-4 bg-slate-50/50 px-4 py-2 rounded-full border border-slate-100">
                  <div className="flex items-center gap-2">
                     <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-slate-500">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-slate-500">Resolved</span>
                  </div>
               </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0c1e3d" stopOpacity={0.05} />
                      <stop offset="95%" stopColor="#0c1e3d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                  fontSize: 8,
                  fontWeight: 700,
                  fill: '#94a3b8',
                  letterSpacing: '0.1em'
                }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{
                  fontSize: 8,
                  fontWeight: 700,
                  fill: '#94a3b8'
                }} dx={-10} />
                  <Tooltip contentStyle={{
                  borderRadius: '1.5rem',
                  border: 'none',
                  backgroundColor: '#fff',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  fontWeight: 700,
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  tracking: '0.1em',
                  padding: '12px 20px'
                }} />
                  <Area type="monotone" dataKey="active" stroke="#0c1e3d" strokeWidth={3} fill="url(#colorActive)" />
                  <Area type="monotone" dataKey="closed" stroke="#c5a059" strokeWidth={2} fill="transparent" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Emergency Dispatch Sidebar */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-sm group">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03] group-hover:scale-110 transition-transform duration-[8s] translate-x-8 -translate-y-8">
             <img src="/logo.svg" alt="Seal" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="official-heading text-base font-bold text-slate-900 tracking-tight mb-8 flex items-center gap-3">
              {t.emergency}
            </h3>
            <div className="space-y-6 flex-1">
              {[{
              district: 'Hodan',
              alert: 'Armed Robbery',
              time: '2m',
              priority: 'Critical',
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            }, {
              district: 'Wadajir',
              alert: 'Traffic Disruption',
              time: '14m',
              priority: 'Medium',
              color: 'text-blue-700',
              bgColor: 'bg-blue-50'
            }, {
              district: 'Bondhere',
              alert: 'Suspect Sighting',
              time: '28m',
              priority: 'Critical',
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            }, {
              district: 'Daynile',
              alert: 'Perimeter Breach',
              time: '41m',
              priority: 'High',
              color: 'text-amber-700',
              bgColor: 'bg-amber-50'
            }].map((alert, i) => <div key={i} className="pb-4 border-b border-slate-50 last:border-0 group/item">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[7px] font-bold rounded-full px-2 py-0.5 uppercase tracking-widest ${alert.color} ${alert.bgColor}`}>{alert.priority}</span>
                    <span className="text-[7px] font-medium text-slate-300 group-hover/item:text-slate-400 transition-colors uppercase">{alert.time} AGO</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-0.5 tracking-tight group-hover/item:translate-x-1 transition-transform">{alert.alert}</p>
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest italic">{alert.district} Sector</p>
                </div>)}
            </div>
            
            <button className="mt-8 w-full py-3.5 bg-[#0b1528] text-white text-[8px] font-bold uppercase tracking-[0.4em] rounded-xl hover:bg-[#162a4d] transition-all shadow-xl shadow-blue-900/10 active:scale-95">
               Live Dispatch Terminal
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default DashboardOverview;
