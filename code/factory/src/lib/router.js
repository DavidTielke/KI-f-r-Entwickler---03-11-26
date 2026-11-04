import { useEffect, useState } from 'react'

function parse() {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [pathPart, queryPart] = raw.split('?')
  return {
    segments: pathPart.split('/').filter(Boolean).map(decodeURIComponent),
    query: new URLSearchParams(queryPart ?? ''),
  }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function navigate(hash) {
  window.location.hash = hash
}
