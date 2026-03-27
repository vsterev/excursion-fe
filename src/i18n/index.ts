import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import bg from './bg'
import en from './en'
import de from './de'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      bg: { translation: bg },
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: 'bg',
    lng: localStorage.getItem('i18nextLng') ?? 'bg',
    supportedLngs: ['bg', 'en', 'de'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
