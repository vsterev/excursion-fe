import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, Loader, Card, useTheme } from 'reshaped'
import { fetchResortDetail, resolvePhotoUrl, rewriteUploadUrlsInHtml } from '../api'
import { normalizeQuillHtmlNbsp } from '../richTextNormalize'
import type { ResortDetailDto } from '../api'
import { ArrowBigLeft } from 'lucide-react'

function stripHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    return (div.textContent ?? '').replace(/\s+/g, ' ').trim()
}

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: ResortDetailDto }

export function ResortDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [activePhoto, setActivePhoto] = useState(0)
    const { colorMode } = useTheme()
    const badgeColor = colorMode === 'dark' ? 'primary' : 'primary'
    const badgeVariant = colorMode === 'dark' ? 'solid' : 'outline'

    const resortId = useMemo(() => {
        const n = id ? parseInt(id, 10) : NaN
        return Number.isFinite(n) ? n : null
    }, [id])

    useEffect(() => {
        if (resortId === null) return
        let cancelled = false
        void Promise.resolve().then(() => {
            if (cancelled) return
            setState({ status: 'loading' })
            fetchResortDetail(resortId)
                .then((data) => {
                    if (!cancelled) {
                        setState({ status: 'success', data })
                        setActivePhoto(0)
                    }
                })
                .catch((e: Error) => {
                    if (!cancelled) setState({ status: 'error', message: e.message })
                })
        })
        return () => {
            cancelled = true
        }
    }, [resortId, i18n.language])

    if (resortId === null) {
        return (
            <View align="center" padding={16} gap={3}>
                <Text variant="title-2">⚠️</Text>
                <Text color="critical">Invalid resort</Text>
                <Button variant="outline" color="neutral" onClick={() => navigate('/resorts')}>
                    {t('resortsPage.backToList')}
                </Button>
            </View>
        )
    }

    if (
        state.status === 'loading' ||
        (state.status === 'success' && state.data.id !== resortId)
    ) {
        return (
            <View align="center" padding={16}>
                <Loader size="large" />
            </View>
        )
    }

    if (state.status === 'error') {
        return (
            <View align="center" padding={16} gap={3}>
                <Text variant="title-2">⚠️</Text>
                <Text color="critical">{state.message}</Text>
                <Button variant="outline" color="neutral" onClick={() => navigate('/resorts')}>
                    {t('resortsPage.backToList')}
                </Button>
            </View>
        )
    }

    const x = state.data
    const photos = x.photos ?? []
    const mainSrc = photos[activePhoto] ? resolvePhotoUrl(photos[activePhoto].url) : null
    const pageTitle = `${x.name} — ${t('nav.resorts')}`
    const metaDesc = stripHtml(normalizeQuillHtmlNbsp(x.description)).slice(0, 158)

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
                    <Button icon={<ArrowBigLeft />} variant={badgeVariant} color={badgeColor} onClick={() => navigate('/resorts')}>
                        {t('resortsPage.backToList')}
                    </Button>
                </View>

                <Text as="h1" variant="title-3" weight="bold">
                    {x.name}
                </Text>

                {mainSrc ? (
                    <Card padding={0}>
                        <img src={mainSrc} alt="" style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
                    </Card>
                ) : null}

                {photos.length > 1 ? (
                    <View direction="row" gap={2} wrap>
                        {photos.map((p, i) => {
                            const thumb = resolvePhotoUrl(p.url)
                            if (!thumb) return null
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setActivePhoto(i)}
                                    style={{
                                        border: activePhoto === i ? '2px solid var(--color-primary, #06c)' : '1px solid var(--border, #ccc)',
                                        borderRadius: 8,
                                        padding: 0,
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        width: 88,
                                        height: 66,
                                        background: 'none',
                                    }}
                                >
                                    <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </button>
                            )
                        })}
                    </View>
                ) : null}

                <View
                    shadow="raised"
                    borderRadius="medium"
                    backgroundColor="elevation-raised"
                    overflow="auto"
                    width="100%"
                    padding={5}
                    attributes={{ style: { minWidth: 0 } }}
                >
                    <Text
                        as="div"
                        variant="body-1"
                        color="neutral-faded"
                        className="excursion-description"
                        attributes={{
                            dangerouslySetInnerHTML: { __html: rewriteUploadUrlsInHtml(x.description) },
                            style: { minWidth: 0, width: '100%', lineHeight: 1.7 },
                        }}
                    />
                </View>

                <View paddingTop={2} direction="row" justify="space-between" gap={2}>
                    <View backgroundColor="primary-faded" paddingBlock={2} paddingInline={2} borderRadius="small">
                        <Link to={`/representatives?resort=${x.id}`} style={{ textDecoration: 'none' }}>
                            <Text variant="body-1" color="primary">
                                {t('resortsPage.repsInResort', { name: x.name })}
                            </Text>
                        </Link>
                    </View>
                    <View backgroundColor="primary-faded" paddingBlock={2} paddingInline={2} borderRadius="small">
                        <Link to={`/excursions?resort=${x.id}`} style={{ textDecoration: 'none' }}>
                            <Text variant="body-1" color="primary">
                                {t('resortsPage.excursionsInResort', { name: x.name })}
                            </Text>
                        </Link>
                    </View>
                </View>
            </View>
        </>
    )
}
