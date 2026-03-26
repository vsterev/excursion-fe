import { Link } from 'react-router-dom'

const CATEGORIES = [
    { emoji: '🏛️', label: 'Културни', value: 'Културна' },
    { emoji: '🌿', label: 'Природни', value: 'Природна' },
    { emoji: '⛰️', label: 'Планински', value: 'Планинска' },
    { emoji: '🎢', label: 'Развлекателни', value: 'Развлекателна' },
]

export function HomePage() {
    return (
        <div>
            {/* Hero */}
            <div className="hero">
                <img
                    className="hero-img"
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80"
                    alt="Hero"
                />
                <div className="hero-content">
                    <div className="hero-badge">🌍 Туристически Гид</div>
                    <h1 className="hero-title">Открийте красотата<br/>на България</h1>
                    <p className="hero-sub">Уникални екскурзии, местни представители и полезна информация за всеки курорт.</p>
                    <Link to="/excursions" className="hero-cta">
                        Разгледай екскурзии →
                    </Link>
                </div>
            </div>

            <div className="page">
                {/* Categories */}
                <div style={{ marginBottom: 48 }}>
                    <div className="page-header">
                        <h1>Видове екскурзии</h1>
                        <p>Избери категория и открий подходящата екскурзия за теб</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 16 }}>
                        {CATEGORIES.map(c => (
                            <Link
                                key={c.value}
                                to={`/excursions?type=${encodeURIComponent(c.value)}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="tour-card" style={{ padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    <div style={{ fontSize: 36 }}>{c.emoji}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{c.label}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Виж всички →</div>
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
                                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Представители</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Локални гидове по всички курорти</div>
                            </div>
                        </div>
                    </Link>
                    <Link to="/useful-info" style={{ textDecoration: 'none' }}>
                        <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer', transition: 'box-shadow .2s', marginBottom: 0 }}>
                            <div style={{ fontSize: 48 }}>ℹ️</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Полезна информация</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Транспорт, телефони, валута и още</div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
