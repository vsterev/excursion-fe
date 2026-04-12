import type { SVGProps } from 'react'

type FlagProps = Omit<SVGProps<SVGSVGElement>, 'viewBox' | 'xmlns'>

const common: Pick<FlagProps, 'role' | 'width' | 'height'> = {
  role: 'img',
  width: 22,
  height: 15,
}

/** United Kingdom — used for English (en) */
export function FlagGb(props: FlagProps) {
  return (
    <svg {...common} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>United Kingdom</title>
      <rect width="60" height="30" fill="#012169" />
      <path stroke="#fff" strokeWidth="6" d="M0,0 60,30M60,0 0,30" />
      <path stroke="#C8102E" strokeWidth="4" d="M0,0 60,30M60,0 0,30" />
      <path stroke="#fff" strokeWidth="10" d="M0,15h60M30,0v30" />
      <path stroke="#C8102E" strokeWidth="6" d="M0,15h60M30,0v30" />
    </svg>
  )
}

export function FlagRo(props: FlagProps) {
  return (
    <svg {...common} viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Romania</title>
      <rect width="1" height="2" fill="#002B7F" />
      <rect x="1" width="1" height="2" fill="#FCD116" />
      <rect x="2" width="1" height="2" fill="#CE1126" />
    </svg>
  )
}

export function FlagUa(props: FlagProps) {
  return (
    <svg {...common} viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Ukraine</title>
      <rect width="3" height="1" fill="#0057B7" />
      <rect y="1" width="3" height="1" fill="#FFD700" />
    </svg>
  )
}

export function FlagRu(props: FlagProps) {
  return (
    <svg {...common} viewBox="0 0 9 6" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Russia</title>
      <rect width="9" height="2" y="0" fill="#fff" />
      <rect width="9" height="2" y="2" fill="#0039A6" />
      <rect width="9" height="2" y="4" fill="#D52B1E" />
    </svg>
  )
}
