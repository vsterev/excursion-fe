import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text } from 'reshaped'

export function NotFoundPage() {
    const { t } = useTranslation()

    return (
        <View attributes={{ style: { textAlign: 'center' } }}>
            <View
                position="relative"
                overflow="hidden"
                height={{ s: 48, m: 80 }}
            >
                <img
                    src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1400&q=80"
                    alt="Beach"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <View
                    position="relative"
                    height="100%"
                    align="center"
                    justify="center"
                    attributes={{ style: { background: 'rgba(0,0,0,0.45)' } }}
                >
                    <Text
                        variant="featured-1"
                        weight="bold"
                        attributes={{ style: { fontSize: 120, lineHeight: 1, color: 'rgba(255,255,255,0.25)', letterSpacing: -4 } }}
                    >
                        {t('notFound.code')}
                    </Text>
                </View>
            </View>

            <View align="center" paddingBlock={12} paddingInline={6} gap={4}>
                <Text as="h1" variant="featured-3" weight="bold">
                    {t('notFound.title')}
                </Text>
                <Text variant="body-2" color="neutral-faded" attributes={{ style: { maxWidth: 420 } }}>
                    {t('notFound.subtitle')}
                </Text>
                <Link to="/" className="hero-cta">
                    {t('notFound.back')}
                </Link>
            </View>
        </View>
    )
}
