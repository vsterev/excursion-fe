import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Avatar, Button, Loader, Hidden, Badge, Grid, useTheme } from 'reshaped'
import { fetchRepresentative, resolvePhotoUrl } from '../api'
import { RepresentativeContact } from '../components/RepresentativeContact'
import { ArrowBigLeft } from 'lucide-react'
import type { RepresentativeDto } from '../api'

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RepresentativeDto }

export function RepresentativeDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })

    const { colorMode } = useTheme();
    const badgeColor = colorMode === 'dark' ? 'primary' : 'primary';
    const badgeVariant = colorMode === 'dark' ? 'solid' : 'outline';

    useEffect(() => {
        if (!id) return
        let cancelled = false
        fetchRepresentative(id)
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [id, i18n.language])

    if (state.status === 'loading') {
        return <View align="center" padding={16}><Loader size="large" /></View>
    }

    if (state.status === 'error') {
        return (
            <View align="center" padding={16} gap={3}>
                <Text variant="title-2">⚠️</Text>
                <Text color="critical">{state.message}</Text>
            </View>
        )
    }

    const r = state.data
    const hotelsList = r.hotels ?? []
    const mapsUrl = `https://www.google.com/maps?q=${r.lat},${r.lng}`
    const pageTitle = `${r.name} — ${t('nav.representatives')}`
    const metaDesc = [r.name, r.resorts?.map((x) => x.name).join(', '), hotelsList.slice(0, 4).join(', ')]
        .filter(Boolean)
        .join(' · ')
        .slice(0, 158)

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDesc} />
            </Helmet>
            <View maxWidth="1200px" width="100%" paddingBlock={{ s: 5, m: 8 }} paddingInline={{ s: 4, m: 6 }} attributes={{ style: { margin: '0 auto' } }}>
            <View paddingBottom={6}>
                <Button icon={<ArrowBigLeft />} variant={badgeVariant} color="primary" onClick={() => navigate(-1)}>
                    {t('repDetail.back')}
                </Button>
            </View>

            <View direction={{ s: 'column', l: 'row' }} gap={{ s: 6, l: 8 }} align="start">
                {/* Main */}
                <View grow gap={6}>
                    {/* Header */}
                    <View direction="column" gap={{ s: 4, m: 6 }} padding={5} borderRadius="medium" align="start" wrap backgroundColor="elevation-raised">
                        <View direction="row" align="center" gap={5}>
                            <Avatar
                                src={resolvePhotoUrl(r.photoUrl) ?? undefined}
                                initials={r.name.charAt(0)}
                                size={{ s: 16, m: 20 }}
                            />
                            <Text as="h1" variant="title-6" weight="bold">{r.name}</Text>
                        </View>
                        {
                            r.languages?.length && <View gap={2} direction="row" align="center">
                                <Text variant="body-2" color="neutral-faded">{t('repDetail.languagesLabel')}</Text>
                                {r.languages.map((l) => <Badge key={l} variant={badgeVariant} size="large" color={badgeColor}>{l}</Badge>)}
                            </View>

                        }
                        {
                            r.resorts?.length && <View gap={2} direction="row">
                                <Text variant="body-2" color="neutral-faded">{t('repDetail.resortsLabel')}</Text>
                                {r.resorts.map((s) => <Badge key={s.id} variant={badgeVariant} size="large" color={badgeColor}>{s.name}</Badge>)}
                            </View>

                        }
                        {
                            hotelsList.length > 0 && <View gap={2} direction="column">
                                <Text variant="body-2" color="neutral-faded">{t('repDetail.hotelsLabel')}</Text>
                                <View direction="row" gap={2}>
                                    <Grid columns={{ s: 3, m: 5, l: 6 }} gap={2}>
                                        {hotelsList.map((h, idx) => (
                                            <Text key={idx} variant="body-1" color="primary">
                                                {idx === hotelsList.length - 1 ? h : `${h}, `}
                                            </Text>
                                        ))}
                                    </Grid>
                                </View>
                            </View>

                        }
                    </View>

                    {/* Map */}
                    <Hidden hide={{ s: true, m: false }}>
                        <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="elevation-raised">
                            <View paddingBottom={3}>
                                <Text variant="title-6" weight="bold">
                                    {t('repDetail.location')}
                                </Text>
                            </View>
                            <iframe
                                title="map"
                                width="100%"
                                height="320"
                                style={{ border: 0, borderRadius: 8, display: 'block' }}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${r.lng - 0.02},${r.lat - 0.02},${r.lng + 0.02},${r.lat + 0.02}&layer=mapnik&marker=${r.lat},${r.lng}`}
                            />
                            <Text
                                as="a"
                                variant="body-2"
                                weight="bold"
                                color="primary"
                                attributes={{ href: mapsUrl, target: '_blank', rel: 'noopener noreferrer', style: { display: 'inline-block', marginTop: 8 } }}
                            >
                                {t('repDetail.openMaps')}
                            </Text>
                        </View>
                    </Hidden>
                </View>

                <RepresentativeContact rep={r} mapsUrl={mapsUrl} />
            </View>
        </View >
        </>
    )
}
