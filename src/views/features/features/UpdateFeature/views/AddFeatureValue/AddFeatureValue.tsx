'use client'

import { toast } from 'sonner'
import z from 'zod'

import {
  type TGetFeatureLookupResponse,
  featureErrors,
} from '../../../../shared'

import { Field, FieldGroup, FieldSet } from '@/components/ui/field'
import { withMinDelay } from '@/helpers/utils'
import { useAppForm } from '@/hooks/create-react-form-hook'
import { addFeatureValueAction } from './add-feature-value.action'

const FeatureValueSchema = z.object({
  value: z.string().trim().min(1, 'The value is required.'),
})
type FeatureValueSchemaT = z.input<typeof FeatureValueSchema>
const defaultValues: FeatureValueSchemaT = {
  value: '',
}

type AddFeatureValueProps = { featureData: TGetFeatureLookupResponse }
export function AddFeatureValue({ featureData }: AddFeatureValueProps) {
  const { success } = featureData

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: FeatureValueSchema,
    },
    onSubmit: async props => {
      if (!success) return

      const formData = new FormData()
      const { value } = FeatureValueSchema.parse(props.value)

      // Basic Information
      formData.append('featureId', featureData.feature.id)
      formData.append(
        'id',
        `${(featureData.feature.values.at(0)?.id ?? 0) + 1}`,
      )
      formData.append('value', value)

      const result = await toast
        .promise(withMinDelay(addFeatureValueAction(formData), 500), {
          loading: 'Adding value...',
          error: 'Failed to add value. Please try again.',
        })
        .unwrap()

      if (result.success) {
        toast.success(`The ${value} has been added`, {
          duration: 1200,
        })
        form.reset()
      } else {
        toast.error('Failure to add a new value', {
          description: result.errors.code
            ? featureErrors[result.errors.code].client
            : 'Please try again!',
          duration: 3000,
        })
      }
    },
  })

  return (
    <form id="add-value-form" onSubmit={e => e.preventDefault()}>
      <FieldSet>
        <FieldGroup>
          <form.AppField name="value">
            {field => <field.TextField label="Value" />}
          </form.AppField>

          <Field className="sm:w-max">
            <form.AppForm>
              <form.SubscribeButton form="add-value-form" label="Add" />
            </form.AppForm>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
