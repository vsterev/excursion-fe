import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, Badge, Loader, Card, Grid, useTheme } from 'reshaped'
import { fetchExcursion, fetchRepresentatives, resolvePhotoUrl } from '../api'
import type { ExcursionDetailDto, RepresentativeDto } from '../api'
import { ArrowBigLeft } from 'lucide-react'
import { RepresentativeCompact } from './Representative'

type Photo = ExcursionDetailDto['photos'][number]

function stripHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    return (div.textContent ?? '').replace(/\s+/g, ' ').trim()
}

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: ExcursionDetailDto }

export function ExcursionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [activePhoto, setActivePhoto] = useState(0)
    const [representatives, setRepresentatives] = useState<RepresentativeDto[]>([])


    const { colorMode } = useTheme();
    const badgeColor = colorMode === 'dark' ? 'primary' : 'primary';
    const badgeVariant = colorMode === 'dark' ? 'solid' : 'outline';

    useEffect(() => {
        if (!id) return
        let cancelled = false
        fetchExcursion(id)
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [id, i18n.language])

    useEffect(() => {
        let cancelled = false
        fetchRepresentatives()
            .then((data) => { if (!cancelled) setRepresentatives(data) })
            .catch(() => { if (!cancelled) setRepresentatives([]) })
        return () => { cancelled = true }
    }, [i18n.language])

    const departureRepresentatives = useMemo(() => {
        if (state.status !== 'success') return []
        const x = state.data
        const departureIds = new Set((x.departures ?? []).map((d) => d.id))
        if (departureIds.size === 0) return []
        const seen = new Set<string>()
        return representatives.filter((rep) => {
            if (!rep.resorts?.some((r) => departureIds.has(r.id))) return false
            if (seen.has(rep.id)) return false
            seen.add(rep.id)
            return true
        })
    }, [state, representatives])

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

    const x = state.data
    const pageTitle = `${x.destination} — ${t('nav.excursions')}`
    const metaDesc = stripHtml(x.description).slice(0, 158)

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDesc} />
            </Helmet>
            <View maxWidth="1200px" gap={4} width="100%" paddingInline={{ s: 4, m: 6 }} paddingBlock={{ s: 5, m: 8 }} attributes={{ style: { margin: '0 auto' } }}>
                <View justify="space-between" direction="row" align="center">
                    <Button icon={<ArrowBigLeft />} variant={badgeVariant} color={badgeColor} onClick={() => navigate(-1)}>
                        {t('repDetail.back')}
                    </Button>
                    {x.departures?.length > 0 && (
                        <Text variant="body-2" color="neutral-faded">
                            📍 {t('detail.departureFrom')} {x.departures.map(d => d.name).join(', ')}
                        </Text>
                    )}
                </View>

                {/* Header */}
                <Text as="h1" variant={{ s: 'title-6', m: 'title-5' }}>{x.destination}</Text>

                {/* Photos */}
                {x.photos.length > 0 && (
                    <View gap={3} paddingBottom={5}>
                        <View borderRadius="medium" overflow="hidden" backgroundColor='elevation-raised'>
                            <img
                                src={resolvePhotoUrl(x.photos[activePhoto].url)!}
                                alt={x.photos[activePhoto].caption ?? x.destination}
                                style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
                            />
                        </View>
                        {x.photos[activePhoto].caption && (
                            <Text variant="body-2" color="neutral-faded" align="center">
                                {x.photos[activePhoto].caption}
                            </Text>
                        )}
                        {x.photos.length > 1 && (
                            <View direction="row" gap={2} wrap>
                                {x.photos.map((p: Photo, i: number) => (
                                    <img
                                        key={p.id}
                                        src={resolvePhotoUrl(p.url)!}
                                        alt={p.caption ?? `${t('detail.photo')} ${i + 1}`}
                                        onClick={() => setActivePhoto(i)}
                                        style={{
                                            width: 96, height: 64, objectFit: 'cover',
                                            borderRadius: 6, cursor: 'pointer',
                                            border: i === activePhoto ? '2px solid var(--primary)' : '2px solid transparent',
                                            opacity: i === activePhoto ? 1 : 0.7,
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                <View
                    shadow="raised"
                    borderRadius="medium"
                    backgroundColor="elevation-raised"
                    overflow="auto"
                    width="100%"
                    attributes={{ style: { minWidth: 0 } }}
                >
                    <Text
                        as="div"
                        variant="body-1"
                        color="neutral-faded"
                        className="excursion-description"
                        attributes={{
                            dangerouslySetInnerHTML: { __html: x.description },
                            style: { minWidth: 0, width: '100%', lineHeight: 1.7 },
                        }}
                    />
                    {x.price && <View
                        direction="row"
                        align="baseline"
                        justify="start"
                        gap={2} padding={5}
                    >
                        <Text variant="body-1" weight="bold" color="neutral">
                            {t('excursions.price')}:
                        </Text>
                        <Badge color="positive" size="large">
                            <Text variant="body-1" weight="bold">{x.price} €</Text>
                        </Badge>
                    </View>
                    }
                </View>

                {departureRepresentatives.length > 0 && (
                    <Card>
                        <View gap={4} paddingTop={2}>
                            <Text variant="featured-1" color="neutral-faded">
                                {t('detail.departureRepresentativesHint')}
                            </Text>
                            <View gap={3} attributes={{ style: { alignItems: 'stretch' } }}>
                                <Grid columns={{ s: 1, m: 2 }} gap={4}>
                                    {departureRepresentatives.map((rep) => (
                                        <RepresentativeCompact key={rep.id} rep={rep} />
                                    ))}
                                </Grid>
                            </View>
                        </View>
                    </Card>
                )}
            </View>
        </>
    )
}
