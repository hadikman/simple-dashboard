import { toast } from 'sonner'

import {
  type GuaranteeFormT,
  type GuaranteeSchemaT,
  type TGuaranteeLookupDataWithId,
  guaranteeErrors,
} from '../../shared'

import { withMinDelay } from '@/helpers/utils'
import { updateGuaranteeAction } from './update-guarantee.action'
import { buildUpdateGuaranteeFormData } from './update-guarantee.form-data'

type UpdateGuaranteeSubmitProps = {
  values: GuaranteeSchemaT
  guarantee: TGuaranteeLookupDataWithId
  form: GuaranteeFormT
}

type UpdateGuaranteeSubmitResult =
  | { success: true; slug: string; shouldNavigate: boolean }
  | { success: false }
  | { noChanges: true }

export async function handleUpdateGuaranteeSubmit({
  values,
  guarantee,
  form,
}: UpdateGuaranteeSubmitProps): Promise<UpdateGuaranteeSubmitResult> {
  // No changes check
  if (form.state.isDefaultValue) {
    toast.info('No changes detected')
    return { noChanges: true }
  }

  const targetItemsChanged = !form.getFieldMeta('target_items')?.isDefaultValue

  const formData = buildUpdateGuaranteeFormData({
    values,
    guaranteeId: guarantee.id,
    initialTargetItems: guarantee.target_items,
    targetItemsChanged,
  })

  const result = await toast
    .promise(
      withMinDelay(
        updateGuaranteeAction({ formData, currentSlug: guarantee.slug }),
        500,
      ),
      {
        loading: 'Updating guarantee...',
        error: 'Failed to update guarantee. Please try again.',
      },
    )
    .unwrap()

  if (result.success) {
    toast.success(`The ${guarantee.name} has been updated`, { duration: 1200 })

    const slugChanged = result.guarantee.slug !== guarantee.slug
    const finalSlug = slugChanged ? result.guarantee.slug : guarantee.slug

    return { success: true, slug: finalSlug, shouldNavigate: slugChanged }
  }

  toast.error('Failure to update the guarantee', {
    description: result.errors.code
      ? guaranteeErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false }
}
