import { useEffect, useMemo, useState } from 'react'
import { Card, Container, Select, Text, View } from 'reshaped'
import { fetchUsefulInfo } from '../api'
import type { UsefulInfoDto } from '../api'

type LoadState =
    | { status: 'idle' | 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: UsefulInfoDto[] }

export function UsefulInfoPage() {
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [resortFilter, setResortFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')

    useEffect(() => {
        let cancelled = false
        fetchUsefulInfo()
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [])

    const data = useMemo(() => (state.status === 'success' ? state.data : []), [state])
    const resorts = useMemo(() => Array.from(new Set(data.map((x: UsefulInfoDto) => x.resort))).sort(), [data])
    const categories = useMemo(() => Array.from(new Set(data.map((x: UsefulInfoDto) => x.category))).sort(), [data])

    const filtered = useMemo(() => {
        return data.filter((x: UsefulInfoDto) => {
            if (resortFilter !== 'all' && x.resort !== resortFilter) return false
            if (categoryFilter !== 'all' && x.category !== categoryFilter) return false
            return true
        })
    }, [data, resortFilter, categoryFilter])

    return (
        <Container width="900px">
            <View paddingTop={12} paddingBottom={12} gap={6}>
                <Text variant="featured-2" weight="bold">Полезна информация</Text>

                <View direction="row" gap={4} wrap>
                    <View grow gap={2}>
                        <Text variant="caption-1" weight="medium">Курорт</Text>
                        <Select
                            name="resort"
                            value={resortFilter}
                            onChange={({ value }: { value: string }) => setResortFilter(value)}
                            options={[
                                { value: 'all', label: 'Всички курорти' },
                                ...resorts.map((r: string) => ({ value: r, label: r })),
                            ]}
                        />
                    </View>
                    <View grow gap={2}>
                        <Text variant="caption-1" weight="medium">Категория</Text>
                        <Select
                            name="category"
                            value={categoryFilter}
                            onChange={({ value }: { value: string }) => setCategoryFilter(value)}
                            options={[
                                { value: 'all', label: 'Всички категории' },
                                ...categories.map((c: string) => ({ value: c, label: c })),
                            ]}
                        />
                    </View>
                </View>

                {state.status === 'loading' && <Text color="neutral-faded">Зареждане…</Text>}
                {state.status === 'error' && <Text color="critical">{state.message}</Text>}
                {state.status === 'success' && filtered.length === 0 && (
                    <Text color="neutral-faded">Няма намерена информация.</Text>
                )}

                <View gap={4}>
                    {filtered.map((item: UsefulInfoDto) => (
                        <Card key={item.id} padding={6}>
                            <View gap={2}>
                                <View direction="row" justify="space-between" align="center" wrap gap={2}>
                                    <Text weight="bold">{item.title}</Text>
                                    <View direction="row" gap={2}>
                                        <Text variant="caption-1" color="neutral-faded">{item.resort}</Text>
                                        <Text variant="caption-1" color="neutral-faded">·</Text>
                                        <Text variant="caption-1" color="neutral-faded">{item.category}</Text>
                                    </View>
                                </View>
                                <Text>{item.body}</Text>
                            </View>
                        </Card>
                    ))}
                </View>
            </View>
        </Container>
    )
}
