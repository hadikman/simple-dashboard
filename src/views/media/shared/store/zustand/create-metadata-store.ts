import { produce } from 'immer'
import { createStore } from 'zustand/vanilla'

export type States = {
  mediaKey: string
  mediaPath: string
}

export type Actions = {
  setMediaKey: (mediaKey: string) => void
  setMediaPath: (mediaPath: string) => void
}

export type MetadataStore = States & Actions

export const defaultInitState: States = {
  mediaKey: '',
  mediaPath: '',
}

export const createMetadataStore = (initState: States = defaultInitState) => {
  return createStore<MetadataStore>()(set => ({
    ...initState,
    setMediaKey: mediaKey =>
      set(
        produce((s: States) => {
          s.mediaKey = mediaKey
        }),
      ),
    setMediaPath: mediaPath =>
      set(
        produce((s: States) => {
          s.mediaPath = mediaPath
        }),
      ),
  }))
}
