import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../AuthContext'
import {
    adminListUsefulInfo, adminCreateUsefulInfo,
    adminUpdateUsefulInfo, adminDeleteUsefulInfo,
} from '../../adminApi'
import { ImageUploader } from '../../components/ImageUploader'
import { View, Text, Button, Loader, Badge, TextField, TextArea, Table, Divider, Grid } from 'reshaped'
import { useAdminToast } from '../../hooks/useAdminToast'

const EMPTY = { resort: '', category: '', title: '', content: '', url: '' }

interface InfoRow {
    id: string
    resort: string
    category: string
    title: string
    body: string
    url?: string | null
}

export function AdminUsefulInfoPage() {
    const { token } = useAuth()
    const { toastSuccess, toastApiError } = useAdminToast()
    const [rows, setRows] = useState<InfoRow[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)

    const load = useCallback(() => {
        if (!token) return
        setLoading(true)
        adminListUsefulInfo(token)
            .then(d => setRows(d as InfoRow[]))
            .catch((e: unknown) => toastApiError(e, 'Неуспешно зареждане'))
            .finally(() => setLoading(false))
    }, [token, toastApiError])

    useEffect(() => { load() }, [load])

    function startEdit(row: InfoRow) {
        setForm({
            resort: row.resort, category: row.category,
            title: row.title, content: row.body,
            url: row.url ?? '',
        })
        setEditId(row.id); setShowForm(true)
    }

    function startNew() {
        setForm(EMPTY); setEditId(null); setShowForm(true)
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!token) return
        setSaving(true)
        const body = {
            resort: form.resort,
            category: form.category,
            title: form.title,
            body: form.content,
            url: form.url.trim() ? form.url.trim() : null,
        }
        try {
            if (editId) {
                await adminUpdateUsefulInfo(token, editId, body)
                toastSuccess('Записът е обновен.')
            } else {
                await adminCreateUsefulInfo(token, body)
                toastSuccess('Записът е създаден.')
            }
            setShowForm(false); load()
        } catch (e: unknown) {
            toastApiError(e, 'Запазването не бе успешно')
        } finally { setSaving(false) }
    }

    async function handleDelete(id: string) {
        if (!token || !confirm('Изтриване на записа?')) return
        try {
            await adminDeleteUsefulInfo(token, id)
            toastSuccess('Записът е изтрит.')
            load()
        } catch (e: unknown) {
            toastApiError(e, 'Изтриването не бе успешно')
        }
    }

    return (
        <View padding={{ s: 4, m: 8 }} gap={6}>
            <View direction="row" justify="space-between" align="center">
                <Text as="h1" variant="title-5" weight="bold">ℹ️ Полезна информация</Text>
                <Button variant="solid" color="primary" onClick={startNew}>+ Добави запис</Button>
            </View>

            {showForm && (
                <View shadow="raised" padding={6} borderRadius="medium" backgroundColor="white" gap={5}>
                    <Text variant="title-3" weight="bold">{editId ? 'Редактиране на запис' : 'Нов запис'}</Text>
                    <Divider />
                    <form onSubmit={handleSave}>
                        <View gap={4}>
                            <Grid columns={{ s: 1, m: 2 }} gap={4}>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Курорт *</Text>
                                    <TextField name="resort" placeholder="Слънчев бряг" value={form.resort} onChange={({ value }) => setForm(p => ({ ...p, resort: value }))} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">Категория *</Text>
                                    <TextField name="category" placeholder="Болница, Аптека…" value={form.category} onChange={({ value }) => setForm(p => ({ ...p, category: value }))} />
                                </View>
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <Text variant="caption-1" weight="bold">Заглавие *</Text>
                                    <TextField name="title" placeholder="Спешна помощ" value={form.title} onChange={({ value }) => setForm(p => ({ ...p, title: value }))} />
                                </View>
                                <View gap={1} attributes={{ style: { gridColumn: '1 / -1' } }}>
                                    <Text variant="caption-1" weight="bold">Съдържание *</Text>
                                    <TextArea name="content" placeholder="Описание, адрес, телефон…" value={form.content} onChange={({ value }) => setForm(p => ({ ...p, content: value }))} />
                                </View>
                                <View gap={1}>
                                    <Text variant="caption-1" weight="bold">URL (опционален)</Text>
                                    <TextField name="url" placeholder="https://..." value={form.url} onChange={({ value }) => setForm(p => ({ ...p, url: value }))} />
                                    <View paddingTop={2}>
                                        <ImageUploader
                                            token={token!}
                                            category="homepage"
                                            label="Качи изображение от диск"
                                            onUploaded={(url: string) => setForm(prev => ({ ...prev, url }))}
                                        />
                                    </View>
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
                    <Text variant="title-1">ℹ️</Text>
                    <Text color="neutral-faded">Няма записи</Text>
                </View>
            ) : (
                <View shadow="raised" borderRadius="medium" backgroundColor="white" overflow="hidden">
                    <Table>
                        <Table.Row>
                            <Table.Heading>Заглавие</Table.Heading>
                            <Table.Heading>Категория</Table.Heading>
                            <Table.Heading>Курорт</Table.Heading>
                            <Table.Heading>Съдържание</Table.Heading>
                            <Table.Heading>URL</Table.Heading>
                            <Table.Heading></Table.Heading>
                        </Table.Row>
                        {rows.map(r => (
                            <Table.Row key={r.id}>
                                <Table.Cell><Text weight="bold">{r.title}</Text></Table.Cell>
                                <Table.Cell><Badge color="primary">{r.category}</Badge></Table.Cell>
                                <Table.Cell>{r.resort}</Table.Cell>
                                <Table.Cell>
                                    <Text color="neutral-faded" attributes={{ style: { maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' } }}>
                                        {r.body}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    {r.url
                                        ? <Text as="a" variant="body-2" color="primary" attributes={{ href: r.url, target: '_blank', rel: 'noreferrer' }}>Линк</Text>
                                        : <Text variant="body-2" color="neutral-faded">—</Text>
                                    }
                                </Table.Cell>
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
