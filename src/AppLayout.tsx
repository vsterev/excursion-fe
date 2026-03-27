import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, Divider, Hidden } from 'reshaped'
import { LanguageSwitcher } from './components/LanguageSwitcher'

export function AppLayout() {
    const [open, setOpen] = useState(false)
    const location = useLocation()
    const { t } = useTranslation()

    useEffect(() => { setOpen(false) }, [location])

    return (
        <View>
            <View
                as="nav"
                position="sticky"
                zIndex={100}
                backgroundColor="white"
                attributes={{ style: { top: 0, borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' } }}
            >
                <View
                    direction="row"
                    align="center"
                    justify="space-between"
                    paddingBlock={{ s: 3, m: 0 }} paddingInline={{ s: 4, m: 6 }}
                    attributes={{ style: { maxWidth: 1200, margin: '0 auto', height: 64 } }}
                >
                    <NavLink to="/" style={{ textDecoration: 'none' }}>
                        <Text variant="featured-2" weight="bold" color="primary">{t('nav.logo')}</Text>
                    </NavLink>

                    {/* Desktop links */}
                    <Hidden hide={{ s: true, l: false }}>
                        <View direction="row" gap={1} align="center">
                            <NavLink to="/excursions" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>{t('nav.excursions')}</NavLink>
                            <NavLink to="/representatives" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>{t('nav.representatives')}</NavLink>
                            <NavLink to="/useful-info" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>{t('nav.usefulInfo')}</NavLink>
                            <LanguageSwitcher />
                        </View>
                    </Hidden>

                    {/* Mobile */}
                    <Hidden hide={{ s: false, l: true }}>
                        <View direction="row" align="center" gap={2}>
                            <LanguageSwitcher />
                            <Button variant="ghost" onClick={() => setOpen(o => !o)} aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}>
                                {open ? '✕' : '☰'}
                            </Button>
                        </View>
                    </Hidden>
                </View>

                {open && (
                    <>
                        <Divider />
                        <View padding={4} gap={1} direction="column">
                            <NavLink to="/excursions" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>🗺️ {t('nav.excursions')}</NavLink>
                            <NavLink to="/representatives" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>👥 {t('nav.representatives')}</NavLink>
                            <NavLink to="/useful-info" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>ℹ️ {t('nav.usefulInfo')}</NavLink>
                        </View>
                    </>
                )}
            </View>

            {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}

            <Outlet />
        </View>
    )
}
