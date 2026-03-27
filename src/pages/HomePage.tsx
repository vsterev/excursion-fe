import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const CATEGORIES = [
    { emoji: '🏛️', key: 'Културна' as const },
    { emoji: '🌿', key: 'Природна' as const },
    { emoji: '⛰️', key: 'Планинска' as const },
    { emoji: '🎢', key: 'Развлекателна' as const },
]

export function HomePage() {
    const { t } = useTranslation()

    return (
        <div>
            {/* Hero */}
            <div className="hero">
                <img
                    // className="hero-img"
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80"
                    alt="Hero"
                />
                <div className="hero-content">
                    <div className="hero-badge">{t('home.badge')}</div>
                    <h1 className="hero-title">{t('home.title').split('\n').map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}</h1>
                    <p className="hero-sub">{t('home.subtitle')}</p>
                    <Link to="/excursions" className="hero-cta">
                        {t('home.cta')}
                    </Link>
                </div>
            </div>

            <div className="page">
                {/* Categories */}
                <div style={{ marginBottom: 48 }}>
                    <div className="page-header">
                        <h1>{t('home.categoriesTitle')}</h1>
                        <p>{t('home.categoriesSubtitle')}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
                        {CATEGORIES.map(c => (
                            <Link
                                key={c.key}
                                to={`/excursions?type=${encodeURIComponent(c.key)}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="tour-card" style={{ padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <div style={{ fontSize: 36 }}>{c.emoji}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{t(`home.categories.${c.key}`)}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t('home.seeAll')}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick links */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <Link to="/representatives" style={{ textDecoration: 'none' }}>
                        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer', transition: 'box-shadow .2s', marginBottom: 0 }}>
                            <div style={{ fontSize: 48 }}>👥</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{t('home.repsTitle')}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('home.repsDesc')}</div>
                            </div>
                        </div>
                    </Link>
                    <Link to="/useful-info" style={{ textDecoration: 'none' }}>
                        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer', transition: 'box-shadow .2s', marginBottom: 0 }}>
                            <div style={{ fontSize: 48 }}>ℹ️</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{t('home.infoTitle')}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>{t('home.infoDesc')}</div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
