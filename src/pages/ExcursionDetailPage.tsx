import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, Badge, Loader } from 'reshaped'
import { fetchExcursion, resolvePhotoUrl } from '../api'
import type { ExcursionDetailDto } from '../api'

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

    const locale = i18n.language?.startsWith('de') ? 'de-DE'
        : i18n.language?.startsWith('en') ? 'en-GB' : 'bg-BG'

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
        <View maxWidth="1200px" width="100%" paddingInline={{ s: 4, m: 6 }} paddingBlock={{ s: 5, m: 8 }} attributes={{ style: { margin: '0 auto' } }}>
            <Button variant="ghost" onClick={() => navigate(-1)} attributes={{ style: { marginBottom: 24 } }}>
                ← {t('detail.back')}
            </Button>

            {/* Header */}
            <View gap={3} attributes={{ style: { marginBottom: 24 } }}>
                <View direction="row" gap={3} align="center" wrap>
                    <Badge color="primary">{t(`home.categories.${x.type}`, { defaultValue: x.type })}</Badge>
                    <Text variant="body-2" color="neutral-faded">{t('detail.departureFrom')} {x.from}</Text>
                </View>
                <Text as="h1" variant="title-1" weight="bold">{x.destination}</Text>
                {x.date && (
                    <Text variant="body-2" color="neutral-faded">
                        📅 {new Date(x.date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                )}
            </View>

            {/* Photos */}
            {x.photos.length > 0 && (
                <View gap={3} attributes={{ style: { marginBottom: 32 } }}>
                    <View attributes={{ style: { borderRadius: 12, overflow: 'hidden' } }}>
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

            {/* Description */}
            <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="white">
                <Text variant="title-3" weight="bold" attributes={{ style: { marginBottom: 12 } }}>{t('detail.description')}</Text>
                <div
                    className="excursion-description"
                    dangerouslySetInnerHTML={{ __html: x.description }}
                    style={{ lineHeight: 1.7, color: 'var(--rs-color-foreground-neutral-faded)' }}
                />
            </View>
        </View>
    )
}
