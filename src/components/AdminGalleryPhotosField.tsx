import { useState, type KeyboardEvent } from 'react'
import { Trash2 } from 'lucide-react'
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
 * Списък от снимки в админа: миниатюра, път/URL, изтриване; ръчно добавяне на URL; слот за ImageUploader.
 */
export function AdminGalleryPhotosField({
    urls,
    onUrlsChange,
    uploadSlot,
    manualAddLabel = 'Добави URL (по избор)',
    manualAddPlaceholder = 'https://… или /uploads/…',
}: Props) {
    const [manualUrl, setManualUrl] = useState('')

    function appendUrl(raw: string) {
        const u = raw.trim()
        if (!u || urls.includes(u)) return
        onUrlsChange([...urls, u])
    }

    function addManual() {
        appendUrl(manualUrl)
        setManualUrl('')
    }

    return (
        <View gap={3}>
            {urls.length > 0 ? (
                <View gap={2}>
                    {urls.map((url, index) => (
                        <View
                            key={`${url}__${index}`}
                            direction="row"
                            align="center"
                            gap={3}
                            padding={3}
                            borderRadius="medium"
                            backgroundColor="neutral-faded"
                        >
                            <img
                                src={resolvePhotoUrl(url) ?? url}
                                alt=""
                                style={{
                                    width: 56,
                                    height: 56,
                                    objectFit: 'cover',
                                    borderRadius: 6,
                                    flexShrink: 0,
                                }}
                            />
                            <Text
                                variant="body-2"
                                attributes={{
                                    style: {
                                        flex: 1,
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    },
                                }}
                            >
                                {url}
                            </Text>
                            <Button
                                type="button"
                                variant="ghost"
                                color="critical"
                                size="small"
                                icon={Trash2}
                                onClick={() => onUrlsChange(urls.filter((_, i) => i !== index))}
                                attributes={{
                                    'aria-label': 'Премахни снимката от списъка',
                                }}
                            />
                        </View>
                    ))}
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
