import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { View, Text, Button, Divider, ToastProvider, MenuItem } from 'reshaped'

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
        <ToastProvider>
            <View direction="row" minHeight="100svh">
                {/* Sidebar */}
                <View
                    as="aside"
                    width={70}
                    backgroundColor="primary-faded"
                    position="sticky"
                    height="100svh"
                    direction="column"
                    gap={5}
                >
                    <View gap={5} padding={5}>
                        <Text variant="title-6" color="neutral-faded">TripsGuide</Text>
                        <Text variant="body-1" color="neutral-faded">Администрация</Text>
                    </View>

                    <View as="nav" padding={3} grow direction="column" gap={3}>
                        {NAV.map(({ to, icon, label }) => (
                            <MenuItem
                                key={to}
                                roundedCorners
                                size='large'
                                onClick={() => navigate(to)}
                                selected={location.pathname === to}
                                startSlot={<span style={{ fontSize: 18 }}>{icon}</span>}>
                                {label}
                            </MenuItem>
                        ))}
                    </View>

                    <Divider attributes={{ style: { borderColor: 'rgba(255,255,255,.08)' } }} />
                    <View padding={3}>
                        <Button
                            variant="solid"
                            onClick={handleLogout}
                            fullWidth
                            color="primary"
                        >
                            🚪 Изход
                        </Button>
                    </View>
                </View>

                {/* Main */}
                <View grow backgroundColor="neutral-faded" height="100svh" overflow="auto">
                    <Outlet />
                </View>
            </View>
        </ToastProvider>
    )
}
