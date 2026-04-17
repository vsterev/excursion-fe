import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Grid, TextField, Button, Badge, Loader, Actionable, Select } from 'reshaped'
import { fetchExcursions, fetchResorts, resolvePhotoUrl } from '../api'
import type { ExcursionDto, ResortDto } from '../api'

function stripHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent ?? ''
}

/**
 * Must stay in sync with `<Grid columns={{ s: 1, m: 2, l: 3 }}>` below (Reshaped s/m/l ≈ 768 / 1024).
 * First request only loads ~one viewport of cards; "Load more" uses the same batch size.
 */
function excursionListGridColumns(viewportWidth: number): number {
    if (viewportWidth >= 1024) return 3
    if (viewportWidth >= 768) return 2
    return 1
}

function computeExcursionBatchLimit(viewportHeight: number, viewportWidth: number): number {
    const cols = excursionListGridColumns(viewportWidth)
    const chromeAboveListPx = 300
    const reservedBottomPx = 100
    const cardRowEstimatePx = 290
    const available = Math.max(180, viewportHeight - chromeAboveListPx - reservedBottomPx)
    const rows = Math.max(2, Math.ceil(available / cardRowEstimatePx))
    const raw = rows * cols
    return Math.min(50, Math.max(cols * 2, raw))
}

