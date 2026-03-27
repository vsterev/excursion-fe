import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Select, Button, Badge, Loader } from 'reshaped'
import { fetchUsefulInfo } from '../api'
import type { UsefulInfoDto } from '../api'

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: UsefulInfoDto[] }

export function UsefulInfoPage() {
    const { t, i18n } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [resortFilter, setResortFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')

    useEffect(() => {
        let cancelled = false
        fetchUsefulInfo()
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [i18n.language])

    const data = useMemo(() => (state.status === 'success' ? state.data : []), [state])
    const resorts = useMemo(() => Array.from(new Set(data.map((x: UsefulInfoDto) => x.resort))).sort(), [data])
    const categories = useMemo(() => Array.from(new Set(data.map((x: UsefulInfoDto) => x.category))).sort(), [data])

    const filtered = useMemo(() => data.filter((x: UsefulInfoDto) => {
        if (resortFilter !== 'all' && x.resort !== resortFilter) return false
        if (categoryFilter !== 'all' && x.category !== categoryFilter) return false
        return true
    }), [data, resortFilter, categoryFilter])

    return (
        <View maxWidth="1200px" width="100%" paddingBlock={{ s: 5, m: 8 }} paddingInline={{ s: 4, m: 6 }} attributes={{ style: { margin: '0 auto' } }}>
            <View gap={1} paddingBottom={8}>
                <Text as="h1" variant="title-1" weight="bold">{t('usefulInfo.title')}</Text>
                <Text variant="body-2" color="neutral-faded">{t('usefulInfo.subtitle')}</Text>
            </View>

            {/* Filters */}
            <View shadow="raised" padding={5} borderRadius="medium" backgroundColor="white" paddingBottom={6}>
                <View direction={{ s: 'column', m: 'row' }} gap={4} align="end">
                    <View minWidth="180px">
                        <Select name="resort" value={resortFilter} onChange={({ value }) => setResortFilter(value)}>
                            <Select.Option value="all">{t('usefulInfo.allResorts')}</Select.Option>
                            {resorts.map((r: string) => <Select.Option key={r} value={r}>{r}</Select.Option>)}
                        </Select>
                    </View>
                    <View minWidth="180px">
                        <Select name="category" value={categoryFilter} onChange={({ value }) => setCategoryFilter(value)}>
                            <Select.Option value="all">{t('usefulInfo.allCategories')}</Select.Option>
                            {categories.map((c: string) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
                        </Select>
                    </View>
                    {(resortFilter !== 'all' || categoryFilter !== 'all') && (
                        <Button variant="ghost" color="primary" onClick={() => { setResortFilter('all'); setCategoryFilter('all') }}>✕</Button>
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
                    <Text variant="title-2">ℹ️</Text>
                    <Text color="neutral-faded">{t('usefulInfo.noResults')}</Text>
                </View>
            )}

            <View gap={4}>
                {filtered.map((item: UsefulInfoDto) => (
                    <View key={item.id} shadow="raised" padding={6} borderRadius="medium" backgroundColor="white" attributes={{ style: { borderLeft: '4px solid var(--primary)' } }}>
                        <View direction={{ s: 'column', m: 'row' }} justify="space-between" align={{ s: 'start', m: 'start' }} gap={3} paddingBottom={2}>
                            <Text variant="title-3" weight="bold">{item.title}</Text>
                            <View direction="row" gap={2}>
                                <Badge color="neutral">{item.resort}</Badge>
                                <Badge color="primary">{item.category}</Badge>
                            </View>
                        </View>
                        <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: 1.7, whiteSpace: 'pre-line' } }}>
                            {item.body}
                        </Text>
                        {item.url && (
                            <Text
                                as="a"
                                variant="body-2"
                                weight="bold"
                                color="primary"
                                attributes={{ href: item.url, target: '_blank', rel: 'noopener noreferrer', style: { display: 'inline-block', marginTop: 10 } }}
                            >
                                {t('usefulInfo.visitLink')}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
        </View>
    )
}
