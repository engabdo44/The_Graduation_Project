
import {
    Users, FileText, CreditCard, Shield, UserCheck, Plane,
    FileWarning, Calendar, CheckCircle2, Activity, Home,
    Smartphone, Truck, Lock, History, Fingerprint, MapPin,
    Flag, AlertTriangle, Phone, GraduationCap, HeartPulse,
    Briefcase, DollarSign, Globe, Car, Gavel, FileX,
    Siren, Baby, Receipt, Mail, Bell, QrCode, SmartphoneNfc
} from 'lucide-react';
import { translations } from '../translations';

export const getServices = (t) => [
    // 1. Identity Services
    { id: 'id-renew', category: 'identity', title: t.services.idRenew, description: t.services.idRenewDesc, icon: Users, tags: ['ID'], type: 'identity', requirements: t.services.idRenewReq },
    { id: 'id-replace', category: 'identity', title: t.services.idLost, description: t.services.idLostDesc, icon: Shield, tags: ['ID'], type: 'identity', requirements: t.services.idLostReq },
    { id: 'id-update', category: 'identity', title: t.dir === 'rtl' ? 'تحديث المعلومات الشخصية' : 'Update Personal Information', description: t.dir === 'rtl' ? 'تحديث وتعديل البيانات الشخصية' : 'Update and modify your personal information', icon: UserCheck, tags: ['Update'], type: 'identity', requirements: t.services.idRenewReq },

    // 2. Passport Services
    { id: 'passport-renew', category: 'passport', title: t.services.pptRenew, description: t.services.pptRenewDesc, icon: FileText, tags: ['Passport'], type: 'passport', requirements: t.services.pptRenewReq },
    { id: 'passport-replace', category: 'passport', title: t.services.pptLost, description: t.services.pptLostDesc, icon: CreditCard, tags: ['Passport'], type: 'passport', requirements: t.services.pptLostReq },
    { id: 'passport-update', category: 'passport', title: t.dir === 'rtl' ? 'تحديث معلومات الجواز' : 'Update Passport Information', description: t.dir === 'rtl' ? 'تحديث وتعديل بيانات الجواز' : 'Update and modify your passport information', icon: FileText, tags: ['Update'], type: 'passport', requirements: t.services.pptRenewReq },

    // 3. Legal & Security
    { id: 'criminal-record', category: 'legal', title: t.services.criminalRecord, description: t.services.criminalRecordDesc, icon: FileWarning, tags: ['Legal'], type: 'legal', requirements: t.services.criminalRecordReq },

    // 4. Birth Certificate Services
    { id: 'birth-cert-pdf', category: 'health', title: t.dir === 'rtl' ? 'شهادة ميلاد PDF' : 'Birth Certificate PDF', description: t.dir === 'rtl' ? 'إنشاء وتنزيل نسخة PDF رسمية مجانية لشهادة الميلاد.' : 'Generate and download an official Birth Certificate PDF using existing birth registration records.', icon: FileText, tags: ['Health'], type: 'health', requirements: [t.dir === 'rtl' ? 'رقم الهوية الوطنية' : 'National ID Number'] },
    { id: 'birth-cert-reprint', category: 'health', title: t.dir === 'rtl' ? 'إعادة طباعة شهادة الميلاد' : 'Birth Certificate Reprint', description: t.dir === 'rtl' ? 'طلب نسخة مطبوعة رسمية من شهادة الميلاد الحالية الخاصة بك.' : 'Request an official printed copy of an existing Birth Certificate.', icon: Baby, tags: ['Health'], type: 'health', requirements: [t.dir === 'rtl' ? 'رقم الهوية الوطنية' : 'National ID Number'] },
];
