import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Calendar, Download, RefreshCw, ChevronLeft, ChevronRight,
    FileText, Plane, DollarSign, Printer, Users, ScrollText,
    CheckCircle2, Clock, XCircle, AlertCircle, ArrowUpDown, Filter
} from 'lucide-react';

const API = 'http://localhost:5000';

// ─── Shared helpers ────────────────────────────────────────────────────────────

const statusBadge = (status) => {
    const map = {
        pending: 'bg-amber-50 text-amber-700 border border-amber-200',
        approved: 'bg-green-50 text-green-700 border border-green-200',
        rejected: 'bg-red-50 text-red-700 border border-red-200',
        completed: 'bg-blue-50 text-blue-700 border border-blue-200',
        printing_queue: 'bg-purple-50 text-purple-700 border border-purple-200',
        printed: 'bg-teal-50 text-teal-700 border border-teal-200',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';
const fmtDatetime = (d) => d ? new Date(d).toLocaleString('en-GB') : '—';
const fmtMoney = (n) => {
    const num = parseFloat(n || 0);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}k`;
    return `$${num.toFixed(2)}`;
};

const SummaryCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className={`${bg} rounded-2xl p-5 border border-white/60 dark:border-white/5 flex items-start gap-4`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${color} bg-white/80`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const ReportToolbar = ({ search, setSearch, from, setFrom, to, setTo, onRefresh, onExportPDF, onExportExcel, title }) => (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-all"
            />
        </div>
        <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="py-2.5 px-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 transition-all" />
            <span className="text-gray-400 text-xs font-bold">—</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="py-2.5 px-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 transition-all" />
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 hover:text-primary-600 transition-all" title="Refresh">
                <RefreshCw size={14} />
            </button>
            <button onClick={onExportPDF}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">
                <Download size={12} /> PDF
            </button>
            <button onClick={onExportExcel}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm">
                <Download size={12} /> Excel
            </button>
        </div>
    </div>
);

const Pagination = ({ page, totalPages, setPage }) => totalPages <= 1 ? null : (
    <div className="flex items-center justify-center gap-2 mt-6">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return (
                <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${pg === page ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                    {pg}
                </button>
            );
        })}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            <ChevronRight size={16} />
        </button>
    </div>
);

const exportCSV = (headers, rows, filename) => {
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
};

const exportPDF = (title, headers, rows) => {
    const win = window.open('', '_blank');
    const tableRows = rows.map(r =>
        `<tr>${headers.map(h => `<td style="padding:6px 10px;border:1px solid #ddd;font-size:11px">${r[h] ?? '—'}</td>`).join('')}</tr>`
    ).join('');
    win.document.write(`
        <html><head><title>${title}</title><style>
            body{font-family:Arial,sans-serif;padding:20px}
            h1{font-size:18px;margin-bottom:16px;color:#1e3a5f}
            table{width:100%;border-collapse:collapse}
            th{background:#1e3a5f;color:white;padding:8px 10px;font-size:11px;text-align:left}
        </style></head><body>
        <h1>${title} — ${new Date().toLocaleDateString()}</h1>
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table>
        </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
};

const PageHeader = ({ icon: Icon, title, subtitle, iconBg }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center shadow-lg text-white`}>
            <Icon size={28} />
        </div>
        <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
    </div>
);

const EmptyState = ({ message }) => (
    <tr><td colSpan="20" className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                <FileText size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-bold text-sm">{message || 'No data found.'}</p>
        </div>
    </td></tr>
);

