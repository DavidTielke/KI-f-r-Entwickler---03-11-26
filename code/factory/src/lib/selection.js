import { createContext, useContext } from 'react'

// Die Auswahl für die nächste Umsetzung bleibt beim Wechsel zwischen den Seiten erhalten.
export const SelectionContext = createContext(null)

export const useSelection = () => useContext(SelectionContext)
