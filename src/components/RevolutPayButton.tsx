import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, Loader, Divider } from 'reshaped'
import RevolutCheckout from '@revolut/checkout'
import type { RevolutCheckoutInstance, RevolutCheckoutError } from '@revolut/checkout'
import { createPaymentOrder } from '../api'

interface Props {
    reservationId: string
    email: string
    totalPrice: number
    onSuccess?: () => void
    onCancel?: () => void
    onError?: (err: string) => void
}

type PrepState =
    | { status: 'loading' }
    | { status: 'ready' }
    | { status: 'error'; message: string }

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://trips.solvex.bg'

export function RevolutPayButton({
    reservationId,
    email,
    totalPrice,
    onSuccess,
    onCancel,
    onError,
}: Props) {
    const { t } = useTranslation()
    const [prep, setPrep] = useState<PrepState>({ status: 'loading' })
    const [paying, setPaying] = useState(false)
    const [hasNativePay, setHasNativePay] = useState(false)
    const instanceRef = useRef<RevolutCheckoutInstance | null>(null)
    const revolutPayRef = useRef<HTMLDivElement>(null)
    const paymentRequestRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let cancelled = false

        createPaymentOrder(reservationId)
            .then(async ({ token, mode }) => {
                if (cancelled) return
                const instance = await RevolutCheckout(token, mode)
                if (cancelled) { instance.destroy(); return }
                instanceRef.current = instance
                setPrep({ status: 'ready' })
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    const msg = err instanceof Error ? err.message : t('payment.errorGeneric')
                    setPrep({ status: 'error', message: msg })
                }
            })

        return () => {
            cancelled = true
            instanceRef.current?.destroy()
            instanceRef.current = null
        }
    }, [reservationId]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (prep.status !== 'ready' || !instanceRef.current) return
        const instance = instanceRef.current
        let alive = true

        const successCb = () => onSuccess?.()
        const cancelCb = () => onCancel?.()
        const errorCb = (err: RevolutCheckoutError) =>
            onError?.(err?.message ?? t('payment.errorGeneric'))

        // Revolut Pay button
        if (revolutPayRef.current) {
            instance.revolutPay({
                target: revolutPayRef.current,
                email,
                onSuccess: successCb,
                onCancel: cancelCb,
                onError: errorCb,
            })
        }

        // Apple Pay / Google Pay
        if (paymentRequestRef.current) {
            const payReq = instance.paymentRequest({
                target: paymentRequestRef.current,
                requestPayerEmail: true,
                requestPayerName: true,
                onSuccess: successCb,
                onCancel: cancelCb,
                onError: errorCb,
            })
            payReq.canMakePayment().then(method => {
                if (method && alive) {
                    setHasNativePay(true)
                    void payReq.render()
                }
            })
        }

        return () => { alive = false }
    }, [prep.status]) // eslint-disable-line react-hooks/exhaustive-deps

    async function handleCardPay() {
        if (!instanceRef.current) return
        setPaying(true)
        try {
            // redirectUrl is supported at runtime but missing from SDK TypeScript types
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(instanceRef.current.payWithPopup as (opts: any) => void)({
                email,
                redirectUrl: `${SITE_URL}/booking/payment/success?rid=${reservationId}`,
                onSuccess() {
                    setPaying(false)
                    onSuccess?.()
                },
                onError(err: unknown) {
                    setPaying(false)
                    onError?.(String(err ?? t('payment.errorGeneric')))
                },
                onCancel() {
                    setPaying(false)
                    onCancel?.()
                },
            })
        } catch (err) {
            setPaying(false)
            onError?.(err instanceof Error ? err.message : t('payment.errorGeneric'))
        }
    }

    if (prep.status === 'loading') {
        return (
            <View direction="row" gap={2} align="center">
                <Loader size="small" />
                <Text variant="body-2" color="neutral-faded">{t('payment.loading')}</Text>
            </View>
        )
    }

    if (prep.status === 'error') {
        return <Text color="critical" variant="body-2">{prep.message}</Text>
    }

    return (
        <View gap={3}>
            {/* Revolut Pay button — always mounted, SDK controls visibility */}
            <div ref={revolutPayRef} />

            {/* Apple Pay / Google Pay — rendered only when available */}
            <div
                ref={paymentRequestRef}
                style={{ display: hasNativePay ? 'block' : 'none' }}
            />

            <View direction="row" align="center" gap={2}>
                <View grow><Divider /></View>
                <Text variant="body-3" color="neutral-faded">{t('payment.orPayWithCard')}</Text>
                <View grow><Divider /></View>
            </View>

            <Button
                variant="solid"
                color="primary"
                size="large"
                disabled={paying}
                onClick={() => void handleCardPay()}
                attributes={{ style: { width: '100%' } }}
            >
                {paying ? (
                    <View direction="row" gap={2} align="center">
                        <Loader size="small" />
                        <span>{t('payment.loading')}</span>
                    </View>
                ) : (
                    `💳 ${t('payment.payNow', { total: totalPrice })}`
                )}
            </Button>
        </View>
    )
}
