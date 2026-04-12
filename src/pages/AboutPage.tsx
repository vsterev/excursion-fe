import type { ReactElement } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { View, Text } from 'reshaped'

/** Decorative photos (Unsplash); thematic match to each section. */
const ABOUT_IMAGES = {
  story: 'https://thumbs.dreamstime.com/b/wooden-footbridge-over-river-black-sea-coast-albena-bulgaria-seaside-resort-87888901.jpg',
  company: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=960&q=80',
  vision: 'https://i.natgeofe.com/n/d89a3d07-56e7-493b-b16f-80adad0fa970/Bulgaria-BlackSeaCoast-thumb-520x389-480x359.png',
  accommodation: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=960&q=80',
  excursions: 'https://traventuria.com/wp-content/uploads/2016/10/sightseeing-on-budget.jpg',
  groups: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=960&q=80',
  mice: 'https://www.w12conferences.co.uk/wp-content/uploads/2019/08/w12-event-spaces.jpg',
  transport: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=960&q=80',
  abroad: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=960&q=80',
} as const

type ParagraphSection = {
  kind: 'paragraphs'
  titleKey: string
  paragraphsKey: string
  imageKey: keyof typeof ABOUT_IMAGES
  imageAltKey: string
}

type SimpleSection = {
  kind: 'simple'
  titleKey: string
  bodyKey: string
  imageKey: keyof typeof ABOUT_IMAGES
  imageAltKey: string
}

type VisionSection = {
  kind: 'vision'
  titleKey: string
  imageKey: keyof typeof ABOUT_IMAGES
  imageAltKey: string
}

const SECTIONS: (ParagraphSection | SimpleSection | VisionSection)[] = [
  { kind: 'paragraphs', titleKey: 'about.secStoryTitle', paragraphsKey: 'about.storyParagraphs', imageKey: 'story', imageAltKey: 'about.altStory' },
  { kind: 'paragraphs', titleKey: 'about.secCompanyTitle', paragraphsKey: 'about.companyParagraphs', imageKey: 'company', imageAltKey: 'about.altCompany' },
  { kind: 'vision', titleKey: 'about.secVisionTitle', imageKey: 'vision', imageAltKey: 'about.altVision' },
  { kind: 'paragraphs', titleKey: 'about.secAccommodationTitle', paragraphsKey: 'about.accommodationParagraphs', imageKey: 'accommodation', imageAltKey: 'about.altAccommodation' },
  { kind: 'paragraphs', titleKey: 'about.secExcursionsTitle', paragraphsKey: 'about.excursionsParagraphs', imageKey: 'excursions', imageAltKey: 'about.altExcursions' },
  { kind: 'simple', titleKey: 'about.secGroupsTitle', bodyKey: 'about.groupsBody', imageKey: 'groups', imageAltKey: 'about.altGroups' },
  { kind: 'simple', titleKey: 'about.secMiceTitle', bodyKey: 'about.miceBody', imageKey: 'mice', imageAltKey: 'about.altMice' },
  { kind: 'simple', titleKey: 'about.secTransportTitle', bodyKey: 'about.transportBody', imageKey: 'transport', imageAltKey: 'about.altTransport' },
  { kind: 'paragraphs', titleKey: 'about.secAbroadTitle', paragraphsKey: 'about.abroadParagraphs', imageKey: 'abroad', imageAltKey: 'about.altAbroad' },
]

function tStringArray(t: TFunction, key: string): string[] {
  const v = t(key, { returnObjects: true })
  return Array.isArray(v) ? (v as string[]).filter((x) => typeof x === 'string') : []
}

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <View
      maxWidth="960px"
      width="100%"
      paddingBlock={{ s: 5, m: 8 }}
      paddingInline={{ s: 4, m: 6 }}
      attributes={{ style: { margin: '0 auto' } }}
    >
      <View gap={1} paddingBottom={6}>
        <Text
          variant="body-1"
          weight="bold"
          attributes={{
            style: {
              display: 'inline-block',
              background: 'var(--color-background-primary)',
              color: 'var(--color-on-background-primary)',
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: 100,
              width: 'fit-content',
            },
          }}
        >
          {t('about.badge')}
        </Text>
        <Text as="h1" variant={{ s: 'title-6', m: 'title-5' }} weight="bold">
          {t('about.title')}
        </Text>
        <Text variant="body-2" color="neutral-faded" attributes={{ style: { maxWidth: 720, lineHeight: 1.55 } }}>
          {t('about.lead')}
        </Text>
      </View>

      <View gap={{ s: 6, m: 8 }}>
        {SECTIONS.map((section, index) => {
          const reversed = index % 2 === 1
          const src = ABOUT_IMAGES[section.imageKey]
          const alt = t(section.imageAltKey)

          let textInner: ReactElement
          if (section.kind === 'paragraphs') {
            const paras = tStringArray(t, section.paragraphsKey)
            textInner = (
              <View gap={3}>
                <Text as="h2" variant={{ s: 'title-6', m: 'title-5' }} weight="bold">
                  {t(section.titleKey)}
                </Text>
                {paras.map((p, i) => (
                  <Text key={i} variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: 1.6 } }}>
                    {p}
                  </Text>
                ))}
              </View>
            )
          } else if (section.kind === 'simple') {
            textInner = (
              <View gap={3}>
                <Text as="h2" variant={{ s: 'title-6', m: 'title-5' }} weight="bold">
                  {t(section.titleKey)}
                </Text>
                <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: 1.6 } }}>
                  {t(section.bodyKey)}
                </Text>
              </View>
            )
          } else {
            textInner = (
              <View gap={4}>
                <Text as="h2" variant={{ s: 'title-6', m: 'title-5' }} weight="bold">
                  {t(section.titleKey)}
                </Text>
                <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: 1.6 } }}>
                  {t('about.visionIntro')}
                </Text>
                <View gap={3}>
                  {(
                    [
                      ['about.valueQualityTitle', 'about.valueQualityBody'],
                      ['about.valueEthicsTitle', 'about.valueEthicsBody'],
                      ['about.valuePeopleTitle', 'about.valuePeopleBody'],
                    ] as const
                  ).map(([tk, bk]) => (
                    <View key={tk} gap={1}>
                      <Text variant="body-2" weight="bold">
                        {t(tk)}
                      </Text>
                      <Text variant="body-2" color="neutral-faded" attributes={{ style: { lineHeight: 1.6 } }}>
                        {t(bk)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          }

          return (
            <div key={section.titleKey} className={`about-split${reversed ? ' about-split--rev' : ''}`}>
              <div className="about-split-text">{textInner}</div>
              <div className="about-split-media">
                <img src={src} alt={alt} loading="lazy" decoding="async" />
              </div>
            </div>
          )
        })}
      </View>
    </View>
  )
}
