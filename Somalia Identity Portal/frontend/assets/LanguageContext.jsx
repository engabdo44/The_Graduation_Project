
import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ar');

    useEffect(() => {
        const dir = translations[language].direction;
        document.documentElement.lang = language;
        document.documentElement.dir = dir;
    }, [language]);

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t: translations[language],
            dir: translations[language].direction
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
