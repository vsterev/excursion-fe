import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Grid, TextField, Button, Badge, Loader, Actionable, Select } from 'reshaped'
import { fetchExcursions } from '../api'
import type { ExcursionDto, ResortDto } from '../api'

function stripHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent ?? ''
}

const TYPE_EMOJI: Record<string, string> = {
    'Културна': '🏛️',
    'Природна': '🌿',
    'Планинска': '⛰️',
    'Развлекателна': '🎢',
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
    const [resortFilter, setResortFilter] = useState('all')
    const [q, setQ] = useState('')

    useEffect(() => {
        let cancelled = false
        fetchExcursions()
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [i18n.language])

    const data = useMemo(() => (state.status === 'success' ? state.data : []), [state])
    const types = useMemo(() => Array.from(new Set(data.map((x: ExcursionDto) => x.type))).sort(), [data])
    const resortOptions = useMemo(() => {
        const map = new Map<number, ResortDto>()
        for (const x of data) for (const d of x.departures ?? []) map.set(d.id, d)
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [data])

    const filtered = useMemo(() => {
        return data.filter((x: ExcursionDto) => {
            if (typeFilter !== 'all' && x.type !== typeFilter) return false
            if (resortFilter !== 'all' && !(x.departures ?? []).some(d => String(d.id) === resortFilter)) return false
            if (q && !`${x.destination} ${(x.departures ?? []).map(d => d.name).join(' ')} ${stripHtml(x.description)} ${x.type}`.toLowerCase().includes(q.toLowerCase())) return false
            return true
        })
    }, [data, typeFilter, resortFilter, q])

    const hasFilters = q || typeFilter !== 'all' || resortFilter !== 'all'

    function clearFilters() {
        setQ(''); setTypeFilter('all'); setResortFilter('all')
    }

    return (
        <View maxWidth="1200px" width="100%" gap={5} paddingBlock={{ s: 5, m: 8 }} paddingInline={{ s: 4, m: 6 }} attributes={{ style: { margin: '0 auto' } }}>
            <View gap={1}>
                <Text as="h1" variant={{ s: 'title-6', m: 'title-4' }} weight="bold">{t('excursions.title')}</Text>
                <Text variant={{ s: 'body-2', m: 'body-1' }} color="neutral-faded">{t('excursions.subtitle')}</Text>
            </View>

            {/* Type chips */}
            {types.length > 0 && (
                <View direction="row" gap={2} wrap>
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

            {/* Search */}
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
                                onChange={({ value }) => setResortFilter(value)}
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
            <Grid columns={{ s: 1, m: 2, l: 3 }} gap={6} justify='center'>
                {filtered.map((x: ExcursionDto) => (
                    <Actionable
                        key={x.id}
                        onClick={() => navigate(`/excursions/${x.id}`)}
                        attributes={{ style: { display: 'block', width: '100%', maxWidth: 380, marginInline: 'auto' } }}
                    >
                        <View
                            shadow="overlay"
                            borderRadius="medium"
                            backgroundColor="elevation-raised"
                            overflow="hidden"
                            attributes={{ style: { height: 360 } }}
                        >
                            {x.coverPhoto ? (
                                <img
                                    src={x.coverPhoto}
                                    alt={x.destination}
                                    style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', flexShrink: 0 }}
                                />
                            ) : (
                                <View
                                    align="center"
                                    justify="center"
                                    attributes={{ style: { height: 160, flexShrink: 0, background: 'linear-gradient(135deg,#667eea,#764ba2)', fontSize: 48 } }}
                                >
                                    {TYPE_EMOJI[x.type] ?? '🗺️'}
                                </View>
                            )}
                            <View padding={4} gap={2} direction="column" attributes={{ style: { overflow: 'hidden', minWidth: 0 } }}>
                                <View direction="row" gap={2} align="center" wrap justify="space-between">
                                    <Badge color="primary" size="large">{TYPE_EMOJI[x.type] ?? ''} {t(`home.categories.${x.type}`, x.type)}</Badge>
                                    {x.price != null && (
                                        <Badge color="positive" size="large">{t('excursions.from')} {x.price} €</Badge>
                                    )}
                                </View>
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
        </View >
    )
}
