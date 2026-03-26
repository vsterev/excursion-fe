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
}

// Backend base URL (without /api). Example: http://localhost:4010
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:4010'

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
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.from) qs.set('from', params.from)
    if (params?.destination) qs.set('destination', params.destination)
    if (params?.q) qs.set('q', params.q)
    if (params?.priceMin != null) qs.set('priceMin', String(params.priceMin))
    if (params?.priceMax != null) qs.set('priceMax', String(params.priceMax))
    if (params?.dateFrom) qs.set('dateFrom', params.dateFrom)
    if (params?.dateTo) qs.set('dateTo', params.dateTo)
    const query = qs.toString() ? `?${qs}` : ''
    return apiFetch<ExcursionDto[]>(`/excursions${query}`)
}

export const fetchExcursion = (id: string): Promise<ExcursionDetailDto> =>
    apiFetch<ExcursionDetailDto>(`/excursions/${id}`)

export const fetchRepresentatives = (params?: { resort?: string; q?: string }): Promise<RepresentativeDto[]> => {
    const qs = new URLSearchParams()
    if (params?.resort) qs.set('resort', params.resort)
    if (params?.q) qs.set('q', params.q)
    const query = qs.toString() ? `?${qs}` : ''
    return apiFetch<RepresentativeDto[]>(`/representatives${query}`)
}

export const fetchRepresentative = (id: string): Promise<RepresentativeDto> =>
    apiFetch<RepresentativeDto>(`/representatives/${id}`)

export const fetchUsefulInfo = (params?: { resort?: string; category?: string }): Promise<UsefulInfoDto[]> => {
    const qs = new URLSearchParams()
    if (params?.resort) qs.set('resort', params.resort)
    if (params?.category) qs.set('category', params.category)
    const query = qs.toString() ? `?${qs}` : ''
    return apiFetch<UsefulInfoDto[]>(`/useful-info${query}`)
}
