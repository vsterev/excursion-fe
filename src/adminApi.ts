import { notifyAdminUnauthorized } from './adminSession'
import { API_BASE, API_ORIGIN } from './api'

/** Хвърля се при 401, за да не се показва общ toast (сесията се обработва от adminSession). */
export class AdminSessionExpiredError extends Error {
    constructor(message = 'Сесията изтече') {
        super(message)
        this.name = 'AdminSessionExpiredError'
    }
}

async function readApiError(res: Response): Promise<string> {
    const fallback = `${res.status} ${res.statusText}`
    const raw = await res.text()
    if (!raw.trim()) return fallback
    try {
        const err = JSON.parse(raw) as { message?: string; details?: { message?: string } | string }
        if (typeof err?.message === 'string' && err.message) return err.message
        const d = err?.details
        if (d && typeof d === 'object' && typeof d.message === 'string') return d.message
        if (typeof d === 'string') return d
    } catch {
        /* не е JSON */
    }
    return raw.length > 200 ? `${raw.slice(0, 200)}…` : raw
}

async function req<T>(method: string, path: string, token: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
        if (res.status === 401) {
            notifyAdminUnauthorized()
            throw new AdminSessionExpiredError()
        }
        throw new Error(await readApiError(res))
    }
    return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>)
}

// ── File Upload ────────────────────────────────
export type UploadCategory = 'excursions' | 'representatives' | 'homepage' | 'resorts'

export async function uploadFile(
    token: string,
    category: UploadCategory,
    file: File,
): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API_BASE}/upload?category=${encodeURIComponent(category)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
    })
    if (!res.ok) {
        if (res.status === 401) {
            notifyAdminUnauthorized()
            throw new AdminSessionExpiredError()
        }
        throw new Error(await readApiError(res))
    }
    const data = await res.json() as { url: string }
    // Return absolute URL so <img src> works from frontend dev server
    return `${API_ORIGIN}${data.url}`
}

// ── Excursions ─────────────────────────────────
export const adminListExcursions = (t: string) => req<unknown[]>('GET', '/admin/excursions', t)
export const adminCreateExcursion = (t: string, body: unknown) => req<{ id: string }>('POST', '/admin/excursions', t, body)
export const adminUpdateExcursion = (t: string, id: string, body: unknown) => req<{ ok: boolean }>('PUT', `/admin/excursions/${id}`, t, body)
export const adminDeleteExcursion = (t: string, id: string) => req<{ ok: boolean }>('DELETE', `/admin/excursions/${id}`, t)
export const adminReorderExcursions = (t: string, ids: string[]) => req<{ ok: boolean }>('POST', '/admin/excursions/reorder', t, { ids })

// ── Representatives ────────────────────────────
export const adminListRepresentatives = (t: string) => req<unknown[]>('GET', '/admin/representatives', t)
export const adminCreateRepresentative = (t: string, body: unknown) => req<{ id: string }>('POST', '/admin/representatives', t, body)
export const adminUpdateRepresentative = (t: string, id: string, body: unknown) => req<{ ok: boolean }>('PUT', `/admin/representatives/${id}`, t, body)
export const adminDeleteRepresentative = (t: string, id: string) => req<{ ok: boolean }>('DELETE', `/admin/representatives/${id}`, t)

// ── Useful Info ────────────────────────────────
export const adminListUsefulInfo = (t: string) => req<unknown[]>('GET', '/admin/useful-info', t)
export const adminCreateUsefulInfo = (t: string, body: unknown) => req<{ id: string }>('POST', '/admin/useful-info', t, body)
export const adminUpdateUsefulInfo = (t: string, id: string, body: unknown) => req<{ ok: boolean }>('PUT', `/admin/useful-info/${id}`, t, body)
export const adminDeleteUsefulInfo = (t: string, id: string) => req<{ ok: boolean }>('DELETE', `/admin/useful-info/${id}`, t)

// ── Reservations ───────────────────────────────
export type ReservationStatus = 'waiting' | 'confirmed' | 'refunded'

export type ReservationDto = {
    id: string
    excursionId: string
    excursionName: string
    touristCount: number
    holderName: string
    email: string
    phone: string
    excursionDate: string | null
    totalPrice: number | null
    notes: string | null
    status: ReservationStatus
    createdAt: string
    paymentOrderId: string | null
    refundOrderId: string | null
}

export type ReservationsListResponse = {
    items: ReservationDto[]
    total: number
}

export type ReservationsFilter = {
    reservationDateFrom?: string
    reservationDateTo?: string
    excursionDateFrom?: string
    excursionDateTo?: string
    name?: string
    phone?: string
    excursionName?: string
    limit?: number
    offset?: number
}

export function adminListReservations(token: string, filter: ReservationsFilter = {}): Promise<ReservationsListResponse> {
    const qs = new URLSearchParams()
    if (filter.reservationDateFrom) qs.set('reservationDateFrom', filter.reservationDateFrom)
    if (filter.reservationDateTo) qs.set('reservationDateTo', filter.reservationDateTo)
    if (filter.excursionDateFrom) qs.set('excursionDateFrom', filter.excursionDateFrom)
    if (filter.excursionDateTo) qs.set('excursionDateTo', filter.excursionDateTo)
    if (filter.name) qs.set('name', filter.name)
    if (filter.phone) qs.set('phone', filter.phone)
    if (filter.excursionName) qs.set('excursionName', filter.excursionName)
    if (filter.limit != null) qs.set('limit', String(filter.limit))
    if (filter.offset != null) qs.set('offset', String(filter.offset))
    return req<ReservationsListResponse>('GET', `/admin/reservations?${qs}`, token)
}

export const adminUpdateReservationStatus = (t: string, id: string, status: 'waiting' | 'confirmed') =>
    req<{ ok: boolean; status: ReservationStatus }>('PATCH', `/admin/reservations/${id}/status`, t, { status })
export const adminDeleteReservation = (t: string, id: string) => req<{ ok: boolean }>('DELETE', `/admin/reservations/${id}`, t)
export const adminSyncRevolutPayments = (t: string) =>
    req<{ checked: number; confirmed: number; errors: number }>('POST', '/admin/reservations/sync-revolut', t)
export const adminRefundReservation = (t: string, id: string) =>
    req<{ ok: boolean; refundOrderId: string }>('POST', `/admin/reservations/${id}/refund`, t)

// ── Resorts ─────────────────────────────────────
export type AdminResortRow = {
    id: number
    name: string
    description: string
    photos: { id: string; url: string; caption: string | null; order: number }[]
}

export const adminListResorts = (t: string) => req<AdminResortRow[]>('GET', '/admin/resorts', t)
export const adminCreateResort = (t: string, body: unknown) => req<{ id: number }>('POST', '/admin/resorts', t, body)
export const adminUpdateResort = (t: string, id: number, body: unknown) =>
    req<{ ok: boolean }>('PUT', `/admin/resorts/${id}`, t, body)
export const adminDeleteResort = (t: string, id: number) => req<{ ok: boolean }>('DELETE', `/admin/resorts/${id}`, t)
