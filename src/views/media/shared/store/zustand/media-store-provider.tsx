'use client'

import React from 'react'
import { useStore } from 'zustand'

import {
  createMediaStore,
  createMediaStoreFactory,
  MediaStore,
} from './create-media-store'

// Dynamic Scoped Vanilla Stores
// Non-Global Store: This means that the store should be created per request and should not be shared across requests

const MediaStoresContext = React.createContext<Map<
  string,
  ReturnType<typeof createMediaStore>
> | null>(null)

export const MediaStoresProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [stores] = React.useState(
    () => new Map<string, ReturnType<typeof createMediaStore>>(),
  )

  return (
    <MediaStoresContext.Provider value={stores}>
      {children}
    </MediaStoresContext.Provider>
  )
}

// A custom hook to access the correct store for a given key
export const useMediaStore = <T,>(
  key: string,
  selector: (state: MediaStore) => T,
) => {
  const stores = React.useContext(MediaStoresContext)

  if (!stores) {
    throw new Error('useMediaStore must be used within MediaStoresProvider')
  }

  const getOrCreateMediaStoreByKey = React.useCallback(
    (key: string) => {
      const mediaStoreFactory = createMediaStoreFactory(stores!)
      return mediaStoreFactory(key)
    },
    [stores],
  )

  return useStore(getOrCreateMediaStoreByKey(key), selector)
}
