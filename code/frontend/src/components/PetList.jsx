import { IconPencil, IconTrash } from './icons.jsx'

export default function PetList({ pets, onEdit, onDelete }) {
  return (
    <table className="dt-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Spezies</th>
          <th>Person</th>
          <th className="dt-table__num" aria-label="Aktionen" />
        </tr>
      </thead>
      <tbody>
        {pets.map((p) => (
          <tr key={p.id}>
            <td className="dt-cell-mono">#{p.id}</td>
            <td className="dt-cell-strong">{p.name}</td>
            <td>{p.species}</td>
            <td>{p.personName ?? '—'}</td>
            <td className="dt-table__num">
              <button
                type="button"
                className="dt-iconbtn"
                title="Bearbeiten"
                aria-label={`Haustier ${p.id} bearbeiten`}
                onClick={() => onEdit(p)}
              >
                {IconPencil()}
              </button>
              <button
                type="button"
                className="dt-iconbtn dt-iconbtn--danger"
                style={{ marginLeft: 8 }}
                title="Löschen"
                aria-label={`Haustier ${p.id} löschen`}
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
