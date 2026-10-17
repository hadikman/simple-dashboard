import { toast } from 'sonner'

import {
  type BrandFormT,
  type BrandSchemaT,
  type TBrandLookupDataWithId,
  brandErrors,
} from '../../shared'

import { withMinDelay } from '@/helpers/utils'
import { updateBrandAction } from './update-brand.action'
import { buildUpdateBrandFormData } from './update-brand.form-data'

type UpdateBrandSubmitProps = {
  values: BrandSchemaT
  brand: TBrandLookupDataWithId
  form: BrandFormT
  hasChangedLogo: boolean
}

type UpdateBrandSubmitResult =
  | {
      success: true
      slug: string
      shouldNavigate: boolean
    }
  | { success: false }
  | { noChanges: true }

export async function handleUpdateBrandSubmit({
  values,
  brand,
  form,
  hasChangedLogo,
}: UpdateBrandSubmitProps): Promise<UpdateBrandSubmitResult> {
  // No changes check
  if (form.state.isDefaultValue) {
    toast.info('No changes detected')
    return { noChanges: true }
  }

  const formData = buildUpdateBrandFormData(values, brand.id, hasChangedLogo)

  const result = await toast
    .promise(
      withMinDelay(
        updateBrandAction({ formData, currentSlug: brand.slug }),
        800,
      ),
      {
        loading: 'Updating brand...',
        error: 'Failed to update brand. Please try again.',
      },
    )
    .unwrap()

  if (result.success) {
    toast.success(`The ${brand.name} has been updated`, {
      duration: 1200,
    })

    const slugChanged = result.brand.slug !== brand.slug
    const finalSlug = slugChanged ? result.brand.slug : brand.slug

    return {
      success: true,
      slug: finalSlug,
      shouldNavigate: slugChanged,
    }
  }

  toast.error('Failure to update the brand', {
    description: result.errors.code
      ? brandErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false }
}
