import { useRef, useState } from 'react'

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? 'http://localhost:4010'
const TOKEN_KEY = 'admin_token'

interface Props {
    onUploaded: (url: string) => void
    label?: string
    token?: string
    category?: string
}

export function ImageUploader({ onUploaded, label = 'Качи снимка', token: tokenProp, category }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleFile(file: File) {
        setUploading(true)
        setError(null)
        try {
            const token = tokenProp ?? localStorage.getItem(TOKEN_KEY)
            const fd = new FormData()
            fd.append('file', file)
            // category passed as query param — req.body is not yet available when
            // multer's destination() runs, but req.query is
            const qs = category ? `?category=${encodeURIComponent(category)}` : ''
            const res = await fetch(`${API_ORIGIN}/api/upload${qs}`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: fd,
            })
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
        <div className="image-uploader">
            <button
                type="button"
                className="btn btn-secondary"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? 'Качване...' : label}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                    e.target.value = ''
                }}
            />
            {error && <span className="form-error">{error}</span>}
        </div>
    )
}
