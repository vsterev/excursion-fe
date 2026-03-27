import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchExcursion, resolvePhotoUrl } from '../api'
import type { ExcursionDetailDto } from '../api'

type Photo = ExcursionDetailDto['photos'][number]

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: ExcursionDetailDto }

export function ExcursionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [activePhoto, setActivePhoto] = useState(0)

    useEffect(() => {
        if (!id) return
        let cancelled = false
        fetchExcursion(id)
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [id])

    const locale = i18n.language?.startsWith('de') ? 'de-DE'
        : i18n.language?.startsWith('en') ? 'en-GB' : 'bg-BG'

    if (state.status === 'loading') {
        return (
            <div className="page">
                <div className="empty-state"><div className="empty-icon">⏳</div><div className="empty-text">{t('detail.loading')}</div></div>
            </div>
        )
    }

    if (state.status === 'error') {
        return (
            <div className="page">
                <div className="empty-state" style={{ color: '#e53e3e' }}><div className="empty-icon">⚠️</div><div className="empty-text">{state.message}</div></div>
            </div>
        )
    }

    const x = state.data

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
            <button className="btn btn-ghost" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
                {t('detail.back')}
            </button>

            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                    <span className="chip chip-active">{t(`home.categories.${x.type}`, { defaultValue: x.type })}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{t('detail.departureFrom')} {x.from}</span>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px' }}>{x.destination}</h1>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {x.priceBgn} {t('detail.currency')}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                        {t('excursions.date')}: {new Date(x.date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {x.photos.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
                        <img
                            src={resolvePhotoUrl(x.photos[activePhoto].url)!}
                            alt={x.photos[activePhoto].caption ?? x.destination}
                            style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
                        />
                    </div>
                    {x.photos[activePhoto].caption && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 12 }}>
                            {x.photos[activePhoto].caption}
                        </p>
                    )}
                    {x.photos.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {x.photos.map((p: Photo, i: number) => (
                                <img
                                    key={p.id}
                                    src={resolvePhotoUrl(p.url)!}
                                    alt={p.caption ?? `${t('detail.photo')} ${i + 1}`}
                                    onClick={() => setActivePhoto(i)}
                                    style={{
                                        width: 96, height: 64, objectFit: 'cover',
                                        borderRadius: 6, cursor: 'pointer',
                                        border: i === activePhoto ? '2px solid var(--primary)' : '2px solid transparent',
                                        opacity: i === activePhoto ? 1 : 0.7,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="tour-card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>{t('detail.description')}</h2>
                <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>{x.description}</p>
            </div>
        </div>
    )
}
