const BASE = '/api/pets'

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
      } else if (body && body.detail) message = body.detail
    } catch {
      /* nicht-JSON-Antwort */
    }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

export function listPets() {
  return request(BASE)
}

export function createPet(data) {
  return request(BASE, { method: 'POST', body: JSON.stringify(data) })
}

export function updatePet(id, data) {
  return request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deletePet(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}
