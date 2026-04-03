import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import bg from './bg'
import en from './en'
import de from './de'
import cs from './cs'
import pl from './pl'
import ro from './ro'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      bg: { translation: bg },
      en: { translation: en },
      de: { translation: de },
      cs: { translation: cs },
      pl: { translation: pl },
      ro: { translation: ro },
    },
    fallbackLng: 'bg',
    lng: localStorage.getItem('i18nextLng') ?? 'bg',
    supportedLngs: ['bg', 'en', 'de', 'cs', 'pl', 'ro'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
