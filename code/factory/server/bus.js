// Live-Benachrichtigung der geöffneten Oberflächen per Server-Sent Events.
const clients = new Set()

export function addClient(res) {
  clients.add(res)
  res.on('close', () => clients.delete(res))
}

export function notify(topic, id = null) {
  const payload = `data: ${JSON.stringify({ topic, id })}\n\n`
  for (const client of clients) client.write(payload)
}

// Hält die Verbindung auch über Pausen hinweg offen.
setInterval(() => {
  for (const client of clients) client.write(': ping\n\n')
}, 25000).unref()
