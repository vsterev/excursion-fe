import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { View, Text, Button, Alert } from 'reshaped'

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
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Грешка при вход')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View minHeight="100svh" align="center" justify="center" backgroundColor="neutral-faded" padding={6}>
            <View shadow="overlay" padding={10} borderRadius="large" backgroundColor="white" attributes={{ style: { width: '100%', maxWidth: 400 } }}>
                <View align="center" gap={2} attributes={{ style: { marginBottom: 32 } }}>
                    <Text variant="title-2">✈️</Text>
                    <Text variant="title-2" weight="bold">TripsGuide Admin</Text>
                    <Text variant="body-2" color="neutral-faded">Влез с администраторски акаунт</Text>
                </View>

                <form onSubmit={handleSubmit}>
                    <View gap={4}>
                        <View gap={1}>
                            <Text variant="caption-1" weight="bold" color="neutral-faded" attributes={{ style: { textTransform: 'uppercase', letterSpacing: '.5px' } }}>Email</Text>
                            <input className="filter-input" type="email" placeholder="vasil@solvex.bg" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                        </View>
                        <View gap={1}>
                            <Text variant="caption-1" weight="bold" color="neutral-faded" attributes={{ style: { textTransform: 'uppercase', letterSpacing: '.5px' } }}>Парола</Text>
                            <input className="filter-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </View>
                        {error && <Alert color="critical">⚠️ {error}</Alert>}
                        <Button type="submit" variant="solid" color="primary" fullWidth loading={loading}>
                            Влез
                        </Button>
                    </View>
                </form>
            </View>
        </View>
    )
}
