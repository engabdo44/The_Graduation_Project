import React, { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { translations } from '../translations';

const COLORS = ['#1e3a8a', '#c5a059', '#10b981', '#0c1e3d', '#f43f5e', '#8b5cf6'];

const DashboardOverview = ({
  dashboardData,
  lang
}) => {
  const t = translations[lang];

  // Safely provide defaults
  const stats = dashboardData?.stats || { totalCrimes: 0, wantedPersons: 0, activeCases: 0, resolvedCases: 0, suspendedCases: 0, underInvestigationCases: 0 };
  const charts = dashboardData?.charts || { distribution: [], categories: [], trendData: [] };
  const tables = dashboardData?.tables || { recentCrimes: [], latestWanted: [] };

  return (
    <div className="space-y-12 animate-in pb-10">
      {/* Official Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          {
            label: t.totalCrimes || 'Total Crimes',
            value: stats.totalCrimes,
            icon: '🚓',
            color: 'bg-blue-50/50 text-blue-900 border-blue-100'
          },
          {
            label: t.investigations || 'Active Cases',
            value: stats.activeCases,
            icon: '⚖️',
            color: 'bg-emerald-50/50 text-emerald-900 border-emerald-100'
          },
          {
            label: t.resolved || 'Resolved Cases',
            value: stats.resolvedCases,
            icon: '🛡️',
            color: 'bg-indigo-50/50 text-indigo-900 border-indigo-100'
          },
          {
            label: t.wanted || 'Wanted Persons',
            value: stats.wantedPersons,
            icon: '🛑',
            color: 'bg-red-50/50 text-red-900 border-red-100'
          },
          {
            label: t.suspended || 'Suspended',
            value: stats.suspendedCases,
            icon: '⏸️',
            color: 'bg-slate-50/50 text-slate-900 border-slate-200'
          },
          {
            label: t.underInvestigation || 'Under Investigation',
            value: stats.underInvestigationCases,
            icon: '🔍',
            color: 'bg-amber-50/50 text-amber-900 border-amber-100'
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-lg hover:translate-y-[-2px] transition-all duration-500">
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
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Crime Activity Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 relative overflow-hidden group shadow-md border border-slate-100">
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="official-heading text-lg font-bold text-slate-900 tracking-tight mb-6">Crime Activity Trend</h3>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="crimes" stroke="#0c1e3d" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Crime Status Distribution Chart */}
        <div className="bg-white rounded-3xl p-8 relative overflow-hidden group shadow-md border border-slate-100 flex flex-col">
          <h3 className="official-heading text-lg font-bold text-slate-900 tracking-tight mb-2">Status Distribution</h3>
          <div className="flex-1 min-h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.distribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {charts.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '11px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Categories Chart */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-8 relative overflow-hidden group shadow-md border border-slate-100">
          <h3 className="official-heading text-lg font-bold text-slate-900 tracking-tight mb-6">Crime Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.categories} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} width={120} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#c5a059" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Crime Reports Table */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
          <h3 className="official-heading text-lg font-bold text-slate-900 tracking-tight mb-6">Recent Crime Reports</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-bold">Case No.</th>
                  <th className="pb-3 font-bold">Crime Type</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {tables.recentCrimes.map((crime, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-700">#{crime.record_id}</td>
                    <td className="py-4 text-xs font-semibold text-slate-800">{crime.crime_type}</td>
                    <td className="py-4">
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${crime.status === 'closed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {crime.status}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-500 whitespace-nowrap">
                      {crime.incident_date ? new Date(crime.incident_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {tables.recentCrimes.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-xs text-slate-400">No recent reports available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Wanted Persons Table */}
        <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
          <h3 className="official-heading text-lg font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            Latest Wanted Persons
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-bold">ID No. / Res No.</th>
                  <th className="pb-3 font-bold">Crime</th>
                  <th className="pb-3 font-bold">Severity</th>
                  <th className="pb-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody>
                {tables.latestWanted.map((wanted, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-700">{wanted.id_number || wanted.residence_number}</td>
                    <td className="py-4 text-xs font-semibold text-slate-800">{wanted.crime_type}</td>
                    <td className="py-4">
                      <span className="text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest bg-red-50 text-red-600">
                        Class {wanted.severity}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-500 whitespace-nowrap">
                      {wanted.incident_date ? new Date(wanted.incident_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {tables.latestWanted.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-xs text-slate-400">No wanted records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardOverview;
