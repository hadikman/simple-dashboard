import { toast } from 'sonner'

import {
  type BuildUpdateProductFormHelperProps,
  type ProductFormT,
  type ProductSchemaT,
  type TProductLookupDataWithId,
  type TProductStatus,
  productErrors,
} from '../../shared'

import { withMinDelay } from '@/helpers/utils'
import { duplicateProductIntoDraftAction } from './duplicate-product-into-draft.action'
import { updateProductAction } from './update-product.action'
import { buildUpdateProductFormData } from './update-product.form-data'

type UpdateProductSubmitProps = {
  values: ProductSchemaT
  meta: TProductStatus
  userId: string
  product: TProductLookupDataWithId
  productPageType: TProductStatus
  form: ProductFormT
  brandId?: string
} & BuildUpdateProductFormHelperProps

type UpdateProductSubmitResult =
  | {
      success: true
      slug: string
      shouldNavigate: boolean
      shouldClearMedia: boolean
    }
  | { success: false }
  | { noChanges: true }

export async function handleUpdateProductSubmit({
  initialValues,
  values,
  meta,
  userId,
  product,
  productPageType,
  form,
  brandId,
  categoriesWithParentMap,
  featuresIdxsMap,
  groupedFeaturesSorted,
}: UpdateProductSubmitProps): Promise<UpdateProductSubmitResult> {
  const formData = buildUpdateProductFormData({
    initialValues,
    values,
    userId,
    meta,
    productId: product.id,
    productGroupId: product.product_group_id,
    form,
    brandId,
    categoriesWithParentMap,
    featuresIdxsMap,
    groupedFeaturesSorted,
  })

  const statusNotChanged = product.status === meta
  if (form.state.isDefaultValue && statusNotChanged) {
    toast.info('No changes detected')
    return { noChanges: true }
  }

  if (meta === 'draft' && !product.has_draft) {
    const dup = await duplicateProductIntoDraftAction({
      productGroupId: product.product_group_id,
    })
    if (dup.success) {
      formData.set('id', JSON.stringify(dup.product.id))
    } else {
      toast.error('Failure to create the product draft duplication', {
        description: dup.errors.code
          ? productErrors[dup.errors.code].client
          : 'Please try again!',
        duration: 3000,
      })
      return { success: false }
    }
  }

  const isDraftOfPublished = meta === 'draft' && productPageType === 'published'
  const isPublishedOfDraft = meta === 'published' && productPageType === 'draft'
  const messages = getMessages(
    product.title,
    isDraftOfPublished,
    isPublishedOfDraft,
  )

  const result = await toast
    .promise(
      withMinDelay(
        updateProductAction({
          formData,
          currentSlug: product.slug,
          isPublishedOfDraftedProduct: isPublishedOfDraft,
        }),
        800,
      ),
      { loading: messages.loading, error: messages.error },
    )
    .unwrap()

  if (result.success) {
    toast.success(messages.success, { duration: 1200 })

    const slugChanged = result.product.slug
      ? result.product.slug !== product.slug
      : false
    const shouldNavigate =
      slugChanged || isDraftOfPublished || isPublishedOfDraft
    const shouldClearMedia = isDraftOfPublished || isPublishedOfDraft
    const finalSlug = slugChanged ? result.product.slug! : product.slug

    return { success: true, slug: finalSlug, shouldNavigate, shouldClearMedia }
  }

  toast.error('Failure to update the product', {
    description: result.errors.code
      ? productErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false }
}

function getMessages(
  title: string,
  isDraftOfPublished: boolean,
  isPublishedOfDraft: boolean,
) {
  if (isDraftOfPublished) {
    return {
      success: `The ${title} has been saved as draft`,
      loading: 'Saving product as draft',
      error: 'Failed to save product as draft',
    }
  }
  if (isPublishedOfDraft) {
    return {
      success: `The ${title} has been published`,
      loading: 'Publishing product',
      error: 'Failed to publish product',
    }
  }
  return {
    success: `The ${title} has been updated`,
    loading: 'Updating product...',
    error: 'Failed to update product. Please try again.',
  }
}
