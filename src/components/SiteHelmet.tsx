import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SOLVEX_LOGO_SRC } from '../branding'

function seoForPath(pathname: string): { titleKey: string; descKey: string } {
    if (pathname === '/') return { titleKey: 'seo.homeTitle', descKey: 'seo.homeDescription' }
    if (pathname === '/excursions') {
        return { titleKey: 'seo.excursionsTitle', descKey: 'seo.excursionsDescription' }
    }
    if (pathname.startsWith('/excursions/')) {
        return {
            titleKey: 'seo.excursionDetailTitle',
            descKey: 'seo.excursionDetailDescription',
        }
    }
    if (pathname === '/representatives') {
        return { titleKey: 'seo.representativesTitle', descKey: 'seo.representativesDescription' }
    }
    if (pathname.startsWith('/representatives/')) {
        return {
            titleKey: 'seo.representativeDetailTitle',
            descKey: 'seo.representativeDetailDescription',
        }
    }
    if (pathname === '/about') return { titleKey: 'seo.aboutTitle', descKey: 'seo.aboutDescription' }
    if (pathname === '/useful-info') {
        return { titleKey: 'seo.usefulInfoTitle', descKey: 'seo.usefulInfoDescription' }
    }
    if (pathname === '/admin/login') {
        return { titleKey: 'seo.adminLoginTitle', descKey: 'seo.adminLoginDescription' }
    }
    if (pathname.startsWith('/admin')) {
        return { titleKey: 'seo.adminTitle', descKey: 'seo.adminDescription' }
    }
    return { titleKey: 'seo.notFoundTitle', descKey: 'seo.notFoundDescription' }
}

export function SiteHelmet() {
    const location = useLocation()
    const { t, i18n } = useTranslation()
    const { titleKey, descKey } = seoForPath(location.pathname)
    const title = t(titleKey)
    const description = t(descKey)
    const lang = (i18n.resolvedLanguage ?? 'en').slice(0, 2)

    return (
        <Helmet htmlAttributes={{ lang }} prioritizeSeoTags>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary" />
            <link rel="icon" href={SOLVEX_LOGO_SRC} type="image/png" />
        </Helmet>
    )
}
