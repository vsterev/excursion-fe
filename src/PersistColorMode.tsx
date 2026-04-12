import { useEffect } from 'react'
import { useTheme } from 'reshaped'
import { writeStoredColorMode } from './colorModeStorage'

/** Syncs Reshaped color mode to localStorage whenever it changes. */
export function PersistColorMode() {
    const { colorMode } = useTheme()
    useEffect(() => {
        writeStoredColorMode(colorMode)
    }, [colorMode])
    return null
}
