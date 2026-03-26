import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchRepresentative } from '../api'
import type { RepresentativeDto } from '../api'

type LoadState =
    | { status: 'idle' | 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RepresentativeDto }

export function RepresentativeDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [state, setState] = useState<LoadState>({ status: 'loading' })

    useEffect(() => {
        if (!id) return
        let cancelled = false
        fetchRepresentative(id)
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [id])

    if (state.status !== 'success') {
        if (state.status === 'error') {
            return <div className="page"><div className="empty-state" style={{ color: '#e53e3e' }}><div className="empty-icon">⚠️</div><div className="empty-text">{state.message}</div></div></div>
        }
        return <div className="page"><div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">Зареждане…</div></div></div>
    }

    const r = state.data
    const mapsUrl = `https://www.google.com/maps?q=${r.lat},${r.lng}`

    return (
        <div className="page">
            <button className="back-btn" onClick={() => navigate(-1)}>← Назад към представители</button>

            <div className="detail-grid">
                {/* Main */}
                <div className="detail-main">
                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 32 }}>
                        {r.photoUrl
                            ? <img src={r.photoUrl} alt={r.name} style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary-light)', flexShrink: 0 }} />
                            : <div className="rep-avatar-placeholder" style={{ width: 140, height: 140, fontSize: 52 }}>{r.name.charAt(0)}</div>
                        }
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.5 }}>{r.name}</h1>
                            <p className="rep-resort" style={{ fontSize: 13 }}>{r.resort}</p>
                            {r.phone && <div className="meta-row" style={{ marginTop: 12 }}><span className="meta-icon">📞</span> <a href={`tel:${r.phone}`} style={{ color: 'inherit' }}>{r.phone}</a></div>}
                            {r.email && <div className="meta-row"><span className="meta-icon">✉️</span> <a href={`mailto:${r.email}`} style={{ color: 'inherit' }}>{r.email}</a></div>}
                        </div>
                    </div>

                    {/* Map */}
                    <div className="section-card">
                        <h3>Местоположение — {r.resort}</h3>
                        <iframe
                            title="map"
                            width="100%"
                            height="320"
                            style={{ border: 0, borderRadius: 8, display: 'block' }}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${r.lng - 0.02},${r.lat - 0.02},${r.lng + 0.02},${r.lat + 0.02}&layer=mapnik&marker=${r.lat},${r.lng}`}
                        />
                        <a className="maps-link" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                            🗺️ Отвори в Google Maps
                        </a>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="detail-sidebar">
                    <p style={{ fontWeight: 700, fontSize: 18, margin: '0 0 16px' }}>Контакт</p>
                    {r.phone && (
                        <div className="meta-row">
                            <span className="meta-icon">📞</span>
                            <a href={`tel:${r.phone}`} style={{ color: 'var(--text)', fontWeight: 600 }}>{r.phone}</a>
                        </div>
                    )}
                    {r.email && (
                        <div className="meta-row">
                            <span className="meta-icon">✉️</span>
                            <a href={`mailto:${r.email}`} style={{ color: 'var(--text)', fontWeight: 600 }}>{r.email}</a>
                        </div>
                    )}
                    <div className="meta-row" style={{ marginTop: 8 }}><span className="meta-icon">🏖️</span> {r.resort}</div>
                    <div className="meta-row"><span className="meta-icon">📌</span> {r.lat.toFixed(4)}, {r.lng.toFixed(4)}</div>
                    <a
                        className="btn btn-primary"
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ width: '100%', marginTop: 20, justifyContent: 'center', fontSize: 14, padding: '12px 20px' }}
                    >
                        🗺️ Виж на картата
                    </a>
                    {r.phone && (
                        <a
                            className="btn btn-outline"
                            href={`tel:${r.phone}`}
                            style={{ width: '100%', marginTop: 10, justifyContent: 'center', fontSize: 14, padding: '12px 20px' }}
                        >
                            📞 Обади се
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
