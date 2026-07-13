import React from 'react';
import { Download, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Baby, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BirthCertificatePDF = () => {
    const { t, dir } = useLanguage();
    const navigate = useNavigate();
    const isAr = dir === 'rtl';
    
    // Fetch user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userData = {
        fullName: storedUser.full_name || 'Guest User',
        idNumber: storedUser.national_number || storedUser.residence_number || storedUser.national_id_number || storedUser.citizen_id || 'N/A'
    };

    const [certData, setCertData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState('');

    const handleRequest = async () => {
        if (userData.idNumber === 'N/A') {
            alert(isAr ? 'لم يتم العثور على رقم هوية في ملفك الشخصي' : 'No ID number found in your profile');
            return;
        }
        setLoading(true);
        setErrorMsg('');
        
        try {
            // First try with ID Number
            let res = await fetch(`http://localhost:5002/api/birth-certificates/${encodeURIComponent(userData.idNumber)}`);
            let data = null;
            
            if (res.ok) {
                data = await res.json();
            } else {
                // Fallback to name search since some records might only match by name in Health DB
                res = await fetch(`http://localhost:5002/api/birth-certificates/${encodeURIComponent(userData.fullName)}`);
                if (res.ok) {
                    data = await res.json();
                }
            }

            if (data && data.length > 0) {
                setCertData(data[0]); // Get the first record
                
                // Add notification
                try {
                   await fetch('http://localhost:5000/api/user/notifications/system', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({
                           user_id: storedUser.user_id,
                           title: 'Certificate Generated',
                           message: 'Your Birth Certificate PDF is ready for download.',
                           type: 'CERTIFICATE_GENERATED'
                       })
                   });
                } catch(e) {}
            } else {
                setErrorMsg('You do not have a registered Birth Certificate. Please visit the Ministry of Health to obtain a Birth Certificate first.');
            }
        } catch (e) {
            console.error(e);
            setErrorMsg('Connection error to Health System.');
        }
        setLoading(false);
    };

    const downloadPDF = () => {
        if (!certData) return;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(11, 21, 40); 
        doc.text("FEDERAL REPUBLIC OF SOMALIA", 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(34, 197, 94); // Green for Health Ministry
        doc.text("MINISTRY OF HEALTH", 105, 28, { align: 'center' });
        
        doc.setFontSize(18);
        doc.setTextColor(11, 21, 40);
        doc.text("OFFICIAL BIRTH CERTIFICATE", 105, 38, { align: 'center' });
        
        doc.setLineWidth(0.5);
        doc.line(20, 42, 190, 42);
        
        // Person Info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        const startY = 55;
        const lineSpacing = 10;
        
        doc.text(`Birth Certificate Number: ${certData.uid}`, 20, startY);
        doc.text(`Full Name: ${certData.full_name}`, 20, startY + lineSpacing * 1);
        doc.text(`Date of Birth: ${new Date(certData.dob).toLocaleDateString()}`, 20, startY + lineSpacing * 2);
        doc.text(`Gender: ${certData.gender}`, 20, startY + lineSpacing * 3);
        doc.text(`Place of Birth: ${certData.place_of_birth}`, 20, startY + lineSpacing * 4);
        
        doc.text(`Father Name: ${certData.father_name}`, 20, startY + lineSpacing * 5);
        doc.text(`Mother Name: ${certData.mother_name}`, 20, startY + lineSpacing * 6);
        
        doc.text(`Registration Date: ${new Date(certData.created_at).toLocaleDateString()}`, 20, startY + lineSpacing * 7);
        
        // Add QR / Verification info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const qrVerificationText = `Verification Code: ${certData.uid.split('-').join('')}-${new Date().getFullYear()}`;
        doc.text(qrVerificationText, 20, startY + lineSpacing * 9);
        
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Official printed copy generated by National Health System & E-Government Portal", 105, 280, { align: 'center' });
        
        doc.save(`Birth_Certificate_${certData.uid}.pdf`);
    };

    const BackIcon = isAr ? ArrowRight : ArrowLeft;

    return (
        <div className="bg-[#f8fafc] dark:bg-primary-950 min-h-screen pb-32 pt-24">
            <div className="container mx-auto px-4 max-w-4xl">
                <button 
                    onClick={() => navigate('/services')}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 font-bold mb-8 transition-colors"
                >
                    <BackIcon size={20} /> {t.allServices}
                </button>

                <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] shadow-premium border border-gray-100 dark:border-white/10 text-center space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500"></div>
                    
                    <div className="w-24 h-24 bg-green-50 dark:bg-white/5 text-green-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                        <Baby size={48} />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                            {isAr ? 'عن طريق الإنترنت PDF شهادة ميلاد' : 'Birth Certificate PDF Service'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold max-w-lg mx-auto">
                            {isAr ? 'احصل على شهادة ميلاد رسمية ومجانية متصلة بسجلات النظام الصحي الوطني.' : 'Get an instant and free official birth certificate connected to the National Health System records.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto py-6">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.feesLabel}</p>
                            <p className="font-black text-emerald-600">{isAr ? 'مجاني' : 'FREE'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t.durationLabel}</p>
                            <p className="font-black text-primary-900 dark:text-white">{isAr ? 'فوري' : 'INSTANT'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 col-span-2 md:col-span-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="font-black text-primary-900 dark:text-white">Official MOH Doc</p>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="animate-fade-in mx-auto max-w-md bg-red-50 dark:bg-red-900/10 border border-red-200 text-red-700 p-6 rounded-2xl flex flex-col items-center gap-3">
                            <AlertCircle size={32} />
                            <p className="font-bold">{errorMsg}</p>
                        </div>
                    )}

                    {!certData ? (
                        <button 
                            onClick={handleRequest}
                            disabled={loading}
                            className="px-12 py-5 bg-green-600 hover:bg-green-700 text-white font-black text-xl rounded-2xl hover:scale-105 transition-all shadow-glow-green flex items-center justify-center gap-3 mx-auto disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                            {isAr ? 'إصدار الشهادة الآن' : 'Apply for Certificate PDF'}
                        </button>
                    ) : (
                        <div className="animate-fade-in space-y-8 pt-8 border-t border-gray-100 dark:border-white/5">
                            <div className="p-8 rounded-[2rem] flex flex-col items-center gap-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white bg-emerald-500 shadow-lg border-4 border-emerald-200 shadow-glow-green">
                                    <ShieldCheck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-400">
                                        {isAr ? 'تم العثور على شهادة ميلاد صالحة' : 'Valid Birth Certificate Found'}
                                    </h3>
                                    <p className="text-gray-500 font-bold mt-2">{certData.full_name}</p>
                                </div>

                                <button 
                                    onClick={downloadPDF}
                                    className="px-10 py-5 bg-emerald-600 text-white font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-lg flex items-center gap-3"
                                >
                                    <Download /> {isAr ? 'تحميل الشهادة (PDF)' : 'Download Certificate (PDF)'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BirthCertificatePDF;
