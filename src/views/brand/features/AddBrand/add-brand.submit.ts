import { toast } from 'sonner'

import {
  type BrandFormT,
  type BrandSchemaT,
  brandErrors,
  queryDuplicateBrand,
} from '../../shared'

import { normalizeSlug, withMinDelay } from '@/helpers/utils'
import { addBrandAction } from './add-brand.action'
import { buildAddBrandFormData } from './add-brand.form-data'

type AddBrandSubmitProps = {
  values: BrandSchemaT
  form: BrandFormT
}

export async function handleAddBrandSubmit({
  values,
  form,
}: AddBrandSubmitProps) {
  let suggestionSlug = ''

  if (!values.slug && values.name) {
    suggestionSlug = normalizeSlug(values.name)
    const dup = await queryDuplicateBrand({ slug: suggestionSlug })

    if (dup.isDuplicate) {
      form.setErrorMap({
        onSubmit: {
          fields: {
            slug: [
              {
                message: `The generated key "${suggestionSlug}" (based on the name) already exists. Please enter a unique key.`,
              },
            ],
          },
        },
      })
      return
    }
  }

  const formData = buildAddBrandFormData(values, suggestionSlug)

  const result = await toast
    .promise(withMinDelay(addBrandAction(formData), 500), {
      loading: 'Adding brand...',
      error: 'Failed to add brand. Please try again.',
    })
    .unwrap()

  if (result.success) {
    toast.success(`The ${values.name} has been added`, {
      duration: 1200,
    })
    return { success: true as const }
  }

  toast.error('Failure to create a new brand', {
    description: result.errors.code
      ? brandErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false as const }
}
