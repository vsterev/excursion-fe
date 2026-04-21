import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

import { API_BASE } from './api'
const TOKEN_KEY = 'admin_token'

interface AuthCtx {
    token: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        if (!res.ok) throw new Error('Невалидни данни за вход')
        const data = await res.json() as { token: string }
        localStorage.setItem(TOKEN_KEY, data.token)
        setToken(data.token)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
    }, [])

    return <Ctx.Provider value={{ token, login, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useAuth must be inside AuthProvider')
    return ctx
}
