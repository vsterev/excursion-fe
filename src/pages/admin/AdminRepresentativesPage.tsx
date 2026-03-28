import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListRepresentatives, adminCreateRepresentative,
    adminUpdateRepresentative, adminDeleteRepresentative,
} from '../../adminApi'
import { ImageUploader } from '../../components/ImageUploader'
import { resolvePhotoUrl } from '../../api'
import { View, Text, Button, Alert, Loader, Avatar, TextField, Table, Divider, Grid } from 'reshaped'

const EMPTY = {
    resort: '',
    name: '',
    phone: '',
    email: '',
    photoUrl: '',
    lat: '',
    lng: '',
    hotels: [] as string[],
    languages: [] as string[]
}

interface RepRow {
    id: string
    resort: string
    name: string
    phone?: string
    email?: string
    photoUrl?: string
    lat: number
    lng: number
    languages: string[]
    hotels: string[]
}

const LANG_OPTIONS = [
    { value: 'ru', label: 'Руски' },
    { value: 'cz', label: 'Чешки' },
    { value: 'pl', label: 'Полски' },
    { value: 'en', label: 'Английски' },
    { value: 'ro', label: 'Румънски' },
    { value: 'de', label: 'Немски' },
]

export function AdminRepresentativesPage() {
    const { token } = useAuth()
    const [rows, setRows] = useState<RepRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState<typeof EMPTY>(EMPTY)
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
            languages: row.languages ?? [],
            hotels: row.hotels ?? [],
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
            hotels: form.hotels || [],
            languages: form.languages || []
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

    return (
        <View padding={{ s: 4, m: 8 }} gap={6}>
            <View direction="row" justify="space-between" align="center">
                <Text as="h1" variant="title-1" weight="bold">👥 Представители</Text>
                <Button variant="solid" color="primary" onClick={startNew}>+ Добави представител</Button>
            </View>

            {error && <Alert color="critical" title="Грешка">{error}</Alert>}

            {showForm && (
                <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="white" gap={5}>
                    <Text variant="title-3" weight="bold">{editId ? 'Редактиране на представител' : 'Нов представител'}</Text>
                    <Divider />
                    <form onSubmit={handleSave}>
                        <View gap={4}>
                            <Grid columns={{ s: 1, m: 2 }} gap={4}>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Курорт *</Text>
                                    <TextField name="resort" placeholder="Слънчев бряг" value={form.resort} onChange={({ value }) => setForm(p => ({ ...p, resort: value }))} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Имe *</Text>
                                    <TextField name="name" placeholder="Иван Петров" value={form.name} onChange={({ value }) => setForm(p => ({ ...p, name: value }))} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Телефон</Text>
                                    <TextField name="phone" placeholder="+359 888 123 456" value={form.phone} onChange={({ value }) => setForm(p => ({ ...p, phone: value }))} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Email</Text>
                                    <TextField name="email" placeholder="ivan@example.com" value={form.email} onChange={({ value }) => setForm(p => ({ ...p, email: value }))} inputAttributes={{ type: 'email' }} />
                                </View>
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <Text variant="caption-1" weight="bold">URL на снимка</Text>
                                    <TextField name="photoUrl" placeholder="https://..." value={form.photoUrl} onChange={({ value }) => setForm(p => ({ ...p, photoUrl: value }))} />
                                    <View paddingTop={2}>
                                        <ImageUploader
                                            token={token!}
                                            category="representatives"
                                            label="Качи снимка от диск"
                                            onUploaded={(url: string) => setForm(prev => ({ ...prev, photoUrl: url }))}
                                        />
                                    </View>
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Latitude *</Text>
                                    <TextField name="lat" placeholder="42.6977" value={form.lat} onChange={({ value }) => setForm(p => ({ ...p, lat: value }))} inputAttributes={{ type: 'number', step: 'any' }} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Longitude *</Text>
                                    <TextField name="lng" placeholder="27.9120" value={form.lng} onChange={({ value }) => setForm(p => ({ ...p, lng: value }))} inputAttributes={{ type: 'number', step: 'any' }} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Езици</Text>
                                    <select
                                        multiple
                                        name='languages'
                                        value={form.languages}
                                        onChange={e => {
                                            const selected = Array.from(e.target.selectedOptions).map(o => o.value)
                                            setForm(p => ({ ...p, languages: selected }))
                                        }}
                                        style={{ minHeight: 80 }}
                                    >
                                        {LANG_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </View>
                            </Grid>
                            <View direction="row" gap={3}>
                                <Button type="submit" variant="solid" color="primary" disabled={saving}>
                                    {saving ? 'Запазване…' : 'Запази'}
                                </Button>
                                <Button variant="outline" color="neutral" onClick={() => setShowForm(false)}>Отказ</Button>
                            </View>
                        </View>
                    </form>
                </View>
            )}

            {loading ? (
                <View align="center" padding={16}><Loader size="large" /></View>
            ) : rows.length === 0 ? (
                <View align="center" padding={16} gap={3}>
                    <Text variant="title-1">👥</Text>
                    <Text color="neutral-faded">Няма представители</Text>
                </View>
            ) : (
                <View shadow="raised" borderRadius="medium" backgroundColor="white" overflow="hidden">
                    <Table>
                        <Table.Row>
                            <Table.Heading>Имe</Table.Heading>
                            <Table.Heading>Курорт</Table.Heading>
                            <Table.Heading>Телефон</Table.Heading>
                            <Table.Heading>Email</Table.Heading>
                            <Table.Heading>Координати</Table.Heading>
                            <Table.Heading></Table.Heading>
                        </Table.Row>
                        {rows.map(r => (
                            <Table.Row key={r.id}>
                                <Table.Cell>
                                    <View direction="row" align="center" gap={3}>
                                        <Avatar
                                            src={resolvePhotoUrl(r.photoUrl) ?? undefined}
                                            initials={r.name?.charAt(0)}
                                            size={8}
                                        />
                                        <Text weight="bold">{r.name}</Text>
                                    </View>
                                </Table.Cell>
                                <Table.Cell>{r.resort}</Table.Cell>
                                <Table.Cell><Text color="neutral-faded">{r.phone ?? '—'}</Text></Table.Cell>
                                <Table.Cell><Text color="neutral-faded">{r.email ?? '—'}</Text></Table.Cell>
                                <Table.Cell><Text variant="caption-1" color="neutral-faded">{r.lat}, {r.lng}</Text></Table.Cell>
                                <Table.Cell>
                                    <View direction="row" gap={2}>
                                        <Button variant="outline" color="neutral" size="small" onClick={() => startEdit(r)}>✏️ Редакция</Button>
                                        <Button variant="outline" color="critical" size="small" onClick={() => handleDelete(r.id)}>🗑️</Button>
                                    </View>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table>
                </View>
            )}
        </View>
    )
}
