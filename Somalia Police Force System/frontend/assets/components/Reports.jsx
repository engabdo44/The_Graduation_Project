import React, { useState, useEffect, useCallback } from 'react';
import { translations } from '../translations';

const Reports = ({ lang, user }) => {
  const [activeReport, setActiveReport] = useState('crime');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const t = translations[lang] || translations.en;

  const logActivity = (action, details) => {
    if (!user) return;
    fetch('http://localhost:5000/api/logs/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id || user.userId,
        action,
        target: `Reports - ${activeReport}`,
        details: JSON.stringify(details)
      })
    }).catch(console.error);
  };

  const reportTabs = [
    { id: 'crime', label: lang === 'ar' ? 'تقارير الجرائم' : 'Crime Reports' },
    { id: 'wanted', label: lang === 'ar' ? 'المطلوبين أمنياً' : 'Wanted Persons Reports' },
    { id: 'case', label: lang === 'ar' ? 'تقارير القضايا' : 'Case Reports' },
    { id: 'officer', label: lang === 'ar' ? 'نشاط الضباط' : 'Officer Activity Reports' },
    { id: 'system', label: lang === 'ar' ? 'سجل النظام' : 'System Activity Reports' },
    { id: 'revenue', label: lang === 'ar' ? 'تقارير الإيرادات' : 'Revenue Reports' }
  ];

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        startDate: dateRange.start || '',
        endDate: dateRange.end || '',
        status: statusFilter,
        crimeType: crimeTypeFilter,
        page: page,
        limit: 10
      });
      const response = await fetch(`http://localhost:5000/api/reports/${activeReport}?${queryParams}`);
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [activeReport, searchTerm, dateRange, statusFilter, crimeTypeFilter, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Handle Tab Change
  const handleTabChange = (tabId) => {
    setActiveReport(tabId);
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setStatusFilter('all');
    setCrimeTypeFilter('all');
    setPage(1);
    logActivity('Report Viewed', { type: tabId });
  };

  // Export functions
  const exportPDF = () => {
    logActivity('Report Exported PDF', { type: activeReport, filters: { searchTerm, statusFilter, dateRange } });
    window.print(); // Simple way to trigger print/save as PDF
  };

  const exportExcel = () => {
    if (data.length === 0) return;
    logActivity('Report Exported Excel', { type: activeReport, count: data.length });
    const headers = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + data.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
                      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Rendering Columns Dynamically
  const renderTableHeaders = () => {
    if (activeReport === 'officer' || activeReport === 'system') {
      return (
        <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
          <th className="p-4 font-bold">User / Officer</th>
          <th className="p-4 font-bold">Action</th>
          <th className="p-4 font-bold">Target</th>
          <th className="p-4 font-bold">Details</th>
          <th className="p-4 font-bold">Date</th>
        </tr>
      );
    } else if (activeReport === 'revenue') {
      return (
        <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
          <th className="p-4 font-bold">Receipt / ID</th>
          <th className="p-4 font-bold">Applicant Name</th>
          <th className="p-4 font-bold">Service</th>
          <th className="p-4 font-bold">Amount</th>
          <th className="p-4 font-bold">Date</th>
        </tr>
      );
    }
    return (
      <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
        <th className="p-4 font-bold">Case No</th>
        <th className="p-4 font-bold">ID / Res No.</th>
        <th className="p-4 font-bold">Crime Type</th>
        <th className="p-4 font-bold">Severity</th>
        <th className="p-4 font-bold">Status</th>
        <th className="p-4 font-bold">Date</th>
      </tr>
    );
  };

  const renderTableRows = () => {
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="py-12 text-center text-sm text-slate-400 font-medium">
            {lang === 'ar' ? 'لا توجد بيانات متاحة لهذه الفلاتر.' : 'No data available for the selected filters.'}
          </td>
        </tr>
      );
    }

    return data.map((item, idx) => {
      if (activeReport === 'officer' || activeReport === 'system') {
        return (
          <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="p-4 text-xs font-bold text-slate-700">{item.officer_name || item.username || 'System'}</td>
            <td className="p-4 text-xs font-semibold text-[#0b1528] uppercase">{item.action}</td>
            <td className="p-4 text-xs text-slate-500">{item.target || item.module_name || 'N/A'}</td>
            <td className="p-4 text-[11px] text-slate-500 max-w-xs truncate" title={item.details || item.description}>{item.details || item.description || '-'}</td>
            <td className="p-4 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</td>
          </tr>
        );
      } else if (activeReport === 'revenue') {
        return (
          <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <td className="p-4 text-xs font-bold text-slate-700">{item.receipt_number || item.request_id || item.revenue_id || '-'}</td>
            <td className="p-4 text-xs font-semibold text-slate-600">{item.applicant_name || '-'}</td>
            <td className="p-4 text-xs text-slate-500">{item.service_name || '-'}</td>
            <td className="p-4 text-xs font-black text-emerald-600">${item.amount}</td>
            <td className="p-4 text-xs text-slate-500">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}</td>
          </tr>
        );
      }
      return (
        <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition">
          <td className="p-4 text-xs font-bold text-slate-700">#{item.record_id}</td>
          <td className="p-4 text-xs font-semibold text-slate-600">{item.id_number || item.residence_number}</td>
          <td className="p-4 text-xs font-semibold text-slate-800">{item.crime_type}</td>
          <td className="p-4 text-xs font-bold text-slate-500">Class {item.severity}</td>
          <td className="p-4">
            <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600`}>
              {item.status?.replace('_', ' ')}
            </span>
          </td>
          <td className="p-4 text-xs text-slate-500">{item.incident_date ? new Date(item.incident_date).toLocaleDateString() : 'N/A'}</td>
        </tr>
      );
    });
  };

  return (
    <div className={`space-y-8 animate-in pb-10 ${lang === 'ar' ? 'text-right' : 'text-left'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 flex flex-col md:flex-row gap-6">
        {/* Sidebar for Reports */}
        <div className={`w-full md:w-64 space-y-2 border-slate-100 shrink-0 ${lang === 'ar' ? 'border-l pl-6' : 'border-r pr-6'}`}>
          <h3 className="official-heading text-lg font-bold text-slate-900 tracking-tight mb-6">
            {lang === 'ar' ? 'أنواع التقارير' : 'Report Types'}
          </h3>
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                activeReport === tab.id
                  ? 'bg-[#0b1528] text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area for Reports */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 print:hidden">
            <h2 className="official-heading text-2xl font-black text-slate-900 tracking-tight">
              {reportTabs.find(t => t.id === activeReport)?.label}
            </h2>
            <div className="flex gap-2">
              <button onClick={fetchReports} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition flex items-center gap-2">
                🔄 {lang === 'ar' ? 'تحديث' : 'Refresh'}
              </button>
              <button onClick={exportPDF} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition">
                📄 Export PDF
              </button>
              <button onClick={exportExcel} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition">
                📊 Export Excel
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100 print:hidden">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {lang === 'ar' ? 'بحث' : 'Search Bar'}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث في التقرير...' : 'Search report data (Name, ID, Type)...'}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0b1528]/20 focus:border-[#0b1528] outline-none transition-all placeholder:text-slate-300"
              />
            </div>
            {(activeReport === 'crime' || activeReport === 'case') && (
              <>
                <div className="w-32">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0b1528] outline-none"
                  >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="suspended">Suspended</option>
                    <option value="under_investigation">Under Investigation</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0b1528]/20 focus:border-[#0b1528] outline-none transition-all text-slate-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#0b1528]/20 focus:border-[#0b1528] outline-none transition-all text-slate-600"
              />
            </div>
            <button 
              onClick={() => { 
                setPage(1); 
                fetchReports(); 
                if (searchTerm) logActivity('Search Performed', { query: searchTerm, filters: { statusFilter, dateRange, crimeTypeFilter } });
                else logActivity('Filter Applied', { filters: { statusFilter, dateRange, crimeTypeFilter } });
              }}
              className="px-6 py-2 bg-[#0b1528] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#162a4d] shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
            >
              Filter
            </button>
          </div>

          {/* Table Area */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#0b1528]/20 border-t-[#0b1528] rounded-full animate-spin"></div>
              </div>
            )}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  {renderTableHeaders()}
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {renderTableRows()}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination limit control & text */}
          <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-4 print:hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {data.length} of {pagination.total} Records
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded text-xs font-bold transition"
              >
                Prev
              </button>
              <span className="px-3 py-1 bg-[#0b1528] text-white rounded text-xs font-bold">{page} / {pagination.totalPages || 1}</span>
              <button 
                disabled={page >= pagination.totalPages} 
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded text-xs font-bold transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
