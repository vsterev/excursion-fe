import { useTranslation } from 'react-i18next'
import { View, Text, Button, Divider, useTheme } from 'reshaped'
import type { RepresentativeDto } from '../api'
import { whatsappChatUrl } from '../utils/whatsappChatUrl'

type Props = {
    rep: RepresentativeDto
    mapsUrl: string
}

/**
 * Странична колона „Контакт“ на профила на представител — телефон, имейл, WhatsApp, координати, бутони.
 */
export function RepresentativeContact({ rep }: Props) {
    const { t } = useTranslation()
    const { colorMode } = useTheme()
    const callVariant = colorMode === 'dark' ? 'solid' : 'outline'
    const callColor = colorMode === 'dark' ? 'neutral' : 'primary'
    const waHref = whatsappChatUrl(rep.whatsapp)

    return (
        <View
            shadow="raised"
            padding={6}
            borderRadius="medium"
            backgroundColor="elevation-raised"
            width={{ s: '100%', l: '320px' }}
            attributes={{ style: { flexShrink: 0 } }}
        >
            <Text variant="title-6" weight="bold">{t('repDetail.contact')}</Text>
            <Divider attributes={{ style: { margin: '12px 0' } }} />
            <View gap={3}>
                {rep.phone && (
                    <View direction="row" align="center" gap={2}>
                        <Text>📞</Text>
                        <Text
                            as="a"
                            variant="body-2"
                            weight="bold"
                            attributes={{
                                href: `tel:${rep.phone}`,
                                style: { color: 'var(--rs-color-foreground-neutral)' },
                            }}
                        >
                            {rep.phone}
                        </Text>
                    </View>
                )}
                {rep.email && (
                    <View direction="row" align="center" gap={2}>
                        <Text>✉️</Text>
                        <Text
                            as="a"
                            variant="body-2"
                            weight="bold"
                            attributes={{
                                href: `mailto:${rep.email}`,
                                style: { color: 'var(--rs-color-foreground-neutral)' },
                            }}
                        >
                            {rep.email}
                        </Text>
                    </View>
                )}
                <View direction="row" align="center" gap={2}>
                    <Text>📌</Text>
                    <Text variant="body-2" color="neutral-faded">
                        {rep.lat.toFixed(4)}, {rep.lng.toFixed(4)}
                    </Text>
                </View>
            </View>
            <View gap={3} paddingTop={5}>
                {rep.phone && (
                    <Button
                        as="a"
                        variant={callVariant}
                        color={callColor}
                        fullWidth
                        attributes={{ href: `tel:${rep.phone}` }}
                    >
                        {t('repDetail.call')}
                    </Button>
                )}
                {waHref && (
                    <Button
                        as="a"
                        variant={callVariant}
                        color={callColor}
                        fullWidth
                        attributes={{ href: waHref, target: '_blank', rel: 'noopener noreferrer' }}
                    >
                        {t('repDetail.openWhatsApp')}
                    </Button>
                )}
            </View>
        </View>
    )
}
