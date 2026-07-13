import React, { useState, useEffect } from 'react';

const CriminalArchives = ({ lang, user }) => {
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  
  // Status Change Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/archives');
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setArchives(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getValidTransitions = (currentStatus) => {
    switch(currentStatus) {
      case 'open': return ['closed', 'suspended', 'under_investigation'];
      case 'closed': return ['reopened'];
      case 'suspended': return ['reopened', 'closed'];
      case 'under_investigation': return ['closed', 'suspended'];
      case 'reopened': return ['closed', 'suspended', 'under_investigation'];
      default: return [];
    }
  };

  const openStatusModal = (record) => {
    setSelectedRecord(record);
    setNewStatus('');
    setReason('');
    setIsModalOpen(true);
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!selectedRecord || !newStatus || !reason) return;

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/archives/${selectedRecord.record_type}/${selectedRecord.record_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reason,
          officer_name: user?.username || 'Unknown',
          officer_id: user?.id || null
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      await fetchArchives(); // Refresh data
      setIsModalOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Error updating status: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredArchives = archives.filter(r => {
    const matchesSearch = (r.crime_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.id_number || r.residence_number || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in pb-10">
      <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="official-heading text-2xl font-black text-slate-900 tracking-tight mb-2">Criminal Archives</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Central Repository of Case Records</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search ID or Crime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0b1528]/20 outline-none w-full md:w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0b1528]/20 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="suspended">Suspended</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">Loading Archives...</div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-bold">Case Ref</th>
                  <th className="p-4 font-bold">Suspect ID</th>
                  <th className="p-4 font-bold">Crime Type</th>
                  <th className="p-4 font-bold">Severity</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Date Logged</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArchives.map((record, idx) => (
                  <React.Fragment key={idx}>
                    <tr 
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition cursor-pointer"
                      onClick={() => setExpandedRecordId(expandedRecordId === record.record_id ? null : record.record_id)}
                    >
                      <td className="p-4 text-xs font-bold text-slate-700">#{record.record_id}</td>
                      <td className="p-4 text-xs font-semibold text-slate-600">{record.id_number || record.residence_number}</td>
                      <td className="p-4 text-xs font-semibold text-slate-800">{record.crime_type}</td>
                      <td className="p-4 text-xs font-bold text-slate-500">Class {record.severity}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600`}>
                          {record.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {record.incident_date ? new Date(record.incident_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {getValidTransitions(record.status || 'open').length > 0 && (
                          <button
                            onClick={() => openStatusModal(record)}
                            className="px-3 py-1.5 bg-[#0b1528] text-white rounded text-[9px] font-bold uppercase tracking-widest hover:bg-[#162a4d] transition-colors shadow-sm"
                          >
                            Change Status
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedRecordId === record.record_id && (
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <td colSpan="7" className="p-6">
                          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Crime Details / Investigation Notes</h4>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {record.crime_details || 'No extended crime details documented.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredArchives.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-2">Update Case Status</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
              Case Ref #{selectedRecord.record_id}
            </p>
            
            <form onSubmit={handleStatusChange} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0b1528] transition"
                  required
                >
                  <option value="" disabled>Select transition...</option>
                  {getValidTransitions(selectedRecord.status || 'open').map(ts => (
                    <option key={ts} value={ts}>{ts.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reason / Notes</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#0b1528] min-h-[100px] resize-none transition"
                  placeholder="Provide detailed justification for status change..."
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#0b1528] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#162a4d] shadow-lg shadow-blue-900/20 active:scale-95 transition disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriminalArchives;
