import { View, Avatar, Hidden, Button, Text, Badge, Actionable, useTheme } from "reshaped";
import { resolvePhotoUrl, type RepresentativeDto } from "../api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function Representative({ rep }: { rep: RepresentativeDto }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { colorMode } = useTheme();
    const badgeColor = colorMode === 'dark' ? 'primary' : 'neutral';
    const badgeVariant = colorMode === 'dark' ? 'solid' : 'outline';
    return (
        <Actionable
            onClick={() => navigate(`/representatives/${rep.id}`)}
            attributes={{ style: { display: 'block', width: '100%' } }}
        >
            <View
                shadow="overlay"
                padding={{ s: 4, m: 5 }}
                borderRadius="medium"
                backgroundColor="elevation-raised"
                gap={2}
            >
                <View direction="row" gap={{ s: 4, m: 8 }} align="center" justify="space-between">
                    <Avatar
                        src={resolvePhotoUrl(rep.photoUrl) ?? undefined}
                        initials={rep.name.charAt(0)}
                        size={{ s: 14, m: 20 }}
                    />
                    <View direction={{ s: "column", m: "row" }} gap={{ s: 3, m: 6 }} justify="space-between" grow align="baseline">
                        <View gap={1}>
                            <Text variant={{ s: 'featured-2', m: 'title-6' }} weight="bold">{rep.name}</Text>
                            {rep.phone && <Text variant="body-2" color="neutral-faded">📞 {rep.phone}</Text>}
                            {rep.email && <Text variant="body-2" color="neutral-faded">✉️ {rep.email}</Text>}
                        </View>
                        <View direction="column" gap={3} align="start" grow>

                            <Hidden hide={{ s: true, m: false }}>
                                <View gap={3}>
                                    {rep.languages?.length ? (
                                        <View gap={1} direction="row" align="center">
                                            <Text variant="body-2" color="neutral-faded">🌐</Text>
                                            {rep.languages.map((l) => <Badge key={l} variant={badgeVariant} color={badgeColor}>{l}</Badge>)}
                                        </View>
                                    ) : null}
                                </View>
                                <View gap={3}>
                                    {rep.resorts?.length ? (
                                        <View gap={1} direction="row" align="center">
                                            <Text variant="body-2" color="neutral-faded">🏘️</Text>
                                            {rep.resorts.map((resort) => <Badge key={resort.id} variant={badgeVariant} color={badgeColor}>{resort.name}</Badge>)}
                                        </View>
                                    ) : null}
                                </View>
                            </Hidden>
                        </View>
                        {/* Desktop: outline button on the right */}
                        <Hidden hide={{ s: true, m: false }}>
                            <Button
                                variant={badgeVariant}
                                color={badgeColor}
                                size="small"
                                onClick={(e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => { e.stopPropagation(); navigate(`/representatives/${rep.id}`) }}
                            >
                                {t('representatives.viewProfile')}
                            </Button>
                        </Hidden>
                    </View>
                </View>
                <Hidden hide={{ s: false, m: true }}>
                    <View gap={3}>
                        {rep.languages?.length ? (
                            <View gap={1} direction="row" align="center">
                                <Text variant="body-2" color="neutral-faded">🌐</Text>
                                {rep.languages.map((l) => <Badge key={l} variant={badgeVariant} color={badgeColor}>{l}</Badge>)}
                            </View>
                        ) : null}
                        {rep.resorts?.length ? (
                            <View gap={1} direction="row" align="center">
                                <Text variant="body-2" color="neutral-faded">🏘️</Text>
                                {rep.resorts.map((resort) => <Badge key={resort.id} variant={badgeVariant} color={badgeColor}>{resort.name}</Badge>)}
                            </View>
                        ) : null}
                    </View>
                </Hidden>
            </View>
        </Actionable >
    )
}

/** Компактна карта за секцията „представители“ на страницата на екскурзия. */
export function RepresentativeCompact({ rep }: { rep: RepresentativeDto }) {
    const navigate = useNavigate()
    const { colorMode } = useTheme()
    const badgeVariant = colorMode === 'dark' ? 'solid' : 'outline'

    return (
        <Actionable
            onClick={() => navigate(`/representatives/${rep.id}`)}
            attributes={{ style: { display: 'block', width: '100%' } }}
        >
            <View
                shadow="overlay"
                padding={4}
                borderRadius="medium"
                backgroundColor="elevation-raised"
                gap={3}
            >
                <View direction="row" gap={3} align="center" justify="space-between">
                    <Avatar
                        src={resolvePhotoUrl(rep.photoUrl) ?? undefined}
                        initials={rep.name.charAt(0)}
                        size={12}
                    />
                    <View direction="row" grow gap={3} justify="space-between">
                        <View gap={3} grow>
                            <Text variant="featured-2">
                                {rep.name}
                            </Text>
                            {rep.phone && (
                                <Text variant="body-1" color="neutral-faded">📞 {rep.phone}</Text>
                            )}
                        </View>
                        <Hidden hide={{ s: true, m: false }}>
                            <View direction="column" gap={2}>
                                {rep.languages?.length ? (
                                    <View direction="row" gap={3}>
                                        {rep.languages.map((l) => (
                                            <Badge key={l} variant={badgeVariant} size="large" color="primary">
                                                {l}
                                            </Badge>
                                        ))}
                                    </View>
                                ) : null}
                                <View direction="row" gap={2}>
                                    {rep.resorts.map((r) => (
                                        <Badge key={r.id} variant={badgeVariant} color="primary" size="large">
                                            {r.name}
                                        </Badge>
                                    ))}
                                </View>
                            </View>
                        </Hidden>
                    </View>

                </View>
                <Hidden hide={{ s: false, m: true }}>
                    <View direction="column" gap={2}>
                        {rep.languages?.length ? (
                            <View direction="row" gap={3}>
                                <Text variant="body-2" color="neutral-faded">🌐</Text>
                                {rep.languages.map((l) => (
                                    <Badge key={l} variant={badgeVariant} size="large" color="primary">
                                        {l}
                                    </Badge>
                                ))}
                            </View>
                        ) : null}
                    </View>
                </Hidden>
            </View>
        </Actionable>
    )
}