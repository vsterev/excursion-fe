import { useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, TextField, FormControl, Badge, Loader, Divider, Card } from 'reshaped'
import { verifyReservation, resolvePhotoUrl } from '../api'
import type { ReservationTicketDto } from '../api'
import { RevolutPayButton } from '../components/RevolutPayButton'

type PageState =
    | { step: 'verify' }
    | { step: 'loading' }
    | { step: 'error'; code: 'email_mismatch' | 'not_found' | 'unknown'; message: string }
    | { step: 'ticket'; data: ReservationTicketDto }

function formatDate(s: string | null) {
    if (!s) return '—'
    return s.slice(0, 10)
}

function formatDateTime(iso: string) {
    const d = new Date(iso)
    return (
        d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' +
        d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    )
}

export function BookingCheckPage() {
    const { id: urlId } = useParams<{ id?: string }>()
    const { t } = useTranslation()

    const [bookingIdInput, setBookingIdInput] = useState(urlId ?? '')
    const [email, setEmail] = useState('')
    const [state, setState] = useState<PageState>({ step: 'verify' })
    const ticketRef = useRef<HTMLDivElement>(null)

    const resolvedId = urlId ?? bookingIdInput.trim()

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()
        const id = bookingIdInput.trim()
        if (!id || !email.trim()) return
        setState({ step: 'loading' })
        try {
            const data = await verifyReservation(id, email.trim())
            setState({ step: 'ticket', data })
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'unknown'
            const code =
                msg === 'email_mismatch' ? 'email_mismatch'
                    : msg === 'not_found' ? 'not_found'
                        : 'unknown'
            setState({ step: 'error', code, message: msg })
        }
    }

    const shortRef = resolvedId ? resolvedId.slice(0, 8).toUpperCase() : ''

    return (
        <>
            <Helmet>
                <title>{t('bookingCheck.pageTitle')}</title>
            </Helmet>

            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #booking-ticket, #booking-ticket * { visibility: visible !important; }
                    #booking-ticket {
                        position: fixed !important;
                        top: 0; left: 0;
                        width: 100%;
                        padding: 32px;
                        box-sizing: border-box;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            <View
                maxWidth="600px"
                width="100%"
                paddingInline={{ s: 4, m: 6 }}
                paddingBlock={{ s: 6, m: 10 }}
                gap={5}
                attributes={{ style: { margin: '0 auto' } }}
            >
                {/* ── Step 1: Verify ── */}
                {(state.step === 'verify' || state.step === 'error') && (
                    <Card>
                        <View gap={4}>
                            <View gap={1}>
                                <Text as="h1" variant="featured-2" weight="bold">
                                    🎟️ {t('bookingCheck.title')}
                                </Text>
                                <Text variant="body-2" color="neutral-faded">
                                    {t('bookingCheck.subtitleForm')}
                                </Text>
                            </View>
                            <Divider />
                            <form noValidate onSubmit={(e) => void handleVerify(e)}>
                                <View gap={3}>
                                    <FormControl required>
                                        <FormControl.Label>{t('bookingCheck.bookingIdLabel')}</FormControl.Label>
                                        <TextField
                                            name="bookingId"
                                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                            value={bookingIdInput}
                                            onChange={({ value }) => setBookingIdInput(value)}
                                            inputAttributes={{ autoComplete: 'off', spellCheck: false }}
                                        />
                                        <FormControl.Helper>{t('bookingCheck.bookingIdHint')}</FormControl.Helper>
                                    </FormControl>

                                    <FormControl required>
                                        <FormControl.Label>{t('bookingCheck.emailLabel')}</FormControl.Label>
                                        <TextField
                                            name="email"
                                            placeholder="ivan@example.com"
                                            value={email}
                                            onChange={({ value }) => setEmail(value)}
                                            inputAttributes={{ type: 'email', autoComplete: 'email' }}
                                        />
                                    </FormControl>

                                    {state.step === 'error' && (
                                        <Text color="critical" variant="body-2">
                                            {state.code === 'email_mismatch'
                                                ? t('bookingCheck.errorEmailMismatch')
                                                : state.code === 'not_found'
                                                    ? t('bookingCheck.errorNotFound')
                                                    : t('bookingCheck.errorUnknown')}
                                        </Text>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="solid"
                                        color="primary"
                                        disabled={!bookingIdInput.trim() || !email.trim()}
                                    >
                                        {t('bookingCheck.submit')}
                                    </Button>
                                </View>
                            </form>
                        </View>
                    </Card>
                )}

                {/* ── Loading ── */}
                {state.step === 'loading' && (
                    <View align="center" padding={16}><Loader size="large" /></View>
                )}

                {/* ── Step 2: Ticket ── */}
                {state.step === 'ticket' && (
                    <View gap={4}>
                        <View direction="row" justify="space-between" align="center" className="no-print">
                            <Text variant="featured-2" weight="bold">🎟️ {t('bookingCheck.ticketTitle')}</Text>
                            <Button variant="solid" color="primary" onClick={() => window.print()}>
                                🖨️ {t('bookingCheck.printPdf')}
                            </Button>
                        </View>

                        <div id="booking-ticket" ref={ticketRef}>
                            <View
                                shadow="raised"
                                borderRadius="medium"
                                backgroundColor="elevation-raised"
                                overflow="hidden"
                            >
                                {state.data.excursion.coverPhoto && (
                                    <img
                                        src={resolvePhotoUrl(state.data.excursion.coverPhoto)!}
                                        alt={state.data.excursion.destination}
                                        style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                                    />
                                )}

                                <View padding={6} gap={4}>
                                    {/* Header */}
                                    <View direction="row" justify="space-between" align="start" gap={3}>
                                        <View gap={1}>
                                            <Text variant="body-2" color="neutral-faded">{t('bookingCheck.excursion')}</Text>
                                            <Text as="h2" variant="title-5" weight="bold">
                                                {state.data.excursion.destination}
                                            </Text>
                                            {state.data.excursion.departures.length > 0 && (
                                                <Text variant="body-2" color="neutral-faded">
                                                    📍 {state.data.excursion.departures.map(d => d.name).join(', ')}
                                                </Text>
                                            )}
                                        </View>
                                        <View gap={1} align="end">
                                            <Badge
                                                color={state.data.status === 'confirmed' ? 'positive' : 'warning'}
                                                variant="solid"
                                                size="large"
                                            >
                                                {state.data.status === 'confirmed'
                                                    ? `✓ ${t('bookingCheck.statusConfirmed')}`
                                                    : `⏳ ${t('bookingCheck.statusWaiting')}`}
                                            </Badge>
                                            <Text variant="body-3" color="neutral-faded">
                                                #{shortRef}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Pay button for unpaid reservations */}
                                    {state.data.status === 'waiting' &&
                                        state.data.totalPrice != null &&
                                        state.data.totalPrice > 0 && (
                                        <View
                                            padding={4}
                                            gap={3}
                                            borderRadius="medium"
                                            backgroundColor="elevation-base"
                                        >
                                            <Text variant="body-1" weight="bold">
                                                💳 {t('payment.completePayment')}
                                            </Text>
                                            <RevolutPayButton
                                                reservationId={state.data.id}
                                                email={state.data.email}
                                                totalPrice={state.data.totalPrice}
                                                onSuccess={() =>
                                                    setState({
                                                        step: 'ticket',
                                                        data: { ...state.data, status: 'confirmed' },
                                                    })
                                                }
                                                onCancel={() => {}}
                                            />
                                            <Text variant="body-3" color="neutral-faded">
                                                {t('payment.orPayLater')}
                                            </Text>
                                        </View>
                                    )}

                                    <Divider />

                                    <View gap={3}>
                                        <View direction="row" gap={6} wrap>
                                            <View gap={1}>
                                                <Text variant="body-3" color="neutral-faded">{t('bookingCheck.holderName')}</Text>
                                                <Text variant="body-1" weight="bold">{state.data.holderName}</Text>
                                            </View>
                                            <View gap={1}>
                                                <Text variant="body-3" color="neutral-faded">{t('bookingCheck.tourists')}</Text>
                                                <Text variant="body-1" weight="bold">{state.data.touristCount}</Text>
                                            </View>
                                            {state.data.excursionDate && (
                                                <View gap={1}>
                                                    <Text variant="body-3" color="neutral-faded">{t('bookingCheck.departureDate')}</Text>
                                                    <Text variant="body-1" weight="bold">{formatDate(state.data.excursionDate)}</Text>
                                                </View>
                                            )}
                                            {state.data.totalPrice != null && (
                                                <View gap={1}>
                                                    <Text variant="body-3" color="neutral-faded">{t('bookingCheck.totalPrice')}</Text>
                                                    <Text variant="body-1" weight="bold" color="positive">
                                                        {state.data.totalPrice} €
                                                    </Text>
                                                </View>
                                            )}
                                        </View>

                                        <Divider />

                                        <View direction="row" gap={6} wrap>
                                            <View gap={1}>
                                                <Text variant="body-3" color="neutral-faded">{t('bookingCheck.email')}</Text>
                                                <Text variant="body-2">{state.data.email}</Text>
                                            </View>
                                            <View gap={1}>
                                                <Text variant="body-3" color="neutral-faded">{t('bookingCheck.phone')}</Text>
                                                <Text variant="body-2">{state.data.phone}</Text>
                                            </View>
                                        </View>

                                        {state.data.notes && (
                                            <>
                                                <Divider />
                                                <View gap={1}>
                                                    <Text variant="body-3" color="neutral-faded">{t('bookingCheck.notes')}</Text>
                                                    <Text variant="body-2">{state.data.notes}</Text>
                                                </View>
                                            </>
                                        )}

                                        <Divider />

                                        <View direction="row" justify="space-between" wrap gap={2}>
                                            <Text variant="body-3" color="neutral-faded">
                                                {t('bookingCheck.bookedAt')} {formatDateTime(state.data.createdAt)}
                                            </Text>
                                            {state.data.excursion.price != null && (
                                                <Text variant="body-3" color="neutral-faded">
                                                    {state.data.touristCount} × {state.data.excursion.price} €
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </div>

                        <View className="no-print">
                            <Button
                                variant="ghost"
                                color="neutral"
                                onClick={() => setState({ step: 'verify' })}
                            >
                                ← {t('bookingCheck.checkAnother')}
                            </Button>
                        </View>
                    </View>
                )}
            </View>
        </>
    )
}
