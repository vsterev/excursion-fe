import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListResorts,
    adminCreateResort,
    adminUpdateResort,
    adminDeleteResort,
    type AdminResortRow,
} from '../../adminApi'
import { normalizeQuillHtmlNbsp } from '../../richTextNormalize'
import { ImageUploader } from '../../components/ImageUploader'
import { View, Text, Button, Loader, TextField, Table, Divider, FormControl } from 'reshaped'
import { useAdminToast } from '../../hooks/useAdminToast'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { ADMIN_QUILL_MODULES } from '../../adminQuillModules'

function emptyForm() {
    return { name: '', description: '', photos: '' }
}

export function AdminResortsPage() {
    const { token } = useAuth()
    const { toastSuccess, toastError, toastApiError } = useAdminToast()
    const [rows, setRows] = useState<AdminResortRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(emptyForm)
    const [editId, setEditId] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListResorts(token)
            .then(setRows)
            .catch((e: unknown) => toastApiError(e, 'Неуспешно зареждане'))
            .finally(() => setLoading(false))
    }, [token, toastApiError])

    useEffect(() => {
        load()
    }, [load])

    function closeForm() {
        setShowForm(false)
    }

    function startEdit(row: AdminResortRow) {
        setForm({
            name: row.name,
            description: normalizeQuillHtmlNbsp(row.description),
            photos: (row.photos ?? []).map((p) => p.url).join('\n'),
        })
        setEditId(row.id)
        setShowForm(true)
    }

    function startNew() {
        setForm(emptyForm())
        setEditId(null)
        setShowForm(true)
    }

    async function handleSave() {
        if (!token) return
        setSaving(true)
        const photoUrls = form.photos.split('\n').map((s) => s.trim()).filter(Boolean)
        const body = {
            name: form.name.trim(),
            description: normalizeQuillHtmlNbsp(form.description),
            photos: photoUrls.map((url, i) => ({ url, order: i })),
        }
        if (!body.name || !body.description.trim()) {
            toastError('Попълнете име и описание (English).', 'Липсват данни')
            setSaving(false)
            return
        }
        try {
            if (editId != null) {
                await adminUpdateResort(token, editId, body)
                toastSuccess('Курортът е обновен.')
            } else {
                await adminCreateResort(token, body)
                toastSuccess('Курортът е създаден.')
            }
            closeForm()
            load()
        } catch (e: unknown) {
            toastApiError(e, 'Запазването не бе успешно')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: number) {
        if (!token || !confirm('Изтриване на курорта и снимките му от сървъра?')) return
        try {
            await adminDeleteResort(token, id)
            toastSuccess('Курортът е изтрит.')
            load()
        } catch (e: unknown) {
            toastApiError(e, 'Изтриването не бе успешно')
        }
    }

    return (
        <View padding={{ s: 4, m: 8 }} gap={5}>
            <View direction="row" justify="space-between" align="center">
                <Text as="h1" variant="title-5" weight="bold">
                    🏖️ Курорти
                </Text>
                <Button variant="solid" color="primary" onClick={startNew}>
                    + Добави курорт
                </Button>
            </View>

            {showForm && (
                <View gap={5}>
                    <Text variant="title-5">{editId != null ? 'Редактиране на курорт' : 'Нов курорт'}</Text>
                    <Divider />
                    <form
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault()
                        }}
                    >
                        <View gap={4}>
                            <View gap={1}>
                                <FormControl.Label>Име (English) *</FormControl.Label>
                                <TextField
                                    name="name"
                                    placeholder="Sunny Beach"
                                    value={form.name}
                                    onChange={({ value }) => setForm((f) => ({ ...f, name: value }))}
                                />
                            </View>
                            <View gap={1}>
                                <FormControl.Label>Описание (English) *</FormControl.Label>
                                <FormControl.Helper>
                                    При запазване се генерират автоматично преводи към румънски, руски и украински (като при
                                    екскурзиите). Линк или вградена снимка: бутони Link и Image в редактора — URL от
                                    „Качи снимка“ (`/uploads/...`).
                                </FormControl.Helper>
                                <ReactQuill
                                    key={editId != null ? String(editId) : 'new-resort'}
                                    theme="snow"
                                    value={form.description ?? ''}
                                    onChange={(value) =>
                                        setForm((f) => ({ ...f, description: value ?? '' }))
                                    }
                                    modules={ADMIN_QUILL_MODULES}
                                    placeholder="Resort description in English…"
                                    style={{ minHeight: 200 }}
                                />
                            </View>
                            <View gap={1}>
                                <FormControl.Label>Снимки</FormControl.Label>
                                <FormControl.Helper>по един URL на ред (локални пътища след качване)</FormControl.Helper>
                                <textarea
                                    name="photos"
                                    rows={4}
                                    value={form.photos}
                                    onChange={(e) => setForm((f) => ({ ...f, photos: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        fontFamily: 'monospace',
                                        fontSize: 13,
                                        padding: 8,
                                        borderRadius: 8,
                                        border: '1px solid var(--border, #ccc)',
                                    }}
                                />
                                <View paddingTop={2}>
                                    <ImageUploader
                                        token={token!}
                                        category="resorts"
                                        label="Качи снимка от диск"
                                        enabled={form.name.trim().length > 0}
                                        disabledHint="Първо въведете името на курорта, после качете снимка."
                                        onUploaded={(url: string) =>
                                            setForm((f) => ({
                                                ...f,
                                                photos: f.photos ? `${f.photos}\n${url}` : url,
                                            }))
                                        }
                                    />
                                </View>
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
                                <Button variant="outline" color="neutral" type="button" onClick={closeForm}>
                                    Отказ
                                </Button>
                            </View>
                        </View>
                    </form>
                </View>
            )}

            {loading ? (
                <View align="center" padding={16}>
                    <Loader size="large" />
                </View>
            ) : rows.length === 0 ? (
                <View align="center" padding={16} gap={3}>
                    <Text variant="title-1">🏖️</Text>
                    <Text color="neutral-faded">Няма курорти</Text>
                </View>
            ) : (
                <View shadow="raised" borderRadius="medium" backgroundColor="white" overflow="hidden">
                    <Table>
                        <Table.Row>
                            <Table.Heading>Име (EN)</Table.Heading>
                            <Table.Heading>Снимки</Table.Heading>
                            <Table.Heading />
                        </Table.Row>
                        {rows.map((r) => (
                            <Table.Row key={r.id}>
                                <Table.Cell>
                                    <Text weight="bold">{r.name}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text color="neutral-faded">{r.photos?.length ?? 0}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <View direction="row" gap={2}>
                                        <Button variant="outline" color="neutral" size="small" onClick={() => startEdit(r)}>
                                            ✏️ Редакция
                                        </Button>
                                        <Button variant="outline" color="critical" size="small" onClick={() => handleDelete(r.id)}>
                                            🗑️
                                        </Button>
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
