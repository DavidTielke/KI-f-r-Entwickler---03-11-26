import { useLayoutEffect, useRef, useState } from 'react'
import {
  IconPencil,
  IconTrash,
  IconGrip,
  IconChevronUp,
  IconChevronDown,
} from './icons.jsx'

export default function PersonList({ persons, onEdit, onDelete, onReorder }) {
  const [rows, setRows] = useState(persons)
  const [dragId, setDragId] = useState(null)
  const [armedId, setArmedId] = useState(null)
  const [flashId, setFlashId] = useState(null)
  const rowRefs = useRef(new Map())
  const lastTops = useRef(new Map())

  // Wenn die Parent-Daten neu sind (Laden, Anlegen, Löschen), Zeilen zurücksetzen
  const [prevPersons, setPrevPersons] = useState(persons)
  if (persons !== prevPersons) {
    setPrevPersons(persons)
    setRows(persons)
  }

  // FLIP: verschobene Zeilen gleiten in ihre neue Position (220 ms, nur Transform)
  useLayoutEffect(() => {
    const prev = lastTops.current
    const next = new Map()
    rowRefs.current.forEach((el, id) => next.set(id, el.getBoundingClientRect().top))
    rowRefs.current.forEach((el, id) => {
      const from = prev.get(id)
      const to = next.get(id)
      if (from !== undefined && to !== from && el.animate) {
        el.animate(
          [{ transform: `translateY(${from - to}px)` }, { transform: 'translateY(0)' }],
          { duration: 220, easing: 'ease-out' }
        )
      }
    })
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
    setDragId(id)
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragId === null) return
    const from = rows.findIndex((p) => p.id === dragId)
    if (from < 0 || from === index) return
    const next = [...rows]
    const [moved] = next.splice(from, 1)
    next.splice(index, 0, moved)
    setRows(next)
  }

  function handleDragEnd() {
    if (dragId !== null) commit(rows)
    setDragId(null)
    setArmedId(null)
    setFlashId(dragId)
  }

  return (
    <table className="dt-table">
      <thead>
        <tr>
          <th aria-label="Reihenfolge" />
          <th>ID</th>
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
  )
}
