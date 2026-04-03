import { useTranslation } from 'react-i18next'
import { Button, Select, Hidden, Tooltip, View } from 'reshaped'

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ro', label: 'RO', flag: '🇷🇴' },
  { code: 'mo', label: 'MO', flag: '🇲🇩' },
  { code: 'uk', label: 'UK', flag: '🇺🇦' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) ?? 'en'

  return (
    <View gap={4} direction='row' >
      <Hidden hide={{ s: false, m: true }}>
        <Select
          name="language"
          defaultValue={current}
          onChange={({ value }) => i18n.changeLanguage(value)}
          variant='outline'
          size='medium'>
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
          ))}
        </Select>
      </Hidden>
      <Hidden hide={{ s: true, m: false }}>
        {LANGS.map((l) => (
          <Tooltip key={l.code} text={l.label} position="bottom">
            {(attributes) =>
              <Button
                attributes={attributes}
                key={l.code}
                variant='ghost'
                highlighted={current === l.code}
                onClick={() => i18n.changeLanguage(l.code)}
              >
                {l.flag}
              </Button>
            }

          </Tooltip>
        ))}
      </Hidden>
    </View>
  )
}
