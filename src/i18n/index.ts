import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en'
import ro from './ro'
import mo from './mo'
import uk from './uk'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ro: { translation: ro },
      mo: { translation: mo },
      uk: { translation: uk },
    },
    fallbackLng: 'en',
    lng: localStorage.getItem('i18nextLng') ?? 'en',
    supportedLngs: ['en', 'ro', 'mo', 'uk'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
