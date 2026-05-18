import { useState, useRef, type KeyboardEvent } from 'react'
import { Trash2, GripVertical } from 'lucide-react'
import { View, Text, Button, TextField, FormControl } from 'reshaped'
import { resolvePhotoUrl } from '../api'

type Props = {
    urls: string[]
    onUrlsChange: (urls: string[]) => void
    uploadSlot: React.ReactNode
    manualAddLabel?: string
    manualAddPlaceholder?: string
}

/**
 * Списък от снимки в админа: миниатюра, път/URL, изтриване, пренареждане с drag-and-drop;
 * ръчно добавяне на URL; слот за ImageUploader.
 */
export function AdminGalleryPhotosField({
    urls,
    onUrlsChange,
    uploadSlot,
    manualAddLabel = 'Добави URL (по избор)',
    manualAddPlaceholder = 'https://… или /uploads/…',
}: Props) {
    const [manualUrl, setManualUrl] = useState('')
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const dragIndexRef = useRef<number | null>(null)

    function appendUrl(raw: string) {
        const u = raw.trim()
        if (!u || urls.includes(u)) return
        onUrlsChange([...urls, u])
    }

    function addManual() {
        appendUrl(manualUrl)
        setManualUrl('')
    }

    function handleDragStart(index: number) {
        dragIndexRef.current = index
        setDraggingIndex(index)
    }

    function handleDragOver(e: React.DragEvent, index: number) {
        e.preventDefault()
        if (dragOverIndex !== index) setDragOverIndex(index)
    }

    function handleDrop(targetIndex: number) {
        const from = dragIndexRef.current
        setDraggingIndex(null)
        setDragOverIndex(null)
        dragIndexRef.current = null
        if (from === null || from === targetIndex) return
        const next = [...urls]
        const [moved] = next.splice(from, 1)
        next.splice(targetIndex, 0, moved)
        onUrlsChange(next)
    }

    function handleDragEnd() {
        setDraggingIndex(null)
        setDragOverIndex(null)
        dragIndexRef.current = null
    }

    function moveUp(index: number) {
        if (index === 0) return
        const next = [...urls]
        ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
        onUrlsChange(next)
    }

    function moveDown(index: number) {
        if (index === urls.length - 1) return
        const next = [...urls]
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
        onUrlsChange(next)
    }

    return (
        <View gap={3}>
            {urls.length > 0 ? (
                <View gap={2}>
                    {urls.map((url, index) => {
                        const isDragging = draggingIndex === index
                        const isDropTarget = dragOverIndex === index && draggingIndex !== index
                        return (
                            <div
                                key={`${url}__${index}`}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={() => handleDrop(index)}
                                onDragEnd={handleDragEnd}
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
                                <img
                                    src={resolvePhotoUrl(url) ?? url}
                                    alt=""
                                    style={{
                                        width: 56,
                                        height: 56,
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                        flexShrink: 0,
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                    }}
                                />
                                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>
                                    {url}
                                </span>
                                <span style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        color="neutral"
                                        size="small"
                                        disabled={index === 0}
                                        onClick={() => moveUp(index)}
                                        attributes={{ 'aria-label': 'Премести нагоре' }}
                                    >↑</Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        color="neutral"
                                        size="small"
                                        disabled={index === urls.length - 1}
                                        onClick={() => moveDown(index)}
                                        attributes={{ 'aria-label': 'Премести надолу' }}
                                    >↓</Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        color="critical"
                                        size="small"
                                        icon={Trash2}
                                        onClick={() => onUrlsChange(urls.filter((_, i) => i !== index))}
                                        attributes={{ 'aria-label': 'Премахни снимката от списъка' }}
                                    />
                                </span>
                            </div>
                        )
                    })}
                </View>
            ) : (
                <Text variant="body-2" color="neutral-faded">
                    Няма снимки. Качете файл или добавете URL по-долу.
                </Text>
            )}

            <View gap={2}>
                <FormControl.Label>{manualAddLabel}</FormControl.Label>
                <View direction={{ s: 'column', m: 'row' }} gap={2} align={{ s: 'stretch', m: 'end' }}>
                    <View grow attributes={{ style: { minWidth: 0 } }}>
                        <TextField
                            name="manualPhotoUrl"
                            placeholder={manualAddPlaceholder}
                            value={manualUrl}
                            onChange={({ value }) => setManualUrl(value)}
                            inputAttributes={{
                                onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addManual()
                                    }
                                },
                            }}
                        />
                    </View>
                    <Button type="button" variant="outline" color="neutral" onClick={addManual}>
                        Добави
                    </Button>
                </View>
            </View>

            {uploadSlot}
        </View>
    )
}
