import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SOLVEX_LOGO_SRC } from '../branding'
import { View, Text, Grid, Hidden } from 'reshaped'

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
                <Hidden hide={{ s: false, l: true }}>
                    <View
                        position="absolute"
                        zIndex={2}
                        padding={4}
                        attributes={{ style: { top: 0, left: 0 } }}
                    >
                        <img
                            src={SOLVEX_LOGO_SRC}
                            alt={t('nav.logoAlt')}
                            style={{ display: 'block', height: 44, width: 'auto', maxWidth: 'min(260px, 85vw)' }}
                        />
                    </View>
                </Hidden>
                <View
                    position="relative"
                    height="100%"
                    justify="end"
                    direction='row'
                // paddingInline={{ s: 5, m: 10 }}
                // paddingBottom={{ s: 6, m: 10 }}
                >
                    <Hidden hide={{ s: true, l: false }}>
                        <View
                            height="100%"
                            padding={10}
                            attributes={{
                                style: {
                                    backgroundColor: '#070061',
                                    width: 'min(380px, 40vw)',
                                    flexShrink: 0,
                                    boxSizing: 'border-box',
                                },
                            }}
                        >
                            <img
                                src={SOLVEX_LOGO_SRC}
                                alt={t('nav.logoAlt')}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: 120,
                                    objectFit: 'contain',
                                    marginBottom: 16,
                                }}
                            />
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

            <View maxWidth="1200px" width="100%" paddingInline={{ s: 4, m: 6 }} paddingBlock={8} align="center" grow justify="center" attributes={{ style: { margin: '0 auto' } }}>
                {/* About + representatives — same row (large screens), same card style */}
                <Grid columns={{ s: 1, m: 2 }} gap={4} align="stretch">
                    <Link to="/about" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                        <View
                            shadow="overlay"
                            padding={5}
                            borderRadius="medium"
                            backgroundColor="primary-faded"
                            height="100%"
                        >
                            <View direction="row" align="center" gap={4}>
                                <Text attributes={{ style: { fontSize: 32, lineHeight: 1 } }}>🏢</Text>
                                <View>
                                    <Text variant="body-1" weight="bold">{t('home.aboutSectionTitle')}</Text>
                                    <Text variant="body-3" color="neutral-faded">{t('home.aboutSectionSubtitle')}</Text>
                                    <Text variant="caption-1" color="neutral-faded" attributes={{ style: { marginTop: 6 } }}>
                                        {t('home.aboutSectionCta')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Link>
                    <Link to="/representatives" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                        <View
                            shadow="overlay"
                            padding={5}
                            borderRadius="medium"
                            backgroundColor="primary-faded"
                            height="100%"
                        >
                            <View direction="row" align="center" gap={4}>
                                <Text attributes={{ style: { fontSize: 32, lineHeight: 1 } }}>👥</Text>
                                <View>
                                    <Text variant="body-1" weight="bold">{t('home.repsTitle')}</Text>
                                    <Text variant="body-3" color="neutral-faded">{t('home.repsDesc')}</Text>
                                </View>
                            </View>
                        </View>
                    </Link>
                </Grid>
            </View>
        </View >
    )
}
