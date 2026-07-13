import React, { useState } from 'react';
import { translations } from '../translations';

const CriminalRecordForm = ({ lang }) => {
  const [formData, setFormData] = useState({
    id_number: '',
    crime_type: '',
    incident_date: '',
    crime_details: '',
    severity: 'C',
    status: 'open'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isAr = lang === 'ar';
  const isSo = lang === 'so';

  const t = translations[lang];

  const texts = {
    title: t.formTitle,
    idNumber: t.idNumberLabel,
    crimeType: t.type,
    incidentDate: t.date,
    crimeDetails: t.crimeDetails || (isAr ? 'تفاصيل الجريمة' : isSo ? 'Faahfaahinta Dambiga' : 'Crime Details'),
    status: t.status,
    open: isAr ? 'مفتوحة' : isSo ? 'Furan' : 'Open',
    closed: isAr ? 'مغلقة' : isSo ? 'Xiran' : 'Closed',
    submit: t.submit,
    success: isAr ? 'تم حفظ السجل بنجاح' : isSo ? 'Diiwaanka si guul ah ayaa loo kaydiyay' : 'Record saved successfully',
    error: isAr ? 'حدث خطأ أثناء الحفظ' : isSo ? 'Cillad ayaa dhacday' : 'An error occurred',
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id_number') {
      // Only allow 11 digits
      const cleaned = value.replace(/\D/g, '').slice(0, 11);
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id_number.length !== 11) {
      setMessage({ type: 'error', text: isAr ? 'يجب أن يتكون الرقم من 11 خانة' : isSo ? 'Aqoonsigu waa inuu ahaado 11 god' : 'ID must be 11 digits' });
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/criminal-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setMessage({ type: 'success', text: texts.success });
        setFormData({ id_number: '', crime_type: '', incident_date: '', crime_details: '', status: 'open', severity: 'C' });
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
        <div className="bg-[#0b1528] px-8 py-6 border-b border-slate-700">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">{texts.idNumber}</label>
              <input 
                type="text" 
                name="id_number" 
                required 
                placeholder="XXXXXXXXXXX"
                value={formData.id_number} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all"
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
              <label className="block text-sm font-bold text-slate-700 mb-2">{texts.severity || (isAr ? 'خطورة الجريمة' : 'Crime Severity')}</label>
              <select 
                name="severity" 
                value={formData.severity || 'C'} 
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
            <label className="block text-sm font-bold text-slate-700 mb-2">{texts.crimeDetails}</label>
            <textarea 
              name="crime_details" 
              rows="6" 
              minLength={500}
              maxLength={5000}
              value={formData.crime_details} 
              onChange={handleChange} 
              placeholder={isAr ? "يرجى كتابة وصف دقيق ومفصل للجريمة وملابساتها وملاحظات التحقيق (بين 500 و 5000 حرف)..." : "Please provide a detailed incident summary, investigation notes, and circumstances of the offense (500–5000 characters)..."}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none transition-all"
            ></textarea>
            <p className="text-[10px] text-slate-400 mt-1">{formData.crime_details.length} / 5000 chars</p>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-[#c5a059] hover:bg-[#b08d4b] text-white font-bold rounded-lg transition-all shadow-md disabled:opacity-50"
            >
              {loading ? '...' : texts.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriminalRecordForm;
