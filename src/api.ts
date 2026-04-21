import i18n from './i18n'
import { normalizeQuillHtmlNbsp } from './richTextNormalize'

/** Пълен базов URL на API (с `/api`), като зад nginx. */
export const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:4010/api').replace(/\/+$/, '')

/** Същият хост без `/api` — за `/uploads/...`. */
export const API_ORIGIN = API_BASE.replace(/\/api$/i, '') || API_BASE

export type ExcursionPhotoDto = {
    id: string
    url: string
    caption: string | null
    order: number
}

export type ExcursionDto = {
    id: string
    destination: string
    description: string
    date: string | null
    price: number | null
    coverPhoto: string | null
    departures: ResortDto[]
}

export type ExcursionDetailDto = ExcursionDto & {
    photos: ExcursionPhotoDto[]
}

export type ExcursionsListResponse = {
    items: ExcursionDto[]
    hasMore: boolean
}

export type ResortDto = {
    id: number
    name: string
    coverPhoto?: string | null
}

export type ResortDetailDto = {
    id: number
    name: string
    description: string
    photos: ExcursionPhotoDto[]
}

/** Публичен списък/детайл — синхрон с RepresentativesController на бекенда */
export type RepresentativeDto = {
    id: string
    name: string
    phone: string | null
    whatsapp: string | null
    email: string | null
    photoUrl: string | null
    lat: number
    lng: number
    languages: string[] | null
    hotels: string[] | null
    resorts: ResortDto[]
}

export type UsefulInfoDto = {
    id: string
    resort: string
    category: string
    title: string
    body: string
    url: string | null
}

/**
 * Converts a photoUrl to an absolute URL.
 * Handles both legacy absolute URLs (http://...) and new relative paths (/uploads/...).
 */
export function resolvePhotoUrl(url: string | null | undefined): string | null {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${API_ORIGIN}${url}`
}

/**
 * Rich text от админа често съдържа `src="/uploads/..."` или `href="/uploads/..."`.
 * На публичния сайт те трябва да сочат към API origin, иначе браузърът ги тъси на домейна на фронтенда.
 */
export function rewriteUploadUrlsInHtml(html: string | null | undefined): string {
    const normalized = normalizeQuillHtmlNbsp(html)
    if (normalized === '') return ''
    const base = API_ORIGIN.replace(/\/$/, '')
    return normalized.replace(
        /(src|href)=(["'])(\/uploads\/[^"']+)\2/gi,
        (_m, attr: string, quote: string, path: string) => `${attr}=${quote}${base}${path}${quote}`
    )
}

function lang() {
    return i18n.language?.slice(0, 2) ?? 'en'
}

async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return res.json() as Promise<T>
}

export const fetchExcursions = (params?: {
    from?: string
    destination?: string
    resortId?: number
    q?: string
    limit?: number
    offset?: number
}): Promise<ExcursionsListResponse> => {
    const qs = new URLSearchParams({ lang: lang() })
    if (params?.from) qs.set('from', params.from)
    if (params?.destination) qs.set('destination', params.destination)
    if (params?.resortId != null) qs.set('resortId', String(params.resortId))
    if (params?.q?.trim()) qs.set('q', params.q.trim())
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.offset != null) qs.set('offset', String(params.offset))
    return apiFetch<ExcursionsListResponse>(`/excursions?${qs}`)
}

export const fetchExcursion = (id: string): Promise<ExcursionDetailDto> =>
    apiFetch<ExcursionDetailDto>(`/excursions/${id}?lang=${lang()}`)

export const fetchRepresentatives = (params?: {
    resortId?: number
    q?: string
    language?: string
}): Promise<RepresentativeDto[]> => {
    const qs = new URLSearchParams({ lang: lang() })
    if (params?.resortId != null) qs.set('resortId', String(params.resortId))
    if (params?.q) qs.set('q', params.q)
    if (params?.language) qs.set('language', params.language)
    return apiFetch<RepresentativeDto[]>(`/representatives?${qs}`)
}

export const fetchResorts = (): Promise<ResortDto[]> =>
    apiFetch<ResortDto[]>(`/resorts?lang=${lang()}`)

export const fetchResortDetail = (id: number): Promise<ResortDetailDto> =>
    apiFetch<ResortDetailDto>(`/resorts/${id}?lang=${lang()}`)

export const fetchRepresentative = (id: string): Promise<RepresentativeDto> =>
    apiFetch<RepresentativeDto>(`/representatives/${id}?lang=${lang()}`)

export const fetchUsefulInfo = (params?: { resort?: string; category?: string }): Promise<UsefulInfoDto[]> => {
    const qs = new URLSearchParams({ lang: lang() })
    if (params?.resort) qs.set('resort', params.resort)
    if (params?.category) qs.set('category', params.category)
    return apiFetch<UsefulInfoDto[]>(`/useful-info?${qs}`)
}
