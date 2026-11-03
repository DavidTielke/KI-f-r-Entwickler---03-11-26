import { IconPencil, IconTrash } from './icons.jsx'

export default function PersonList({ persons, onEdit, onDelete }) {
  return (
    <table className="dt-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th className="dt-table__num">Alter</th>
          <th className="dt-table__num" aria-label="Aktionen" />
        </tr>
      </thead>
      <tbody>
        {persons.map((p) => (
          <tr key={p.id}>
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
