import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en'
import ro from './ro'
import ru from './ru'
import uk from './uk'

try {
  const stored = localStorage.getItem('i18nextLng')
  if (stored === 'mo' || stored?.startsWith('mo-')) {
    localStorage.setItem('i18nextLng', 'ru')
  }
} catch {
  /* ignore */
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ro: { translation: ro },
      ru: { translation: ru },
      uk: { translation: uk },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ro', 'uk', 'ru'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
