import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
        <div className="page">
            <div className="page-header">
                <h1>{t('representatives.title')}</h1>
                <p>{t('representatives.subtitle')}</p>
            </div>

            <div className="filters-bar">
                <div className="filters-row">
                    <div className="filter-group" style={{ flex: 2, minWidth: 200 }}>
                        <label className="filter-label">🔍</label>
                        <input className="filter-input" value={q} onChange={e => setQ(e.target.value)} placeholder={t('representatives.title') + '…'} />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">{t('representatives.resort')}</label>
                        <select className="filter-select" value={resortFilter} onChange={e => setResortFilter(e.target.value)}>
                            <option value="all">{t('representatives.title')}</option>
                            {resorts.map((r: string) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    {(q || resortFilter !== 'all') && (
                        <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
                            <label className="filter-label">&nbsp;</label>
                            <button className="filter-clear" onClick={() => { setQ(''); setResortFilter('all') }}>✕</button>
                        </div>
                    )}
                </div>
            </div>

            {state.status === 'loading' && (
                <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">{t('representatives.loading')}</div></div>
            )}
            {state.status === 'error' && (
                <div className="empty-state" style={{ color: '#e53e3e' }}><div className="empty-icon">⚠️</div><div className="empty-text">{state.message}</div></div>
            )}
            {state.status === 'success' && filtered.length === 0 && (
                <div className="empty-state"><div className="empty-icon">👤</div><div className="empty-text">{t('representatives.noResults')}</div></div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filtered.map((r: RepresentativeDto) => (
                    <div key={r.id} className="rep-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/representatives/${r.id}`)}>
                        {r.photoUrl
                            ? <img className="rep-avatar" src={resolvePhotoUrl(r.photoUrl)!} alt={r.name} />
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
                            {t('representatives.viewProfile')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
