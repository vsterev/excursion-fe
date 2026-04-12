import { useCallback } from 'react'
import { useToast } from 'reshaped'

const POSITION = 'bottom-end' as const

export function unknownErrorMessage(e: unknown): string {
    if (e instanceof Error && e.message) return e.message
    if (typeof e === 'string') return e
    return 'Неочаквана грешка'
}

/**
 * Reshaped toast за админ отговори от API (успех / грешка).
 */
export function useAdminToast() {
    const { show } = useToast()

    const toastSuccess = useCallback(
        (text: string, title = 'Готово') => {
            show({
                title,
                text,
                color: 'positive',
                position: POSITION,
                timeout: 'short',
            })
        },
        [show],
    )

    const toastError = useCallback(
        (text: string, title = 'Грешка') => {
            show({
                title,
                text,
                color: 'critical',
                position: POSITION,
                timeout: 'long',
            })
        },
        [show],
    )

    return { toastSuccess, toastError }
}
