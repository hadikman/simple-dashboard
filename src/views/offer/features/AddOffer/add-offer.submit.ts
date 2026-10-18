import { toast } from 'sonner'

import { type OfferFormT, type OfferSchemaT, offerErrors } from '../../shared'

import { withMinDelay } from '@/helpers/utils'
import { addOfferAction } from './add-offer.action'
import { buildAddOfferFormData } from './add-offer.form-data'

type AddOfferSubmitProps = {
  values: OfferSchemaT
  form: OfferFormT
}

export async function handleAddOfferSubmit({ values }: AddOfferSubmitProps) {
  const formData = buildAddOfferFormData(values)

  const result = await toast
    .promise(withMinDelay(addOfferAction(formData), 500), {
      loading: 'Adding offer...',
      error: 'Failed to add offer. Please try again.',
    })
    .unwrap()

  if (result.success) {
    toast.success(`The ${values.name} has been added`, { duration: 1200 })
    return { success: true as const }
  }

  toast.error('Failure to create a new offer', {
    description: result.errors.code
      ? offerErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false as const }
}
