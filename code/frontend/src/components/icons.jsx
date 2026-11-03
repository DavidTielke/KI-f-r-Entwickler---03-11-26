function iconProps(size) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
}

export function IconPencil() {
  return (
    <svg {...iconProps(16)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7.5 19 3 21l1.5-5.5L16.5 3.5Z" />
    </svg>
  )
}

export function IconTrash(size = 16) {
  return (
    <svg {...iconProps(size)}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export function IconClose() {
  return (
    <svg {...iconProps(16)}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function IconGrip(size = 16) {
  return (
    <svg {...iconProps(size)}>
      <path d="M9 6h.01" />
      <path d="M15 6h.01" />
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M9 18h.01" />
      <path d="M15 18h.01" />
    </svg>
  )
}

export function IconChevronUp(size = 16) {
  return (
    <svg {...iconProps(size)}>
      <path d="m6 14 6-6 6 6" />
    </svg>
  )
}

export function IconChevronDown(size = 16) {
  return (
    <svg {...iconProps(size)}>
      <path d="m6 10 6 6 6-6" />
    </svg>
  )
}
