import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListRepresentatives,
    adminCreateRepresentative,
    adminUpdateRepresentative,
    adminDeleteRepresentative,
    adminListResorts,
} from '../../adminApi'
import { ImageUploader } from '../../components/ImageUploader'
import { resolvePhotoUrl, type ResortDto } from '../../api'
import { View, Text, Button, Loader, Avatar, TextField, TextArea, Table, Divider, Grid, Badge, Autocomplete, Dismissible, FormControl, CheckboxGroup, Checkbox } from 'reshaped'
import { useAdminToast } from '../../hooks/useAdminToast'

function emptyForm() {
    return {
        resortIds: [] as number[],
        name: '',
        phone: '',
        whatsapp: '',
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
    whatsapp?: string | null
    email?: string | null
    photoUrl?: string | null
    lat: number
    lng: number
    languages: string[] | null
    hotels: string[] | null
}

const LANG_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'ro', label: 'Română' },
    { value: 'uk', label: 'Українська' },
    { value: 'ru', label: 'Русский' },
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
    const { toastSuccess, toastApiError } = useAdminToast()
    const [rows, setRows] = useState<RepRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(emptyForm)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [resortOptions, setResortOptions] = useState<ResortDto[]>([])
    const [resortQuery, setResortQuery] = useState('')

    useEffect(() => {
        if (!token) return
        adminListResorts(token)
            .then((rows) => setResortOptions(rows.map((r) => ({ id: r.id, name: r.name }))))
            .catch(() => {
                setResortOptions([])
            })
    }, [token])

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListRepresentatives(token)
            .then(d => setRows(d as RepRow[]))
            .catch((e: unknown) => toastApiError(e, 'Неуспешно зареждане'))
            .finally(() => setLoading(false))
    }, [token, toastApiError])



    useEffect(() => { load() }, [load])

    /** GET /resorts + курортите от редактирания ред (ако липсват в списъка). */
    const resortChoices = useMemo(() => {
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
            a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
        )
    }, [resortOptions, showForm, editId, rows])

    const resortAutocompleteItems = useMemo(() => {
        const q = resortQuery.trim().toLowerCase()
        return resortChoices.filter((o) => {
            if (form.resortIds.includes(o.id)) return false
            if (!q) return true
            return o.name.toLowerCase().includes(q)
        })
    }, [resortChoices, form.resortIds, resortQuery])

    function closeForm() {
        setShowForm(false)
        setResortQuery('')
    }

    function startEdit(row: RepRow) {
        setResortQuery('')
        const hotels = row.hotels ?? []
        setForm({
            ...emptyForm(),
            resortIds: row.resorts.map((s) => Number(s.id)).filter((id) => Number.isFinite(id)),
            name: row.name,
            phone: row.phone ?? '', whatsapp: row.whatsapp ?? '', email: row.email ?? '',
            photoUrl: row.photoUrl ?? '',
            lat: String(row.lat), lng: String(row.lng),
            languages: row.languages ?? [],
            hotelsText: hotels.length ? hotels.join('\n') : '',
        })
        setEditId(row.id); setShowForm(true)
    }

    function startNew() {
        setResortQuery('')
        setForm(emptyForm()); setEditId(null); setShowForm(true)
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!token) return
        setSaving(true)
        const body = {
            resortIds: form.resortIds,
            name: form.name,
            phone: form.phone || undefined,
            /** Винаги подаваме стойност при PUT, за да може да се изчисти полето (null). */
            whatsapp: form.whatsapp.trim() || null,
            email: form.email || undefined,
            photoUrl: form.photoUrl || undefined,
            lat: Number(form.lat), lng: Number(form.lng),
            hotels: parseHotelsInput(form.hotelsText),
            languages: form.languages || []
        }
        try {
            if (editId) {
                await adminUpdateRepresentative(token, editId, body)
                toastSuccess('Промените по представителя са запазени.')
            } else {
                await adminCreateRepresentative(token, body)
                toastSuccess('Представителят е добавен.')
            }
            closeForm(); load()
        } catch (e: unknown) {
            toastApiError(e, 'Запазването не бе успешно')
        } finally { setSaving(false) }
    }

    async function handleDelete(id: string) {
        if (!token || !confirm('Изтриване на представителя?')) return
        try {
            await adminDeleteRepresentative(token, id)
            toastSuccess('Представителят е изтрит.')
            load()
        } catch (e: unknown) {
            toastApiError(e, 'Изтриването не бе успешно')
        }
    }

    return (
        <View padding={{ s: 4, m: 8 }} gap={6}>
            <View direction="row" justify="space-between" align="center">
                <Text as="h1" variant="title-5" weight="bold">👥 Представители</Text>
                <Button variant="solid" color="primary" onClick={startNew}>+ Добави представител</Button>
            </View>

            {showForm && (
                <View shadow="raised" padding={6} borderRadius="medium" gap={5}>
                    <Text variant="title-5">{editId ? 'Редактиране на представител' : 'Нов представител'}</Text>
                    <Divider />
                    <form onSubmit={handleSave}>
                        <View gap={4}>
                            <Grid columns={{ s: 1, m: 2 }} gap={4}>
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <FormControl.Label>Курорти</FormControl.Label>
                                    <FormControl.Helper>
                                        Търси по име и избери от списъка; Backspace при празно поле маха последния курорт
                                    </FormControl.Helper>
                                    {resortChoices.length === 0 ? (
                                        <Text variant="body-2" color="neutral-faded">Зареждане на курорти… (ако остава празно, проверете връзката с API)</Text>
                                    ) : (
                                        <View gap={3}>
                                            {form.resortIds.length > 0 && (
                                                <View direction="row" gap={4} wrap align="center">
                                                    {form.resortIds.map((id) => {
                                                        const label = resortChoices.find((o) => o.id === id)?.name ?? `#${id}`
                                                        return (
                                                            <Badge key={id} variant="outline" color="primary" size="large">
                                                                <Dismissible
                                                                    closeAriaLabel={`Премахни курорт ${label}`}
                                                                    onClose={() => setForm((f) => ({
                                                                        ...f,
                                                                        resortIds: f.resortIds.filter((x) => x !== id),
                                                                    }))}
                                                                >
                                                                    <Text variant="body-2" color="primary">{label}</Text>
                                                                </Dismissible>
                                                            </Badge>
                                                        )
                                                    })}
                                                </View>
                                            )}
                                            <Autocomplete
                                                name="resortSearch"
                                                placeholder="Добави курорт…"
                                                value={resortQuery}
                                                onChange={({ value }) => setResortQuery(value)}
                                                onItemSelect={({ value }) => {
                                                    const id = Number(value)
                                                    if (!Number.isFinite(id)) return
                                                    setForm((f) => ({
                                                        ...f,
                                                        resortIds: f.resortIds.includes(id) ? f.resortIds : [...f.resortIds, id],
                                                    }))
                                                    setResortQuery('')
                                                }}
                                                onBackspace={() => {
                                                    if (resortQuery !== '') return
                                                    setForm((f) => ({ ...f, resortIds: f.resortIds.slice(0, -1) }))
                                                }}
                                            >
                                                {resortAutocompleteItems.map((opt) => (
                                                    <Autocomplete.Item key={opt.id} value={String(opt.id)}>
                                                        {opt.name}
                                                    </Autocomplete.Item>
                                                ))}
                                            </Autocomplete>
                                        </View>
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
                                    <Text variant="caption-1" weight="bold">WhatsApp</Text>
                                    <Text variant="caption-1" color="neutral-faded">Номер за чат в приложението (международен формат, напр. +359888123456)</Text>
                                    <TextField name="whatsapp" placeholder="+359888123456" value={form.whatsapp} onChange={({ value }) => setForm(p => ({ ...p, whatsapp: value }))} />
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
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <FormControl.Label>Езици</FormControl.Label>
                                    <FormControl.Helper>Може да избереш няколко езика</FormControl.Helper>
                                    <CheckboxGroup
                                        name="languages"
                                        value={form.languages}
                                        onChange={({ value }) => setForm((p) => ({ ...p, languages: value }))}
                                    >
                                        <View direction="row" gap={4} wrap>
                                            {LANG_OPTIONS.map((opt) => (
                                                <Checkbox key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </Checkbox>
                                            ))}
                                        </View>
                                    </CheckboxGroup>
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
                                <Button variant="outline" color="neutral" type="button" onClick={closeForm}>Отказ</Button>
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
                            <Table.Heading>WhatsApp</Table.Heading>
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
                                <Table.Cell><Text color="neutral-faded">{r.whatsapp ?? '—'}</Text></Table.Cell>
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
