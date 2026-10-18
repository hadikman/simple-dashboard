import { toast } from 'sonner'

import {
  type OfferFormT,
  type OfferSchemaT,
  type TOfferLookupDataWithId,
  offerErrors,
} from '../../shared'

import { withMinDelay } from '@/helpers/utils'
import { updateOfferAction } from './update-offer.action'
import { buildUpdateOfferFormData } from './update-offer.form-data'

type UpdateOfferSubmitProps = {
  values: OfferSchemaT
  offer: TOfferLookupDataWithId
  form: OfferFormT
}

type UpdateOfferSubmitResult =
  | { success: true; slug: string; shouldNavigate: boolean }
  | { success: false }
  | { noChanges: true }

export async function handleUpdateOfferSubmit({
  values,
  offer,
  form,
}: UpdateOfferSubmitProps): Promise<UpdateOfferSubmitResult> {
  // No changes check
  if (form.state.isDefaultValue) {
    toast.info('No changes detected')
    return { noChanges: true }
  }

  const targetItemsChanged = !form.getFieldMeta('target_items')?.isDefaultValue

  const formData = buildUpdateOfferFormData({
    values,
    offerId: offer.id,
    initialTargetItems: offer.target_items,
    targetItemsChanged,
  })

  const result = await toast
    .promise(
      withMinDelay(
        updateOfferAction({ formData, currentSlug: offer.slug }),
        500,
      ),
      {
        loading: 'Updating offer...',
        error: 'Failed to update offer. Please try again.',
      },
    )
    .unwrap()

  if (result.success) {
    toast.success(`The ${offer.name} has been updated`, { duration: 1200 })

    const slugChanged = result.offer.slug !== offer.slug
    const finalSlug = slugChanged ? result.offer.slug : offer.slug

    return { success: true, slug: finalSlug, shouldNavigate: slugChanged }
  }

  toast.error('Failure to update the offer', {
    description: result.errors.code
      ? offerErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false }
}
