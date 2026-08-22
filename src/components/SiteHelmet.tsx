import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SOLVEX_LOGO_SRC } from '../branding'

const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) ?? '').replace(/\/$/, '')

function seoForPath(pathname: string): { titleKey: string; descKey: string } {
    if (pathname === '/') return { titleKey: 'seo.homeTitle', descKey: 'seo.homeDescription' }
    if (pathname === '/excursions') {
        return { titleKey: 'seo.excursionsTitle', descKey: 'seo.excursionsDescription' }
    }
    if (pathname === '/resorts') {
        return { titleKey: 'seo.resortsTitle', descKey: 'seo.resortsDescription' }
    }
    if (pathname.startsWith('/resorts/')) {
        return { titleKey: 'seo.resortDetailTitle', descKey: 'seo.resortDetailDescription' }
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
    const isAdmin = location.pathname.startsWith('/admin')

    const canonicalUrl = SITE_URL ? `${SITE_URL}${location.pathname}` : ''
    const logoUrl = SITE_URL ? `${SITE_URL}${SOLVEX_LOGO_SRC}` : SOLVEX_LOGO_SRC

    return (
        <Helmet htmlAttributes={{ lang }} prioritizeSeoTags>
            <title>{title}</title>
            <meta name="description" content={description} />
            {isAdmin && <meta name="robots" content="noindex, nofollow" />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={logoUrl} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={logoUrl} />
            <link rel="icon" href={SOLVEX_LOGO_SRC} type="image/png" />
        </Helmet>
    )
}
