import i18n from './i18n'

export type ExcursionPhotoDto = {
    id: string
    url: string
    caption: string | null
    order: number
}

export type ExcursionDto = {
    id: string
    /** Каноничен тип (английски), за филтри и URL */
    typeKey: string
    type: string
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

export type ResortDto = {
    id: number
    name: string
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
    return i18n.language?.slice(0, 2) ?? 'en'
}

async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${API_ORIGIN}/api${path}`)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return res.json() as Promise<T>
}

export const fetchExcursions = (params?: {
    type?: string; from?: string; destination?: string
    q?: string
}): Promise<ExcursionDto[]> => {
    const qs = new URLSearchParams({ lang: lang() })
    if (params?.type) qs.set('type', params.type)
    if (params?.from) qs.set('from', params.from)
    if (params?.destination) qs.set('destination', params.destination)
    if (params?.q) qs.set('q', params.q)
    return apiFetch<ExcursionDto[]>(`/excursions?${qs}`)
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

export const fetchResorts = (): Promise<ResortDto[]> => apiFetch<ResortDto[]>('/resorts')

export const fetchRepresentative = (id: string): Promise<RepresentativeDto> =>
    apiFetch<RepresentativeDto>(`/representatives/${id}?lang=${lang()}`)

export const fetchUsefulInfo = (params?: { resort?: string; category?: string }): Promise<UsefulInfoDto[]> => {
    const qs = new URLSearchParams({ lang: lang() })
    if (params?.resort) qs.set('resort', params.resort)
    if (params?.category) qs.set('category', params.category)
    return apiFetch<UsefulInfoDto[]>(`/useful-info?${qs}`)
}
