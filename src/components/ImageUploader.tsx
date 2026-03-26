import { useRef, useState } from 'react'
import { uploadFile } from '../adminApi'
import type { UploadCategory } from '../adminApi'

interface Props {
    token: string
    category: UploadCategory
    /** Called with the full URL after successful upload */
    onUploaded: (url: string) => void
    label?: string
}

export function ImageUploader({ token, category, onUploaded, label = 'Качи снимка' }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [err, setErr] = useState('')

    async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setErr('')
        setPreview(URL.createObjectURL(file))
        setUploading(true)
        try {
            const url = await uploadFile(token, category, file)
            onUploaded(url)
        } catch (ex: any) {
            setErr(ex.message)
            setPreview(null)
        } finally {
            setUploading(false)
            // reset so same file can be re-selected
            if (inputRef.current) inputRef.current.value = ''
        }
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleChange}
            />
            <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '7px 14px', fontSize: 13 }}
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
            >
                {uploading ? '⏳ Качване…' : `📁 ${label}`}
            </button>
            {preview && (
                <img
                    src={preview}
                    alt="preview"
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                />
            )}
            {err && <span style={{ color: '#c53030', fontSize: 12 }}>⚠️ {err}</span>}
        </div>
    )
}
