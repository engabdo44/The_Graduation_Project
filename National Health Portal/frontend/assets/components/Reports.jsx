import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = ({ user, lang }) => {
  const [activeTab, setActiveTab] = useState('BIRTH_CERTS');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [vitalStats, setVitalStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [certNum, setCertNum] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [facility, setFacility] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Role Checks
  const role = user?.account_type || user?.role || '';
  const canViewMedicalRecords = ['Ministry Health Admin', 'Ministry_Health_Admin', 'Health Officer'].includes(role);
  const canViewCertificates = ['Ministry Health Admin', 'Ministry_Health_Admin', 'Registrar', 'Printing Officer'].includes(role);
  
  useEffect(() => {
    // Reset filters on tab change
    setSearch(''); setCertNum(''); setStatus(''); setDateFrom(''); setDateTo(''); 
    setFacility(''); setDiagnosis(''); setPage(1); setStats(null); setRecords([]);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'BIRTH_CERTS' || activeTab === 'MED_RECORDS' || activeTab === 'DEATH_CERTS') {
      loadData();
    } else if (activeTab === 'VITAL_STATS') {
      loadVitalStats();
    }
  }, [page, activeTab]);

  useEffect(() => {
    // Load Dashboard Overall Stats once
    fetch('http://localhost:5002/api/dashboard/stats')
      .then(r => r.json())
      .then(d => { if(d.success) setDashboardStats(d); })
      .catch(e => console.error(e));
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const queryParams = new URLSearchParams({ search, certNum, status, dateFrom, dateTo, facility, diagnosis, page, limit: 10 });
        let endpoint = '';
        if (activeTab === 'BIRTH_CERTS') endpoint = '/api/reports/birth-certificates';
        else if (activeTab === 'MED_RECORDS') endpoint = '/api/reports/medical-records';
        else if (activeTab === 'DEATH_CERTS') endpoint = '/api/reports/death-certificates';

        const res = await fetch(`http://localhost:5002${endpoint}?${queryParams}`);
        const data = await res.json();
        if(data.success) {
            setRecords(data.records);
            setStats(data.stats);
            setTotalPages(data.pages || 1);
        }
    } catch(err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const loadVitalStats = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({ search, dateFrom, dateTo });
      const res = await fetch(`http://localhost:5002/api/reports/vital-statistics?${queryParams}`);
      const data = await res.json();
      if(data.success) {
        setVitalStats(data.stats);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateRequestStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5002/api/certificates/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           status: newStatus, 
           user_id: user?.id, 
           username: user?.name, 
           account_type: user?.role 
        })
      });
      if (res.ok) {
         loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportExcel = () => {
    let headers = [];
    let rows = [];

    if (activeTab === 'BIRTH_CERTS') {
      headers = ['Date', 'Certificate #', 'Citizen Name', 'Type', 'Fee', 'Status'];
      rows = records.map(r => [new Date(r.created_at).toLocaleDateString(), r.certificate_number || '-', r.patient_name, r.service_type, r.fee, r.status]);
    } else if (activeTab === 'MED_RECORDS') {
      headers = ['Registration Date', 'Medical Record #', 'Patient Name', 'National ID', 'Facility', 'Blood Type', 'Allergies', 'Last Checkup'];
      rows = records.map(r => [new Date(r.created_at).toLocaleDateString(), r.health_record_id, r.full_name, r.id_number, r.region, r.blood_type, r.allergies, new Date(r.last_checkup).toLocaleDateString()]);
    } else if (activeTab === 'DEATH_CERTS') {
      headers = ['Registration Date', 'Certificate #', 'Name', 'Date of Death', 'Cause of Death', 'Facility'];
      rows = records.map(r => [new Date(r.created_at).toLocaleDateString(), r.registry_number, r.full_name, new Date(r.dod).toLocaleDateString(), r.cause_of_death, r.place_of_death]);
    } else if (activeTab === 'VITAL_STATS') {
      headers = ['Total Birth Registrations', 'Total Death Registrations', 'Birth-to-Death Ratio'];
      rows = [[vitalStats?.totalBirthRegistrations || 0, vitalStats?.totalDeathRegistrations || 0, vitalStats?.birthToDeathRatio || 0]];
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gov-blue font-black text-[9px] tracking-[0.3em] uppercase opacity-80">Ministry of Health Analytics</span>
          </div>
        </div>
      </motion.header>

      {/* Mini Dashboard Integration in Reports */}
      {dashboardStats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Births" value={dashboardStats.totalBirths} color="emerald" />
          <StatCard label="Total Deaths" value={dashboardStats.totalDeaths} color="rose" />
          <StatCard label="Total Med Records" value={dashboardStats.totalMedicalRecords} color="blue" /> 
          <StatCard label="Total Reprints ($10)" value={dashboardStats.totalReprintsRevenue / 10} color="amber" />
          <StatCard label="Total Revenue" value={`$${dashboardStats.totalGeneratedRevenue}`} color="gov-gold" />
        </div>
      )}

      {/* Tabs */}
      <div className={`flex bg-slate-100 p-1 rounded-xl w-full overflow-x-auto ${lang === 'ar' ? 'ml-auto' : ''}`}>
        {canViewCertificates && (
          <TabButton active={activeTab === 'BIRTH_CERTS'} onClick={() => setActiveTab('BIRTH_CERTS')} label="Birth Certificates" />
        )}
        {canViewMedicalRecords && (
          <TabButton active={activeTab === 'MED_RECORDS'} onClick={() => setActiveTab('MED_RECORDS')} label="Medical Records" />
        )}
        {canViewCertificates && (
          <TabButton active={activeTab === 'DEATH_CERTS'} onClick={() => setActiveTab('DEATH_CERTS')} label="Death Certificates" />
        )}
        <TabButton active={activeTab === 'VITAL_STATS'} onClick={() => setActiveTab('VITAL_STATS')} label="Vital Statistics" />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
        
        {/* Dynamic Filters depending on Tab */}
        <div className={`flex gap-3 mb-6 flex-wrap ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-center`}>
            {activeTab !== 'VITAL_STATS' && (
              <input type="text" placeholder={activeTab === 'MED_RECORDS' ? "Patient Name / ID" : "Citizen Name"} value={search} onChange={e=>setSearch(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue text-sm" />
            )}
            
            {(activeTab === 'BIRTH_CERTS' || activeTab === 'DEATH_CERTS') && (
              <input type="text" placeholder="Certificate Number" value={certNum} onChange={e=>setCertNum(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue text-sm" />
            )}
            
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue text-sm" />
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue text-sm" />

            {activeTab === 'MED_RECORDS' && (
              <>
                <input type="text" placeholder="Facility Name" value={facility} onChange={e=>setFacility(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue text-sm" />
                <input type="text" placeholder="Diagnosis / History" value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue text-sm" />
              </>
            )}
            {activeTab === 'DEATH_CERTS' && (
              <>
                <input type="text" placeholder="Facility" value={facility} onChange={e=>setFacility(e.target.value)} className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-gov-blue text-sm" />
              </>
            )}

            <button onClick={() => { setPage(1); if(activeTab === 'VITAL_STATS') loadVitalStats(); else loadData(); }} className="bg-gov-navy text-gov-gold px-6 rounded-xl font-black uppercase text-[10px] hover:bg-black transition-all h-10">Filter</button>
            <button onClick={() => { setPage(1); if(activeTab === 'VITAL_STATS') loadVitalStats(); else loadData(); }} className="bg-slate-100 text-slate-500 px-4 rounded-xl font-black uppercase text-[10px] hover:bg-slate-200 transition-all h-10 ml-2" title="Refresh">
              <i className="fa-solid fa-arrows-rotate"></i>
            </button>

            <div className="flex gap-2 ml-auto">
              <button onClick={() => window.print()} className="bg-gov-blue text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-gov-navy transition-all flex items-center gap-2"><i className="fa-solid fa-file-pdf"></i> PDF</button>
              <button onClick={exportExcel} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-emerald-600 transition-all flex items-center gap-2"><i className="fa-solid fa-file-excel"></i> Excel</button>
            </div>
        </div>

        {/* Tab content bodies */}
        {loading ? (
           <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest"><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading Data...</div>
        ) : (
           <>
              {activeTab === 'BIRTH_CERTS' && (
                <>
                  {stats && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <MiniStat label="Total Issuance" value={stats.totalIssuance} />
                      <MiniStat label="Total Reprints" value={stats.totalReprints} />
                      <MiniStat label="Pending Reqs" value={stats.pendingReqs} />
                      <MiniStat label="Revenue" value={`$${stats.revenue}`} />
                    </div>
                  )}
                  <div className="overflow-x-auto">
                      <table className={`w-full text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                              <tr>
                                  <th className="p-4">Date</th><th className="p-4">Certificate #</th><th className="p-4">Citizen Name</th><th className="p-4">Type</th><th className="p-4">Fee</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {records.map(r => (
                                  <tr key={r.request_id} className="hover:bg-slate-50">
                                      <td className="p-4 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                                      <td className="p-4 font-bold text-gov-navy">{r.certificate_number || '-'}</td>
                                      <td className="p-4 font-bold">{r.patient_name}</td>
                                      <td className="p-4"><span className={`px-2 py-1 rounded text-[9px] uppercase font-black ${r.service_type === 'ISSUANCE' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{r.service_type}</span></td>
                                      <td className="p-4 font-black">${r.fee}</td>
                                      <td className="p-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">{r.status}</span></td>
                                      <td className="p-4 flex gap-2 justify-end">
                                          <button className="bg-slate-200 text-slate-600 px-3 py-1 rounded text-[9px] font-bold uppercase transition-all shadow-sm hover:bg-slate-300">View</button>
                                          {r.status === 'submitted' && (
                                              <>
                                                  <button onClick={() => updateRequestStatus(r.request_id, 'approved')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-[9px] font-bold uppercase transition-all shadow-sm shadow-emerald-500/20">Approve</button>
                                                  <button onClick={() => updateRequestStatus(r.request_id, 'rejected')} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-[9px] font-bold uppercase transition-all shadow-sm shadow-rose-500/20">Reject</button>
                                              </>
                                          )}
                                          {r.status === 'approved' && (
                                              <button onClick={() => updateRequestStatus(r.request_id, 'printing_queue')} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-[9px] font-bold uppercase transition-all shadow-sm shadow-blue-500/20">Send to Printing</button>
                                          )}
                                          {r.status === 'printing_queue' && (
                                              <button onClick={() => updateRequestStatus(r.request_id, 'printed')} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-[9px] font-bold uppercase transition-all shadow-sm shadow-indigo-500/20">Mark as Printed</button>
                                          )}
                                          {r.status === 'printed' && (
                                              <button onClick={() => updateRequestStatus(r.request_id, 'completed')} className="bg-gov-gold hover:bg-yellow-600 text-white px-3 py-1 rounded text-[9px] font-bold uppercase transition-all shadow-sm shadow-gov-gold/20">Complete</button>
                                          )}
                                      </td>
                                  </tr>
                              ))}
                              {records.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold">No records found</td></tr>}
                          </tbody>
                      </table>
                  </div>
                </>
              )}

              {activeTab === 'MED_RECORDS' && (
                <>
                  {stats && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <MiniStat label="Total Medical Records" value={stats.totalMedicalRecords} />
                      <MiniStat label="Active Medical Records" value={stats.activeMedicalRecords} />
                      <MiniStat label="Archived Medical Records" value={stats.archivedMedicalRecords} />
                    </div>
                  )}
                  <div className="overflow-x-auto">
                      <table className={`w-full text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                              <tr>
                                  <th className="p-4">Record #</th><th className="p-4">Patient Name</th><th className="p-4">National ID</th><th className="p-4">Diagnosis / History</th><th className="p-4">Facility</th><th className="p-4">Last Checkup</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {records.map(r => (
                                  <tr key={r.health_record_id} className="hover:bg-slate-50">
                                      <td className="p-4 font-bold text-gov-blue">{r.health_record_id}</td>
                                      <td className="p-4 font-bold">{r.full_name}</td>
                                      <td className="p-4 text-slate-500">{r.id_number}</td>
                                      <td className="p-4 text-xs max-w-xs truncate">{r.medical_history}</td>
                                      <td className="p-4 text-xs font-bold text-gov-navy">{r.region}</td>
                                      <td className="p-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">{new Date(r.last_checkup).toLocaleDateString()}</span></td>
                                  </tr>
                              ))}
                              {records.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold">No records found</td></tr>}
                          </tbody>
                      </table>
                  </div>
                </>
              )}

              {activeTab === 'DEATH_CERTS' && (
                <>
                  {stats && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <MiniStat label="Total Death Certificates" value={stats.totalDeathCertificates} />
                      <MiniStat label="Deaths This Month" value={stats.deathsThisMonth} />
                    </div>
                  )}
                  <div className="overflow-x-auto">
                      <table className={`w-full text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                              <tr>
                                  <th className="p-4">Cert #</th><th className="p-4">Name</th><th className="p-4">Date of Death</th><th className="p-4">Cause of Death</th><th className="p-4">Facility</th><th className="p-4">Registration</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {records.map(r => (
                                  <tr key={r.death_id} className="hover:bg-slate-50">
                                      <td className="p-4 font-bold text-rose-500">{r.registry_number}</td>
                                      <td className="p-4 font-bold">{r.full_name}</td>
                                      <td className="p-4 font-black">{new Date(r.dod).toLocaleDateString()}</td>
                                      <td className="p-4 text-xs text-slate-600 truncate max-w-[150px]">{r.cause_of_death}</td>
                                      <td className="p-4 text-xs font-bold">{r.place_of_death}</td>
                                      <td className="p-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">{new Date(r.created_at).toLocaleDateString()}</span></td>
                                  </tr>
                              ))}
                              {records.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold">No records found</td></tr>}
                          </tbody>
                      </table>
                  </div>
                </>
              )}

              {activeTab === 'VITAL_STATS' && vitalStats && (
                <div className="space-y-8 p-4">
                   <div className="grid grid-cols-3 gap-6">
                      <div className="bg-emerald-50 rounded-2xl p-6 text-emerald-700">
                         <p className="text-[10px] uppercase font-black mb-1">Total Birth Registrations</p>
                         <p className="text-3xl font-black gov-serif">{vitalStats.totalBirthRegistrations}</p>
                      </div>
                      <div className="bg-rose-50 rounded-2xl p-6 text-rose-700">
                         <p className="text-[10px] uppercase font-black mb-1">Total Death Registrations</p>
                         <p className="text-3xl font-black gov-serif">{vitalStats.totalDeathRegistrations}</p>
                      </div>
                      <div className="bg-blue-50 rounded-2xl p-6 text-blue-700">
                         <p className="text-[10px] uppercase font-black mb-1">Birth-to-Death Ratio</p>
                         <p className="text-3xl font-black gov-serif">{vitalStats.birthToDeathRatio} : 1</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white border text-center border-slate-100 rounded-2xl p-6 shadow-sm">
                         <h3 className="text-sm font-black uppercase text-slate-400 mb-6">Demographic Growth Analysis</h3>
                         <div className="h-64">
                            {dashboardStats && dashboardStats.chartData && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={dashboardStats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{fontSize: 10, fontWeight: 'bold'}} />
                                    <Line type="monotone" dataKey="births" stroke="#10b981" strokeWidth={3} />
                                    <Line type="monotone" dataKey="deaths" stroke="#f43f5e" strokeWidth={3} />
                                  </LineChart>
                                </ResponsiveContainer>
                            )}
                         </div>
                      </div>
                      <div className="bg-white border text-center border-slate-100 rounded-2xl p-6 shadow-sm">
                         <h3 className="text-sm font-black uppercase text-slate-400 mb-6">Facility Registration Distributions</h3>
                         <div className="h-64">
                            {dashboardStats && dashboardStats.chartData && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={dashboardStats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{fontSize: 10, fontWeight: 'bold'}} />
                                    <Bar dataKey="births" stackId="a" fill="#10b981" barSize={32} />
                                    <Bar dataKey="deaths" stackId="a" fill="#f43f5e" barSize={32} />
                                  </BarChart>
                                </ResponsiveContainer>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
              )}
           </>
        )}
        
        {/* Pagination */}
        {activeTab !== 'VITAL_STATS' && (
          <div className="flex justify-between items-center mt-6">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg disabled:opacity-50">Previous</button>
              <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${active ? 'bg-white shadow text-gov-blue' : 'text-slate-500 hover:text-slate-800'}`}
  >
      {label}
  </button>
);

const StatCard = ({ label, value, color }) => {
  const borderColor = color === 'emerald' ? 'border-b-emerald-500' : 
                      color === 'rose' ? 'border-b-rose-500' : 
                      color === 'blue' ? 'border-b-blue-500' : 
                      color === 'amber' ? 'border-b-amber-500' : 
                      color === 'gov-gold' ? 'border-b-gov-gold' : 'border-b-slate-500';

  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-md border-b-4 ${borderColor}`}>
        <h4 className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">{label}</h4>
        <p className={`text-2xl font-black ${color === 'gov-gold' ? 'text-gov-gold' : 'text-slate-800'} gov-mono`}>{value}</p>
    </div>
  );
};

const MiniStat = ({ label, value }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
    <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest mb-1">{label}</p>
    <p className="text-lg font-black text-gov-navy">{value}</p>
  </div>
);

export default Reports;
