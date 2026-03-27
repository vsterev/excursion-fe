import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Grid, TextField, Button, Badge, Loader } from 'reshaped'
import { fetchExcursions } from '../api'
import type { ExcursionDto } from '../api'

const TYPE_EMOJI: Record<string, string> = {
    'Културна': '🏛️',
    'Природна': '🌿',
    'Планинска': '⛰️',
    'Развлекателна': '🎢',
}

function fmtDate(iso: string, locale: string) {
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

type LoadState =
    | { status: 'idle' | 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: ExcursionDto[] }

export function ExcursionsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { t, i18n } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [typeFilter, setTypeFilter] = useState(() => searchParams.get('type') ?? 'all')
    const [q, setQ] = useState('')
    const [priceMin, setPriceMin] = useState('')
    const [priceMax, setPriceMax] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    useEffect(() => {
        let cancelled = false
        fetchExcursions()
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [i18n.language])

    const data = useMemo(() => (state.status === 'success' ? state.data : []), [state])
    const types = useMemo(() => Array.from(new Set(data.map((x: ExcursionDto) => x.type))).sort(), [data])

    const filtered = useMemo(() => {
        return data.filter((x: ExcursionDto) => {
            if (typeFilter !== 'all' && x.type !== typeFilter) return false
            if (q && !`${x.destination} ${x.from} ${x.description} ${x.type}`.toLowerCase().includes(q.toLowerCase())) return false
            if (priceMin && x.priceBgn < Number(priceMin)) return false
            if (priceMax && x.priceBgn > Number(priceMax)) return false
            if (dateFrom && x.date < dateFrom) return false
            if (dateTo && x.date > dateTo) return false
            return true
        })
    }, [data, typeFilter, q, priceMin, priceMax, dateFrom, dateTo])

    const hasFilters = q || typeFilter !== 'all' || priceMin || priceMax || dateFrom || dateTo

    function clearFilters() {
        setQ(''); setTypeFilter('all'); setPriceMin(''); setPriceMax(''); setDateFrom(''); setDateTo('')
    }

    const locale = i18n.language?.startsWith('de') ? 'de-DE' : i18n.language?.startsWith('en') ? 'en-GB' : 'bg-BG'

    return (
        <View maxWidth="1200px" width="100%" paddingBlock={{ s: 5, m: 8 }} paddingInline={{ s: 4, m: 6 }} attributes={{ style: { margin: '0 auto' } }}>
            <View gap={1} paddingBottom={8}>
                <Text as="h1" variant="title-1" weight="bold">{t('excursions.title')}</Text>
                <Text variant="body-2" color="neutral-faded">{t('excursions.subtitle')}</Text>
            </View>

            {/* Type chips */}
            {types.length > 0 && (
                <View direction="row" gap={2} wrap paddingBottom={6}>
                    <Button
                        variant={typeFilter === 'all' ? 'solid' : 'outline'}
                        color={typeFilter === 'all' ? 'primary' : 'neutral'}
                        size="small"
                        onClick={() => setTypeFilter('all')}
                    >
                        {t('excursions.allTypes')}
                    </Button>
                    {types.map((type: string) => (
                        <Button
                            key={type}
                            variant={typeFilter === type ? 'solid' : 'outline'}
                            color={typeFilter === type ? 'primary' : 'neutral'}
                            size="small"
                            onClick={() => setTypeFilter(type)}
                        >
                            {TYPE_EMOJI[type] ?? ''} {t(`home.categories.${type}`, type)}
                        </Button>
                    ))}
                </View>
            )}

            {/* Filters */}
            <View shadow="raised" padding={5} borderRadius="medium" backgroundColor="white" paddingBottom={6}>
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
                    <View minWidth="120px">
                        <View gap={1}>
                            <Text variant="caption-1">{t('excursions.filterSort')} min ({t('common.bgn')})</Text>
                            <TextField
                                name="priceMin"
                                placeholder="0"
                                value={priceMin}
                                onChange={({ value }) => setPriceMin(value)}
                                inputAttributes={{ type: 'number' }}
                            />
                        </View>
                    </View>
                    <View minWidth="120px">
                        <View gap={1}>
                            <Text variant="caption-1">{t('excursions.filterSort')} max ({t('common.bgn')})</Text>
                            <TextField
                                name="priceMax"
                                placeholder="9999"
                                value={priceMax}
                                onChange={({ value }) => setPriceMax(value)}
                                inputAttributes={{ type: 'number' }}
                            />
                        </View>
                    </View>
                    <View minWidth="140px">
                        <View gap={1}>
                            <Text variant="caption-1">{t('excursions.date')} from</Text>
                            <TextField
                                name="dateFrom"
                                value={dateFrom}
                                onChange={({ value }) => setDateFrom(value)}
                                inputAttributes={{ type: 'date' }}
                            />
                        </View>
                    </View>
                    <View minWidth="140px">
                        <View gap={1}>
                            <Text variant="caption-1">{t('excursions.date')} to</Text>
                            <TextField
                                name="dateTo"
                                value={dateTo}
                                onChange={({ value }) => setDateTo(value)}
                                inputAttributes={{ type: 'date' }}
                            />
                        </View>
                    </View>
                    {hasFilters && (
                        <View justify="end">
                            <Button variant="ghost" color="primary" onClick={clearFilters}>✕</Button>
                        </View>
                    )}
                </View>
            </View>

            {/* States */}
            {state.status === 'loading' && (
                <View align="center" padding={16}><Loader size="large" /></View>
            )}
            {state.status === 'error' && (
                <View align="center" padding={16} gap={3}>
                    <Text variant="title-2">⚠️</Text>
                    <Text color="critical">{state.message}</Text>
                </View>
            )}
            {state.status === 'success' && filtered.length === 0 && (
                <View align="center" padding={16} gap={3}>
                    <Text variant="title-2">🔍</Text>
                    <Text color="neutral-faded">{t('excursions.noResults')}</Text>
                </View>
            )}

            {/* Cards grid */}
            <Grid columns={{ s: 1, m: 2, l: 3 }} gap={6}>
                {filtered.map((x: ExcursionDto) => (
                    <View
                        key={x.id}
                        shadow="raised"
                        borderRadius="medium"
                        backgroundColor="white"
                        overflow="hidden"
                        attributes={{ style: { cursor: 'pointer' }, onClick: () => navigate(`/excursions/${x.id}`) }}
                    >
                        <View
                            align="center"
                            justify="center"
                            attributes={{ style: { height: 200, background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: 48 } }}
                        >
                            {TYPE_EMOJI[x.type] ?? '🗺️'}
                        </View>
                        <View padding={4} gap={2}>
                            <Badge color="primary">{TYPE_EMOJI[x.type] ?? ''} {t(`home.categories.${x.type}`, x.type)}</Badge>
                            <Text variant="title-3" weight="bold">{x.destination}</Text>
                            <Text variant="caption-1" color="neutral-faded">📍 {t('excursions.departure')} {x.from}</Text>
                            <Text variant="body-2" color="neutral-faded" attributes={{ style: { WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' } }}>
                                {x.description}
                            </Text>
                        </View>
                        <View
                            direction="row"
                            align="center"
                            justify="space-between"
                            padding={4}
                            attributes={{ style: { borderTop: '1px solid var(--border)' } }}
                        >
                            <Text variant="title-3" weight="bold">{x.priceBgn} {t('common.bgn')}</Text>
                            <Text variant="caption-1" color="neutral-faded">📅 {fmtDate(x.date, locale)}</Text>
                        </View>
                    </View>
                ))}
            </Grid>
        </View>
    )
}
