import { createStore } from 'zustand/vanilla'

export type EditorExtensionProps = {
  wrapperToolbarClassName?: string
  wrapperContentEditableClassName?: string
  wrapperSelectionMonitorClassName?: string
  groupId?: string
  slug?: string
  status?: string
}

export type States = EditorExtensionProps

export type EditorStore = States

export const defaultInitState: States = {
  wrapperToolbarClassName: '',
  wrapperContentEditableClassName: '',
  wrapperSelectionMonitorClassName: '',
}

export const createEditorStore = (initState: States = defaultInitState) => {
  return createStore<EditorStore>()(() => ({
    ...initState,
  }))
}
