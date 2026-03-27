import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListExcursions, adminCreateExcursion,
    adminUpdateExcursion, adminDeleteExcursion,
} from '../../adminApi'
import { ImageUploader } from '../../components/ImageUploader'
import { View, Text, Button, Alert, Loader, Badge, Select, TextField, TextArea, Table, Divider, Grid } from 'reshaped'

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
        <View padding={{ s: 4, m: 8 }} gap={6}>
            <View direction="row" justify="space-between" align="center">
                <Text as="h1" variant="title-1" weight="bold">🗺️ Екскурзии</Text>
                <Button variant="solid" color="primary" onClick={startNew}>+ Добави екскурзия</Button>
            </View>

            {error && <Alert color="critical" title="Грешка">{error}</Alert>}

            {showForm && (
                <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="white" gap={5}>
                    <Text variant="title-3" weight="bold">{editId ? 'Редактиране на екскурзия' : 'Нова екскурзия'}</Text>
                    <Divider />
                    <form onSubmit={handleSave}>
                        <View gap={4}>
                            <Grid columns={{ s: 1, m: 2 }} gap={4}>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Тип *</Text>
                                    <Select name="type" value={form.type} onChange={({ value }) => setForm(f => ({ ...f, type: value }))}>
                                        {TYPES.map(t => <Select.Option key={t} value={t}>{t}</Select.Option>)}
                                    </Select>
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Тръгване от *</Text>
                                    <TextField name="from" placeholder="Слънчев бряг" value={form.from} onChange={({ value }) => setForm(f => ({ ...f, from: value }))} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Дестинация *</Text>
                                    <TextField name="destination" placeholder="Несебър" value={form.destination} onChange={({ value }) => setForm(f => ({ ...f, destination: value }))} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Цена (лв.) *</Text>
                                    <TextField name="priceBgn" placeholder="0.00" value={form.priceBgn} onChange={({ value }) => setForm(f => ({ ...f, priceBgn: value }))} inputAttributes={{ type: 'number', min: '0', step: '0.01' }} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Дата *</Text>
                                    <TextField name="date" value={form.date} onChange={({ value }) => setForm(f => ({ ...f, date: value }))} inputAttributes={{ type: 'date' }} />
                                </View>
                            </Grid>
                            <View gap={1}>
                                <Text variant="caption-1" weight="bold">Описание *</Text>
                                <TextArea name="description" placeholder="Описание на екскурзията…" value={form.description} onChange={({ value }) => setForm(f => ({ ...f, description: value }))} />
                            </View>
                            <View gap={1}>
                                <Text variant="caption-1" weight="bold">Снимки (по един URL на ред)</Text>
                                <TextArea name="photos" placeholder="https://..." value={form.photos} onChange={({ value }) => setForm(f => ({ ...f, photos: value }))} />
                                <View paddingTop={2}>
                                    <ImageUploader
                                        token={token!}
                                        category="excursions"
                                        label="Качи снимка от диск"
                                        onUploaded={(url: string) => setForm(f => ({
                                            ...f,
                                            photos: f.photos ? f.photos + '\n' + url : url,
                                        }))}
                                    />
                                </View>
                            </View>
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
                    <Text variant="title-1">🗺️</Text>
                    <Text color="neutral-faded">Няма екскурзии</Text>
                </View>
            ) : (
                <View shadow="raised" borderRadius="medium" backgroundColor="white" overflow="hidden">
                    <Table>
                        <Table.Row>
                            <Table.Heading>Дестинация</Table.Heading>
                            <Table.Heading>Тип</Table.Heading>
                            <Table.Heading>От</Table.Heading>
                            <Table.Heading>Цена</Table.Heading>
                            <Table.Heading>Дата</Table.Heading>
                            <Table.Heading>Снимки</Table.Heading>
                            <Table.Heading></Table.Heading>
                        </Table.Row>
                        {rows.map(r => (
                            <Table.Row key={r.id}>
                                <Table.Cell><Text weight="bold">{r.destination}</Text></Table.Cell>
                                <Table.Cell><Badge color="primary">{r.type}</Badge></Table.Cell>
                                <Table.Cell>{r.from}</Table.Cell>
                                <Table.Cell>{r.priceBgn} лв.</Table.Cell>
                                <Table.Cell>{r.date?.slice(0, 10)}</Table.Cell>
                                <Table.Cell><Text color="neutral-faded">{r.photos?.length ?? 0}</Text></Table.Cell>
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
