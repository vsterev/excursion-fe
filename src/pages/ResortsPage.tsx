import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Loader, Card, Grid } from 'reshaped'
import { fetchResorts, resolvePhotoUrl } from '../api'
import type { ResortDto } from '../api'

export function ResortsPage() {
    const { t, i18n } = useTranslation()
    const [items, setItems] = useState<ResortDto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        void Promise.resolve().then(() => {
            if (cancelled) return
            setLoading(true)
            setError(null)
            return fetchResorts()
                .then((data) => {
                    if (!cancelled) setItems(data)
                })
                .catch((e: Error) => {
                    if (!cancelled) setError(e.message)
                })
                .finally(() => {
                    if (!cancelled) setLoading(false)
                })
        })
        return () => {
            cancelled = true
        }
    }, [i18n.language])

    if (loading) {
        return (
            <View align="center" padding={16}>
                <Loader size="large" />
            </View>
        )
    }

    if (error) {
        return (
            <View align="center" padding={16} gap={2}>
                <Text color="critical">{error}</Text>
            </View>
        )
    }

    return (
        <>
            <Helmet>
                <title>{t('seo.resortsTitle')}</title>
                <meta name="description" content={t('seo.resortsDescription')} />
            </Helmet>
            <View maxWidth="1200px" width="100%" paddingInline={{ s: 4, m: 6 }} paddingBlock={{ s: 5, m: 8 }} attributes={{ style: { margin: '0 auto' } }} gap={5}>
                <View gap={2}>
                    <Text as="h1" variant="title-3" weight="bold">
                        {t('resortsPage.title')}
                    </Text>
                    <Text variant="body-2" color="neutral-faded">
                        {t('resortsPage.subtitle')}
                    </Text>
                </View>
                {items.length > 6 ? (
                    <View gap={2}>
                        <Text variant="caption-1" color="neutral-faded">
                            {t('resortsPage.quickNav')}
                        </Text>
                        <View direction="row" gap={2} wrap>
                            {items.map((r) => (
                                <Link
                                    key={`quick-${r.id}`}
                                    to={`/resorts/${r.id}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <Text variant="body-2" color="primary">
                                        {r.name}
                                    </Text>
                                </Link>
                            ))}
                        </View>
                    </View>
                ) : null}
                <Grid columns={{ s: 1, m: 2, l: 3 }} gap={4}>
                    {items.map((r) => {
                        const src = resolvePhotoUrl(r.coverPhoto ?? null)
                        return (
                            <Link key={r.id} to={`/resorts/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Card padding={0}>
                                    <View gap={0}>
                                        {src ? (
                                            <img
                                                src={src}
                                                alt=""
                                                style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                                            />
                                        ) : (
                                            <View
                                                height={180}
                                                backgroundColor="neutral-faded"
                                                align="center"
                                                justify="center"
                                            >
                                                <Text color="neutral-faded">🏖️</Text>
                                            </View>
                                        )}
                                        <View padding={4} gap={1}>
                                            <Text variant="body-1" weight="bold">
                                                {r.name}
                                            </Text>
                                            <Text variant="caption-1" color="primary">
                                                {t('resortsPage.readMore')}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            </Link>
                        )
                    })}
                </Grid>
            </View>
        </>
    )
}
