import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Button, useToggle, Hidden, MenuItem, Modal, useTheme } from 'reshaped'
import { SOLVEX_LOGO_SRC } from './branding'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { Menu, Home, MapPin, Users, Building2, Sun, Moon } from 'lucide-react'

export function AppLayout() {
    const location = useLocation()
    const { t } = useTranslation()

    const navigate = useNavigate();
    const { toggle, deactivate, active } = useToggle(false);
    const { colorMode, setColorMode } = useTheme();

    const modalNavigate = (path: string) => {
        navigate(path)
        deactivate()
    }

    return (
        <View>
            <View
                position="sticky"
                zIndex={100}
                backgroundColor="elevation-raised"
                attributes={{ style: { top: 0, borderBottom: '1px solid var(--border)' } }}
                paddingInline={{ s: 4, m: 6, l: 10 }}
            >
                <View
                    direction="row"
                    align="center"
                    justify="space-between"
                    paddingBlock={{ s: 3, m: 2 }} paddingInline={{ s: 4, m: 2 }}
                >
                    <Hidden hide={{ s: true, l: false }}>
                        <NavLink
                            to="/"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                            aria-label={t('nav.logoAlt')}
                        >
                            <img
                                src={SOLVEX_LOGO_SRC}
                                alt=""
                                style={{ display: 'block', height: 40, width: 'auto', maxWidth: 200 }}
                            />
                        </NavLink>
                    </Hidden>

                    {/* Desktop links */}
                    <Hidden hide={{ s: true, l: false }}>
                        <View direction="row" gap={3} borderRadius="medium">
                            <MenuItem roundedCorners size='large' onClick={() => navigate("/excursions")} selected={location.pathname === '/excursions'}>{t('nav.excursions')}</MenuItem>
                            <MenuItem roundedCorners size='large' onClick={() => navigate("/representatives")} selected={location.pathname === '/representatives'}>{t('nav.representatives')}</MenuItem>
                            <MenuItem roundedCorners size='large' onClick={() => navigate("/about")} selected={location.pathname === '/about'}>{t('nav.aboutUs')}</MenuItem>
                        </View>
                        <View direction="row" align="center" gap={2}>
                            <Button
                                icon={colorMode === 'dark' ? Sun : Moon}
                                onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}
                                variant='ghost'
                                size='large'
                            />
                            <LanguageSwitcher />
                        </View>
                    </Hidden>

                    {/* Mobile */}
                    <Hidden hide={{ s: false, l: true }}>
                        <View direction="row" align="center" justify='space-between' grow paddingStart={{ s: 5, m: 10 }}>
                            <LanguageSwitcher />
                            <View direction="row" align="center" gap={1}>
                                <Button
                                    icon={colorMode === 'dark' ? Sun : Moon}
                                    onClick={() => setColorMode(colorMode === 'dark' ? 'light' : 'dark')}
                                    variant='ghost'
                                    size='large'
                                />
                                <Button icon={Menu} onClick={toggle} variant='ghost' color='primary' size='large' />
                            </View>
                        </View>
                    </Hidden>
                </View>

                <Modal
                    active={active}
                    onClose={deactivate}
                    position="end"
                // transparentOverlay
                >
                    <View padding={4} gap={1} direction="column" >
                        <MenuItem roundedCorners size='large' startSlot={<Home size={18} />} onClick={() => modalNavigate("/")} selected={location.pathname === '/'}>{t('nav.home')}</MenuItem>
                        <MenuItem roundedCorners size='large' startSlot={<MapPin size={18} />} onClick={() => modalNavigate("/excursions")} selected={location.pathname === '/excursions'}>{t('nav.excursions')}</MenuItem>
                        <MenuItem roundedCorners size='large' startSlot={<Users size={18} />} onClick={() => modalNavigate("/representatives")} selected={location.pathname === '/representatives'}>{t('nav.representatives')}</MenuItem>
                        <MenuItem roundedCorners size='large' startSlot={<Building2 size={18} />} onClick={() => modalNavigate("/about")} selected={location.pathname === '/about'}>{t('nav.aboutUs')}</MenuItem>
                    </View>
                </Modal>

            </View >


            <Outlet />
        </View >
    )
}
