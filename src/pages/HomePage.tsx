import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Grid, Hidden } from 'reshaped'

const CATEGORIES = [
    { emoji: '🏛️', key: 'Cultural' as const },
    { emoji: '🌿', key: 'Nature' as const },
    { emoji: '⛰️', key: 'Mountain' as const },
    { emoji: '🎢', key: 'Leisure' as const },
    { emoji: '🚌', key: 'Sightseeing' as const },
]

export function HomePage() {
    const { t } = useTranslation()

    return (
        <View>
            {/* Hero */}
            <View
                position="relative"
                overflow="hidden"
                height={{ s: 40, m: 105 }}
            // attributes={{ style: { background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' } }}

            >
                <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80"
                    alt="Hero"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                />
                <View
                    position="relative"
                    height="100%"
                    justify="end"
                    direction='row'
                // paddingInline={{ s: 5, m: 10 }}
                // paddingBottom={{ s: 6, m: 10 }}
                >
                    <Hidden hide={{ s: true, l: false }}>
                        <View height="100%" padding={10} width={100} attributes={{ style: { backgroundColor: '#070061' } }}>
                            <Text variant="caption-1" weight="bold" attributes={{ style: { display: 'inline-block', background: 'var(--primary)', color: '#fff', fontSize: 11, letterSpacing: '.8px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, marginBottom: 12, width: 'fit-content' } }}>
                                {t('home.badge')}
                            </Text>
                            <Text as="h1" variant="featured-1" weight="bold" attributes={{ style: { color: '#fff', marginBottom: 8, letterSpacing: -0.5, lineHeight: 1.15 } }}>
                                {t('home.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
                            </Text>
                            <Text variant="body-2" attributes={{ style: { color: 'rgba(255,255,255,.85)', marginBottom: 20, maxWidth: 480 } }}>
                                {t('home.subtitle')}
                            </Text>
                            <Link to="/excursions" className="hero-cta">{t('home.cta')}</Link>
                        </View>
                    </Hidden>

                </View>
            </View>

            <View maxWidth="1200px" width="100%" paddingInline={{ s: 4, m: 6 }} paddingBlock={8} attributes={{ style: { margin: '0 auto' } }}>
                {/* Categories */}
                <View gap={4} paddingBottom={8}>
                    <View>
                        <Text as="h2" variant="featured-2" weight="bold">{t('home.categoriesTitle')}</Text>
                        <Text variant="body-3" color="neutral-faded">{t('home.categoriesSubtitle')}</Text>
                    </View>
                    <View>
                        <Grid columns={{ s: 1, m: 2, l: 3 }} gap={4} align='center'>
                            {CATEGORIES.map(c => (
                                <Link key={c.key} to={`/excursions?type=${encodeURIComponent(c.key)}`} style={{ textDecoration: 'none' }}>
                                    <View shadow='overlay' padding={4} borderRadius="medium">
                                        <View direction="row" gap={3}>
                                            <Text attributes={{ style: { fontSize: 28, lineHeight: 1 } }}>{c.emoji}</Text>
                                            <View>
                                                <Text variant="body-2" weight="bold">{t(`home.categories.${c.key}`)}</Text>
                                                <Text variant="caption-1" color="neutral-faded">{t('home.seeAll')}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </Link>
                            ))}
                        </Grid>
                    </View>
                </View>

                {/* Quick links */}
                <Grid columns={{ s: 1, l: 2 }} gap={4}>
                    <Link to="/representatives" style={{ textDecoration: 'none' }}>
                        <View shadow='overlay' padding={5} borderRadius="medium" backgroundColor="primary-faded">
                            <View direction="row" align="center" gap={4}>
                                <Text attributes={{ style: { fontSize: 32, lineHeight: 1 } }}>👥</Text>
                                <View>
                                    <Text variant="body-1" weight="bold">{t('home.repsTitle')}</Text>
                                    <Text variant="body-3" color="neutral-faded">{t('home.repsDesc')}</Text>
                                </View>
                            </View>
                        </View>
                    </Link>
                    <Link to="/useful-info" style={{ textDecoration: 'none' }}>
                        <View shadow="overlay" padding={5} borderRadius="medium" backgroundColor="primary-faded">
                            <View direction="row" align="center" gap={4}>
                                <Text attributes={{ style: { fontSize: 32, lineHeight: 1 } }}>ℹ️</Text>
                                <View>
                                    <Text variant="body-1" weight="bold">{t('home.infoTitle')}</Text>
                                    <Text variant="body-3" color="neutral-faded">{t('home.infoDesc')}</Text>
                                </View>
                            </View>
                        </View>
                    </Link>
                </Grid>
            </View>
        </View>
    )
}
