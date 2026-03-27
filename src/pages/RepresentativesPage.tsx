import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Avatar, Button, TextField, Select, Loader, Hidden } from 'reshaped'
import { fetchRepresentatives, resolvePhotoUrl } from '../api'
import type { RepresentativeDto } from '../api'

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RepresentativeDto[] }

export function RepresentativesPage() {
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [resortFilter, setResortFilter] = useState('all')
    const [q, setQ] = useState('')

    useEffect(() => {
        let cancelled = false
        fetchRepresentatives()
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [i18n.language])

    const data = useMemo(() => (state.status === 'success' ? state.data : []), [state])
    const resorts = useMemo(() => Array.from(new Set(data.map((x: RepresentativeDto) => x.resort))).sort(), [data])

    const filtered = useMemo(() => {
        return data.filter((x: RepresentativeDto) => {
            if (resortFilter !== 'all' && x.resort !== resortFilter) return false
            if (q && !`${x.name} ${x.resort} ${x.phone ?? ''} ${x.email ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false
            return true
        })
    }, [data, resortFilter, q])

    return (
        <View maxWidth="1200px" width="100%" paddingBlock={{ s: 5, m: 8 }} paddingInline={{ s: 4, m: 6 }} attributes={{ style: { margin: '0 auto' } }}>
            <View gap={1} paddingBottom={8}>
                <Text as="h1" variant="title-1" weight="bold">{t('representatives.title')}</Text>
                <Text variant="body-2" color="neutral-faded">{t('representatives.subtitle')}</Text>
            </View>

            {/* Filters */}
            <View shadow="raised" padding={5} borderRadius="medium" backgroundColor="white" paddingBottom={6}>
                <View direction={{ s: 'column', m: 'row' }} gap={3} align="end">
                    <View grow>
                        <TextField
                            name="search"
                            placeholder={t('representatives.title') + '…'}
                            value={q}
                            onChange={({ value }) => setQ(value)}
                            prefix="🔍"
                        />
                    </View>
                    <View width={{ s: '100%', m: '180px' }}>
                        <Select
                            name="resort"
                            value={resortFilter}
                            onChange={({ value }) => setResortFilter(value)}
                        >
                            <Select.Option value="all">{t('representatives.title')}</Select.Option>
                            {resorts.map((r: string) => <Select.Option key={r} value={r}>{r}</Select.Option>)}
                        </Select>
                    </View>
                    {(q || resortFilter !== 'all') && (
                        <Button variant="ghost" color="primary" onClick={() => { setQ(''); setResortFilter('all') }}>✕</Button>
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
                    <Text variant="title-2">👤</Text>
                    <Text color="neutral-faded">{t('representatives.noResults')}</Text>
                </View>
            )}

            <View gap={4} paddingTop={6}>
                {filtered.map((r: RepresentativeDto) => (
                    <View
                        key={r.id}
                        shadow="raised"
                        padding={{ s: 4, m: 5 }}
                        borderRadius="medium"
                        backgroundColor="white"
                        attributes={{ style: { cursor: 'pointer' }, onClick: () => navigate(`/representatives/${r.id}`) }}
                    >
                        <View direction={{ s: 'column', m: 'row' }} gap={{ s: 3, m: 4 }} align={{ s: 'start', m: 'center' }}>
                            <Avatar
                                src={resolvePhotoUrl(r.photoUrl) ?? undefined}
                                initials={r.name.charAt(0)}
                                size={{ s: 10, m: 14 }}
                            />
                            <View grow gap={1}>
                                <Text variant="title-3" weight="bold">{r.name}</Text>
                                <Text variant="caption-1" color="primary" weight="bold" attributes={{ style: { textTransform: 'uppercase', letterSpacing: '.6px' } }}>{r.resort}</Text>
                                {r.phone && <Text variant="body-2" color="neutral-faded">📞 {r.phone}</Text>}
                                {r.email && <Text variant="body-2" color="neutral-faded">✉️ {r.email}</Text>}
                            </View>
                            {/* Desktop: outline button on the right */}
                            <Hidden hide={{ s: true, m: false }}>
                                <Button
                                    variant="outline"
                                    color="primary"
                                    size="small"
                                    onClick={(e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => { e.stopPropagation(); navigate(`/representatives/${r.id}`) }}
                                >
                                    {t('representatives.viewProfile')}
                                </Button>
                            </Hidden>
                            {/* Mobile: full-width solid button at bottom */}
                            <Hidden hide={{ s: false, m: true }}>
                                <View width="100%">
                                    <Button
                                        variant="solid"
                                        color="primary"
                                        fullWidth
                                        onClick={(e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => { e.stopPropagation(); navigate(`/representatives/${r.id}`) }}
                                    >
                                        {t('representatives.viewProfile')}
                                    </Button>
                                </View>
                            </Hidden>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
}
