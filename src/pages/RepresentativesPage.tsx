import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, TextField, Select, Loader } from 'reshaped'
import { fetchRepresentatives, fetchResorts } from '../api'
import type { RepresentativeDto, ResortDto } from '../api'
import { Representative } from './Representative'

/** Съвпада с кодовете в админ и бекенд LANGUAGE_CODES */
const LANGUAGE_LABELS = {
    en: 'english',
    ro: 'romanian',
    ru: 'russian',
    cs: 'czech',
    pl: 'polish',
    de: 'german',
} as const

const LANGUAGE_ORDER = ['en', 'ro', 'ru', 'cs', 'pl', 'de'] as const satisfies readonly (keyof typeof LANGUAGE_LABELS)[]

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RepresentativeDto[] }

export function RepresentativesPage() {
    const { t } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [resortOptions, setResortOptions] = useState<ResortDto[]>([])
    const [resortFilter, setResortFilter] = useState('all') // 'all' or resort id as string
    const [languageFilter, setLanguageFilter] = useState('all')
    const [q, setQ] = useState('')

    // Load all resorts for the dropdown
    useEffect(() => {
        fetchResorts().then(setResortOptions).catch(() => { })
    }, [])

    // Load all representatives once; filtering happens client-side
    useEffect(() => {
        let cancelled = false
        fetchRepresentatives()
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [])

    const allData = state.status === 'success' ? state.data : []

    const data = allData.filter((r) => {
        if (resortFilter !== 'all') {
            const hasResort = r.resorts?.some(s => String(s.id) === resortFilter)
            if (!hasResort) return false
        }
        if (languageFilter !== 'all') {
            if (!r.languages?.includes(languageFilter)) return false
        }
        if (q.trim()) {
            const term = q.trim().toLowerCase()
            const match =
                r.name.toLowerCase().includes(term) ||
                r.phone?.toLowerCase().includes(term) ||
                r.email?.toLowerCase().includes(term) ||
                r.resorts?.some(s => s.name.toLowerCase().includes(term))
            if (!match) return false
        }
        return true
    })

    return (
        <View maxWidth="1200px" width="100%" paddingBlock={{ s: 5, m: 8 }} paddingInline={{ s: 4, m: 6 }} attributes={{ style: { margin: '0 auto' } }}>
            <View gap={1} paddingBottom={8}>
                <Text as="h1" variant={{ s: 'title-6', m: 'title-4' }} weight="bold">{t('representatives.title')}</Text>
                <Text variant={{ s: 'body-2', m: 'body-1' }} color="neutral-faded">{t('representatives.subtitle')}</Text>
            </View>

            {/* Filters */}
            <View shadow='raised' padding={5} borderRadius="medium" backgroundColor="elevation-raised" paddingBottom={6}>
                <View direction={{ s: 'column', m: 'row' }} gap={3} >
                    <View grow>
                        <TextField
                            name="search"
                            placeholder={t('representatives.search')}
                            value={q}
                            onChange={({ value }) => setQ(value)}
                            prefix="🔍"
                        />
                    </View>
                    <View width={{ s: '100%', m: '200px' }}>
                        <Select
                            name="resort"
                            value={resortFilter}
                            onChange={({ value }) => setResortFilter(value)}
                        >
                            <option value="all">{t('usefulInfo.allResorts')}</option>
                            {resortOptions.map((r: ResortDto) => (
                                <option key={r.id} value={String(r.id)}>{r.name}</option>
                            ))}
                        </Select>
                    </View>
                    <View width={{ s: '100%', m: '200px' }}>
                        <Select
                            name="language"
                            value={languageFilter}
                            onChange={({ value }) => setLanguageFilter(value)}
                        >
                            <option value="all">{t('representatives.allLanguages')}</option>
                            {LANGUAGE_ORDER.map((code) => (
                                <option key={code} value={code}>{LANGUAGE_LABELS[code]}</option>
                            ))}
                        </Select>
                    </View>
                    {(q || resortFilter !== 'all' || languageFilter !== 'all') && (
                        <Button
                            variant="ghost"
                            color="primary"
                            onClick={() => {
                                setQ('')
                                setResortFilter('all')
                                setLanguageFilter('all')
                            }}
                        >
                            ✕
                        </Button>
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
            {state.status === 'success' && data.length === 0 && (
                <View align="center" padding={16} gap={3}>
                    <Text variant="title-2">👤</Text>
                    <Text color="neutral-faded">{t('representatives.noResults')}</Text>
                </View>
            )}

            <View gap={4} paddingTop={6}>
                {data.map((r: RepresentativeDto) => (
                    <Representative key={r.id} rep={r} />
                ))}
            </View>
        </View>
    )
}
