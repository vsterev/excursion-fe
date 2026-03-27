import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Grid } from 'reshaped'

const CATEGORIES = [
    { emoji: '🏛️', key: 'Културна' as const },
    { emoji: '🌿', key: 'Природна' as const },
    { emoji: '⛰️', key: 'Планинска' as const },
    { emoji: '🎢', key: 'Развлекателна' as const },
]

export function HomePage() {
    const { t } = useTranslation()

    return (
        <View>
            {/* Hero */}
            <View
                position="relative"
                overflow="hidden"
                attributes={{ style: { height: 480, marginBottom: 48, background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', display: 'flex', alignItems: 'flex-end' } }}
            >
                <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80"
                    alt="Hero"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
                />
                <View position="relative" padding={10} attributes={{ style: { color: '#fff' } }}>
                    <Text variant="caption-1" weight="bold" attributes={{ style: { display: 'inline-block', background: 'var(--primary)', color: '#fff', fontSize: 12, letterSpacing: '.8px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, marginBottom: 16 } }}>
                        {t('home.badge')}
                    </Text>
                    <Text as="h1" variant="featured-1" weight="bold" attributes={{ style: { color: '#fff', marginBottom: 12, letterSpacing: -1 } }}>
                        {t('home.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
                    </Text>
                    <Text variant="body-1" attributes={{ style: { color: 'rgba(255,255,255,.85)', marginBottom: 28, maxWidth: 560 } }}>
                        {t('home.subtitle')}
                    </Text>
                    <Link to="/excursions" className="hero-cta">{t('home.cta')}</Link>
                </View>
            </View>

            <View maxWidth="1200px" width="100%" paddingInline={{ s: 4, m: 6 }} attributes={{ style: { margin: '0 auto' } }}>
                {/* Categories */}
                <View gap={6} paddingBottom={12}>
                    <View>
                        <Text as="h1" variant="title-1" weight="bold">{t('home.categoriesTitle')}</Text>
                        <Text variant="body-2" color="neutral-faded">{t('home.categoriesSubtitle')}</Text>
                    </View>
                    <Grid columns={{ s: 1, m: 2, l: 4 }} gap={4}>
                        {CATEGORIES.map(c => (
                            <Link key={c.key} to={`/excursions?type=${encodeURIComponent(c.key)}`} style={{ textDecoration: 'none' }}>
                                <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="white">
                                    <View direction="row" align="center" gap={4}>
                                        <Text variant="title-1">{c.emoji}</Text>
                                        <View>
                                            <Text variant="body-1" weight="bold">{t(`home.categories.${c.key}`)}</Text>
                                            <Text variant="caption-1" color="neutral-faded">{t('home.seeAll')}</Text>
                                        </View>
                                    </View>
                                </View>
                            </Link>
                        ))}
                    </Grid>
                </View>

                {/* Quick links */}
                <Grid columns={{ s: 1, m: 2 }} gap={6}>
                    <Link to="/representatives" style={{ textDecoration: 'none' }}>
                        <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="white">
                            <View direction="row" align="center" gap={5}>
                                <Text variant="featured-1">👥</Text>
                                <View>
                                    <Text variant="title-3" weight="bold">{t('home.repsTitle')}</Text>
                                    <Text variant="body-2" color="neutral-faded">{t('home.repsDesc')}</Text>
                                </View>
                            </View>
                        </View>
                    </Link>
                    <Link to="/useful-info" style={{ textDecoration: 'none' }}>
                        <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="white">
                            <View direction="row" align="center" gap={5}>
                                <Text variant="featured-1">ℹ️</Text>
                                <View>
                                    <Text variant="title-3" weight="bold">{t('home.infoTitle')}</Text>
                                    <Text variant="body-2" color="neutral-faded">{t('home.infoDesc')}</Text>
                                </View>
                            </View>
                        </View>
                    </Link>
                </Grid>
            </View>
        </View>
    )
}
