import { produce } from 'immer'
import { createStore } from 'zustand'

type Components = 'table' | 'layout' | 'poll' | 'image' | null

type States = {
  component: Components
}
type Actions = {
  setComponent: (component: Components) => void
}
export type ModalStore = States & Actions

export const createModalStore = () => {
  return createStore<ModalStore>()(set => ({
    component: null,

    setComponent: component =>
      set(
        produce((s: States) => {
          s.component = component
        }),
      ),
  }))
}

export const createModalStoreFactory = (
  modalStores: Map<string, ReturnType<typeof createModalStore>>,
) => {
  return (modalStoreKey: string) => {
    if (!modalStores.has(modalStoreKey)) {
      modalStores.set(modalStoreKey, createModalStore())
    }
    return modalStores.get(modalStoreKey)!
  }
}
