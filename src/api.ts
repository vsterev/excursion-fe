import i18n from './i18n'

export type ExcursionPhotoDto = {
    id: string
    url: string
    caption: string | null
    order: number
}

export type ExcursionDto = {
    id: string
    type: string
    from: string
    destination: string
    description: string
    priceBgn: number
    date: string
}

export type ExcursionDetailDto = ExcursionDto & {
    photos: ExcursionPhotoDto[]
}

export type RepresentativeDto = {
    id: string
    resort: string
    name: string
    phone: string | null
    email: string | null
    photoUrl: string | null
    lat: number
    lng: number
}

export type UsefulInfoDto = {
    id: string
    resort: string
    category: string
    title: string
    body: string
    url: string | null
}

// Backend base URL (without /api). Example: http://localhost:4010
export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:4010'

/**
 * Converts a photoUrl to an absolute URL.
 * Handles both legacy absolute URLs (http://...) and new relative paths (/uploads/...).
 */
export function resolvePhotoUrl(url: string | null | undefined): string | null {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `${API_ORIGIN}${url}`
}

function lang() {
    return i18n.language?.slice(0, 2) ?? 'bg'
}

async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${API_ORIGIN}/api${path}`)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return res.json() as Promise<T>
}

export const fetchExcursions = (params?: {
    type?: string; from?: string; destination?: string
    q?: string; priceMin?: number; priceMax?: number
    dateFrom?: string; dateTo?: string
}): Promise<ExcursionDto[]> => {
    const qs = new URLSearchParams({ lang: lang() })
    if (params?.type) qs.set('type', params.type)
    if (params?.from) qs.set('from', params.from)
    if (params?.destination) qs.set('destination', params.destination)
    if (params?.q) qs.set('q', params.q)
    if (params?.priceMin != null) qs.set('priceMin', String(params.priceMin))
    if (params?.priceMax != null) qs.set('priceMax', String(params.priceMax))
    if (params?.dateFrom) qs.set('dateFrom', params.dateFrom)
    if (params?.dateTo) qs.set('dateTo', params.dateTo)
    return apiFetch<ExcursionDto[]>(`/excursions?${qs}`)
}

export const fetchExcursion = (id: string): Promise<ExcursionDetailDto> =>
    apiFetch<ExcursionDetailDto>(`/excursions/${id}?lang=${lang()}`)

export const fetchRepresentatives = (params?: { resort?: string; q?: string }): Promise<RepresentativeDto[]> => {
    const qs = new URLSearchParams({ lang: lang() })
    if (params?.resort) qs.set('resort', params.resort)
    if (params?.q) qs.set('q', params.q)
    return apiFetch<RepresentativeDto[]>(`/representatives?${qs}`)
}

export const fetchRepresentative = (id: string): Promise<RepresentativeDto> =>
    apiFetch<RepresentativeDto>(`/representatives/${id}?lang=${lang()}`)

export const fetchUsefulInfo = (params?: { resort?: string; category?: string }): Promise<UsefulInfoDto[]> => {
    const qs = new URLSearchParams({ lang: lang() })
    if (params?.resort) qs.set('resort', params.resort)
    if (params?.category) qs.set('category', params.category)
    return apiFetch<UsefulInfoDto[]>(`/useful-info?${qs}`)
}
