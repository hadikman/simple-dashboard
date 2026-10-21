'use client'

import React from 'react'
import { toast } from 'sonner'

import {
  type TGetFeatureLookupResponse,
  featureErrors,
} from '../../../../shared'

import {
  FeatureValueSchema,
  type FeatureValueSchemaT,
} from './feature-values-table.schema'
import type { FeatureValuesTableMeta } from './feature-values-table.types'

import { DataTable } from '@/components/data-table'
import { deleteConfirmation } from '@/helpers/confirmation-utils'
import { withMinDelay } from '@/helpers/utils'
import { useAppForm } from '@/hooks/create-react-form-hook'
import { deleteFeatureValueAction } from './delete-feature-value.action'
import { featureValuesColumns } from './FeatureValuesColumns'
import { updateFeatureValueAction } from './update-feature-value.action'

const defaultValues: FeatureValueSchemaT = { value: '' }

type FeatureValuesTableProps = { featureData: TGetFeatureLookupResponse }

export function FeatureValuesTable({ featureData }: FeatureValuesTableProps) {
  const { success } = featureData
  const [editId, setEditId] = React.useState<number>()

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: FeatureValueSchema },
    onSubmit: async props => {
      if (!success || editId === undefined) return

      const { value } = FeatureValueSchema.parse(props.value)
      const formData = new FormData()
      formData.append('featureId', featureData.feature.id)
      formData.append('id', editId.toString())
      formData.append('value', value)

      const result = await toast
        .promise(withMinDelay(updateFeatureValueAction(formData), 500), {
          loading: 'Updating value...',
          error: 'Failed to update value. Please try again.',
        })
        .unwrap()

      if (result.success) {
        toast.success(`The ${value} has been updated`, { duration: 1200 })
        form.reset()
        setEditId(undefined)
      } else {
        toast.error('Failure to update value', {
          description: result.errors.code
            ? featureErrors[result.errors.code].client
            : 'Please try again!',
          duration: 3000,
        })
      }
    },
  })

  async function handleDelete(id: number, value: string) {
    if (!success) return

    const confirmed = await deleteConfirmation(value)
    if (!confirmed) return

    const result = await toast
      .promise(
        withMinDelay(
          deleteFeatureValueAction({ featureId: featureData.feature.id, id }),
          500,
        ),
        {
          loading: 'Deleting value...',
          error: 'Failed to delete value. Please try again.',
        },
      )
      .unwrap()

    if (result.success) {
      toast.success(`The ${value} has been deleted`, { duration: 1200 })
      form.reset()
      setEditId(undefined)
    } else {
      toast.error('Failure to delete value', {
        description: result.errors.code
          ? featureErrors[result.errors.code].client
          : 'Please try again!',
        duration: 3000,
      })
    }
  }

  const data = success ? featureData.feature.values : []

  const tableMeta: FeatureValuesTableMeta = {
    editId,
    setEditId,
    featureId: success ? featureData.feature.id : '',
    form,
    onDelete: handleDelete,
  }

  return (
    <div className="@container/table">
      <DataTable
        data={data}
        columns={featureValuesColumns}
        persistKeys={{
          visibility: 'feature-values-visibility',
          filter: 'feature-values-filter',
          pagination: 'feature-values-pagination',
          selection: 'feature-values-selection',
        }}
        tableMeta={{ featureValues: tableMeta }}
      />
    </div>
  )
}
