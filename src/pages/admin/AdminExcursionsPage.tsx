import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListExcursions, adminCreateExcursion,
    adminUpdateExcursion, adminDeleteExcursion,
} from '../../adminApi'
import { ImageUploader } from '../../components/ImageUploader'

const TYPES = ['Културна', 'Природна', 'Планинска', 'Развлекателна']
const EMPTY = { type: 'Културна', from: '', destination: '', description: '', priceBgn: '', date: '', photos: '' }

interface ExcursionRow {
    id: string
    type: string
    from: string
    destination: string
    description: string
    priceBgn: number
    date: string
    photos: { url: string; caption?: string; order?: number }[]
}

export function AdminExcursionsPage() {
    const { token } = useAuth()
    const [rows, setRows] = useState<ExcursionRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListExcursions(token)
            .then(d => setRows(d as ExcursionRow[]))
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false))
    }, [token])

    useEffect(() => { load() }, [load])

    function startEdit(row: ExcursionRow) {
        setForm({
            type: row.type,
            from: row.from,
            destination: row.destination,
            description: row.description,
            priceBgn: String(row.priceBgn),
            date: row.date?.slice(0, 10) ?? '',
            photos: (row.photos ?? []).map(p => p.url).join('\n'),
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
        const photoUrls = form.photos.split('\n').map(s => s.trim()).filter(Boolean)
        const body = {
            type: form.type, from: form.from, destination: form.destination,
            description: form.description, priceBgn: Number(form.priceBgn),
            date: form.date,
            photos: photoUrls.map((url, i) => ({ url, order: i })),
        }
        try {
            if (editId) await adminUpdateExcursion(token, editId, body)
            else await adminCreateExcursion(token, body)
            setShowForm(false); load()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Грешка')
        } finally { setSaving(false) }
    }

    async function handleDelete(id: string) {
        if (!token || !confirm('Изтриване на екскурзията?')) return
        await adminDeleteExcursion(token, id).catch((e: Error) => setError(e.message))
        load()
    }

    return (
        <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>🗺️ Екскурзии</h1>
                <button className="btn btn-primary" onClick={startNew}>+ Добави екскурзия</button>
            </div>

            {error && <div className="admin-error">⚠️ {error}</div>}

            {showForm && (
                <div className="admin-form-card">
                    <h2 className="admin-form-title">{editId ? 'Редактиране' : 'Нова екскурзия'}</h2>
                    <form onSubmit={handleSave}>
                        <div className="admin-grid-2">
                            <div className="filter-group">
                                <label className="filter-label">Тип *</label>
                                <select className="filter-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} required>
                                    {TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Тръгване от *</label>
                                <input className="filter-input" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} placeholder="Слънчев бряг" required />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Дестинация *</label>
                                <input className="filter-input" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="Несебър" required />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Цена (лв.) *</label>
                                <input className="filter-input" type="number" min="0" step="0.01" value={form.priceBgn} onChange={e => setForm(f => ({ ...f, priceBgn: e.target.value }))} required />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Дата *</label>
                                <input className="filter-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                            </div>
                        </div>
                        <div className="filter-group" style={{ marginTop: 12 }}>
                            <label className="filter-label">Описание *</label>
                            <textarea className="filter-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} required />
                        </div>
                        <div className="filter-group" style={{ marginTop: 12 }}>
                            <label className="filter-label">Снимки (по един URL на ред)</label>
                            <textarea className="filter-input" rows={3} value={form.photos} onChange={e => setForm(f => ({ ...f, photos: e.target.value }))} placeholder="https://..." style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
                            <div style={{ marginTop: 6 }}>
                                <ImageUploader
                                    token={token!}
                                    category="excursions"
                                    label="Качи снимка от диск"
                                    onUploaded={(url: string) => setForm(f => ({
                                        ...f,
                                        photos: f.photos ? f.photos + '\n' + url : url,
                                    }))}
                                />
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
                            <tr><th>Дестинация</th><th>Тип</th><th>От</th><th>Цена</th><th>Дата</th><th>Снимки</th><th></th></tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.id}>
                                    <td><strong>{r.destination}</strong></td>
                                    <td><span className="tour-card-type" style={{ fontSize: 11 }}>{r.type}</span></td>
                                    <td>{r.from}</td>
                                    <td>{r.priceBgn} лв.</td>
                                    <td>{r.date?.slice(0, 10)}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{r.photos?.length ?? 0}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => startEdit(r)}>✏️ Редакция</button>
                                            <button className="btn" style={{ padding: '5px 12px', fontSize: 12, background: '#fff5f5', color: '#c53030', border: '1px solid #fed7d7' }} onClick={() => handleDelete(r.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rows.length === 0 && <div className="empty-state"><div className="empty-icon">🗺️</div><div className="empty-text">Няма екскурзии</div></div>}
                </div>
            )}
        </div>
    )
}
