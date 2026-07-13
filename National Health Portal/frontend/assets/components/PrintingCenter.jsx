import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { translations } from '../translations';

const PrintingCenter = ({ user, lang }) => {
  const [queue, setQueue] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    birthPending: 0,
    birthPrinted: 0,
    deathPending: 0,
    deathPrinted: 0,
    totalRevenue: 0
  });

  const fetchQueue = async () => {
    try {
      const qs = new URLSearchParams();
      if (search) qs.append('search', search);
      if (filter) qs.append('status', filter);
      
      const res = await fetch(`http://localhost:5002/api/print_queue?${qs.toString()}`);
      const data = await res.json();
      if (data.success) {
        setQueue(data.queue);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
       const res = await fetch(`http://localhost:5002/api/print_queue/stats`);
       const data = await res.json();
       if(data.success) setStats(data.stats);
    } catch (e) {
       console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchStats();
  }, [search, filter]);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5002/api/print_queue/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, operator: user.name })
      });
      fetchQueue();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div className="flex-1 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center bg-white p-6 rounded-2xl shadow border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-gov-navy uppercase tracking-tighter">Printing Queue Management</h2>
          <p className="text-gov-blue text-xs font-bold uppercase tracking-widest mt-1">Process and Print Approved Certificates from National Systems</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search Applicant or Tracking No..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-gov-blue"
          />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-gov-blue"
          >
            <option value="all">All Tracking Status</option>
            <option value="pending">Pending</option>
            <option value="printing_queue">Printing Queue</option>
            <option value="printed">Printed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </motion.div>

      <div className="bg-white rounded-2xl shadow border border-slate-100 p-6 overflow-x-auto min-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-400">
              <th className="p-4">Tracking Number</th>
              <th className="p-4">Applicant Name</th>
              <th className="p-4">Document Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Requested At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((req, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={req.print_id} 
                className="border-b border-slate-50 hover:bg-slate-50/50"
              >
                <td className="p-4 font-mono text-xs font-bold text-gov-blue">{req.document_number}</td>
                <td className="p-4 font-bold text-gov-navy text-sm uppercase">{req.applicant_name}</td>
                <td className="p-4 whitespace-nowrap"><span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">{req.document_type}</span></td>
                <td className="p-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                    req.status === 'printed' ? 'bg-emerald-50 text-emerald-600' :
                    req.status === 'completed' ? 'bg-gov-navy text-white' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-xs font-bold text-slate-500">{new Date(req.request_date).toLocaleString()}</td>
                <td className="p-4 flex gap-2 justify-end">
                  {req.status === 'printing_queue' && (
                    <button onClick={() => updateStatus(req.print_id, 'printed')} className="bg-gov-blue hover:bg-gov-navy text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gov-blue/20 transition-all active:scale-95">
                      <i className="fa-solid fa-print mr-2"></i> Print & Bill ($10)
                    </button>
                  )}
                  {req.status === 'printed' && (
                    <button onClick={() => updateStatus(req.print_id, 'completed')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                      <i className="fa-solid fa-check mr-2"></i> Mark Completed
                    </button>
                  )}
                  {(req.status === 'completed' || req.status === 'printed') && (
                    <p className="text-[10px] font-bold text-slate-400 mt-2 px-2">Processed by {req.printed_by || 'System'}</p>
                  )}
                </td>
              </motion.tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest">No print requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
      
      {/* Sidebar Statistics */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow border border-slate-100">
          <h2 className="text-lg font-black text-gov-navy uppercase tracking-tighter mb-4">Sidebar Statistics</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-1">Birth Certs Pending</p>
              <p className="text-2xl font-black text-blue-700">{stats.birthPending}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mb-1">Birth Certs Printed</p>
              <p className="text-2xl font-black text-emerald-700">{stats.birthPrinted}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <p className="text-[10px] uppercase font-black tracking-widest text-amber-500 mb-1">Death Certs Pending</p>
              <p className="text-2xl font-black text-amber-700">{stats.deathPending}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <p className="text-[10px] uppercase font-black tracking-widest text-rose-500 mb-1">Death Certs Printed</p>
              <p className="text-2xl font-black text-rose-700">{stats.deathPrinted}</p>
            </div>
            <div className="bg-gov-navy/5 p-4 rounded-xl border border-gov-navy/10 mt-4">
              <p className="text-[10px] uppercase font-black tracking-widest text-gov-navy/60 mb-1">Total Health Printing Revenue</p>
              <p className="text-3xl font-black text-gov-navy">${stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintingCenter;
