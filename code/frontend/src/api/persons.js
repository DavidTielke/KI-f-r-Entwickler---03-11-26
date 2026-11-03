const BASE = '/api/persons'

async function request(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      if (body && body.title) message = body.title
      else if (body && body.errors) {
        const flat = Object.values(body.errors).flat()
        if (flat.length) message = flat.join(', ')
      }
    } catch {
      /* nicht-JSON-Antwort */
    }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

export function listPersons() {
  return request(BASE)
}

export function getPerson(id) {
  return request(`${BASE}/${id}`)
}

export function createPerson(data) {
  return request(BASE, { method: 'POST', body: JSON.stringify(data) })
}

export function updatePerson(id, data) {
  return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deletePerson(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}

export function reorderPersons(ids) {
  return request(`${BASE}/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  })
}