// ─── National ID Reports ────────────────────────────────────────────────────────
export const NationalIDReport = () => {
    const [data, setData] = useState({ records: [], total: 0, pages: 0, summary: {} });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('request_date');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ search, from, to, status, page, sortBy, sortOrder, limit: 20 });
            const res = await fetch(`${API}/api/admin/reports/national-id?${p}`);
            const d = await res.json();
            if (d.success) setData(d);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [search, from, to, status, page, sortBy, sortOrder]);

    useEffect(() => { fetch_(); }, [fetch_]);
    useEffect(() => { setPage(1); }, [search, from, to, status]);

    const s = data.summary || {};
    const pdfHeaders = ['Name', 'National No.', 'Service Type', 'Status', 'Request Date'];
    const pdfRows = data.records.map(r => ({
        'Name': r.citizen?.full_name || r.resident?.full_name || '—',
        'National No.': r.citizen?.national_number || '—',
        'Service Type': r.service_type,
        'Status': r.status,
        'Request Date': fmtDate(r.request_date),
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader icon={FileText} title="National ID Reports" subtitle="New Applications • Renewals • Replacements" iconBg="bg-blue-600" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total" value={data.total} icon={FileText} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
                <SummaryCard label="New Applications" value={s.newCount ?? '—'} icon={FileText} color="text-green-600" bg="bg-green-50 dark:bg-green-500/10" />
                <SummaryCard label="Renewals" value={s.renewalCount ?? '—'} icon={RefreshCw} color="text-teal-600" bg="bg-teal-50 dark:bg-teal-500/10" />
                <SummaryCard label="Replacements" value={s.replacementCount ?? '—'} icon={AlertCircle} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" />
                <SummaryCard label="Pending" value={s.pendingCount ?? '—'} icon={Clock} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" />
                <SummaryCard label="Approved" value={s.approvedCount ?? '—'} icon={CheckCircle2} color="text-green-600" bg="bg-green-50 dark:bg-green-500/10" />
                <SummaryCard label="Rejected" value={s.rejectedCount ?? '—'} icon={XCircle} color="text-red-600" bg="bg-red-50 dark:bg-red-500/10" />
                <SummaryCard label="Completed" value={s.completedCount ?? '—'} icon={CheckCircle2} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 p-6 space-y-4">
                <ReportToolbar search={search} setSearch={setSearch} from={from} setFrom={setFrom} to={to} setTo={setTo}
                    onRefresh={fetch_} onExportPDF={() => exportPDF('National ID Reports', pdfHeaders, pdfRows)}
                    onExportExcel={() => exportCSV(pdfHeaders, pdfRows, 'national_id_report')} />
                <div className="flex gap-2 flex-wrap">
                    {['', 'pending', 'approved', 'rejected', 'completed', 'printing_queue'].map(s => (
                        <button key={s} onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                {['Name', 'National No.', 'Service Type', 'Status', 'Request Date'].map(h => (
                                    <th key={h} className="text-left py-3 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}><td colSpan="5" className="py-3 px-3"><div className="h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" /></td></tr>
                                ))
                            ) : data.records.length === 0 ? <EmptyState message="No national ID records found." /> :
                                data.records.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{r.citizen?.full_name || r.resident?.full_name || '—'}</td>
                                        <td className="py-3 px-3 font-mono text-gray-500">{r.citizen?.national_number || '—'}</td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[9px] font-black uppercase">{r.service_type?.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${statusBadge(r.status)}`}>{r.status}</span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-400">{fmtDate(r.request_date)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={data.pages} setPage={setPage} />
            </div>
        </div>
    );
};

// ─── Passport Reports ───────────────────────────────────────────────────────────
export const PassportReport = () => {
    const [data, setData] = useState({ records: [], total: 0, pages: 0, summary: {} });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ search, from, to, status, page, limit: 20 });
            const res = await fetch(`${API}/api/admin/reports/passport?${p}`);
            const d = await res.json();
            if (d.success) setData(d);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [search, from, to, status, page]);

    useEffect(() => { fetch_(); }, [fetch_]);
    useEffect(() => { setPage(1); }, [search, from, to, status]);

    const s = data.summary || {};
    const pdfHeaders = ['Name', 'National No.', 'Service Type', 'Status', 'Request Date'];
    const pdfRows = data.records.map(r => ({
        'Name': r.citizen?.full_name || '—',
        'National No.': r.citizen?.national_number || '—',
        'Service Type': r.service_type,
        'Status': r.status,
        'Request Date': fmtDate(r.request_date),
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader icon={Plane} title="Passport Reports" subtitle="New Applications • Renewals • Replacements" iconBg="bg-indigo-600" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total" value={data.total} icon={Plane} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-500/10" />
                <SummaryCard label="New Passports" value={s.newCount ?? '—'} icon={Plane} color="text-green-600" bg="bg-green-50 dark:bg-green-500/10" />
                <SummaryCard label="Renewals" value={s.renewalCount ?? '—'} icon={RefreshCw} color="text-teal-600" bg="bg-teal-50 dark:bg-teal-500/10" />
                <SummaryCard label="Replacements" value={s.replacementCount ?? '—'} icon={AlertCircle} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" />
                <SummaryCard label="Pending" value={s.pendingCount ?? '—'} icon={Clock} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" />
                <SummaryCard label="Approved" value={s.approvedCount ?? '—'} icon={CheckCircle2} color="text-green-600" bg="bg-green-50 dark:bg-green-500/10" />
                <SummaryCard label="Rejected" value={s.rejectedCount ?? '—'} icon={XCircle} color="text-red-600" bg="bg-red-50 dark:bg-red-500/10" />
                <SummaryCard label="Completed" value={s.completedCount ?? '—'} icon={CheckCircle2} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 p-6 space-y-4">
                <ReportToolbar search={search} setSearch={setSearch} from={from} setFrom={setFrom} to={to} setTo={setTo}
                    onRefresh={fetch_} onExportPDF={() => exportPDF('Passport Reports', pdfHeaders, pdfRows)}
                    onExportExcel={() => exportCSV(pdfHeaders, pdfRows, 'passport_report')} />
                <div className="flex gap-2 flex-wrap">
                    {['', 'pending', 'approved', 'rejected', 'completed', 'printing_queue'].map(s => (
                        <button key={s} onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                {['Name', 'National No.', 'Service Type', 'Status', 'Request Date'].map(h => (
                                    <th key={h} className="text-left py-3 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan="5" className="py-3 px-3"><div className="h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" /></td></tr>
                            )) : data.records.length === 0 ? <EmptyState message="No passport records found." /> :
                                data.records.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{r.citizen?.full_name || '—'}</td>
                                        <td className="py-3 px-3 font-mono text-gray-500">{r.citizen?.national_number || '—'}</td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase">{r.service_type?.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${statusBadge(r.status)}`}>{r.status}</span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-400">{fmtDate(r.request_date)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={data.pages} setPage={setPage} />
            </div>
        </div>
    );
};

// ─── Revenue Reports ────────────────────────────────────────────────────────────
export const RevenueReport = () => {
    const [data, setData] = useState({ records: [], total: 0, pages: 0, summary: {} });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [txType, setTxType] = useState('');
    const [page, setPage] = useState(1);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ search, from, to, transaction_type: txType, page, limit: 20 });
            const res = await fetch(`${API}/api/admin/reports/revenue?${p}`);
            const d = await res.json();
            if (d.success) setData(d);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [search, from, to, txType, page]);

    useEffect(() => { fetch_(); }, [fetch_]);
    useEffect(() => { setPage(1); }, [search, from, to, txType]);

    const s = data.summary || {};
    const pdfHeaders = ['Applicant', 'Service', 'Type', 'Amount', 'Date'];
    const pdfRows = data.records.map(r => ({
        'Applicant': r.applicant_name || '—',
        'Service': r.service_name || '—',
        'Type': r.transaction_type || '—',
        'Amount': `$${parseFloat(r.amount || 0).toFixed(2)}`,
        'Date': fmtDate(r.created_at),
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader icon={DollarSign} title="Revenue Reports" subtitle="National ID • Passport • Renewals • Replacements" iconBg="bg-emerald-600" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Grand Total" value={fmtMoney(s.grandTotal)} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-500/10" />
                <SummaryCard label="This Month" value={fmtMoney(s.monthly)} icon={Calendar} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
                <SummaryCard label="This Year" value={fmtMoney(s.yearly)} icon={Calendar} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-500/10" />
                <SummaryCard label="Total Records" value={data.total} icon={FileText} color="text-gray-600" bg="bg-gray-50 dark:bg-white/5" />
                <SummaryCard label="National ID Revenue" value={fmtMoney(s.idRev)} icon={FileText} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
                <SummaryCard label="Passport Revenue" value={fmtMoney(s.passportRev)} icon={Plane} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-500/10" />
                <SummaryCard label="Renewal Revenue" value={fmtMoney(s.renewalRev)} icon={RefreshCw} color="text-teal-600" bg="bg-teal-50 dark:bg-teal-500/10" />
                <SummaryCard label="Replacement Revenue" value={fmtMoney(s.replacementRev)} icon={AlertCircle} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" />
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 p-6 space-y-4">
                <ReportToolbar search={search} setSearch={setSearch} from={from} setFrom={setFrom} to={to} setTo={setTo}
                    onRefresh={fetch_} onExportPDF={() => exportPDF('Revenue Reports', pdfHeaders, pdfRows)}
                    onExportExcel={() => exportCSV(pdfHeaders, pdfRows, 'revenue_report')} />
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                {['Applicant', 'ID Number', 'Service', 'Type', 'Amount', 'Date'].map(h => (
                                    <th key={h} className="text-left py-3 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan="6" className="py-3 px-3"><div className="h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" /></td></tr>
                            )) : data.records.length === 0 ? <EmptyState message="No revenue records found." /> :
                                data.records.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{r.applicant_name || '—'}</td>
                                        <td className="py-3 px-3 font-mono text-gray-500">{r.id_number || '—'}</td>
                                        <td className="py-3 px-3 text-gray-600 dark:text-gray-300">{r.service_name || '—'}</td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black">{r.transaction_type || '—'}</span>
                                        </td>
                                        <td className="py-3 px-3 font-black text-emerald-600">${parseFloat(r.amount || 0).toFixed(2)}</td>
                                        <td className="py-3 px-3 text-gray-400">{fmtDate(r.created_at)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={data.pages} setPage={setPage} />
            </div>
        </div>
    );
};

// ─── Printing Reports ───────────────────────────────────────────────────────────
export const PrintingReport = () => {
    const [data, setData] = useState({ records: [], total: 0, pages: 0, summary: {} });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ search, from, to, status, page, limit: 20 });
            const res = await fetch(`${API}/api/admin/reports/printing?${p}`);
            const d = await res.json();
            if (d.success) setData(d);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [search, from, to, status, page]);

    useEffect(() => { fetch_(); }, [fetch_]);
    useEffect(() => { setPage(1); }, [search, from, to, status]);

    const s = data.summary || {};
    const pdfHeaders = ['Applicant', 'Doc Number', 'Doc Type', 'Status', 'Requested', 'Printed'];
    const pdfRows = data.records.map(r => ({
        'Applicant': r.applicant_name || '—',
        'Doc Number': r.document_number || '—',
        'Doc Type': r.document_type || '—',
        'Status': r.status || '—',
        'Requested': fmtDate(r.request_date),
        'Printed': fmtDate(r.print_date),
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader icon={Printer} title="Printing Reports" subtitle="Printed IDs • Printed Passports • Print Queue" iconBg="bg-violet-600" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total Records" value={data.total} icon={Printer} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-500/10" />
                <SummaryCard label="Pending Print" value={s.pendingCount ?? '—'} icon={Clock} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" />
                <SummaryCard label="Printed" value={s.printedCount ?? '—'} icon={CheckCircle2} color="text-green-600" bg="bg-green-50 dark:bg-green-500/10" />
                <SummaryCard label="ID Cards" value={s.idCount ?? '—'} icon={FileText} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 p-6 space-y-4">
                <ReportToolbar search={search} setSearch={setSearch} from={from} setFrom={setFrom} to={to} setTo={setTo}
                    onRefresh={fetch_} onExportPDF={() => exportPDF('Printing Reports', pdfHeaders, pdfRows)}
                    onExportExcel={() => exportCSV(pdfHeaders, pdfRows, 'printing_report')} />
                <div className="flex gap-2">
                    {['', 'pending', 'printed'].map(s => (
                        <button key={s} onClick={() => setStatus(s)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                {['Applicant', 'Document Number', 'Type', 'Status', 'Requested', 'Print Date'].map(h => (
                                    <th key={h} className="text-left py-3 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan="6" className="py-3 px-3"><div className="h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" /></td></tr>
                            )) : data.records.length === 0 ? <EmptyState message="No printing records found." /> :
                                data.records.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{r.applicant_name || '—'}</td>
                                        <td className="py-3 px-3 font-mono text-gray-500">{r.document_number || '—'}</td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-1 rounded-md bg-violet-50 text-violet-700 text-[9px] font-black">{r.document_type || '—'}</span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${statusBadge(r.status)}`}>{r.status}</span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-400">{fmtDate(r.request_date)}</td>
                                        <td className="py-3 px-3 text-gray-400">{fmtDate(r.print_date)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={data.pages} setPage={setPage} />
            </div>
        </div>
    );
};

// ─── User Reports ───────────────────────────────────────────────────────────────
export const UserReport = () => {
    const [data, setData] = useState({ records: [], total: 0, pages: 0, summary: {} });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [accountType, setAccountType] = useState('');
    const [isActive, setIsActive] = useState('');
    const [page, setPage] = useState(1);

    const ACCOUNT_TYPES = [
        'Ministry_Health_Admin', 'Police_Officer', 'Printing_Officer',
        'Immigration_Officer', 'Immigration_Department_Manager', 'citizen', 'resident',
    ];

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ search, account_type: accountType, is_active: isActive, page, limit: 20 });
            const res = await fetch(`${API}/api/admin/reports/users?${p}`);
            const d = await res.json();
            if (d.success) setData(d);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [search, accountType, isActive, page]);

    useEffect(() => { fetch_(); }, [fetch_]);
    useEffect(() => { setPage(1); }, [search, accountType, isActive]);

    const s = data.summary || {};
    const byType = s.byType || [];
    const pdfHeaders = ['Username', 'Full Name', 'Account Type', 'Email', 'Active', 'Joined'];
    const pdfRows = data.records.map(r => ({
        'Username': r.username || '—',
        'Full Name': r.full_name || '—',
        'Account Type': r.account_type || '—',
        'Email': r.email || '—',
        'Active': r.is_active ? 'Yes' : 'No',
        'Joined': fmtDate(r.created_at),
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader icon={Users} title="User Reports" subtitle="Staff • Citizens • Residents • Roles" iconBg="bg-rose-600" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total Users" value={data.total} icon={Users} color="text-rose-600" bg="bg-rose-50 dark:bg-rose-500/10" />
                <SummaryCard label="Active" value={s.activeCount ?? '—'} icon={CheckCircle2} color="text-green-600" bg="bg-green-50 dark:bg-green-500/10" />
                <SummaryCard label="Disabled" value={s.disabledCount ?? '—'} icon={XCircle} color="text-red-600" bg="bg-red-50 dark:bg-red-500/10" />
                <SummaryCard label="Role Types" value={byType.length} icon={Filter} color="text-gray-600" bg="bg-gray-50 dark:bg-white/5" />
            </div>

            {byType.length > 0 && (
                <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 p-6">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest">Users by Role</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {byType.map((t, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
                                <span className="text-xs font-black text-gray-700 dark:text-gray-300">{t.account_type?.replace(/_/g, ' ')}</span>
                                <span className="text-sm font-black text-primary-600">{t._count?.user_id ?? t.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 p-6 space-y-4">
                <ReportToolbar search={search} setSearch={setSearch} from={from} setFrom={setFrom} to={to} setTo={setTo}
                    onRefresh={fetch_} onExportPDF={() => exportPDF('User Reports', pdfHeaders, pdfRows)}
                    onExportExcel={() => exportCSV(pdfHeaders, pdfRows, 'user_report')} />
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setAccountType('')}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${accountType === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 hover:bg-gray-200'}`}>All</button>
                    {ACCOUNT_TYPES.map(t => (
                        <button key={t} onClick={() => setAccountType(t)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${accountType === t ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 hover:bg-gray-200'}`}>
                            {t.replace(/_/g, ' ')}
                        </button>
                    ))}
                    <select value={isActive} onChange={e => setIsActive(e.target.value)}
                        className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Disabled</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                {['Username', 'Full Name', 'Account Type', 'Email', 'Status', 'Joined'].map(h => (
                                    <th key={h} className="text-left py-3 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan="6" className="py-3 px-3"><div className="h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" /></td></tr>
                            )) : data.records.length === 0 ? <EmptyState message="No user records found." /> :
                                data.records.map((r, i) => (
                                    <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-3 font-mono font-bold text-primary-600">{r.username}</td>
                                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{r.full_name || '—'}</td>
                                        <td className="py-3 px-3">
                                            <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-[9px] font-black">{r.account_type?.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-500">{r.email || '—'}</td>
                                        <td className="py-3 px-3">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black ${r.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {r.is_active ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-gray-400">{fmtDate(r.created_at)}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={data.pages} setPage={setPage} />
            </div>
        </div>
    );
};

// ─── Activity Log Reports ────────────────────────────────────────────────────────
export const ActivityLogReport = () => {
    const [data, setData] = useState({ records: [], total: 0, pages: 0, eventSummary: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [eventType, setEventType] = useState('');
    const [moduleName, setModuleName] = useState('');
    const [page, setPage] = useState(1);

    const EVENT_TYPES = [
        'LOGIN', 'LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'PASSWORD_CHANGED',
        'ACCOUNT_TYPE_CHANGED', 'CITIZEN_REGISTERED', 'RESIDENT_REGISTERED',
        'PASSPORT_ISSUED', 'PASSPORT_RENEWED', 'ID_ISSUED', 'ID_RENEWED',
        'PRINT_OPERATION', 'REQUEST_APPROVED', 'REQUEST_REJECTED',
    ];

    const fetch_ = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ search, from, to, event_type: eventType, module_name: moduleName, page, limit: 20 });
            const res = await fetch(`${API}/api/admin/reports/activity-logs?${p}`);
            const d = await res.json();
            if (d.success) setData(d);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, [search, from, to, eventType, moduleName, page]);

    useEffect(() => { fetch_(); }, [fetch_]);
    useEffect(() => { setPage(1); }, [search, from, to, eventType, moduleName]);

    const eventColors = {
        LOGIN: 'bg-green-50 text-green-700', LOGOUT: 'bg-gray-100 text-gray-600',
        USER_CREATED: 'bg-blue-50 text-blue-700', USER_UPDATED: 'bg-teal-50 text-teal-700',
        PASSWORD_CHANGED: 'bg-orange-50 text-orange-700', ACCOUNT_TYPE_CHANGED: 'bg-purple-50 text-purple-700',
        CITIZEN_REGISTERED: 'bg-indigo-50 text-indigo-700', RESIDENT_REGISTERED: 'bg-violet-50 text-violet-700',
        PASSPORT_ISSUED: 'bg-blue-50 text-blue-700', PASSPORT_RENEWED: 'bg-teal-50 text-teal-700',
        ID_ISSUED: 'bg-blue-50 text-blue-700', ID_RENEWED: 'bg-teal-50 text-teal-700',
        PRINT_OPERATION: 'bg-violet-50 text-violet-700',
        REQUEST_APPROVED: 'bg-green-50 text-green-700', REQUEST_REJECTED: 'bg-red-50 text-red-700',
    };

    const pdfHeaders = ['Username', 'Account Type', 'Event', 'Module', 'Description', 'Date', 'Time'];
    const pdfRows = data.records.map(r => {
        const dt = r.created_at ? new Date(r.created_at) : null;
        return {
            'Username': r.username || '—',
            'Account Type': r.account_type || '—',
            'Event': r.event_type || '—',
            'Module': r.module_name || '—',
            'Description': r.description || '—',
            'Date': dt ? dt.toLocaleDateString('en-GB') : '—',
            'Time': dt ? dt.toLocaleTimeString('en-GB') : '—',
        };
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader icon={ScrollText} title="Activity Log Reports" subtitle="All System Events & Audit Trail" iconBg="bg-slate-600" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard label="Total Logs" value={data.total} icon={ScrollText} color="text-slate-600" bg="bg-slate-50 dark:bg-white/5" />
                {data.eventSummary.slice(0, 3).map((e, i) => (
                    <SummaryCard key={i} label={e.event_type?.replace(/_/g, ' ')} value={e._count?.log_id ?? e.count} icon={ScrollText} color="text-primary-600" bg="bg-primary-50 dark:bg-primary-500/10" />
                ))}
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-premium border border-gray-200 dark:border-white/5 p-6 space-y-4">
                <ReportToolbar search={search} setSearch={setSearch} from={from} setFrom={setFrom} to={to} setTo={setTo}
                    onRefresh={fetch_} onExportPDF={() => exportPDF('Activity Log Reports', pdfHeaders, pdfRows)}
                    onExportExcel={() => exportCSV(pdfHeaders, pdfRows, 'activity_log_report')} />
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setEventType('')}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${eventType === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 hover:bg-gray-200'}`}>All Events</button>
                    {EVENT_TYPES.map(et => (
                        <button key={et} onClick={() => setEventType(et)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${eventType === et ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 hover:bg-gray-200'}`}>
                            {et.replace(/_/g, ' ')}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                {['Username', 'Account Type', 'Event', 'Module', 'Description', 'Date & Time'].map(h => (
                                    <th key={h} className="text-left py-3 px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan="6" className="py-3 px-3"><div className="h-4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" /></td></tr>
                            )) : data.records.length === 0 ? <EmptyState message="No activity logs found." /> :
                                data.records.map((r, i) => {
                                    const dt = r.created_at ? new Date(r.created_at) : null;
                                    return (
                                        <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-3 font-mono font-bold text-primary-600">{r.username || '—'}</td>
                                            <td className="py-3 px-3 text-gray-500 text-[10px]">{r.account_type?.replace(/_/g, ' ') || '—'}</td>
                                            <td className="py-3 px-3">
                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black ${eventColors[r.event_type] || 'bg-gray-100 text-gray-600'}`}>{r.event_type?.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td className="py-3 px-3 text-gray-500">{r.module_name || '—'}</td>
                                            <td className="py-3 px-3 text-gray-700 dark:text-gray-300 max-w-xs truncate" title={r.description}>{r.description || '—'}</td>
                                            <td className="py-3 px-3 text-gray-400 whitespace-nowrap">
                                                {dt ? <><span className="font-bold">{dt.toLocaleDateString('en-GB')}</span> <span className="text-[10px]">{dt.toLocaleTimeString('en-GB')}</span></> : '—'}
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={data.pages} setPage={setPage} />
            </div>
        </div>
    );
};
