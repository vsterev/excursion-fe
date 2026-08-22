import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { View, Text, Button, Loader } from 'reshaped'
import { getRevolutPayOrderIdURLParam } from '@revolut/checkout'

interface Props {
    result: 'success' | 'failure' | 'cancel'
}

export function BookingPaymentResultPage({ result }: Props) {
    const { t } = useTranslation()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const reservationId = searchParams.get('rid') ?? ''

    // On success, Revolut appends _rp_oid with order ID — we can use it for verification
    const revolOrderId = getRevolutPayOrderIdURLParam()
    if (revolOrderId) {
        console.log('[RevolutPay] order id on redirect:', revolOrderId)
    }

    // Auto-redirect to booking check after 3 seconds on success
    useEffect(() => {
        if (result === 'success' && reservationId) {
            const t = setTimeout(() => {
                navigate(`/booking/${reservationId}`, { replace: true })
            }, 3000)
            return () => clearTimeout(t)
        }
    }, [result, reservationId, navigate])

    const icon = result === 'success' ? '✅' : result === 'cancel' ? '↩️' : '❌'
    const titleKey =
        result === 'success'
            ? 'payment.successTitle'
            : result === 'cancel'
              ? 'payment.cancelTitle'
              : 'payment.failureTitle'
    const descKey =
        result === 'success'
            ? 'payment.successDesc'
            : result === 'cancel'
              ? 'payment.cancelDesc'
              : 'payment.failureDesc'

    return (
        <View
            align="center"
            justify="center"
            gap={5}
            padding={12}
            attributes={{ style: { minHeight: '60vh', textAlign: 'center' } }}
        >
            {result === 'success' ? (
                <>
                    <Text variant="featured-1">{icon}</Text>
                    <View gap={2} align="center">
                        <Text variant="title-4" weight="bold">{t(titleKey)}</Text>
                        <Text variant="body-1" color="neutral-faded">{t(descKey)}</Text>
                    </View>
                    {reservationId ? (
                        <View gap={2} align="center">
                            <Loader size="small" />
                            <Text variant="body-2" color="neutral-faded">{t('payment.redirecting')}</Text>
                            <Button
                                variant="solid"
                                color="primary"
                                onClick={() => navigate(`/booking/${reservationId}`, { replace: true })}
                            >
                                {t('payment.viewTicket')}
                            </Button>
                        </View>
                    ) : (
                        <Button variant="solid" color="primary" onClick={() => navigate('/')}>
                            {t('payment.goHome')}
                        </Button>
                    )}
                </>
            ) : (
                <>
                    <Text variant="featured-1">{icon}</Text>
                    <View gap={2} align="center">
                        <Text variant="title-4" weight="bold">{t(titleKey)}</Text>
                        <Text variant="body-1" color="neutral-faded">{t(descKey)}</Text>
                    </View>
                    <View direction="row" gap={3}>
                        {reservationId && (
                            <Button
                                variant="solid"
                                color="primary"
                                onClick={() => navigate(`/booking/${reservationId}`)}
                            >
                                {t('payment.tryAgain')}
                            </Button>
                        )}
                        <Button variant="ghost" color="neutral" onClick={() => navigate('/')}>
                            {t('payment.goHome')}
                        </Button>
                    </View>
                </>
            )}
        </View>
    )
}
