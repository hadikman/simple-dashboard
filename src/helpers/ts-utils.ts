export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type PartialByRecursive<T> = Prettify<{
  [P in keyof T]?: T[P] extends object ? PartialByRecursive<T[P]> : T[P]
}>

export type ProjectionKeys<T> = {
  [K in keyof T]?: boolean
} & {}

export type WithId<T> = T & { id: string }
