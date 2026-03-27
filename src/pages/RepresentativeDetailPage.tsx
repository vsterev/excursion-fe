import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Avatar, Button, Divider, Loader } from 'reshaped'
import { fetchRepresentative, resolvePhotoUrl } from '../api'
import type { RepresentativeDto } from '../api'

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RepresentativeDto }

export function RepresentativeDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })

    useEffect(() => {
        if (!id) return
        let cancelled = false
        fetchRepresentative(id)
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [id])

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
    const mapsUrl = `https://www.google.com/maps?q=${r.lat},${r.lng}`

    return (
        <View maxWidth="1200px" width="100%" paddingBlock={{ s: 5, m: 8 }} paddingInline={{ s: 4, m: 6 }} attributes={{ style: { margin: '0 auto' } }}>
            <View paddingBottom={6}>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    ← {t('repDetail.back')}
                </Button>
            </View>

            <View direction={{ s: 'column', l: 'row' }} gap={{ s: 6, l: 8 }} align="start">
                {/* Main */}
                <View grow gap={6}>
                    {/* Header */}
                    <View direction={{ s: 'column', m: 'row' }} gap={{ s: 4, m: 6 }} align="start">
                        <Avatar
                            src={resolvePhotoUrl(r.photoUrl) ?? undefined}
                            initials={r.name.charAt(0)}
                            size={{ s: 16, m: 20 }}
                        />
                        <View gap={2}>
                            <Text as="h1" variant="title-1" weight="bold">{r.name}</Text>
                            <Text variant="caption-1" weight="bold" color="primary" attributes={{ style: { textTransform: 'uppercase', letterSpacing: '.6px' } }}>{r.resort}</Text>
                            {r.phone && (
                                <View direction="row" align="center" gap={2}>
                                    <Text>📞</Text>
                                    <Text as="a" variant="body-2" attributes={{ href: `tel:${r.phone}`, style: { color: 'inherit' } }}>{r.phone}</Text>
                                </View>
                            )}
                            {r.email && (
                                <View direction="row" align="center" gap={2}>
                                    <Text>✉️</Text>
                                    <Text as="a" variant="body-2" attributes={{ href: `mailto:${r.email}`, style: { color: 'inherit' } }}>{r.email}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Map */}
                    <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="white">                    <View paddingBottom={3}>
                        <Text variant="title-3" weight="bold">
                            {t('repDetail.location')} — {r.resort}
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
                </View>

                {/* Sidebar */}
                <View
                    shadow="raised"
                    padding={6}
                    borderRadius="medium"
                    backgroundColor="white"
                    width={{ s: '100%', l: '320px' }}
                    attributes={{ style: { flexShrink: 0 } }}
                >
                    <Text variant="title-3" weight="bold">{t('repDetail.contact')}</Text>
                    <Divider attributes={{ style: { margin: '12px 0' } }} />
                    <View gap={3}>
                        {r.phone && (
                            <View direction="row" align="center" gap={2}>
                                <Text>📞</Text>
                                <Text as="a" variant="body-2" weight="bold" attributes={{ href: `tel:${r.phone}`, style: { color: 'var(--rs-color-foreground-neutral)' } }}>{r.phone}</Text>
                            </View>
                        )}
                        {r.email && (
                            <View direction="row" align="center" gap={2}>
                                <Text>✉️</Text>
                                <Text as="a" variant="body-2" weight="bold" attributes={{ href: `mailto:${r.email}`, style: { color: 'var(--rs-color-foreground-neutral)' } }}>{r.email}</Text>
                            </View>
                        )}
                        <View direction="row" align="center" gap={2}>
                            <Text>🏖️</Text><Text variant="body-2">{r.resort}</Text>
                        </View>
                        <View direction="row" align="center" gap={2}>
                            <Text>📌</Text><Text variant="body-2" color="neutral-faded">{r.lat.toFixed(4)}, {r.lng.toFixed(4)}</Text>
                        </View>
                    </View>
                    <View gap={3} paddingTop={5}>
                        <Button
                            as="a"
                            variant="solid"
                            color="primary"
                            fullWidth
                            attributes={{ href: mapsUrl, target: '_blank', rel: 'noopener noreferrer' }}
                        >
                            {t('repDetail.viewMap')}
                        </Button>
                        {r.phone && (
                            <Button
                                as="a"
                                variant="outline"
                                color="primary"
                                fullWidth
                                attributes={{ href: `tel:${r.phone}` }}
                            >
                                {t('repDetail.call')}
                            </Button>
                        )}
                    </View>
                </View>
            </View>
        </View>
    )
}
