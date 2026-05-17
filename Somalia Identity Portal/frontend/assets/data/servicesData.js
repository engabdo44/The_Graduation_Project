
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
    { id: 'biometrics', category: 'identity', title: t.services.biometrics, description: t.services.biometricsDesc, icon: Fingerprint, tags: ['Security'], type: 'security', requirements: t.services.biometricsReq },

    // 2. Passport Services
    { id: 'passport-renew', category: 'passport', title: t.services.pptRenew, description: t.services.pptRenewDesc, icon: FileText, tags: ['Passport'], type: 'passport', requirements: t.services.pptRenewReq },
    { id: 'passport-replace', category: 'passport', title: t.services.pptLost, description: t.services.pptLostDesc, icon: CreditCard, tags: ['Passport'], type: 'passport', requirements: t.services.pptLostReq },
    { id: 'visas', category: 'passport', title: t.services.visas, description: t.services.visasDesc, icon: Globe, tags: ['Travel'], type: 'travel', requirements: t.services.visasReq },
    { id: 'travel-history', category: 'passport', title: t.services.travelHistory, description: t.services.travelHistoryDesc, icon: Plane, tags: ['Travel'], type: 'travel', requirements: t.services.travelHistoryReq },

    // 3. Legal & Security
    { id: 'criminal-record', category: 'legal', title: t.services.criminalRecord, description: t.services.criminalRecordDesc, icon: FileWarning, tags: ['Legal'], type: 'legal', requirements: t.services.criminalRecordReq },
    { id: 'doc-verify', category: 'legal', title: t.services.docVerify, description: t.services.docVerifyDesc, icon: CheckCircle2, tags: ['Security'], type: 'general', requirements: t.services.docVerifyReq },

    // 4. Civil Services
    { id: 'residence-cert', category: 'civil', title: t.services.residenceCert, description: t.services.residenceCertDesc, icon: Home, tags: ['Civil'], type: 'civil', requirements: t.services.residenceCertReq },

    // 5. Digital Services
    { id: 'digital-docs', category: 'digital', title: t.services.digitalDocs, description: t.services.digitalDocsDesc, icon: Smartphone, tags: ['Digital'], type: 'digital', requirements: t.services.digitalDocsReq },
    { id: 'app-status', category: 'digital', title: t.services.appStatus, description: t.services.appStatusDesc, icon: Activity, tags: ['General'], type: 'general', requirements: t.services.appStatusReq },

    // 6. Administrative
    { id: 'appointments', category: 'admin', title: t.services.appointments, description: t.services.appointmentsDesc, icon: Calendar, tags: ['General'], type: 'general', requirements: t.services.appointmentsReq },
    { id: 'delivery', category: 'admin', title: t.services.delivery, description: t.services.deliveryDesc, icon: Truck, tags: ['Logistics'], type: 'general', requirements: t.services.deliveryReq },
];
