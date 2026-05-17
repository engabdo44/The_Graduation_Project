import React, { useState } from 'react';
import { translations } from '../translations';

const ResidentCriminalRecordForm = ({ lang }) => {
  const [formData, setFormData] = useState({
    residence_number: '',
    crime_type: '',
    incident_date: '',
    court_decision: '',
    severity: 'C',
    status: 'open'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isAr = lang === 'ar';
  const isSo = lang === 'so';

  const t = translations[lang];

  const texts = {
    title: isAr ? 'تسجيل جريمة مقيم' : isSo ? 'Diiwaangelinta dambiyada deganaanshaha' : 'Resident Crime Registration',
    residenceNumber: isAr ? 'رقم الإقامة' : isSo ? 'Lambarka deganaanshaha' : 'Residence Number',
    crimeType: t.type,
    incidentDate: t.date,
    courtDecision: t.courtDecision || (isAr ? 'قرار المحكمة' : isSo ? 'Go\'aanka Maxkamadda' : 'Court Decision'),
    status: t.status,
    open: isAr ? 'مفتوحة' : isSo ? 'Furan' : 'Open',
    closed: isAr ? 'مغلقة' : isSo ? 'Xiran' : 'Closed',
    submit: t.submit,
    success: isAr ? 'تم حفظ سجل المقيم بنجاح' : isSo ? 'Diiwaanka deganaha si guul ah ayaa loo kaydiyay' : 'Resident record saved successfully',
    error: isAr ? 'حدث خطأ أثناء حفظ سجل المقيم' : isSo ? 'Cillad ayaa dhacday' : 'An error occurred while saving resident record',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'residence_number') {
      const cleaned = value.replace(/\D/g, '').slice(0, 11);
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/resident-criminal-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setMessage({ type: 'success', text: texts.success });
        setFormData({ residence_number: '', crime_type: '', incident_date: '', court_decision: '', status: 'open', severity: 'C' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || texts.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: texts.error });
    }
    setLoading(false);
  };

  return (
    <div className={`p-8 w-full max-w-4xl mx-auto ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-[#1e293b] px-8 py-6 border-b border-slate-700">
          <h2 className="text-white text-xl font-bold">{texts.title}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {message && (
            <div className={`p-4 rounded-lg font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{texts.residenceNumber}</label>
              <input 
                type="text" 
                name="residence_number" 
                required 
                placeholder="XXXXXXXXXXX"
                value={formData.residence_number} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{texts.crimeType}</label>
              <input 
                type="text" 
                name="crime_type" 
                required 
                value={formData.crime_type} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{texts.incidentDate}</label>
              <input 
                type="date" 
                name="incident_date" 
                value={formData.incident_date} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{isAr ? 'خطورة الجريمة' : 'Crime Severity'}</label>
              <select 
                name="severity" 
                value={formData.severity} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all bg-white font-bold"
              >
                <option value="A">{isAr ? 'فئة A (الأدنى)' : 'Class A (Lowest)'}</option>
                <option value="B">{isAr ? 'فئة B' : 'Class B'}</option>
                <option value="C">{isAr ? 'فئة C' : 'Class C'}</option>
                <option value="D">{isAr ? 'فئة D' : 'Class D'}</option>
                <option value="E">{isAr ? 'فئة E' : 'Class E'}</option>
                <option value="F">{isAr ? 'فئة F (الأعلى)' : 'Class F (Highest)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{texts.status}</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all bg-white"
              >
                <option value="open">{texts.open}</option>
                <option value="closed">{texts.closed}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{texts.courtDecision}</label>
            <textarea 
              name="court_decision" 
              rows="4" 
              value={formData.court_decision} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all"
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-[#1e293b] hover:bg-[#334155] text-white font-bold rounded-lg transition-all shadow-md disabled:opacity-50"
            >
              {loading ? '...' : texts.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentCriminalRecordForm;
