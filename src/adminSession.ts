/** Registered by AuthProvider; invoked on 401 from admin API to clear session and redirect to login. */
let onUnauthorized: (() => void) | null = null

export function setAdminUnauthorizedHandler(handler: (() => void) | null) {
    onUnauthorized = handler
}

export function notifyAdminUnauthorized() {
    onUnauthorized?.()
}
