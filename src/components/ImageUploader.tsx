import { useState } from 'react'
import { View, Text, FileUpload } from 'reshaped'
import { notifyAdminUnauthorized } from '../adminSession'

import { API_BASE } from '../api'
const TOKEN_KEY = 'admin_token'

interface Props {
    onUploaded: (url: string) => void
    label?: string
    token?: string
    category?: string
    /** When false, the upload request is not sent (e.g. until required form fields are filled). */
    enabled?: boolean
    /** Shown when `enabled` is false (optional). */
    disabledHint?: string
}

export function ImageUploader({
    onUploaded,
    label = 'Качи снимка',
    token: tokenProp,
    category,
    enabled = true,
    disabledHint,
}: Props) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleFile(file: File) {
        if (!enabled) return
        setUploading(true)
        setError(null)
        try {
            const token = tokenProp ?? localStorage.getItem(TOKEN_KEY)
            const fd = new FormData()
            fd.append('file', file)
            // category passed as query param — req.body is not yet available when
            // multer's destination() runs, but req.query is
            const qs = category ? `?category=${encodeURIComponent(category)}` : ''
            const res = await fetch(`${API_BASE}/upload${qs}`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: fd,
            })
            if (res.status === 401) {
                notifyAdminUnauthorized()
                return
            }
            if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
            const data = await res.json() as { url: string }
            onUploaded(data.url)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Upload error')
        } finally {
            setUploading(false)
        }
    }

    return (
        <View gap={2}>
            <FileUpload
                name="admin-image-upload"
                disabled={uploading || !enabled}
                inputAttributes={{ accept: 'image/*' }}
                height={{ s: '72px', m: '80px' }}
                onChange={({ value }) => {
                    const file = value[0]
                    if (file) void handleFile(file)
                }}
            >
                <Text
                    variant="body-2"
                    color={uploading || !enabled ? 'neutral-faded' : 'neutral'}
                >
                    {uploading ? 'Качване...' : label}
                </Text>
            </FileUpload>
            {!enabled && disabledHint ? (
                <Text variant="body-2" color="neutral-faded">
                    {disabledHint}
                </Text>
            ) : null}
            {error ? (
                <Text variant="body-2" color="critical">
                    {error}
                </Text>
            ) : null}
        </View>
    )
}
