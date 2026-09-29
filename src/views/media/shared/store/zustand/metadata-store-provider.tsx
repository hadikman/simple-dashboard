'use client'

import { type ReactNode, createContext, useContext, useState } from 'react'
import { useStore } from 'zustand'

import {
  createMetadataStore,
  MetadataStore,
  States,
} from './create-metadata-store'

type MetadataStoreApi = ReturnType<typeof createMetadataStore>

const MetadataStoreContext = createContext<MetadataStoreApi | undefined>(
  undefined,
)

interface MetadataStoreProviderProps {
  children: ReactNode
  initialValues: States
}

export const MetadataStoreProvider = ({
  children,
  initialValues,
}: MetadataStoreProviderProps) => {
  const [store] = useState(() => createMetadataStore(initialValues))
  return (
    <MetadataStoreContext.Provider value={store}>
      {children}
    </MetadataStoreContext.Provider>
  )
}

export const useMetadataStore = <T,>(
  selector: (store: MetadataStore) => T,
): T => {
  const metadataStoreContext = useContext(MetadataStoreContext)
  if (!metadataStoreContext) {
    throw new Error(
      `useMetadataStore must be used within MetadataStoreProvider`,
    )
  }

  return useStore(metadataStoreContext, selector)
}
