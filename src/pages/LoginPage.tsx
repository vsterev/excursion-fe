import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate('/admin')
        } catch (err: any) {
            setError(err.message ?? 'Грешка при вход')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100svh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'var(--bg)', padding: 24,
        }}>
            <div style={{
                background: '#fff', borderRadius: 'var(--radius-lg)', padding: '48px 40px',
                boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 400,
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>✈️</div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.5 }}>
                        TripsGuide Admin
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                        Влез с администраторски акаунт
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="filter-group">
                        <label className="filter-label">Email</label>
                        <input
                            className="filter-input"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="vasil@solvex.bg"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Парола</label>
                        <input
                            className="filter-input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: '#fff5f5', border: '1px solid #fed7d7',
                            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                            color: '#c53030', fontSize: 14,
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 4 }}
                    >
                        {loading ? 'Зареждане…' : 'Влез'}
                    </button>
                </form>
            </div>
        </div>
    )
}
