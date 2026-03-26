import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const NAV = [
    { to: '/admin/excursions', icon: '🗺️', label: 'Екскурзии' },
    { to: '/admin/representatives', icon: '👥', label: 'Представители' },
    { to: '/admin/useful-info', icon: 'ℹ️', label: 'Полезна информация' },
]

export function AdminLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/admin/login')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100svh' }}>
            {/* Sidebar */}
            <aside style={{
                width: 240, background: '#1a1a2e', color: '#fff',
                display: 'flex', flexDirection: 'column',
                position: 'sticky', top: 0, height: '100svh', flexShrink: 0,
            }}>
                <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>✈ TripsGuide</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Администрация
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '12px 10px' }}>
                    {NAV.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '11px 14px', borderRadius: 8, marginBottom: 4,
                                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                                color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
                                background: isActive ? 'rgba(255,85,51,.25)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                transition: 'all .15s',
                            })}
                        >
                            <span style={{ fontSize: 18 }}>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: 8,
                            background: 'rgba(255,255,255,.06)', border: 'none',
                            color: 'rgba(255,255,255,.6)', cursor: 'pointer',
                            fontSize: 14, textAlign: 'left', display: 'flex', gap: 10,
                        }}
                    >
                        🚪 Изход
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, background: 'var(--bg)', overflow: 'auto' }}>
                <Outlet />
            </main>
        </div>
    )
}
