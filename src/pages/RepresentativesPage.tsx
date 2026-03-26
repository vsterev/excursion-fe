import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchRepresentatives } from '../api'
import type { RepresentativeDto } from '../api'

type LoadState =
    | { status: 'idle' | 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RepresentativeDto[] }

export function RepresentativesPage() {
    const navigate = useNavigate()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [resortFilter, setResortFilter] = useState('all')
    const [q, setQ] = useState('')

    useEffect(() => {
        let cancelled = false
        fetchRepresentatives()
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [])

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
        <div className="page">
            <div className="page-header">
                <h1>Представители</h1>
                <p>Локални гидове и контакти по курорти</p>
            </div>

            {/* Filters bar */}
            <div className="filters-bar">
                <div className="filters-row">
                    <div className="filter-group" style={{ flex: 2, minWidth: 200 }}>
                        <label className="filter-label">Търсене</label>
                        <input className="filter-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Име, телефон, email…" />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Курорт</label>
                        <select className="filter-select" value={resortFilter} onChange={e => setResortFilter(e.target.value)}>
                            <option value="all">Всички курорти</option>
                            {resorts.map((r: string) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    {(q || resortFilter !== 'all') && (
                        <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
                            <label className="filter-label">&nbsp;</label>
                            <button className="filter-clear" onClick={() => { setQ(''); setResortFilter('all') }}>✕ Изчисти</button>
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
                <div className="empty-state"><div className="empty-icon">👤</div><div className="empty-text">Няма намерени представители.</div></div>
            )}

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filtered.map((r: RepresentativeDto) => (
                    <div key={r.id} className="rep-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/representatives/${r.id}`)}>
                        {r.photoUrl
                            ? <img className="rep-avatar" src={r.photoUrl} alt={r.name} />
                            : <div className="rep-avatar-placeholder">{r.name.charAt(0)}</div>
                        }
                        <div className="rep-info">
                            <p className="rep-name">{r.name}</p>
                            <p className="rep-resort">{r.resort}</p>
                            {r.phone && <p className="rep-contact">📞 {r.phone}</p>}
                            {r.email && <p className="rep-contact">✉️ {r.email}</p>}
                        </div>
                        <button className="btn btn-outline" style={{ marginLeft: 'auto', flexShrink: 0 }}
                            onClick={e => { e.stopPropagation(); navigate(`/representatives/${r.id}`) }}>
                            Виж →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
