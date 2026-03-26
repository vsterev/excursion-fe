import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

export function AppLayout() {
    const [open, setOpen] = useState(false)
    const location = useLocation()

    // close drawer on route change
    useEffect(() => { setOpen(false) }, [location])

    return (
        <div>
            <nav className="nav">
                <div className="nav-inner">
                    <NavLink to="/" className="nav-logo">✈ TripsGuide</NavLink>

                    {/* Desktop links */}
                    <div className="nav-links nav-links--desktop">
                        <NavLink to="/excursions" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                            Екскурзии
                        </NavLink>
                        <NavLink to="/representatives" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                            Представители
                        </NavLink>
                        <NavLink to="/useful-info" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                            Полезна информация
                        </NavLink>
                    </div>

                    {/* Hamburger button — mobile only */}
                    <button
                        className="nav-burger"
                        aria-label={open ? 'Затвори меню' : 'Отвори меню'}
                        aria-expanded={open}
                        onClick={() => setOpen(o => !o)}
                    >
                        <span className={`burger-icon${open ? ' open' : ''}`} />
                    </button>
                </div>

                {/* Mobile drawer */}
                <div className={`nav-drawer${open ? ' nav-drawer--open' : ''}`}>
                    <NavLink to="/excursions" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>
                        🗺️ Екскурзии
                    </NavLink>
                    <NavLink to="/representatives" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>
                        👥 Представители
                    </NavLink>
                    <NavLink to="/useful-info" className={({ isActive }) => 'nav-drawer-link' + (isActive ? ' active' : '')}>
                        ℹ️ Полезна информация
                    </NavLink>
                </div>
            </nav>

            {/* Overlay */}
            {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}

            <Outlet />
        </div>
    )
}
