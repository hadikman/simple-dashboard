'use client'

import React from 'react'
import { useStore } from 'zustand'

import {
  createModalStore,
  createModalStoreFactory,
  ModalStore,
} from './create-modal-store'

// Dynamic Scoped Vanilla Stores
// Non-Global Store: This means that the store should be created per request and should not be shared across requests

const ModalStoresContext = React.createContext<Map<
  string,
  ReturnType<typeof createModalStore>
> | null>(null)

export const ModalStoresProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [stores] = React.useState(
    () => new Map<string, ReturnType<typeof createModalStore>>(),
  )

  return (
    <ModalStoresContext.Provider value={stores}>
      {children}
    </ModalStoresContext.Provider>
  )
}

// A custom hook to access the correct store for a given key
export const useModalStore = <T,>(
  key: string,
  selector: (state: ModalStore) => T,
) => {
  const stores = React.useContext(ModalStoresContext)

  if (!stores) {
    throw new Error('useModalStore must be used within ModalStoresProvider')
  }

  const getOrCreateModalStoreByKey = React.useCallback(
    (key: string) => {
      const modalStoreFactory = createModalStoreFactory(stores!)
      return modalStoreFactory(key)
    },
    [stores],
  )

  return useStore(getOrCreateModalStoreByKey(key), selector)
}
