/**
 * Word/Google Docs често вмъкват неразривни интервали (U+00A0, &nbsp;, тесен NBSP).
 * Текстът остава един дълъг ред без пренасяне между думите.
 *
 * Винаги връща низ — ReactQuill и др. не трябва да получават `undefined`/не-низ.
 */
export function normalizeQuillHtmlNbsp(html: unknown): string {
    if (html == null) return ''
    if (typeof html !== 'string') return ''
    if (html === '') return ''
    return html
        .replace(/\u00A0/g, ' ')
        .replace(/\u202F/g, ' ')
        .replace(/&nbsp;/gi, ' ')
}
