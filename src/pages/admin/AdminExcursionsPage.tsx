import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListExcursions,
    adminCreateExcursion,
    adminUpdateExcursion,
    adminDeleteExcursion,
    adminListResorts,
    adminReorderExcursions,
} from '../../adminApi'
import { type ResortDto } from '../../api'
import { normalizeQuillHtmlNbsp } from '../../richTextNormalize'
import { ImageUploader } from '../../components/ImageUploader'
import { AdminGalleryPhotosField } from '../../components/AdminGalleryPhotosField'
import { GripVertical } from 'lucide-react'
import { View, Text, Button, Loader, Badge, TextField, Table, Divider, Grid, FormControl, Autocomplete, Dismissible } from 'reshaped'
import { useAdminToast } from '../../hooks/useAdminToast'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { ADMIN_QUILL_MODULES } from '../../adminQuillModules'

function emptyForm() {
    return {
        resortIds: [] as number[],
        destination: '',
        description: '',
        price: '',
        photoUrls: [] as string[],
    }
}

interface ExcursionRow {
    id: string
    destination: string
    description: string
    price: number | null
    departures: { id: number; name: string }[]
    photos: { url: string; caption?: string; order?: number }[]
}

export function AdminExcursionsPage() {
    const { token } = useAuth()
    const { toastSuccess, toastApiError } = useAdminToast()
    const [rows, setRows] = useState<ExcursionRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(emptyForm)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [resortOptions, setResortOptions] = useState<ResortDto[]>([])
    const [resortQuery, setResortQuery] = useState('')
    const [reorderMode, setReorderMode] = useState(false)
    const [reorderIds, setReorderIds] = useState<string[]>([])
    const [reorderSaving, setReorderSaving] = useState(false)
    const [reorderDragging, setReorderDragging] = useState<number | null>(null)
    const [reorderDragOver, setReorderDragOver] = useState<number | null>(null)
    const reorderDragRef = useRef<number | null>(null)

    useEffect(() => {
        if (!token) return
        adminListResorts(token)
            .then((rows) => setResortOptions(rows.map((r) => ({ id: r.id, name: r.name }))))
            .catch(() => setResortOptions([]))
    }, [token])


    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListExcursions(token)
            .then(d => setRows(d as ExcursionRow[]))
            .catch((e: unknown) => toastApiError(e, 'Неуспешно зареждане'))
            .finally(() => setLoading(false))
    }, [token, toastApiError])

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
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
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

    function openReorderMode() {
        setReorderIds(rows.map((r) => r.id))
        setReorderMode(true)
        setShowForm(false)
    }

    function closeReorderMode() {
        setReorderMode(false)
        setReorderIds([])
    }

    async function saveReorder() {
        if (!token) return
        setReorderSaving(true)
        try {
            await adminReorderExcursions(token, reorderIds)
            toastSuccess('Подредбата е запазена.')
            closeReorderMode()
            load()
        } catch (e: unknown) {
            toastApiError(e, 'Неуспешно запазване на подредбата')
        } finally {
            setReorderSaving(false)
        }
    }

    function reorderDragStart(index: number) {
        reorderDragRef.current = index
        setReorderDragging(index)
    }

    function handleReorderDragOver(e: React.DragEvent, index: number) {
        e.preventDefault()
        setReorderDragOver(index)
    }

    function reorderDrop(targetIndex: number) {
        const from = reorderDragRef.current
        setReorderDragging(null)
        setReorderDragOver(null)
        reorderDragRef.current = null
        if (from === null || from === targetIndex) return
        const next = [...reorderIds]
        const [moved] = next.splice(from, 1)
        next.splice(targetIndex, 0, moved)
        setReorderIds(next)
    }

    function reorderDragEnd() {
        setReorderDragging(null)
        setReorderDragOver(null)
        reorderDragRef.current = null
    }

    function reorderMoveUp(index: number) {
        if (index === 0) return
        const next = [...reorderIds]
        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
        setReorderIds(next)
    }

    function reorderMoveDown(index: number) {
        if (index === reorderIds.length - 1) return
        const next = [...reorderIds]
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
        setReorderIds(next)
    }

    function startEdit(row: ExcursionRow) {
        setResortQuery('')
        setForm({
            ...emptyForm(),
            resortIds: (row.departures ?? []).map((s) => Number(s.id)).filter(Number.isFinite),
            destination: row.destination,
            description: normalizeQuillHtmlNbsp(row.description),
            price: row.price != null ? String(row.price) : '',
            photoUrls: (row.photos ?? []).map((p) => p.url),
        })
        setEditId(row.id); setShowForm(true)
    }

    function startNew() {
        setResortQuery('')
        setForm(emptyForm()); setEditId(null); setShowForm(true)
    }

    async function handleSave() {
        if (!token) return
        setSaving(true)
        const photoUrls = form.photoUrls.map((s) => s.trim()).filter(Boolean)
        const rawPrice = form.price.trim()
        const parsed = rawPrice === '' ? null : parseFloat(rawPrice.replace(',', '.'))
        const price =
            parsed != null && !Number.isNaN(parsed) && Number.isFinite(parsed) ? parsed : null

        const body = {
            resortIds: form.resortIds,
            destination: form.destination,
            description: normalizeQuillHtmlNbsp(form.description),
            price,
            photos: photoUrls.map((url, i) => ({ url, order: i })),
        }
        try {
            if (editId) {
                await adminUpdateExcursion(token, editId, body)
                toastSuccess('Промените по екскурзията са запазени.')
            } else {
                await adminCreateExcursion(token, body)
                toastSuccess('Екскурзията е създадена.')
            }
            closeForm(); load()
        } catch (e: unknown) {
            toastApiError(e, 'Запазването не бе успешно')
        } finally { setSaving(false) }
    }

    async function handleDelete(id: string) {
        if (!token || !confirm('Изтриване на екскурзията?')) return
        try {
            await adminDeleteExcursion(token, id)
            toastSuccess('Екскурзията е изтрита.')
            load()
        } catch (e: unknown) {
            toastApiError(e, 'Изтриването не бе успешно')
        }
    }


    return (
        <View padding={{ s: 4, m: 8 }} gap={5}>
            <View direction="row" justify="space-between" align="center">
                <Text as="h1" variant="title-5" weight="bold">🗺️ Екскурзии</Text>
                <View direction="row" gap={2}>
                    <Button
                        variant={reorderMode ? 'solid' : 'outline'}
                        color="neutral"
                        onClick={() => reorderMode ? closeReorderMode() : openReorderMode()}
                        disabled={rows.length === 0}
                    >
                        ↕ Подреди
                    </Button>
                    <Button variant="solid" color="primary" onClick={startNew} disabled={reorderMode}>
                        + Добави екскурзия
                    </Button>
                </View>
            </View>

            {showForm && (
                <View gap={5}>
                    <Text variant="title-5">{editId ? 'Редактиране на екскурзия' : 'Нова екскурзия'}</Text>
                    <Divider />
                    <form
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault()
                        }}
                    >
                        <View gap={4}>
                            <Grid columns={{ s: 1, m: 2 }} gap={4}>
                                <View gap={1}>
                                    <FormControl.Label>Title / destination (English) *</FormControl.Label>
                                    <TextField name="destination" placeholder="Nessebar" value={form.destination} onChange={({ value }) => setForm(f => ({ ...f, destination: value }))} />
                                </View>
                                <View gap={1}>
                                    <FormControl.Label>Цена € (незадължително)</FormControl.Label>
                                    <TextField
                                        name="price"
                                        placeholder="49.99"
                                        value={form.price}
                                        onChange={({ value }) => setForm((f) => ({ ...f, price: value }))}
                                        inputAttributes={{ type: 'text', inputMode: 'decimal', autoComplete: 'off' }}
                                    />
                                </View>
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <FormControl.Label>Тръгване от (курорти)</FormControl.Label>
                                    <FormControl.Helper>
                                        Търси по име и избери от списъка; Backspace при празно поле маха последния курорт
                                    </FormControl.Helper>
                                    {resortChoices.length === 0 ? (
                                        <Text variant="body-2" color="neutral-faded">Зареждане на курорти…</Text>
                                    ) : (
                                        <View gap={3}>
                                            {form.resortIds.length > 0 && (
                                                <View direction="row" gap={4} wrap align="center">
                                                    {form.resortIds.map((id) => {
                                                        const label = resortChoices.find((o) => o.id === id)?.name ?? `#${id}`
                                                        return (
                                                            <Badge variant="outline" color="primary" size="large">
                                                                <Dismissible
                                                                    key={id}
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
                                            )
                                            }
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
                            </Grid>
                            <View gap={1}>
                                <FormControl.Label>Description (English) *</FormControl.Label>
                                <FormControl.Helper>
                                    Запазване → автоматичен превод към румънски, руски и украински. Можеш да вмъкнеш линк или
                                    снимка (Link / Image) с URL-а от „Качи снимка“ — относителният път `/uploads/...` се
                                    показва правилно на сайта.
                                </FormControl.Helper>
                                <ReactQuill
                                    key={editId ?? 'new-excursion'}
                                    theme="snow"
                                    value={form.description ?? ''}
                                    onChange={(value) =>
                                        setForm((f) => ({ ...f, description: value ?? '' }))
                                    }
                                    modules={ADMIN_QUILL_MODULES}
                                    placeholder="Excursion description in English…"
                                    style={{ minHeight: 200 }}
                                />
                            </View>
                            <View gap={1}>
                                <FormControl.Label>Снимки</FormControl.Label>
                                <FormControl.Helper>
                                    Качване добавя към списъка. Премахване от реда изтрива файла от сървъра едва при
                                    „Запази“. Външен URL: полето „Добави URL“.
                                </FormControl.Helper>
                                <AdminGalleryPhotosField
                                    urls={form.photoUrls}
                                    onUrlsChange={(photoUrls) => setForm((f) => ({ ...f, photoUrls }))}
                                    uploadSlot={
                                        <View paddingTop={1}>
                                            <ImageUploader
                                                token={token!}
                                                category="excursions"
                                                label="Качи снимка от диск"
                                                enabled={form.destination.trim().length > 0}
                                                disabledHint="Първо въведете destination (заглавие на екскурзията), после качете снимка."
                                                onUploaded={(url: string) =>
                                                    setForm((f) => ({
                                                        ...f,
                                                        photoUrls: f.photoUrls.includes(url) ? f.photoUrls : [...f.photoUrls, url],
                                                    }))
                                                }
                                            />
                                        </View>
                                    }
                                />
                            </View>
                            <View direction="row" gap={3}>
                                <Button
                                    type="button"
                                    variant="solid"
                                    color="primary"
                                    disabled={saving}
                                    onClick={() => void handleSave()}
                                >
                                    {saving ? 'Запазване…' : 'Запази'}
                                </Button>
                                <Button variant="outline" color="neutral" type="button" onClick={closeForm}>Отказ</Button>
                            </View>
                        </View>
                    </form>
                </View >
            )
            }

            {reorderMode && (
                <View gap={4}>
                    <View gap={1}>
                        <Text variant="title-5" weight="bold">Подреди екскурзиите</Text>
                        <Text variant="body-2" color="neutral-faded">
                            Влачи редовете или използвай стрелките. Натисни „Запази подредбата" за да запишеш промяната.
                        </Text>
                    </View>
                    <Divider />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {reorderIds.map((id, index) => {
                            const row = rows.find((r) => r.id === id)
                            if (!row) return null
                            const isDragging = reorderDragging === index
                            const isDropTarget = reorderDragOver === index && reorderDragging !== index
                            return (
                                <div
                                    key={id}
                                    draggable
                                    onDragStart={() => reorderDragStart(index)}
                                    onDragOver={(e) => handleReorderDragOver(e, index)}
                                    onDrop={() => reorderDrop(index)}
                                    onDragEnd={reorderDragEnd}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        background: 'var(--rs-color-background-neutral-faded, #f5f5f5)',
                                        opacity: isDragging ? 0.35 : 1,
                                        outline: isDropTarget ? '2px solid var(--rs-color-border-primary, #0066cc)' : '2px solid transparent',
                                        transition: 'opacity 0.15s, outline 0.1s',
                                        cursor: 'grab',
                                        userSelect: 'none',
                                    }}
                                >
                                    <span style={{ color: '#999', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                                        <GripVertical size={18} />
                                    </span>
                                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 500 }}>
                                        {row.destination}
                                    </span>
                                    {row.departures?.length > 0 && (
                                        <span style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap' }}>
                                            {row.departures.slice(0, 2).map((d) => (
                                                <Badge key={d.id} color="neutral" size="small">{d.name}</Badge>
                                            ))}
                                            {row.departures.length > 2 && (
                                                <span style={{ fontSize: 12, color: '#999' }}>+{row.departures.length - 2}</span>
                                            )}
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            color="neutral"
                                            size="small"
                                            disabled={index === 0}
                                            onClick={() => reorderMoveUp(index)}
                                            attributes={{ 'aria-label': 'Премести нагоре' }}
                                        >↑</Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            color="neutral"
                                            size="small"
                                            disabled={index === reorderIds.length - 1}
                                            onClick={() => reorderMoveDown(index)}
                                            attributes={{ 'aria-label': 'Премести надолу' }}
                                        >↓</Button>
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <View direction="row" gap={3}>
                        <Button
                            variant="solid"
                            color="primary"
                            disabled={reorderSaving}
                            onClick={() => void saveReorder()}
                        >
                            {reorderSaving ? 'Запазване…' : 'Запази подредбата'}
                        </Button>
                        <Button variant="outline" color="neutral" onClick={closeReorderMode}>Отказ</Button>
                    </View>
                </View>
            )}

            {!reorderMode && (loading ? (
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
                                <Table.Heading>Name</Table.Heading>
                                <Table.Heading>Departure</Table.Heading>
                                <Table.Heading>Price</Table.Heading>
                                <Table.Heading>Photos</Table.Heading>
                                <Table.Heading></Table.Heading>
                            </Table.Row>
                            {rows.map(r => (
                                <Table.Row key={r.id}>
                                    <Table.Cell><Text weight="bold">{r.destination}</Text></Table.Cell>
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
                                            ? <Badge color="positive">{r.price} €</Badge>
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
                )
            )}
        </View >
    )
}
