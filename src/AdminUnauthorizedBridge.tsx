import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { setAdminUnauthorizedHandler } from './adminSession'

/**
 * При 401 от admin API (`notifyAdminUnauthorized`) — изчиства токена и пренасочва към логин.
 */
export function AdminUnauthorizedBridge() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        setAdminUnauthorizedHandler(() => {
            logout()
            navigate('/admin/login', { replace: true })
        })
        return () => setAdminUnauthorizedHandler(null)
    }, [logout, navigate])

    return null
}
