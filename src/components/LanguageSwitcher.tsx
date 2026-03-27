import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'bg', label: 'БГ', flag: '🇧🇬' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) ?? 'bg'

  return (
    <div className="lang-switcher">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={'lang-btn' + (current === l.code ? ' active' : '')}
          onClick={() => i18n.changeLanguage(l.code)}
          title={l.label}
        >
          <span className="lang-flag">{l.flag}</span>
          {l.label}
        </button>
      ))}
    </div>
  )
}
