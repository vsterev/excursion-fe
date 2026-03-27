import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher'

export function AppLayout() {
    const [open, setOpen] = useState(false)
    const location = useLocation()
    const { t } = useTranslation()

    useEffect(() => { setOpen(false) }, [location])

    return (
        <div>
            <nav className="nav">
                <div className="nav-inner">
                    <NavLink to="/" className="nav-logo">{t('nav.logo')}</NavLink>

                    {/* Desktop links */}
                    <div className="nav-links nav-links--desktop">
                        <NavLink to="/excursions" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                            {t('nav.excursions')}
                        </NavLink>
                        <NavLink to="/representatives" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                            {t('nav.representatives')}
                        </NavLink>
                        <NavLink to="/useful-info" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                            {t('nav.usefulInfo')}
                        </NavLink>
                        {/* <LanguageSwitcher /> */}
                    </div>

                    {/* Hamburger button — mobile only */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="nav-links--mobile-lang"><LanguageSwitcher /></div>
                        <button
                            className="nav-burger"
                            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
                            aria-expanded={open}
                            onClick={() => setOpen(o => !o)}
                        >
                            <span className={`burger-icon${open ? ' open' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                <div className={`nav-drawer${open ? ' nav-drawer--open' : ''}`}>
                    <NavLink to="/excursions" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>
                        🗺️ {t('nav.excursions')}
                    </NavLink>
                    <NavLink to="/representatives" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>
                        👥 {t('nav.representatives')}
                    </NavLink>
                    <NavLink to="/useful-info" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>
                        ℹ️ {t('nav.usefulInfo')}
                    </NavLink>
                </div>
            </nav>

            {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}

            <Outlet />
        </div>
    )
}
