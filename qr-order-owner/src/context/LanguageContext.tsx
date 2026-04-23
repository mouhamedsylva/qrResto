import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Types de langues supportées
export type Language = 'fr' | 'en' | 'nl' | 'es';

// Interface pour les traductions
export interface Translations {
  [key: string]: string | Translations;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Import statique des traductions (requis par Vite)
import frTranslations from '../locales/fr.json';
import enTranslations from '../locales/en.json';
import nlTranslations from '../locales/nl.json';
import esTranslations from '../locales/es.json';

const translationsMap: Record<Language, Translations> = {
  fr: frTranslations as Translations,
  en: enTranslations as Translations,
  nl: nlTranslations as Translations,
  es: esTranslations as Translations,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Récupérer la langue depuis localStorage ou utiliser 'fr' par défaut
    const savedLanguage = localStorage.getItem('qr_owner_language') as Language;
    return savedLanguage || 'fr';
  });

  useEffect(() => {
    // Sauvegarder la langue dans localStorage
    localStorage.setItem('qr_owner_language', language);
    // Mettre à jour l'attribut lang du document
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Fonction pour récupérer une traduction par clé (supporte les clés imbriquées avec "." et l'interpolation {key})
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translationsMap[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }

    let result = typeof value === 'string' ? value : key;

    if (replacements && typeof result === 'string') {
      Object.entries(replacements).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations: translationsMap[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
