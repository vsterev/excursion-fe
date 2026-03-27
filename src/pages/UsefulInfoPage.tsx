import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
        <div className="page">
            <div className="page-header">
                <h1>{t('usefulInfo.title')}</h1>
                <p>{t('usefulInfo.subtitle')}</p>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filters-row">
                    <div className="filter-group">
                        <label className="filter-label">{t('representatives.resort')}</label>
                        <select className="filter-select" value={resortFilter} onChange={e => setResortFilter(e.target.value)}>
                            <option value="all">{t('usefulInfo.allResorts')}</option>
                            {resorts.map((r: string) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">{t('usefulInfo.category')}</label>
                        <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="all">{t('usefulInfo.allCategories')}</option>
                            {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    {(resortFilter !== 'all' || categoryFilter !== 'all') && (
                        <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
                            <label className="filter-label">&nbsp;</label>
                            <button className="filter-clear" onClick={() => { setResortFilter('all'); setCategoryFilter('all') }}>✕</button>
                        </div>
                    )}
                </div>
            </div>

            {/* States */}
            {state.status === 'loading' && (
                <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">{t('usefulInfo.loading')}</div></div>
            )}
            {state.status === 'error' && (
                <div className="empty-state" style={{ color: '#e53e3e' }}><div className="empty-icon">⚠️</div><div className="empty-text">{state.message}</div></div>
            )}
            {state.status === 'success' && filtered.length === 0 && (
                <div className="empty-state"><div className="empty-icon">ℹ️</div><div className="empty-text">{t('usefulInfo.noResults')}</div></div>
            )}

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filtered.map((item: UsefulInfoDto) => (
                    <div key={item.id} className="section-card" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{item.title}</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span className="chip" style={{ fontSize: 11, padding: '2px 10px' }}>{item.resort}</span>
                                <span className="chip" style={{ fontSize: 11, padding: '2px 10px' }}>{item.category}</span>
                            </div>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.body}</p>
                        {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-block', marginTop: 10, color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
                                {t('usefulInfo.visitLink')}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
