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
            >
                <View direction={{ s: 'row', m: 'row' }} gap={{ s: 4, m: 8 }} align="center" justify="space-between">
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
                        </View>
                        {/* Desktop: outline button on the right */}
                        <Hidden hide={{ s: true, m: false }}>
                            <Button
                                variant="outline"
                                color="primary"
                                size="small"
                                onClick={(e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => { e.stopPropagation(); navigate(`/representatives/${rep.id}`) }}
                            >
                                {t('representatives.viewProfile')}
                            </Button>
                        </Hidden>
                    </View>
                </View>
            </View>
        </Actionable>
    )
}