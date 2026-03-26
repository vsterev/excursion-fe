import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListUsefulInfo, adminCreateUsefulInfo,
    adminUpdateUsefulInfo, adminDeleteUsefulInfo,
} from '../../adminApi'
import { ImageUploader } from '../../components/ImageUploader'

const EMPTY = { resort: '', category: '', title: '', content: '', url: '', urlLabel: '' }

interface InfoRow {
    id: string
    resort: string
    category: string
    title: string
    content: string
    url?: string
    urlLabel?: string
}

export function AdminUsefulInfoPage() {
    const { token } = useAuth()
    const [rows, setRows] = useState<InfoRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListUsefulInfo(token)
            .then(d => setRows(d as InfoRow[]))
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false))
    }, [token])

    useEffect(() => { load() }, [load])

    function startEdit(row: InfoRow) {
        setForm({
            resort: row.resort, category: row.category,
            title: row.title, content: row.content,
            url: row.url ?? '', urlLabel: row.urlLabel ?? '',
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
            resort: form.resort, category: form.category,
            title: form.title, content: form.content,
            url: form.url || undefined,
            urlLabel: form.urlLabel || undefined,
        }
        try {
            if (editId) await adminUpdateUsefulInfo(token, editId, body)
            else await adminCreateUsefulInfo(token, body)
            setShowForm(false); load()
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Грешка')
        } finally { setSaving(false) }
    }

    async function handleDelete(id: string) {
        if (!token || !confirm('Изтриване на записа?')) return
        await adminDeleteUsefulInfo(token, id).catch((e: Error) => setError(e.message))
        load()
    }

    const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }))

    return (
        <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>ℹ️ Полезна информация</h1>
                <button className="btn btn-primary" onClick={startNew}>+ Добави запис</button>
            </div>

            {error && <div className="admin-error">⚠️ {error}</div>}

            {showForm && (
                <div className="admin-form-card">
                    <h2 className="admin-form-title">{editId ? 'Редактиране' : 'Нов запис'}</h2>
                    <form onSubmit={handleSave}>
                        <div className="admin-grid-2">
                            <div className="filter-group">
                                <label className="filter-label">Курорт *</label>
                                <input className="filter-input" value={form.resort} onChange={f('resort')} placeholder="Слънчев бряг" required />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Категория *</label>
                                <input className="filter-input" value={form.category} onChange={f('category')} placeholder="Болница, Аптека…" required />
                            </div>
                            <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="filter-label">Заглавие *</label>
                                <input className="filter-input" value={form.title} onChange={f('title')} placeholder="Спешна помощ" required />
                            </div>
                            <div className="filter-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="filter-label">Съдържание *</label>
                                <textarea className="filter-input" value={form.content} onChange={f('content')} placeholder="Описание, адрес, телефон…" rows={3} required style={{ resize: 'vertical' }} />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">URL (опционален)</label>
                                <input className="filter-input" value={form.url} onChange={f('url')} placeholder="https://..." />
                                <div style={{ marginTop: 6 }}>
                                    <ImageUploader
                                        token={token!}
                                        category="homepage"
                                        label="Качи изображение от диск"
                                        onUploaded={(url: string) => setForm(prev => ({ ...prev, url }))}
                                    />
                                </div>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Текст на линка</label>
                                <input className="filter-input" value={form.urlLabel} onChange={f('urlLabel')} placeholder="Посети сайта" />
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
                            <tr><th>Заглавие</th><th>Категория</th><th>Курорт</th><th>Съдържание</th><th>URL</th><th></th></tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.id}>
                                    <td><strong>{r.title}</strong></td>
                                    <td><span style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{r.category}</span></td>
                                    <td>{r.resort}</td>
                                    <td style={{ color: 'var(--text-muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content}</td>
                                    <td>
                                        {r.url
                                            ? <a href={r.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: 12 }}>{r.urlLabel || 'Линк'}</a>
                                            : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                                        }
                                    </td>
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
                    {rows.length === 0 && <div className="empty-state"><div className="empty-icon">ℹ️</div><div className="empty-text">Няма записи</div></div>}
                </div>
            )}
        </div>
    )
}
