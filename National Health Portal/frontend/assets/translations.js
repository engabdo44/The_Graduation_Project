export const translations = {
  en: {
    login: {
      title: 'National Health Portal',
      subtitle: 'Ministry of Health Intelligence Access',
      username: 'Authorized Username',
      usernamePlaceholder: 'Enter username...',
      password: 'Security Keyphrase',
      passwordPlaceholder: '••••••••',
      submit: 'Establish Secure Link',
      quickAccess: 'Quick Access',
      secureNote: 'Republic of Somalia • Secured via 256-bit Ministry Encryption',
      errorEmpty: 'CRITICAL: Empty identifiers detected. Identity verification failed.'
    },
    nav: {
      dashboard: 'Control Center',
      healthRecords: 'Citizen Base',
      birthCert: 'Birth Registry',
      deathCert: 'Mortality Logs',
      birthCertServices: 'Birth Certificate Services',
      reports: 'Reports',
      logout: 'Terminate Session'
    },
    dashboard: {
      header: {
        secureLink: 'SECURE_LINK',
        level: 'Level: Auth-R',
        node: 'Node'
      },
      stats: {
        registrations: 'System Registrations',
        critical: 'Critical Alerts',
        facility: 'Facility Load',
        response: 'Response Rate'
      },
      charts: {
        title: 'National Vital Statistics',
        subtitle: 'Registry Trends (Monthly)',
        births: 'Births',
        deaths: 'Deaths'
      },
      regions: {
        title: 'Regional Node Status',
        subtitle: 'Live Database Connectivity'
      }
    },
    common: {
      verified: 'Verified',
      loading: 'Loading...',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      na: 'N/A',
      print: 'Print PDF',
      sync: 'Sync Node'
    },
    birth: {
      title: 'National Registry',
      certTitle: 'CERTIFICATE OF BIRTH',
      fieldLabels: {
        fullName: 'Citizen Name',
        dob: 'Date of Birth',
        father: 'Paternal Full Name',
        mother: 'Maternal Full Name',
        locality: 'Locality',
        gender: 'Biology',
        facility: 'Facility',
        physician: 'Physician'
      },
      placeholders: {
        fullName: 'Enter full name...',
        locality: 'City/Region...'
      },
      buttonNew: 'New Entry',
      buttonAuth: 'Authorize Record',
      directive: 'Biographical data must be verified against medical affidavits.'
    },
    death: {
      title: 'Mortality Registry',
      certTitle: 'CERTIFICATE OF DEATH',
      fieldLabels: {
        fullName: 'Deceased Name',
        dod: 'Date of Death',
        cause: 'Cause of Mortality',
        age: 'Age at Event',
        declarant: 'Reporting Official'
      },
      buttonAuth: 'Finalize Registry'
    },
    records: {
      title: 'Central Patient Base',
      subtitle: 'Query National Health Identity',
      searchPlaceholder: 'Search by UID or Name...',
      tableHeaders: {
        id: 'UID',
        patient: 'Citizen',
        facility: 'Last Node',
        lastVisit: 'Last Access'
      }
    }
  },
  ar: {
    login: {
      title: 'البوابة الصحية الوطنية',
      subtitle: 'خدمة الدخول لوزارة الصحة',
      username: 'اسم المستخدم',
      usernamePlaceholder: 'أدخل اسم المستخدم...',
      password: 'كلمة المرور',
      passwordPlaceholder: '••••••••',
      submit: 'تسجيل الدخول',
      quickAccess: 'وصول سريع',
      secureNote: 'جمهورية الصومال • مؤمن عبر تشفير الوزارة ٢٥٦ بت',
      errorEmpty: 'خطأ: تم اكتشاف حقول فارغة. فشل التحقق من الهوية.'
    },
    nav: {
      dashboard: 'مركز التحكم',
      healthRecords: 'قاعدة المواطنين',
      birthCert: 'سجل المواليد',
      deathCert: 'سجلات الوفيات',
      birthCertServices: 'خدمات شهادات الميلاد',
      reports: 'التقارير',
      logout: 'إنهاء الجلسة'
    },
    dashboard: {
      header: {
        secureLink: 'ارتباط_آمن',
        level: 'المستوى: مصرح',
        node: 'العقدة'
      },
      stats: {
        registrations: 'التسجيلات في النظام',
        critical: 'تنبيهات حرجة',
        facility: 'حمولة المرافق',
        response: 'معدل الاستجابة'
      },
      charts: {
        title: 'الإحصاءات الحيوية الوطنية',
        subtitle: 'اتجاهات السجل (شهرياً)',
        births: 'المواليد',
        deaths: 'الوفيات'
      },
      regions: {
        title: 'حالة العقد الإقليمية',
        subtitle: 'اتصال قاعدة البيانات المباشر'
      }
    },
    common: {
      verified: 'تم التحقق',
      loading: 'جاري التحميل...',
      actions: 'إجراءات',
      status: 'الحالة',
      date: 'التاريخ',
      na: 'غير متوفر',
      print: 'طباعة PDF',
      sync: 'مزامنة العقدة'
    },
    birth: {
      title: 'السجل الوطني',
      certTitle: 'شهادة ميلاد',
      fieldLabels: {
        fullName: 'اسم المواطن',
        dob: 'تاريخ الميلاد',
        father: 'اسم الأب الكامل',
        mother: 'اسم الأم الكامل',
        locality: 'المكان',
        gender: 'الجنس',
        facility: 'المنشأة',
        physician: 'الطبيب'
      },
      placeholders: {
        fullName: 'أدخل الاسم الكامل...',
        locality: 'المدينة/الإقليم...'
      },
      buttonNew: 'إدخل جديد',
      buttonAuth: 'اعتماد السجل',
      directive: 'يجب التحقق من البيانات الحيوية مقابل المستندات الطبية.'
    },
    death: {
      title: 'سجل الوفيات',
      certTitle: 'شهادة وفاة',
      fieldLabels: {
        fullName: 'اسم المتوفى',
        dod: 'تاريخ الوفاة',
        cause: 'سبب الوفاة',
        age: 'العمر عند الوفاة',
        declarant: 'المسؤول المبلغ'
      },
      buttonAuth: 'إتمام السجل'
    },
    records: {
      title: 'قاعدة المرضى المركزية',
      subtitle: 'الاستعلام عن الهوية الصحية الوطنية',
      searchPlaceholder: 'البحث عن طريق المعرف أو الاسم...',
      tableHeaders: {
        id: 'المعرف',
        patient: 'المواطن',
        facility: 'آخر عقدة',
        lastVisit: 'آخر وصول'
      }
    }
  },
  so: {
    login: {
      title: 'Bogga Caafimaadka Qaranka',
      subtitle: 'Helitaanka Xogta Wasaaradda Caafimaadka',
      username: 'Magaca Isticmaalaha',
      usernamePlaceholder: 'Gali magacaaga...',
      password: 'Furaha Sirta ah',
      passwordPlaceholder: '••••••••',
      submit: 'Xaqiiji Xiriirka',
      quickAccess: 'Helitaan Degdeg ah',
      secureNote: 'Jamhuuriyadda Soomaaliya • Waxaa lagu xafiday sirta 256-bit',
      errorEmpty: 'QALAD: Lama helin aqoonsi. Xaqiijinta waa fashilantay.'
    },
    nav: {
      dashboard: 'Xarunta Maamulka',
      healthRecords: 'Xogta Muwaadiniinta',
      birthCert: 'Diiwaanka Dhalashada',
      deathCert: 'Diiwaanka Dhimashada',
      birthCertServices: 'Adeegyada Shahaadada Dhalashada',
      reports: 'Warbixinada',
      logout: 'Xir Kalfadhiga'
    },
    dashboard: {
      header: {
        secureLink: 'XIRIIR_AAMIN_AH',
        level: 'Heerka: La Ogolaaday',
        node: 'Noodhka'
      },
      stats: {
        registrations: 'Diiwaangelinta Nidaamka',
        critical: 'Digniino Degdeg ah',
        facility: 'Culeyska Xarunta',
        response: 'Heerka Jawaabta'
      },
      charts: {
        title: 'Tirooyinka Muhiimka ah ee Qaranka',
        subtitle: 'Isbeddellada Diiwaanka (Bil kasta)',
        births: 'Dhalashada',
        deaths: 'Dhimashada'
      },
      regions: {
        title: 'Xaaladda Gobollada',
        subtitle: 'Xiriirka Tooska ah ee Xogta'
      }
    },
    common: {
      verified: 'La xaqiijiyey',
      loading: 'Lagu jiro raridda...',
      actions: 'Waxqabadka',
      status: 'Xaaladda',
      date: 'Taariikhda',
      na: 'Lama hayo',
      print: 'Daabac PDF',
      sync: 'Iwaaji Noodhka'
    },
    birth: {
      title: 'Diiwaanka Qaranka',
      certTitle: 'SHAHAADADA DHALASHADA',
      fieldLabels: {
        fullName: 'Magaca Muwaadinka',
        dob: 'Taariikhda Dhalashada',
        father: 'Magaca Aabbaha',
        mother: 'Magaca Hooyada',
        locality: 'Goobta',
        gender: 'Jinsiga',
        facility: 'Xarunta',
        physician: 'Dhakhtarka'
      },
      placeholders: {
        fullName: 'Gali magaca oo buuxa...',
        locality: 'Magaalada/Gobolka...'
      },
      buttonNew: 'Diiwaan Cusub',
      buttonAuth: 'Oggolow Diiwaanka',
      directive: 'Xogta taariikh nololeedka waa in laga xaqiijiyaa qoraallada caafimaadka.'
    },
    death: {
      title: 'Diiwaanka Dhimashada',
      certTitle: 'SHAHAADADA DHIMASHADA',
      fieldLabels: {
        fullName: 'Magaca Marxuumka',
        dod: 'Taariikhda Dhimashada',
        cause: 'Sababta Dhimashada',
        age: 'Da\'da',
        declarant: 'Sarkaalka Warbixinta'
      },
      buttonAuth: 'Finalize Registry'
    },
    records: {
      title: 'Xogta Bukaannada',
      subtitle: 'Baadigoobka Aqoonsiga Caafimaadka Qaranka',
      searchPlaceholder: 'Ku raadi aqoonsi ama magac...',
      tableHeaders: {
        id: 'Aqoonsiga',
        patient: 'Muwaadinka',
        facility: 'Xaruntii u dambaysay',
        lastVisit: 'Gelitaankii u dambeeyey'
      }
    }
  }
};
