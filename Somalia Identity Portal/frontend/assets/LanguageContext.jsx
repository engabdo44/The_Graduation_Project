
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Restore saved language preference
        return localStorage.getItem('admin_lang') || 'ar';
    });

    useEffect(() => {
        const dir = translations[language]?.direction || 'rtl';
        document.documentElement.lang = language;
        document.documentElement.dir = dir;
        localStorage.setItem('admin_lang', language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t: translations[language] || translations['ar'],
            dir: translations[language]?.direction || 'rtl'
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
