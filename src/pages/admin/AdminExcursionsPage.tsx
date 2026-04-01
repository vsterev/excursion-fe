import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListExcursions, adminCreateExcursion,
    adminUpdateExcursion, adminDeleteExcursion,
} from '../../adminApi'
import { fetchResorts, type ResortDto } from '../../api'
import { ImageUploader } from '../../components/ImageUploader'
import { View, Text, Button, Alert, Loader, Badge, Select, TextField, TextArea, Table, Divider, Grid } from 'reshaped'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const QUILL_MODULES = {
    toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
    ],
}

const TYPES = ['Културна', 'Природна', 'Планинска', 'Развлекателна']

function emptyForm() {
    return {
        type: 'Културна',
        resortIds: [] as number[],
        destination: '',
        description: '',
        price: '',
        photos: '',
    }
}

interface ExcursionRow {
    id: string
    type: string
    destination: string
    description: string
    price: number | null
    departures: { id: number; name: string }[]
    photos: { url: string; caption?: string; order?: number }[]
}

export function AdminExcursionsPage() {
    const { token } = useAuth()
    const [rows, setRows] = useState<ExcursionRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(emptyForm)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [resortOptions, setResortOptions] = useState<ResortDto[]>([])

    useEffect(() => {
        fetchResorts().then(setResortOptions).catch(() => setResortOptions([]))
    }, [])

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListExcursions(token)
            .then(d => setRows(d as ExcursionRow[]))
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false))
    }, [token])

    useEffect(() => { load() }, [load])

    const resortChoices = useMemo(() => {
        const map = new Map<number, ResortDto>()
        for (const o of resortOptions) map.set(Number(o.id), { id: Number(o.id), name: o.name })
        if (showForm && editId) {
            const row = rows.find((r) => r.id === editId)
            for (const s of row?.departures ?? []) {
                const id = Number(s.id)
                if (Number.isFinite(id) && !map.has(id)) map.set(id, { id, name: s.name })
            }
        }
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'bg', { sensitivity: 'base' }))
    }, [resortOptions, showForm, editId, rows])

    function startEdit(row: ExcursionRow) {
        setForm({
            ...emptyForm(),
            type: row.type,
            resortIds: (row.departures ?? []).map((s) => Number(s.id)).filter(Number.isFinite),
            destination: row.destination,
            description: row.description,
            price: row.price != null ? String(row.price) : '',
            photos: (row.photos ?? []).map(p => p.url).join('\n'),
        })
        setEditId(row.id); setShowForm(true); setError('')
    }

    function startNew() {
        setForm(emptyForm()); setEditId(null); setShowForm(true); setError('')
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!token) return
        setSaving(true); setError('')
        const photoUrls = form.photos.split('\n').map(s => s.trim()).filter(Boolean)
        const parsedPrice = form.price.trim() !== '' ? parseFloat(form.price) : null
        const body = {
            type: form.type,
            resortIds: form.resortIds,
            destination: form.destination,
            description: form.description,
            price: parsedPrice != null && !isNaN(parsedPrice) ? parsedPrice : null,
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
                                    <Text variant="caption-1" weight="bold">Дестинация *</Text>
                                    <TextField name="destination" placeholder="Несебър" value={form.destination} onChange={({ value }) => setForm(f => ({ ...f, destination: value }))} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Цена (лв.)</Text>
                                    <TextField name="price" placeholder="49.99" value={form.price} onChange={({ value }) => setForm(f => ({ ...f, price: value }))} />
                                </View>
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <Text variant="caption-1" weight="bold">Тръгване от (курорти)</Text>
                                    <Text variant="caption-1" color="neutral-faded">Задръж Ctrl (Windows/Linux) или ⌘ (Mac) за няколко курорта</Text>
                                    {resortChoices.length === 0 ? (
                                        <Text variant="body-2" color="neutral-faded">Зареждане на курорти…</Text>
                                    ) : (
                                        <select
                                            key={editId ?? 'new'}
                                            multiple
                                            name="resortIds"
                                            value={form.resortIds.map(String)}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions).map(o => Number(o.value))
                                                setForm(f => ({ ...f, resortIds: selected }))
                                            }}
                                            style={{ minHeight: 120, width: '100%' }}
                                        >
                                            {resortChoices.map(opt => (
                                                <option key={opt.id} value={String(opt.id)}>{opt.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </View>
                            </Grid>
                            <View gap={1}>
                                <Text variant="caption-1" weight="bold">Описание *</Text>
                                <ReactQuill
                                    theme="snow"
                                    value={form.description}
                                    onChange={(value) => setForm(f => ({ ...f, description: value }))}
                                    modules={QUILL_MODULES}
                                    placeholder="Описание на екскурзията…"
                                    style={{ minHeight: 200 }}
                                />
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
                            <Table.Heading>Тръгване от</Table.Heading>
                            <Table.Heading>Цена</Table.Heading>
                            <Table.Heading>Снимки</Table.Heading>
                            <Table.Heading></Table.Heading>
                        </Table.Row>
                        {rows.map(r => (
                            <Table.Row key={r.id}>
                                <Table.Cell><Text weight="bold">{r.destination}</Text></Table.Cell>
                                <Table.Cell><Badge color="primary">{r.type}</Badge></Table.Cell>
                                <Table.Cell>
                                    <View direction="row" gap={1} wrap>
                                        {r.departures?.length
                                            ? r.departures.map(d => <Badge key={d.id} color="neutral">{d.name}</Badge>)
                                            : <Text color="neutral-faded">—</Text>
                                        }
                                    </View>
                                </Table.Cell>
                                <Table.Cell>
                                    {r.price != null
                                        ? <Badge color="positive">{r.price} лв.</Badge>
                                        : <Text color="neutral-faded">—</Text>
                                    }
                                </Table.Cell>
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
