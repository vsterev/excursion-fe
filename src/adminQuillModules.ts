/**
 * Споделени настройки за ReactQuill в админа.
 * - Изключва „list autofill“ (интервал след `-` в начало на сегмент → bullet), списъци само от toolbar.
 */
export const ADMIN_QUILL_MODULES = {
    toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
    ],
    keyboard: {
        bindings: {
            'list autofill': null,
        },
    },
}
