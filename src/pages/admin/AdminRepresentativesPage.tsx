import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListRepresentatives, adminCreateRepresentative,
    adminUpdateRepresentative, adminDeleteRepresentative,
} from '../../adminApi'
import { ImageUploader } from '../../components/ImageUploader'
import { resolvePhotoUrl } from '../../api'

const EMPTY = { resort: '', name: '', phone: '', email: '', photoUrl: '', lat: '', lng: '' }

interface RepRow {
    id: string
    resort: string
    name: string
    phone?: string
    email?: string
    photoUrl?: string
    lat: number
    lng: number
}

export function AdminRepresentativesPage() {
    const { token } = useAuth()
    const [rows, setRows] = useState<RepRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListRepresentatives(token)
            .then(d => setRows(d as RepRow[]))
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false))
    }, [token])

    useEffect(() => { load() }, [load])

    function startEdit(row: RepRow) {
        setForm({
            resort: row.resort, name: row.name,
            phone: row.phone ?? '', email: row.email ?? '',
            photoUrl: row.photoUrl ?? '',
            lat: String(row.lat), lng: String(row.lng),
        })
        setEditId(row.id); setShowForm(true); setError('')
    }

    function startNew() {
        setForm(EMPTY); setEditId(null); setShowForm(true); setError('')
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!token) return
        setSaving(true); setError('')
        const body = {
            resort: form.resort, name: form.name,
            phone: form.phone || undefined, email: form.email || undefined,
            photoUrl: form.photoUrl || undefined,
            lat: Number(form.lat), lng: Number(form.lng),
        }
        try {
            if (editId) await adminUpdateRepresentative(token, editId, body)
            else await adminCreateRepresentative(token, body)
            setShowForm(false); load()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Грешка')
        } finally { setSaving(false) }
    }

    async function handleDelete(id: string) {
        if (!token || !confirm('Изтриване на представителя?')) return
        await adminDeleteRepresentative(token, id).catch((e: Error) => setError(e.message))
        load()
    }

    const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }))

    return (
        <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>👥 Представители</h1>
                <button className="btn btn-primary" onClick={startNew}>+ Добави представител</button>
            </div>

            {error && <div className="admin-error">⚠️ {error}</div>}

            {showForm && (
                <div className="admin-form-card">
                    <h2 className="admin-form-title">{editId ? 'Редактиране' : 'Нов представител'}</h2>
                    <form onSubmit={handleSave}>
                        <div className="admin-grid-2">
                            <div className="filter-group">
                                <label className="filter-label">Курорт *</label>
                                <input className="filter-input" value={form.resort} onChange={f('resort')} placeholder="Слънчев бряг" required />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Имe *</label>
                                <input className="filter-input" value={form.name} onChange={f('name')} placeholder="Иван Петров" required />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Телефон</label>
                                <input className="filter-input" value={form.phone} onChange={f('phone')} placeholder="+359 888 123 456" />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Email</label>
                                <input className="filter-input" type="email" value={form.email} onChange={f('email')} placeholder="ivan@example.com" />
                            </div>
                            <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="filter-label">URL на снимка</label>
                                <input className="filter-input" value={form.photoUrl} onChange={f('photoUrl')} placeholder="https://..." />
                                <div style={{ marginTop: 6 }}>
                                    <ImageUploader
                                        token={token!}
                                        category="representatives"
                                        label="Качи снимка от диск"
                                        onUploaded={(url: string) => setForm(prev => ({ ...prev, photoUrl: url }))}
                                    />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Latitude *</label>
                                <input className="filter-input" type="number" step="any" value={form.lat} onChange={f('lat')} placeholder="42.6977" required />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Longitude *</label>
                                <input className="filter-input" type="number" step="any" value={form.lng} onChange={f('lng')} placeholder="27.9120" required />
                            </div>
                        </div>
                        {error && <div className="admin-error" style={{ marginTop: 8 }}>⚠️ {error}</div>}
                        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Запазване…' : 'Запази'}</button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Отказ</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="empty-state"><div className="empty-icon">⏳</div></div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr><th>Имe</th><th>Курорт</th><th>Телефон</th><th>Email</th><th>Координати</th><th></th></tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {r.photoUrl
                                                ? <img src={resolvePhotoUrl(r.photoUrl)!} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                                : <div className="rep-avatar-placeholder" style={{ width: 36, height: 36, fontSize: 14 }}>{r.name?.charAt(0)}</div>
                                            }
                                            <strong>{r.name}</strong>
                                        </div>
                                    </td>
                                    <td>{r.resort}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{r.phone ?? '—'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{r.email ?? '—'}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.lat}, {r.lng}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => startEdit(r)}>✏️ Редакция</button>
                                            <button className="btn" style={{ padding: '5px 12px', fontSize: 12, background: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7' }} onClick={() => handleDelete(r.id)}>��️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-text">Няма представители</div></div>}
                </div>
            )}
        </div>
    )
}
