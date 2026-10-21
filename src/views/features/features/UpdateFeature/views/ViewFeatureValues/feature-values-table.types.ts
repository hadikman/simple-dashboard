import { FeatureValueFormT } from './feature-values-table.schema'

/**
 * Extra context passed via tableMeta so cells can access
 * the edit state, form, and delete handler.
 */
export type FeatureValuesTableMeta = {
  editId: number | undefined
  setEditId: (id: number | undefined) => void
  featureId: string
  form: FeatureValueFormT
  onDelete: (id: number, value: string) => void | Promise<void>
}
