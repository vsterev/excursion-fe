import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { View, Text, Button, Divider } from 'reshaped'

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
        <View direction="row" minHeight="100svh">
            {/* Sidebar */}
            <View
                as="aside"
                attributes={{ style: { width: 240, background: '#1a1a2e', color: '#fff', flexShrink: 0, position: 'sticky', top: 0, height: '100svh', display: 'flex', flexDirection: 'column' } }}
            >
                <View padding={5} attributes={{ style: { borderBottom: '1px solid rgba(255,255,255,.08)' } }}>
                    <Text variant="title-3" weight="bold" attributes={{ style: { color: '#fff' } }}>✈ TripsGuide</Text>
                    <Text variant="caption-1" attributes={{ style: { color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: 1 } }}>Администрация</Text>
                </View>

                <View as="nav" padding={3} grow>
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
                            })}
                        >
                            <span style={{ fontSize: 18 }}>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </View>

                <Divider attributes={{ style: { borderColor: 'rgba(255,255,255,.08)' } }} />
                <View padding={3}>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        fullWidth
                        attributes={{ style: { color: 'rgba(255,255,255,.6)', justifyContent: 'flex-start' } }}
                    >
                        🚪 Изход
                    </Button>
                </View>
            </View>

            {/* Main */}
            <View grow backgroundColor="neutral-faded" overflow="auto">
                <Outlet />
            </View>
        </View>
    )
}
