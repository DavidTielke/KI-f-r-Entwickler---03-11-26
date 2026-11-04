const paths = {
  cockpit: ['M3 13h8V3H3v10Z', 'M13 21h8V11h-8v10Z', 'M13 3v4h8V3h-8Z', 'M3 21h8v-4H3v4Z'],
  idea: ['M9 18h6', 'M10 22h4', 'M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  factory: ['M2 20h20', 'M4 20V9l6 4V9l6 4V4h4v16'],
  history: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5', 'M12 7v5l4 2'],
  settings: ['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6'],
  mic: ['M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z', 'M19 10v2a7 7 0 0 1-14 0v-2', 'M12 19v3'],
  micOff: ['m2 2 20 20', 'M9 9v3a3 3 0 0 0 5.1 2.1', 'M15 9.3V5a3 3 0 0 0-5.9-.7', 'M19 10v2c0 .8-.1 1.5-.4 2.2', 'M5 10v2a7 7 0 0 0 11 5.7', 'M12 19v3'],
  speaker: ['M11 5 6 9H2v6h4l5 4V5Z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M19 5a10 10 0 0 1 0 14'],
  send: ['M5 12h14', 'm12 5 7 7-7 7'],
  plus: ['M12 5v14', 'M5 12h14'],
  check: ['M20 6 9 17l-5-5'],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  pencil: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7.5 19 3 21l1.5-5.5L16.5 3.5Z'],
  trash: ['M3 6h18', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M10 11v6', 'M14 11v6'],
  chevronRight: ['m9 6 6 6-6 6'],
  chevronDown: ['m6 9 6 6 6-6'],
  chevronLeft: ['m15 6-6 6 6 6'],
  external: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
  stop: ['M6 6h12v12H6z'],
  refresh: ['M21 12a9 9 0 0 1-15 6.7L3 16', 'M3 21v-5h5', 'M3 12a9 9 0 0 1 15-6.7L21 8', 'M21 3v5h-5'],
  undo: ['M9 14 4 9l5-5', 'M4 9h11a5 5 0 0 1 0 10h-3'],
  quality: ['M9 11l3 3L22 4', 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'],
  alert: ['M12 9v4', 'M12 17h.01', 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'],
  dialog: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z'],
  document: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z', 'M14 2v6h6', 'M8 13h8', 'M8 17h8'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z', 'M14 2v6h6'],
}

export function Icon({ name, size = 16, strokeWidth = 2 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: '0 0 auto' }}
    >
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
