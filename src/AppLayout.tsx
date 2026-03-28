import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, useToggle, Hidden, MenuItem, Modal } from 'reshaped'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { Menu } from 'lucide-react'

export function AppLayout() {
    const location = useLocation()
    const { t } = useTranslation()

    const navigate = useNavigate();
    const { toggle, deactivate, active } = useToggle(false);

    const modalNavigate = (path: string) => {
        navigate(path)
        deactivate()
    }

    return (
        <View>
            <View
                position="sticky"
                zIndex={100}
                backgroundColor="white"
                attributes={{ style: { top: 0, borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' } }}
            >
                <View
                    direction="row"
                    align="center"
                    justify="space-between"
                    paddingBlock={{ s: 3, m: 2 }} paddingInline={{ s: 4, m: 2 }}
                    attributes={{ style: { maxWidth: 1200, margin: '0 auto', height: 74 } }}
                >
                    <NavLink to="/" style={{ textDecoration: 'none' }}>
                        <Text variant="featured-2" weight="bold" color="primary">{t('nav.logo')}</Text>
                    </NavLink>

                    {/* Desktop links */}
                    <Hidden hide={{ s: true, l: false }}>
                        <View direction="row" gap={3} borderRadius="medium">
                            <MenuItem roundedCorners size='large' onClick={() => navigate("/excursions")} selected={location.pathname === '/excursions'}>{t('nav.excursions')}</MenuItem>
                            <MenuItem roundedCorners size='large' onClick={() => navigate("/representatives")} selected={location.pathname === '/representatives'}>{t('nav.representatives')}</MenuItem>
                            <MenuItem roundedCorners size='large' onClick={() => navigate("/useful-info")} selected={location.pathname === '/useful-info'}>{t('nav.usefulInfo')}</MenuItem>
                        </View>
                        <LanguageSwitcher />
                    </Hidden>

                    {/* Mobile */}
                    <Hidden hide={{ s: false, l: true }}>
                        <View direction="row" align="center" justify='space-between' grow paddingStart={10}>
                            <LanguageSwitcher />
                            <Button icon={Menu} onClick={toggle} variant='ghost' color='primary' size='large' />
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
                        <MenuItem roundedCorners size='large' onClick={() => modalNavigate("/")} selected={location.pathname === '/'}>{t('nav.home')}</MenuItem>
                        <MenuItem roundedCorners size='large' onClick={() => modalNavigate("/excursions")} selected={location.pathname === '/excursions'}>{t('nav.excursions')}</MenuItem>
                        <MenuItem roundedCorners size='large' onClick={() => modalNavigate("/representatives")} selected={location.pathname === '/representatives'}>{t('nav.representatives')}</MenuItem>
                        <MenuItem roundedCorners size='large' onClick={() => modalNavigate("/useful-info")} selected={location.pathname === '/useful-info'}>{t('nav.usefulInfo')}</MenuItem>
                    </View>
                </Modal>

            </View >


            <Outlet />
        </View >
    )
}
