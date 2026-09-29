import { produce } from 'immer'
import { createStore } from 'zustand'

type States = {
  thumbnailImages: string[]
  images: string[]
  mediaOpen: boolean
}
type Actions = {
  initialThumbnailImages: (filename: string) => void
  initialImages: (filenames: string[]) => void
  setThumbnailImages: (filename: string) => void
  toggleImages: (filename: string) => void
  clearAll: () => void
  setMediaOpen: (open: boolean) => void
}
export type MediaStore = States & Actions

export const createMediaStore = () => {
  return createStore<MediaStore>()((set, get, store) => ({
    thumbnailImages: [],
    images: [],
    mediaOpen: false,

    initialThumbnailImages: filename =>
      set(
        produce((s: States) => {
          s.thumbnailImages = filename ? [filename] : []
        }),
      ),
    initialImages: filenames =>
      set(
        produce((s: States) => {
          s.images = filenames
        }),
      ),

    setThumbnailImages: filename =>
      set(
        produce((s: States) => {
          s.thumbnailImages = filename ? [filename] : []
        }),
      ),
    toggleImages: filename =>
      set(
        produce((s: States) => {
          const images = s.images
          const index = images.indexOf(filename)

          if (index >= 0) {
            images.splice(index, 1)
          } else {
            images.push(filename)
          }
        }),
      ),

    clearAll: () => set(store.getInitialState()),

    setMediaOpen: open =>
      set(
        produce((s: States) => {
          s.mediaOpen = open
        }),
      ),
  }))
}

export const createMediaStoreFactory = (
  mediaStores: Map<string, ReturnType<typeof createMediaStore>>,
) => {
  return (mediaStoreKey: string) => {
    if (!mediaStores.has(mediaStoreKey)) {
      mediaStores.set(mediaStoreKey, createMediaStore())
    }
    return mediaStores.get(mediaStoreKey)!
  }
}
