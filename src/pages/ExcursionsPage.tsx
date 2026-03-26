import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchExcursions } from '../api'
import type { ExcursionDto } from '../api'

const TYPE_EMOJI: Record<string, string> = {
    'Културна': '🏛️',
    'Природна': '🌿',
    'Планинска': '⛰️',
    'Развлекателна': '🎢',
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' })
}

type LoadState =
    | { status: 'idle' | 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: ExcursionDto[] }

export function ExcursionsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
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
    }, [])

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

    return (
        <div className="page">
            <div className="page-header">
                <h1>Екскурзии</h1>
                <p>Открийте най-добрите туристически маршрути</p>
            </div>

            {/* Type chips */}
            {types.length > 0 && (
                <div className="chips">
                    <button className={`chip${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>
                        Всички
                    </button>
                    {types.map((t: string) => (
                        <button key={t} className={`chip${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>
                            {TYPE_EMOJI[t] ?? ''} {t}
                        </button>
                    ))}
                </div>
            )}

            {/* Filters bar */}
            <div className="filters-bar">
                <div className="filters-row">
                    <div className="filter-group" style={{ flex: 2, minWidth: 200 }}>
                        <label className="filter-label">Търсене</label>
                        <input className="filter-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Дестинация, описание…" />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Цена от (лв.)</label>
                        <input className="filter-input" type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Цена до (лв.)</label>
                        <input className="filter-input" type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="9999" />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Дата от</label>
                        <input className="filter-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Дата до</label>
                        <input className="filter-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </div>
                    {hasFilters && (
                        <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
                            <label className="filter-label">&nbsp;</label>
                            <button className="filter-clear" onClick={clearFilters}>✕ Изчисти</button>
                        </div>
                    )}
                </div>
            </div>

            {/* States */}
            {state.status === 'loading' && (
                <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">Зареждане…</div></div>
            )}
            {state.status === 'error' && (
                <div className="empty-state" style={{ color: '#e53e3e' }}><div className="empty-icon">⚠️</div><div className="empty-text">{state.message}</div></div>
            )}
            {state.status === 'success' && filtered.length === 0 && (
                <div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-text">Няма намерени екскурзии.</div></div>
            )}

            {/* Cards grid */}
            <div className="cards-grid">
                {filtered.map((x: ExcursionDto) => (
                    <div key={x.id} className="tour-card" onClick={() => navigate(`/excursions/${x.id}`)}>
                        <div className="tour-card-img-placeholder">{TYPE_EMOJI[x.type] ?? '🗺️'}</div>
                        <div className="tour-card-body">
                            <div className="tour-card-type">{TYPE_EMOJI[x.type] ?? ''} {x.type}</div>
                            <p className="tour-card-title">{x.destination}</p>
                            <p className="tour-card-meta">📍 Тръгване от {x.from}</p>
                            <p className="tour-card-meta" style={{ marginTop: 4, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {x.description}
                            </p>
                        </div>
                        <div className="tour-card-footer">
                            <div className="tour-card-price">{x.priceBgn} лв. <span>на човек</span></div>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📅 {fmtDate(x.date)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
