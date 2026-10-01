'use client'

import { type ReactNode, createContext, useContext, useState } from 'react'
import { useStore } from 'zustand'

import {
  CategoryStore,
  States,
  createCategoryStore,
} from './create-category-store'

export type CategoryStoreApi = ReturnType<typeof createCategoryStore>

export const CategoryStoreContext = createContext<CategoryStoreApi | undefined>(
  undefined,
)

export interface CategoryStoreProviderProps {
  children: ReactNode
  initialValues: States
}

export const CategoryStoreProvider = ({
  children,
  initialValues,
}: CategoryStoreProviderProps) => {
  const [store] = useState(() => createCategoryStore(initialValues))
  return (
    <CategoryStoreContext.Provider value={store}>
      {children}
    </CategoryStoreContext.Provider>
  )
}

export const useCategoryStore = <T,>(
  selector: (store: CategoryStore) => T,
): T => {
  const categoryStoreContext = useContext(CategoryStoreContext)
  if (!categoryStoreContext) {
    throw new Error(
      `useCategoryStore must be used within CategoryStoreProvider`,
    )
  }

  return useStore(categoryStoreContext, selector)
}
