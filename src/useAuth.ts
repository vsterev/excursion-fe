import { useContext } from 'react'
import { Ctx } from './AuthContext'

export function useAuth() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useAuth must be inside AuthProvider')
    return ctx
}
