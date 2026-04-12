import { useTranslation } from 'react-i18next'
import { Button, Select, Hidden, Tooltip, View } from 'reshaped'
import type { ComponentType, SVGProps } from 'react'
import { FlagGb, FlagRo, FlagUa, FlagRu } from './LanguageFlagSvgs'

type LangCode = 'en' | 'ro' | 'uk' | 'ru'

type FlagComponent = ComponentType<SVGProps<SVGSVGElement>>

const LANGS: { code: LangCode; label: string; Flag: FlagComponent }[] = [
  { code: 'en', label: 'EN', Flag: FlagGb },
  { code: 'ro', label: 'RO', Flag: FlagRo },
  { code: 'uk', label: 'UK', Flag: FlagUa },
  { code: 'ru', label: 'RU', Flag: FlagRu },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) ?? 'en'

  return (
    <View gap={{ s: 2, m: 4 }} direction='row' >
      <Hidden hide={{ s: false, m: true }}>
        <Select
          name="language"
          defaultValue={current}
          onChange={({ value }) => i18n.changeLanguage(value)}
          variant='outline'
          size='medium'>
          {LANGS.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
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
                <l.Flag style={{ display: 'block' }} />
              </Button>
            }

          </Tooltip>
        ))}
      </Hidden>
    </View>
  )
}
