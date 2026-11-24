import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';
import tr from './locales/tr.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  tr: { translation: tr },
  zh: { translation: zh },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'tr', 'zh'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Handle text direction and lang attribute on document
export const updateDocumentDirection = (lang) => {
  const currentLang = lang || i18n.language || 'en';
  const isRtl = currentLang === 'ar';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;
};

// Initial sync
updateDocumentDirection(i18n.language);

i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
