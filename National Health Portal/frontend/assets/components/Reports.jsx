import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { translations } from '../translations';

const Reports = ({ lang }) => {
  const [activeReport, setActiveReport] = useState('BIRTH_CERTS');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [certNum, setCertNum] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
        const queryParams = new URLSearchParams({ search, certNum, status, dateFrom, dateTo });
        const res = await fetch(`http://localhost:5002/api/reports/birth-certificates?${queryParams}`);
        const data = await res.json();
        if(data.success) {
            setRecords(data.records);
            setStats(data.stats);
        }
    } catch(err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className={`space-y-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <motion.header 
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`flex ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-end border-b-2 border-gov-gold pb-4`}
      >
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-black text-gov-navy uppercase tracking-tighter gov-serif">
            {lang === 'ar' ? 'تقارير النظام' : 'System Reports'}
          </h2>
          <div className={`flex items-center gap-2 mt-1 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-gov-blue font-black text-[9px] tracking-[0.3em] uppercase opacity-80">Ministry of Health Analytics</span>
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <div className={`flex bg-slate-100 p-1 rounded-xl w-max ${lang === 'ar' ? 'ml-auto' : ''}`}>
        <button className="px-6 py-2 bg-white shadow text-gov-blue rounded-lg font-bold text-xs">
            Birth Certificate Reports
        </button>
      </div>

      {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Issuance ($0)" value={stats.totalIssuance} color="emerald" />
              <StatCard label="Total Reprints ($10)" value={stats.totalReprints} color="blue" />
              <StatCard label="Pending Reprints" value={stats.pendingReqs} color="amber" />
              <StatCard label="Total Revenue" value={`$${stats.revenue}`} color="gov-gold" />
          </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
        <div className={`flex gap-3 mb-6 flex-wrap ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <input type="text" placeholder="Citizen Name" value={search} onChange={e=>setSearch(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue" />
            <input type="text" placeholder="Certificate Number" value={certNum} onChange={e=>setCertNum(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue" />
            <select value={status} onChange={e=>setStatus(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue">
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="printing_queue">Printing Queue</option>
                <option value="completed">Completed</option>
            </select>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue" />
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue" />
            <button onClick={loadData} className="bg-gov-navy text-gov-gold px-6 rounded-xl font-black uppercase text-[10px] hover:bg-black transition-all">Filter</button>
            <button onClick={() => window.print()} className="bg-gov-blue text-white px-6 rounded-xl font-black uppercase text-[10px] hover:bg-gov-navy transition-all ml-auto"><i className="fa-solid fa-file-pdf mr-2"></i> Export</button>
        </div>

        <div className="overflow-x-auto">
            <table className={`w-full text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-4 rounded-tl-xl">Date</th>
                        <th className="p-4">Certificate #</th>
                        <th className="p-4">Citizen Name</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Fee</th>
                        <th className="p-4 rounded-tr-xl">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {records.map(r => (
                        <tr key={r.request_id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                            <td className="p-4 font-bold text-gov-navy">{r.certificate_number || '-'}</td>
                            <td className="p-4 font-bold">{r.patient_name}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded tracking-widest text-[9px] uppercase font-black ${r.service_type === 'ISSUANCE' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{r.service_type}</span></td>
                            <td className="p-4 font-black">${r.fee}</td>
                            <td className="p-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">{r.status}</span></td>
                        </tr>
                    ))}
                    {records.length === 0 && (
                        <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold">No records found</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">{label}</h4>
        <p className={`text-3xl font-black text-${color === 'gov-gold' ? 'gov-gold' : 'gov-navy'}`}>{value}</p>
    </div>
);

export default Reports;
