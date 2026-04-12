import { useTranslation } from 'react-i18next'
import { Button, DropdownMenu, Hidden, Tooltip, View } from 'reshaped'
import type { ComponentType, SVGProps } from 'react'
import { ChevronDown } from 'lucide-react'
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
  const { i18n, t } = useTranslation()
  const currentCode = (i18n.language?.slice(0, 2) ?? 'en') as LangCode
  const current = LANGS.find((l) => l.code === currentCode) ?? LANGS[0]
  const CurrentFlag = current.Flag

  return (
    <View gap={{ s: 2, m: 4 }} direction="row">
      <Hidden hide={{ s: false, m: true }}>
        <DropdownMenu position="bottom-end">
          <DropdownMenu.Trigger>
            {(attributes) => (
              <Button
                attributes={attributes}
                variant="outline"
                size="medium"
                aria-label={t('nav.chooseLanguage')}
              >
                <View direction="row" align="center" gap={2}>
                  <CurrentFlag style={{ display: 'block' }} />
                  <ChevronDown size={16} strokeWidth={2} aria-hidden />
                </View>
              </Button>
            )}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {LANGS.map((l) => (
              <DropdownMenu.Item
                key={l.code}
                onClick={() => i18n.changeLanguage(l.code)}
                startSlot={<l.Flag style={{ display: 'block' }} />}
                selected={currentCode === l.code}
              >
                {l.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      </Hidden>
      <Hidden hide={{ s: true, m: false }}>
        {LANGS.map((l) => (
          <Tooltip key={l.code} text={l.label} position="bottom">
            {(attributes) => (
              <Button
                attributes={attributes}
                variant="ghost"
                highlighted={currentCode === l.code}
                onClick={() => i18n.changeLanguage(l.code)}
              >
                <l.Flag style={{ display: 'block' }} />
              </Button>
            )}
          </Tooltip>
        ))}
      </Hidden>
    </View>
  )
}
