import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListRepresentatives, adminCreateRepresentative,
    adminUpdateRepresentative, adminDeleteRepresentative,
} from '../../adminApi'
import { ImageUploader } from '../../components/ImageUploader'
import { resolvePhotoUrl, fetchResorts, type ResortDto } from '../../api'
import { View, Text, Button, Alert, Loader, Avatar, TextField, TextArea, Table, Divider, Grid } from 'reshaped'

function emptyForm() {
    return {
        resortIds: [] as number[],
        name: '',
        phone: '',
        email: '',
        photoUrl: '',
        lat: '',
        lng: '',
        /** Суров текст в полето — парсира се при „Запази“, за да не „изяжда“ запетайте докато пишете */
        hotelsText: '',
        languages: [] as string[],
    }
}

interface RepRow {
    id: string
    resorts: { id: number; name: string }[]
    name: string
    phone?: string | null
    email?: string | null
    photoUrl?: string | null
    lat: number
    lng: number
    languages: string[] | null
    hotels: string[] | null
}

const LANG_OPTIONS = [
    { value: 'ru', label: 'Руски' },
    { value: 'cz', label: 'Чешки' },
    { value: 'pl', label: 'Полски' },
    { value: 'en', label: 'Английски' },
    { value: 'ro', label: 'Румънски' },
    { value: 'de', label: 'Немски' },
]

/** Ако има нов ред — всеки ред е хотел (позволява запетая в името). Иначе — разделяне по запетая. */
function parseHotelsInput(s: string): string[] {
    const t = s.trim()
    if (!t) return []
    if (/\r?\n/.test(t)) {
        return t.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    }
    return t.split(',').map((x) => x.trim()).filter(Boolean)
}

export function AdminRepresentativesPage() {
    const { token } = useAuth()
    const [rows, setRows] = useState<RepRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(emptyForm)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [resortOptions, setResortOptions] = useState<ResortDto[]>([])

    useEffect(() => {
        fetchResorts().then(setResortOptions).catch(() => { setResortOptions([]) })
    }, [])

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListRepresentatives(token)
            .then(d => setRows(d as RepRow[]))
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false))
    }, [token])



    useEffect(() => { load() }, [load])

    /** Всички опции за селекта: GET /resorts + курортите от редактирания ред (ако липсват в списъка или id са string от JSON). */
    const resortChoicesForSelect = useMemo(() => {
        const map = new Map<number, ResortDto>()
        for (const o of resortOptions) {
            map.set(Number(o.id), { id: Number(o.id), name: o.name })
        }
        if (showForm && editId) {
            const row = rows.find((r) => r.id === editId)
            for (const s of row?.resorts ?? []) {
                const id = Number(s.id)
                if (!Number.isFinite(id)) continue
                if (!map.has(id)) {
                    map.set(id, { id, name: s.name })
                }
            }
        }
        return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name, 'bg', { sensitivity: 'base' }),
        )
    }, [resortOptions, showForm, editId, rows])

    function startEdit(row: RepRow) {
        const hotels = row.hotels ?? []
        setForm({
            ...emptyForm(),
            resortIds: row.resorts.map((s) => Number(s.id)).filter((id) => Number.isFinite(id)),
            name: row.name,
            phone: row.phone ?? '', email: row.email ?? '',
            photoUrl: row.photoUrl ?? '',
            lat: String(row.lat), lng: String(row.lng),
            languages: row.languages ?? [],
            hotelsText: hotels.length ? hotels.join('\n') : '',
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
        const body = {
            resortIds: form.resortIds,
            name: form.name,
            phone: form.phone || undefined, email: form.email || undefined,
            photoUrl: form.photoUrl || undefined,
            lat: Number(form.lat), lng: Number(form.lng),
            hotels: parseHotelsInput(form.hotelsText),
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
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <Text variant="caption-1" weight="bold">Курорти</Text>
                                    <Text variant="caption-1" color="neutral-faded">Множествен избор — задръж Ctrl (Windows/Linux) или ⌘ (Mac) за няколко курорта</Text>
                                    {resortChoicesForSelect.length === 0 ? (
                                        <Text variant="body-2" color="neutral-faded">Зареждане на курорти… (ако остава празно, проверете връзката с API)</Text>
                                    ) : (
                                        <select
                                            key={editId ?? 'new'}
                                            multiple
                                            name="resortIds"
                                            value={form.resortIds.map((id) => String(id))}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions).map((o) => Number(o.value))
                                                setForm((p) => ({ ...p, resortIds: selected }))
                                            }}
                                            style={{ minHeight: 120, width: '100%' }}
                                        >
                                            {resortChoicesForSelect.map((opt) => (
                                                <option key={opt.id} value={String(opt.id)}>{opt.name}</option>
                                            ))}
                                        </select>
                                    )}
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
                                        key={`lang-${editId ?? 'new'}`}
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
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <Text variant="caption-1" weight="bold">Хотели</Text>
                                    <Text variant="caption-1" color="neutral-faded">
                                        На един ред — разделени със запетая; или по един хотел на ред (за име със запетая ползвайте нов ред).
                                    </Text>
                                    <TextArea
                                        name="hotels"
                                        placeholder="Grand Hotel, Marina Palace — или по един хотел на ред"
                                        value={form.hotelsText}
                                        onChange={({ value }) => setForm((p) => ({ ...p, hotelsText: value }))}
                                        inputAttributes={{ rows: 4 }}
                                    />
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
                            <Table.Heading>Курорти</Table.Heading>
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
                                <Table.Cell>
                                    <Text variant="body-2">{r.resorts?.length ? r.resorts.map((s) => s.name).join(', ') : '—'}</Text>
                                </Table.Cell>
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
