'use client'

import { type ReactNode, createContext, useContext, useState } from 'react'
import { useStore } from 'zustand'

import { createEditorStore, EditorStore, States } from './create-editor-store'

export type EditorStoreApi = ReturnType<typeof createEditorStore>

export const EditorStoreContext = createContext<EditorStoreApi | undefined>(
  undefined,
)

export interface EditorStoreProviderProps {
  children: ReactNode
  initialValues: States
}

export const EditorStoreProvider = ({
  children,
  initialValues,
}: EditorStoreProviderProps) => {
  const [store] = useState(() => createEditorStore(initialValues))
  return (
    <EditorStoreContext.Provider value={store}>
      {children}
    </EditorStoreContext.Provider>
  )
}

export const useEditorStore = <T,>(selector: (store: EditorStore) => T): T => {
  const editorStoreContext = useContext(EditorStoreContext)
  if (!editorStoreContext) {
    throw new Error(`useEditorStore must be used within EditorStoreProvider`)
  }

  return useStore(editorStoreContext, selector)
}
