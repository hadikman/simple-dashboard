import { createStore } from 'zustand/vanilla'

import { type CategoryGroupType } from '../../'

export type States = {
  categoryGroup: CategoryGroupType
}

export type CategoryStore = States

export const defaultInitState: States = {
  categoryGroup: 'products',
}

export const createCategoryStore = (initState: States = defaultInitState) => {
  return createStore<CategoryStore>()(() => ({
    ...initState,
  }))
}
