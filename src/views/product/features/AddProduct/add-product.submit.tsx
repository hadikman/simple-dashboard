import Link from 'next/link'
import { toast } from 'sonner'

import {
  type ProductFormT,
  type ProductSchemaT,
  type TProductStatus,
  productErrors,
  queryDuplicateProduct,
} from '../../shared'

import { normalizeSlug, withMinDelay } from '@/helpers/utils'
import { addProductAction } from './add-product.action'
import { buildAddProductFormData } from './add-product.form-data'

type AddProductSubmitProps = {
  values: ProductSchemaT
  meta: TProductStatus
  userId: string
  form: ProductFormT
  brandId?: string
}

export async function handleAddProductSubmit({
  values,
  meta,
  userId,
  form,
  brandId,
}: AddProductSubmitProps) {
  let suggestionSlug = ''

  if (!values.slug && values.title) {
    suggestionSlug = normalizeSlug(values.title)
    const dup = await queryDuplicateProduct({ slug: suggestionSlug })

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

  const formData = buildAddProductFormData({
    values,
    userId,
    meta,
    suggestionSlug,
    brandId,
  })

  const result = await toast
    .promise(withMinDelay(addProductAction(formData), 800), {
      loading: 'Adding product...',
      error: 'Failed to add product. Please try again.',
    })
    .unwrap()

  if (result.success) {
    const slug = values.slug || suggestionSlug
    let slugPath = `/${slug}`
    if (meta === 'draft') {
      slugPath = `/draft/${slug}?group-id=${result.product.product_group_id}`
    }

    toast.success(`The ${values.title} has been added`, {
      description: (
        <p>
          Edit{' '}
          <Link
            href={`/dashboard/products/all-products${slugPath}`}
            className="font-semibold underline decoration-neutral-600 underline-offset-2"
          >
            {values.title}
          </Link>
        </p>
      ),
      duration: 4000,
    })

    return { success: true as const }
  }

  toast.error('Failure to create a new product', {
    description: result.errors.code
      ? productErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false as const }
}