export function ExcursionsPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const { t, i18n } = useTranslation()
    const [items, setItems] = useState<ExcursionDto[]>([])
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resortOptions, setResortOptions] = useState<ResortDto[]>([])
    const resortFilter = useMemo(() => {
        const r = searchParams.get('resort')
        return r && /^\d+$/.test(r) ? r : 'all'
    }, [searchParams])
    const [q, setQ] = useState('')
    const [debouncedQ, setDebouncedQ] = useState('')

    const filterRef = useRef({ resort: resortFilter, q: debouncedQ, lang: i18n.language })
    const itemsLenRef = useRef(0)
    const batchLimitRef = useRef(12)
    const fetchingMoreRef = useRef(false)

    useEffect(() => {
        filterRef.current = { resort: resortFilter, q: debouncedQ, lang: i18n.language }
    }, [resortFilter, debouncedQ, i18n.language])

    useEffect(() => {
        itemsLenRef.current = items.length
    }, [items.length])

    useEffect(() => {
        const tmr = setTimeout(() => setDebouncedQ(q), 350)
        return () => clearTimeout(tmr)
    }, [q])

    useEffect(() => {
        fetchResorts().then(setResortOptions).catch(() => setResortOptions([]))
    }, [])

    const fetchParams = useMemo(
        () => ({
            resortId: resortFilter !== 'all' ? Number(resortFilter) : undefined,
            q: debouncedQ.trim() || undefined,
        }),
        [resortFilter, debouncedQ],
    )

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)
        setItems([])
        setHasMore(true)

            ; (async () => {
                try {
                    const limit = computeExcursionBatchLimit(window.innerHeight, window.innerWidth)
                    batchLimitRef.current = limit
                    const res = await fetchExcursions({
                        limit,
                        offset: 0,
                        resortId: fetchParams.resortId,
                        q: fetchParams.q,
                    })
                    if (cancelled) return
                    setItems(res.items)
                    setHasMore(res.hasMore)
                } catch (e: unknown) {
                    if (!cancelled) setError(e instanceof Error ? e.message : 'Error')
                } finally {
                    if (!cancelled) setLoading(false)
                }
            })()

        return () => {
            cancelled = true
        }
    }, [fetchParams.resortId, fetchParams.q, i18n.language])

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || loading || fetchingMoreRef.current) return
        fetchingMoreRef.current = true
        const snap = { ...filterRef.current }
        setLoadingMore(true)
        setError(null)
        try {
            const res = await fetchExcursions({
                limit: batchLimitRef.current,
                offset: itemsLenRef.current,
                resortId: snap.resort !== 'all' ? Number(snap.resort) : undefined,
                q: snap.q.trim() || undefined,
            })
            const cur = filterRef.current
            if (
                snap.resort !== cur.resort ||
                snap.q !== cur.q ||
                snap.lang !== cur.lang
            ) {
                return
            }
            setItems((prev) => [...prev, ...res.items])
            setHasMore(res.hasMore)
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Error')
        } finally {
            fetchingMoreRef.current = false
            setLoadingMore(false)
        }
    }, [hasMore, loadingMore, loading])

    const hasFilters = q.trim().length > 0 || resortFilter !== 'all'

    function clearFilters() {
        setQ('')
        setSearchParams(
            (prev) => {
                const p = new URLSearchParams(prev)
                p.delete('resort')
                return p
            },
            { replace: true },
        )
    }

    function setResortInUrl(value: string) {
        setSearchParams(
            (prev) => {
                const p = new URLSearchParams(prev)
                if (value === 'all') p.delete('resort')
                else p.set('resort', value)
                return p
            },
            { replace: true },
        )
    }

    return (
        <View maxWidth={{ s: '300px', m: '700px', l: '1200px' }}
            width="100%"
            gap={5}
            paddingBlock={{ s: 5, m: 8 }}
            paddingInline={{ s: 4, m: 6 }}
            attributes={{ style: { margin: '0 auto' } }}
        >
            <View gap={2}>
                <Text as="h1" variant={{ s: 'title-6', m: 'title-4' }} weight="bold">{t('excursions.title')}</Text>
                <Text variant={{ s: 'body-2', m: 'body-1' }} color="neutral-faded">{t('excursions.subtitle')}</Text>
            </View>

            <View shadow="overlay" padding={5} borderRadius="medium" backgroundColor="elevation-raised" paddingBottom={6}>
                <View direction={{ s: 'column', m: 'row' }} gap={4} wrap>
                    <View grow>
                        <TextField
                            name="search"
                            placeholder={`${t('excursions.title')}…`}
                            value={q}
                            onChange={({ value }) => setQ(value)}
                            prefix="🔍"
                        />
                    </View>
                    {resortOptions.length > 0 && (
                        <View width={{ s: '100%', m: '220px' }}>
                            <Select
                                name="resort"
                                value={resortFilter}
                                onChange={({ value }) => setResortInUrl(value)}
                            >
                                <option value="all">{t('usefulInfo.allResorts')}</option>
                                {resortOptions.map(r => (
                                    <option key={r.id} value={String(r.id)}>{r.name}</option>
                                ))}
                            </Select>
                        </View>
                    )}
                    {hasFilters && (
                        <View justify="end">
                            <Button variant="ghost" color="primary" onClick={clearFilters}>✕</Button>
                        </View>
                    )}
                </View>
            </View>

            {loading && (
                <View align="center" padding={16}><Loader size="large" /></View>
            )}
            {error && !loading && (
                <View align="center" padding={16} gap={3}>
                    <Text variant="title-2">⚠️</Text>
                    <Text color="critical">{error}</Text>
                </View>
            )}
            {!loading && !error && items.length === 0 && (
                <View align="center" padding={16} gap={3}>
                    <Text variant="title-2">🔍</Text>
                    <Text color="neutral-faded">{t('excursions.noResults')}</Text>
                </View>
            )}

            {!loading && items.length > 0 && (
                <>
                    <Grid columns={{ s: 1, m: 2, l: 3 }} gap={{ s: 4, m: 6 }} justify="center">
                        {items.map((x: ExcursionDto) => (
                            <Actionable
                                key={x.id}
                                onClick={() => navigate(`/excursions/${x.id}`)}
                            // attributes={{ style: { display: 'block', width: '100%', maxWidth: 350, marginInline: 'auto' } }}
                            >
                                <View
                                    shadow="overlay"
                                    borderRadius="medium"
                                    backgroundColor="elevation-raised"
                                    overflow="hidden"
                                    maxWidth="350px"
                                >
                                    {x.coverPhoto ? (
                                        <img
                                            src={resolvePhotoUrl(x.coverPhoto) ?? ''}
                                            alt={x.destination}
                                            style={{ width: '100%', maxHeight: '230px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <View
                                            align="center"
                                            justify="center"
                                            attributes={{ style: { height: 160, flexShrink: 0, background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: 48 } }}
                                        >
                                            🗺️
                                        </View>
                                    )}
                                    <View padding={4} gap={2} direction="column" attributes={{ style: { overflow: 'hidden', minWidth: 0 } }}>
                                        {x.price != null && (
                                            <View direction="row" justify="end">
                                                <Badge color="positive" size="large">{t('excursions.from')} {x.price} €</Badge>
                                            </View>
                                        )}
                                        <Text variant="featured-1" weight="bold" attributes={{ style: { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }}>{x.destination} </Text>
                                        {x.departures?.length > 0 && (
                                            <Text variant="body-2" color="neutral-faded" attributes={{ style: { display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }}>
                                                📍 {t('excursions.departure')} {x.departures.map(d => d.name).join(', ')}
                                            </Text>
                                        )}
                                        <Text variant="body-1" color="neutral-faded" attributes={{ style: { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } }}>
                                            {stripHtml(x.description)}
                                        </Text>
                                    </View>
                                </View>
                            </Actionable>
                        ))}
                    </Grid>
                    {hasMore ? (
                        <View align="center" paddingTop={4} gap={3}>
                            <Button
                                type="button"
                                variant="faded"
                                color="primary"
                                loading={loadingMore}
                                onClick={() => void loadMore()}
                            >
                                {t('excursions.loadMore')}
                            </Button>
                        </View>
                    ) : null}
                </>
            )}
        </View >
    )
}
