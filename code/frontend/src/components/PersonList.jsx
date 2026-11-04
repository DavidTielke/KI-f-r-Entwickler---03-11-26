import { useLayoutEffect, useRef, useState } from 'react'
import {
  IconPencil,
  IconTrash,
  IconGrip,
  IconChevronUp,
  IconChevronDown,
} from './icons.jsx'

const RAIN_COLORS = ['#f38a2c', '#7cb342', '#ff5252', '#40c4ff', '#ffca28', '#e040fb']

function spawnRain(overlay, x, y) {
  const count = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    const size = 5 + Math.random() * 4
    el.style.cssText = `position:fixed;left:${x + (Math.random() * 24 - 12)}px;top:${y - 8}px;width:${size}px;height:${size}px;border-radius:50%;background:${RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)]};pointer-events:none;z-index:60;`
    overlay.appendChild(el)
    const dx = Math.random() * 40 - 20
    const dy = 60 + Math.random() * 80
    el.animate(
      [
        { transform: 'translate(0, 0)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 400, easing: 'ease-in' },
    ).onfinish = () => el.remove()
  }
  while (overlay.childElementCount > 80) overlay.firstElementChild.remove()
}

export default function PersonList({ persons, onEdit, onDelete, onReorder }) {
  const [rows, setRows] = useState(persons)
  const [dragId, setDragId] = useState(null)
  const [armedId, setArmedId] = useState(null)
  const [flashId, setFlashId] = useState(null)
  const tableRef = useRef(null)
  const rowRefs = useRef(new Map())
  const lastTops = useRef(new Map())
  const anims = useRef(new Map())
  const dragIdRef = useRef(null)
  const overlayRef = useRef(null)
  const lastRainAt = useRef(0)

  // Wenn die Parent-Daten neu sind (Laden, Anlegen, Löschen), Zeilen zurücksetzen
  const [prevPersons, setPrevPersons] = useState(persons)
  if (persons !== prevPersons) {
    setPrevPersons(persons)
    setRows(persons)
  }

  // FLIP: verschobene Zeilen gleiten in ihre neue Position (220 ms, nur Transform).
  // Laufende Animationen werden zuerst abgebrochen, sonst misst getBoundingClientRect
  // Positionen inkl. der noch laufenden Verformung und neue FLIP-Animationen summieren sich.
  // Waehrend eines Drags keine Animationen: FLIP-Transforms verschieben die Zeilen optisch
  // und damit auch ihre Hit-Testing-Position. dragover trifft die noch gleitende Zeile und
  // der Tausch oscilliert. Beim Ziehen also Snap; nur per Pfeil-Button gleiten die Zeilen.
  useLayoutEffect(() => {
    anims.current.forEach((a) => a.cancel())
    anims.current.clear()

    const prev = lastTops.current
    const base = tableRef.current ? tableRef.current.getBoundingClientRect().top : 0
    const next = new Map()
    // Position relativ zur Tabelle (nicht zum Viewport), sonst verfälscht Scrollen jede Messung
    rowRefs.current.forEach((el, id) => next.set(id, el.getBoundingClientRect().top - base))
    if (dragIdRef.current === null) {
      rowRefs.current.forEach((el, id) => {
        const from = prev.get(id)
        const to = next.get(id)
        if (from !== undefined && to !== from && el.animate) {
          anims.current.set(id, el.animate(
            [{ transform: `translateY(${from - to}px)` }, { transform: 'translateY(0)' }],
            { duration: 220, easing: 'ease-out' }
          ))
        }
      })
    }
    lastTops.current = next
  }, [rows])

  function commit(next) {
    onReorder(next.map((p) => p.id))
  }

  function moveRow(id, direction) {
    const from = rows.findIndex((p) => p.id === id)
    const to = from + direction
    if (from < 0 || to < 0 || to >= rows.length) return
    const next = [...rows]
    ;[next[from], next[to]] = [next[to], next[from]]
    setRows(next)
    commit(next)
    setFlashId(id)
  }

  function handleDragStart(e, id) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(id))
    // Laufende FLIP-Animationen aus einer Pfeil-Button-Verschiebung abbrechen,
    // damit die Zeilen beim Drag-Start saubere Layout-Positionen haben
    anims.current.forEach((a) => a.cancel())
    anims.current.clear()
    dragIdRef.current = id
    setDragId(id)
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragId === null) return
    const now = performance.now()
    if (now - lastRainAt.current >= 40 && overlayRef.current) {
      lastRainAt.current = now
      spawnRain(overlayRef.current, e.clientX, e.clientY)
    }
    const from = rows.findIndex((p) => p.id === dragId)
    if (from < 0 || from === index) return
    const next = [...rows]
    const [moved] = next.splice(from, 1)
    next.splice(index, 0, moved)
    setRows(next)
  }

  function handleDragEnd() {
    if (dragId !== null) commit(rows)
    dragIdRef.current = null
    setDragId(null)
    setArmedId(null)
    setFlashId(dragId)
  }

  return (
    <>
    <table className="dt-table" ref={tableRef}>
      <thead>
        <tr>
          <th aria-label="Reihenfolge" />
          <th>ID 💩</th>
          <th>Name</th>
          <th className="dt-table__num">Alter</th>
          <th className="dt-table__num" aria-label="Aktionen" />
        </tr>
      </thead>
      <tbody>
        {rows.map((p, index) => (
          <tr
            key={p.id}
            ref={(el) => {
              if (el) rowRefs.current.set(p.id, el)
              else rowRefs.current.delete(p.id)
            }}
            draggable={armedId === p.id}
            onDragStart={(e) => handleDragStart(e, p.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => e.preventDefault()}
            onDragEnd={handleDragEnd}
            onMouseUp={() => setArmedId(null)}
            className={
              [dragId === p.id ? 'dt-row--dragging' : '', flashId === p.id ? 'dt-row--flash' : ''].filter(Boolean).join(' ')
            }
            onAnimationEnd={() => setFlashId(null)}
          >
            <td>
              <div className="dt-reorder">
                <span
                  className="dt-reorder__grip"
                  title="Ziehen, um die Reihenfolge zu ändern"
                  onMouseDown={() => setArmedId(p.id)}
                >
                  {IconGrip()}
                </span>
                <span className="dt-reorder__arrows">
                  <button
                    type="button"
                    className="dt-reorder__arrow"
                    aria-label={`${p.name} nach oben verschieben`}
                    disabled={index === 0}
                    onClick={() => moveRow(p.id, -1)}
                  >
                    {IconChevronUp(11)}
                  </button>
                  <button
                    type="button"
                    className="dt-reorder__arrow"
                    aria-label={`${p.name} nach unten verschieben`}
                    disabled={index === rows.length - 1}
                    onClick={() => moveRow(p.id, 1)}
                  >
                    {IconChevronDown(11)}
                  </button>
                </span>
              </div>
            </td>
            <td className="dt-cell-mono">#{p.id}</td>
            <td className="dt-cell-strong">{p.name}</td>
            <td className="dt-table__num dt-cell-mono">{p.age}</td>
            <td className="dt-table__num">
              <button
                type="button"
                className="dt-iconbtn"
                title="Bearbeiten"
                aria-label={`Person ${p.id} bearbeiten`}
                onClick={() => onEdit(p)}
              >
                {IconPencil()}
              </button>
              <button
                type="button"
                className="dt-iconbtn dt-iconbtn--danger"
                style={{ marginLeft: 8 }}
                title="Löschen"
                aria-label={`Person ${p.id} löschen`}
                onClick={() => onDelete(p)}
              >
                {IconTrash()}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
      <div ref={overlayRef} aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 60 }} />
    </>
  )
}
