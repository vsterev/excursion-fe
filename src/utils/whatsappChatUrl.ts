/** URL за отваряне на чат в WhatsApp (wa.me — само цифри). */
export function whatsappChatUrl(raw: string | null | undefined): string | null {
    if (!raw?.trim()) return null
    const digits = raw.replace(/\D/g, '')
    return digits.length ? `https://wa.me/${digits}` : null
}
