import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, Badge, Loader } from 'reshaped'
import { fetchExcursion, resolvePhotoUrl } from '../api'
import type { ExcursionDetailDto } from '../api'
import { ArrowBigLeft } from 'lucide-react'

type Photo = ExcursionDetailDto['photos'][number]

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

    useEffect(() => {
        if (!id) return
        let cancelled = false
        fetchExcursion(id)
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

    const x = state.data

    return (
        <View maxWidth="1200px" gap={4} width="100%" paddingInline={{ s: 4, m: 6 }} paddingBlock={{ s: 5, m: 8 }} attributes={{ style: { margin: '0 auto' } }}>
            <View justify="space-between" direction="row" align="center">
                <Button icon={<ArrowBigLeft />} variant="outline" color="primary" onClick={() => navigate(-1)}>
                    {t('repDetail.back')}
                </Button>
                {x.departures?.length > 0 && (
                    <Text variant="body-2" color="neutral-faded">
                        📍 {t('detail.departureFrom')} {x.departures.map(d => d.name).join(', ')}
                    </Text>
                )}
            </View>

            {/* Header */}
            <View direction={{ s: "column", m: "row" }} align={{ s: "start", m: "center" }} gap={4}>
                <Badge size="large" color="primary">{t(`home.categories.${x.type}`, { defaultValue: x.type })}</Badge>
                <Text as="h1" variant={{ s: 'title-6', m: 'title-5' }}>{x.destination}</Text>
            </View>

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
            </View>
        </View>
    )
}
