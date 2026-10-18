import { toast } from 'sonner'

import {
  type GuaranteeFormT,
  type GuaranteeSchemaT,
  guaranteeErrors,
} from '../../shared'

import { withMinDelay } from '@/helpers/utils'
import { addGuaranteeAction } from './add-guarantee.action'
import { buildAddGuaranteeFormData } from './add-guarantee.form-data'

type AddGuaranteeSubmitProps = {
  values: GuaranteeSchemaT
  form: GuaranteeFormT
}

export async function handleAddGuaranteeSubmit({
  values,
}: AddGuaranteeSubmitProps) {
  const formData = buildAddGuaranteeFormData(values)

  const result = await toast
    .promise(withMinDelay(addGuaranteeAction(formData), 500), {
      loading: 'Adding guarantee...',
      error: 'Failed to add guarantee. Please try again.',
    })
    .unwrap()

  if (result.success) {
    toast.success(`The ${values.name} has been added`, { duration: 1200 })
    return { success: true as const }
  }

  toast.error('Failure to create a new guarantee', {
    description: result.errors.code
      ? guaranteeErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false as const }
}
