const STORAGE_KEY = 'trips-color-mode'

export function readStoredColorMode(): 'light' | 'dark' {
    try {
        const v = localStorage.getItem(STORAGE_KEY)
        if (v === 'dark' || v === 'light') return v
    } catch {
        /* private mode / quota */
    }
    return 'light'
}

export function writeStoredColorMode(mode: 'light' | 'dark'): void {
    try {
        localStorage.setItem(STORAGE_KEY, mode)
    } catch {
        /* ignore */
    }
}
