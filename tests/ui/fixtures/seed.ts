// Getypte Seed-Datensätze — müssen bitgleich mit dem Basisdatensatz des
// Backend-Reset-Endpunkts (POST /api/testdata/reset) übereinstimmen.
// Diese Typen sind die einzige Quelle für IDs und Namen in den UI-Tests.

export interface PersonSeed {
  id: number
  name: string
  age: number
  order: number
}

export type PetSpecies = 'Hund' | 'Katze' | 'Vogel' | 'Dinosaurier'

export interface PetSeed {
  id: number
  name: string
  species: PetSpecies
  personId: number | null
  personName: string | null
}

export const personsSeed: PersonSeed[] = [
  { id: 1, name: 'Anna Berger', age: 34, order: 1 },
  { id: 2, name: 'Jonas Weber', age: 41, order: 2 },
  { id: 3, name: 'Tom Krüger', age: 55, order: 3 },
  { id: 4, name: 'Maria Schneider', age: 28, order: 3 },
]

export const petsSeed: PetSeed[] = [
  { id: 1, name: 'Fiete', species: 'Hund', personId: 1, personName: 'Anna Berger' },
  { id: 2, name: 'Minka', species: 'Katze', personId: 4, personName: 'Maria Schneider' },
  { id: 3, name: 'Rex', species: 'Hund', personId: null, personName: null },
]

/** Erwartete Zeilenreihenfolge der Personenliste: Order aufsteigend, bei gleichem Order nach Name. */
export const personsSeedInDisplayOrder: PersonSeed[] = [...personsSeed].sort(
  (a, b) => a.order - b.order || a.name.localeCompare(b.name, 'de'),
)

/** Erwartete Zeilenreihenfolge der Haustierliste: Name aufsteigend. */
export const petsSeedInDisplayOrder: PetSeed[] = [...petsSeed].sort(
  (a, b) => a.name.localeCompare(b.name, 'de'),
)
