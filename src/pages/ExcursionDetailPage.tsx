import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, Badge, Loader, Card, Grid, useTheme, TextField, TextArea, FormControl, Divider, Select } from 'reshaped'
import { fetchExcursion, fetchRepresentatives, resolvePhotoUrl, rewriteUploadUrlsInHtml, createReservation } from '../api'
import type { ExcursionDetailDto, RepresentativeDto } from '../api'
import { ArrowBigLeft } from 'lucide-react'
import { RepresentativeCompact } from './Representative'
import { RevolutPayButton } from '../components/RevolutPayButton'

type Photo = ExcursionDetailDto['photos'][number]

function stripHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    return (div.textContent ?? '').replace(/\s+/g, ' ').trim()
}

type LoadState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: ExcursionDetailDto }

type BookingState = 'idle' | 'submitting' | 'success' | 'error'

function emptyBookingForm() {
    return {
        touristCount: 1,
        holderName: '',
        email: '',
        phone: '',
        excursionDate: '',
        notes: '',
    }
}

export function ExcursionDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { t, i18n } = useTranslation()
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [activePhoto, setActivePhoto] = useState(0)
    const [representatives, setRepresentatives] = useState<RepresentativeDto[]>([])

    const [bookingForm, setBookingForm] = useState(emptyBookingForm)
    const [bookingState, setBookingState] = useState<BookingState>('idle')
    const [bookingError, setBookingError] = useState('')
    const [bookingId, setBookingId] = useState('')
    const [bookingEmail, setBookingEmail] = useState('')

    const { colorMode } = useTheme();
    const badgeColor = colorMode === 'dark' ? 'primary' : 'primary';
    const badgeVariant = colorMode === 'dark' ? 'solid' : 'outline';

    useEffect(() => {
        if (!id) return
        let cancelled = false
        fetchExcursion(id)
            .then((data) => { if (!cancelled) setState({ status: 'success', data }) })
            .catch((e: Error) => { if (!cancelled) setState({ status: 'error', message: e.message }) })
        return () => { cancelled = true }
    }, [id, i18n.language])

    useEffect(() => {
        let cancelled = false
        fetchRepresentatives()
            .then((data) => { if (!cancelled) setRepresentatives(data) })
            .catch(() => { if (!cancelled) setRepresentatives([]) })
        return () => { cancelled = true }
    }, [i18n.language])

    const departureRepresentatives = useMemo(() => {
        if (state.status !== 'success') return []
        const x = state.data
        const departureIds = new Set((x.departures ?? []).map((d) => d.id))
        if (departureIds.size === 0) return []
        const seen = new Set<string>()
        return representatives.filter((rep) => {
            if (!rep.resorts?.some((r) => departureIds.has(r.id))) return false
            if (seen.has(rep.id)) return false
            seen.add(rep.id)
            return true
        })
    }, [state, representatives])

    async function handleBookingSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (state.status !== 'success' || !id) return

        const name = bookingForm.holderName.trim()
        const email = bookingForm.email.trim()
        const phone = bookingForm.phone.trim()
        if (!name || !email || !phone) {
            setBookingError(t('booking.errorRequired'))
            return
        }
        if (bookingForm.touristCount < 1) {
            setBookingError(t('booking.errorTouristCount'))
            return
        }

        setBookingState('submitting')
        setBookingError('')

        try {
            const result = await createReservation({
                excursionId: id,
                touristCount: bookingForm.touristCount,
                holderName: name,
                email,
                phone,
                excursionDate: bookingForm.excursionDate || null,
                notes: bookingForm.notes.trim() || null,
            })
            setBookingId(result.id)
            setBookingEmail(email)
            setBookingState('success')
            setBookingForm(emptyBookingForm())
        } catch (err: unknown) {
            setBookingState('error')
            setBookingError(err instanceof Error ? err.message : 'Грешка при резервацията')
        }
    }

    if (state.status === 'loading') {
        return <View align="center" padding={16}><Loader size="large" /></View>
    }

    if (state.status === 'error') {
        return (
            <View align="center" padding={16} gap={3}>
                <Text variant="title-2">⚠️</Text>
                <Text color="critical">{state.message}</Text>
            </View>
        )
    }

    const x = state.data
    const pageTitle = `${x.destination} — ${t('nav.excursions')}`
    const metaDesc = stripHtml(x.description).slice(0, 158)
    const priceNum = x.price ?? null
    const totalPrice = priceNum != null ? priceNum * bookingForm.touristCount : null

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const hasFutureDates = x.departureDates != null &&
        x.departureDates.some(d => { const [y, m, day] = d.split('-').map(Number); return new Date(y, m - 1, day) >= today })
    const bookingAvailable = priceNum != null && hasFutureDates

    const coverPhotoAbsolute = x.photos.length > 0 ? resolvePhotoUrl(x.photos[0].url) : null

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'TouristAttraction',
        name: x.destination,
        description: metaDesc,
        ...(coverPhotoAbsolute ? { image: coverPhotoAbsolute } : {}),
        ...(x.price != null ? {
            offers: {
                '@type': 'Offer',
                price: x.price,
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
            },
        } : {}),
        ...(x.departures?.length > 0 ? {
            location: x.departures.map(d => ({ '@type': 'Place', name: d.name, address: { '@type': 'PostalAddress', addressCountry: 'BG' } })),
        } : {}),
        ...(x.departureDates?.length ? {
            event: x.departureDates.map(d => ({
                '@type': 'Event',
                startDate: d,
                location: x.departures?.map(dep => ({ '@type': 'Place', name: dep.name })) ?? [],
            })),
        } : {}),
        provider: { '@type': 'TravelAgency', name: 'Solvex Tourist Agency' },
    }

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDesc} />
                {coverPhotoAbsolute && <meta property="og:image" content={coverPhotoAbsolute} />}
                {coverPhotoAbsolute && <meta name="twitter:image" content={coverPhotoAbsolute} />}
                <meta name="twitter:card" content="summary_large_image" />
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>
            <View maxWidth="1200px" gap={4} width="100%" paddingInline={{ s: 4, m: 6 }} paddingBlock={{ s: 5, m: 8 }} attributes={{ style: { margin: '0 auto' } }}>
                <View justify="space-between" direction="row" align="center">
                    <Button icon={<ArrowBigLeft />} variant={badgeVariant} color={badgeColor} onClick={() => navigate(-1)}>
                        {t('repDetail.back')}
                    </Button>
                    {x.departures?.length > 0 && (
                        <Text variant="body-2" color="neutral-faded">
                            📍 {t('detail.departureFrom')} {x.departures.map(d => d.name).join(', ')}
                        </Text>
                    )}
                </View>

                {/* Header */}
                <Text as="h1" variant={{ s: 'title-6', m: 'title-5' }}>{x.destination}</Text>

                {/* Photos */}
                {x.photos.length > 0 && (
                    <View gap={3} paddingBottom={5}>
                        <View borderRadius="medium" overflow="hidden" backgroundColor='elevation-raised'>
                            <img
                                src={resolvePhotoUrl(x.photos[activePhoto].url)!}
                                alt={x.photos[activePhoto].caption ?? x.destination}
                                style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }}
                            />
                        </View>
                        {x.photos[activePhoto].caption && (
                            <Text variant="body-2" color="neutral-faded" align="center">
                                {x.photos[activePhoto].caption}
                            </Text>
                        )}
                        {x.photos.length > 1 && (
                            <View direction="row" gap={2} wrap>
                                {x.photos.map((p: Photo, i: number) => (
                                    <img
                                        key={p.id}
                                        src={resolvePhotoUrl(p.url)!}
                                        alt={p.caption ?? `${t('detail.photo')} ${i + 1}`}
                                        loading="lazy"
                                        onClick={() => setActivePhoto(i)}
                                        style={{
                                            width: 96, height: 64, objectFit: 'cover',
                                            borderRadius: 6, cursor: 'pointer',
                                            border: i === activePhoto ? '2px solid var(--primary)' : '2px solid transparent',
                                            opacity: i === activePhoto ? 1 : 0.7,
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                <View
                    shadow="raised"
                    borderRadius="medium"
                    backgroundColor="elevation-raised"
                    overflow="auto"
                    width="100%"
                    attributes={{ style: { minWidth: 0 } }}
                >
                    <Text
                        as="div"
                        variant="body-1"
                        color="neutral-faded"
                        className="excursion-description"
                        attributes={{
                            dangerouslySetInnerHTML: { __html: rewriteUploadUrlsInHtml(x.description) },
                            style: { minWidth: 0, width: '100%', lineHeight: 1.7 },
                        }}
                    />
                    {x.price && <View
                        direction="row"
                        align="baseline"
                        justify="start"
                        gap={2} padding={5}
                    >
                        <Text variant="body-1" weight="bold" color="neutral">
                            {t('excursions.price')}:
                        </Text>
                        <Badge color="positive" size="large">
                            <Text variant="body-1" weight="bold">{x.price} €</Text>
                        </Badge>
                    </View>
                    }
                </View>

                {/* Departure dates info */}
                {x.departureDates && x.departureDates.length > 0 && (
                    <View gap={2}>
                        <Text variant="body-1" weight="bold">📅 {t('detail.availableDates')}</Text>
                        <View direction="row" gap={2} wrap>
                            {x.departureDates.map((d) => {
                                const [y, m, day] = d.split('-').map(Number)
                                const label = new Date(y, m - 1, day).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
                                const selected = bookingForm.excursionDate === d
                                return (
                                    <Badge
                                        key={d}
                                        variant={selected ? 'solid' : 'outline'}
                                        color="primary"
                                        size="large"
                                        attributes={{
                                            onClick: bookingAvailable ? () => {
                                                setBookingForm(f => ({ ...f, excursionDate: d }))
                                                document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                            } : undefined,
                                            style: bookingAvailable ? { cursor: 'pointer' } : undefined,
                                        }}
                                    >
                                        {label}
                                    </Badge>
                                )
                            })}
                        </View>
                    </View>
                )}

                {/* Reservation form */}
                {bookingAvailable && <Card attributes={{ id: 'booking-form' }}>
                    <View gap={4}>
                        <View gap={1}>
                            <Text as="h2" variant="featured-2" weight="bold">{t('booking.title')}</Text>
                            <Text variant="body-2" color="neutral-faded">
                                {t('booking.subtitle')}
                            </Text>
                        </View>
                        <Divider />

                        {bookingState === 'success' ? (
                            <View gap={5} align="center" paddingBlock={4}>
                                <View
                                    borderRadius="large"
                                    padding={5}
                                    backgroundColor="positive-faded"
                                    align="center"
                                    gap={3}
                                    width="100%"
                                >
                                    <Text variant="title-2">✅</Text>
                                    <Text variant="featured-2" weight="bold" align="center">
                                        {t('booking.successTitle')}
                                    </Text>
                                    <View gap={1} align="center">
                                        <Text variant="body-2" color="neutral-faded" align="center">
                                            {t('booking.successRef')}
                                        </Text>
                                        <Text
                                            variant="body-1"
                                            weight="bold"
                                            attributes={{ style: { fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center', userSelect: 'all' } }}
                                        >
                                            {bookingId}
                                        </Text>
                                    </View>
                                    <Text variant="body-2" color="neutral-faded" align="center">
                                        {t('booking.successHint')}
                                    </Text>
                                </View>

                                {priceNum != null && totalPrice != null && totalPrice > 0 && (
                                    <View gap={3} align="center" width="100%" maxWidth="320px">
                                        <Divider />
                                        <Text variant="body-1" weight="bold" align="center">{t('payment.completePayment')}</Text>
                                        <RevolutPayButton
                                            reservationId={bookingId}
                                            email={bookingEmail}
                                            totalPrice={totalPrice}
                                            onSuccess={() => navigate(`/booking/${bookingId}`)}
                                            onCancel={() => {}}
                                        />
                                        <Text variant="body-3" color="neutral-faded" align="center">
                                            {t('payment.orPayLater')}
                                        </Text>
                                    </View>
                                )}

                                <View direction="row" gap={3} wrap justify="center">
                                    <Button variant="solid" color="primary" onClick={() => navigate(`/booking/${bookingId}`)}>
                                        🎟️ {t('booking.viewTicket')}
                                    </Button>
                                    <Button variant="outline" color="neutral" onClick={() => { setBookingState('idle'); setBookingError('') }}>
                                        {t('booking.newBooking')}
                                    </Button>
                                </View>
                            </View>
                        ) : (
                            <form noValidate onSubmit={(e) => void handleBookingSubmit(e)}>
                                <View gap={5}>
                                    <Grid columns={{ s: 1, m: 2 }} gap={4}>

                                        {/* Tourist count */}
                                        <FormControl>
                                            <FormControl.Label>{t('booking.touristCount')}</FormControl.Label>
                                            <View direction="row" gap={2} align="center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    color="neutral"
                                                    disabled={bookingForm.touristCount <= 1}
                                                    onClick={() => setBookingForm(f => ({ ...f, touristCount: Math.max(1, f.touristCount - 1) }))}
                                                >−</Button>
                                                <Text variant="title-6" weight="bold" attributes={{ style: { minWidth: 36, textAlign: 'center' } }}>
                                                    {bookingForm.touristCount}
                                                </Text>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    color="neutral"
                                                    onClick={() => setBookingForm(f => ({ ...f, touristCount: f.touristCount + 1 }))}
                                                >+</Button>
                                            </View>
                                            {priceNum != null && (
                                                <FormControl.Helper>
                                                    {t('booking.touristCountHelper', { count: bookingForm.touristCount, price: priceNum, total: totalPrice })}
                                                </FormControl.Helper>
                                            )}
                                        </FormControl>

                                        {/* Departure date */}
                                        {x.departureDates && x.departureDates.length > 0 ? (
                                            <FormControl required>
                                                <FormControl.Label>{t('booking.departureDate')}</FormControl.Label>
                                                <Select
                                                    name="excursionDate"
                                                    value={bookingForm.excursionDate}
                                                    onChange={({ value }) => setBookingForm(f => ({ ...f, excursionDate: value }))}
                                                >
                                                    <option value="">{t('booking.departureDateSelect')}</option>
                                                    {x.departureDates.map((d) => {
                                                        const [y, m, day] = d.split('-').map(Number)
                                                        const label = new Date(y, m - 1, day).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })
                                                        return <option key={d} value={d}>{label}</option>
                                                    })}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <FormControl>
                                                <FormControl.Label>{t('booking.desiredDate')}</FormControl.Label>
                                                <TextField
                                                    name="excursionDate"
                                                    value={bookingForm.excursionDate}
                                                    onChange={({ value }) => setBookingForm(f => ({ ...f, excursionDate: value }))}
                                                    inputAttributes={{ type: 'date' }}
                                                />
                                            </FormControl>
                                        )}

                                        {/* Holder name */}
                                        <FormControl required>
                                            <FormControl.Label>{t('booking.holderName')}</FormControl.Label>
                                            <TextField
                                                name="holderName"
                                                placeholder={t('booking.holderNamePlaceholder')}
                                                value={bookingForm.holderName}
                                                onChange={({ value }) => setBookingForm(f => ({ ...f, holderName: value }))}
                                                inputAttributes={{ autoComplete: 'name' }}
                                            />
                                        </FormControl>

                                        {/* Phone */}
                                        <FormControl required>
                                            <FormControl.Label>{t('booking.phone')}</FormControl.Label>
                                            <TextField
                                                name="phone"
                                                placeholder="+359 888 123 456"
                                                value={bookingForm.phone}
                                                onChange={({ value }) => setBookingForm(f => ({ ...f, phone: value }))}
                                                inputAttributes={{ type: 'tel', autoComplete: 'tel' }}
                                            />
                                        </FormControl>

                                        {/* Email */}
                                        <View attributes={{ style: { gridColumn: '1 / -1' } }}>
                                            <FormControl required>
                                                <FormControl.Label>{t('booking.email')}</FormControl.Label>
                                                <TextField
                                                    name="email"
                                                    placeholder="ivan@example.com"
                                                    value={bookingForm.email}
                                                    onChange={({ value }) => setBookingForm(f => ({ ...f, email: value }))}
                                                    inputAttributes={{ type: 'email', autoComplete: 'email' }}
                                                />
                                            </FormControl>
                                        </View>

                                        {/* Notes */}
                                        <View attributes={{ style: { gridColumn: '1 / -1' } }}>
                                            <FormControl>
                                                <FormControl.Label>{t('booking.notes')}</FormControl.Label>
                                                <TextArea
                                                    name="notes"
                                                    placeholder={t('booking.notesPlaceholder')}
                                                    value={bookingForm.notes}
                                                    onChange={({ value }) => setBookingForm(f => ({ ...f, notes: value }))}
                                                />
                                            </FormControl>
                                        </View>
                                    </Grid>

                                    {bookingError && (
                                        <View
                                            padding={3}
                                            borderRadius="medium"
                                            backgroundColor="critical-faded"
                                        >
                                            <Text color="critical" variant="body-2">{bookingError}</Text>
                                        </View>
                                    )}

                                    <Divider />

                                    <View direction="row" gap={3} align="center" justify="space-between" wrap>
                                        <Button
                                            type="submit"
                                            variant="solid"
                                            color="primary"
                                            size="large"
                                            disabled={bookingState === 'submitting'}
                                        >
                                            {bookingState === 'submitting' ? t('booking.submitting') : t('booking.submit')}
                                        </Button>
                                        {priceNum != null && totalPrice != null && (
                                            <Badge color="positive" size="large">
                                                <Text variant="featured-2" weight="bold">{t('booking.totalAmount', { total: totalPrice })}</Text>
                                            </Badge>
                                        )}
                                    </View>
                                </View>
                            </form>
                        )}
                    </View>
                </Card>}

                {departureRepresentatives.length > 0 && (
                    <Card>
                        <View gap={4} paddingTop={2}>
                            <Text variant="featured-1" color="neutral-faded">
                                {t('detail.departureRepresentativesHint')}
                            </Text>
                            <View gap={3} attributes={{ style: { alignItems: 'stretch' } }}>
                                <Grid columns={{ s: 1, m: 2 }} gap={4}>
                                    {departureRepresentatives.map((rep) => (
                                        <RepresentativeCompact key={rep.id} rep={rep} />
                                    ))}
                                </Grid>
                            </View>
                        </View>
                    </Card>
                )}
            </View>
        </>
    )
}
