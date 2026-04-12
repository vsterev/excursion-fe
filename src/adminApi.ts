import { notifyAdminUnauthorized } from './adminSession'

const API = import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:4010'

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
    const res = await fetch(`${API}/api${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
        if (res.status === 401) notifyAdminUnauthorized()
        throw new Error(await readApiError(res))
    }
    return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>)
}

// ── File Upload ────────────────────────────────
export type UploadCategory = 'excursions' | 'representatives' | 'homepage'

export async function uploadFile(
    token: string,
    category: UploadCategory,
    file: File,
): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API}/api/upload/${category}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
    })
    if (!res.ok) {
        if (res.status === 401) notifyAdminUnauthorized()
        throw new Error(await readApiError(res))
    }
    const data = await res.json() as { url: string }
    // Return absolute URL so <img src> works from frontend dev server
    return `${API}${data.url}`
}

// ── Excursions ─────────────────────────────────
export const adminListExcursions = (t: string) => req<unknown[]>('GET', '/admin/excursions', t)
export const adminCreateExcursion = (t: string, body: unknown) => req<{ id: string }>('POST', '/admin/excursions', t, body)
export const adminUpdateExcursion = (t: string, id: string, body: unknown) => req<{ ok: boolean }>('PUT', `/admin/excursions/${id}`, t, body)
export const adminDeleteExcursion = (t: string, id: string) => req<{ ok: boolean }>('DELETE', `/admin/excursions/${id}`, t)

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
