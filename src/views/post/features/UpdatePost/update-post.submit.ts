import { toast } from 'sonner'

import {
  postErrors,
  type PostFormT,
  type PostSchemaT,
  type TPostLookupDataWithId,
  type TPostStatus,
} from '../../shared'

import { withMinDelay } from '@/helpers/utils'
import { duplicatePostIntoDraftAction } from './actions/duplicate-post-into-draft.action'
import { updatePostAction } from './actions/update-post.action'
import { buildUpdatePostFormData } from './update-post.form-data'

type UpdatePostSubmitProps = {
  values: PostSchemaT
  meta: TPostStatus
  userId: string
  post: TPostLookupDataWithId
  postPageType: TPostStatus
  form: PostFormT
}

type UpdatePostSubmitResult =
  | {
      success: true
      slug: string
      shouldNavigate: boolean
      shouldClearMedia: boolean
    }
  | { success: false }
  | { noChanges: true }

function getMessages(
  title: string,
  isDraftOfPublished: boolean,
  isPublishedOfDraft: boolean,
) {
  if (isDraftOfPublished) {
    return {
      success: `The ${title} has been saved as draft`,
      loading: 'Saving post as draft',
      error: 'Failed to save post as draft',
    }
  }
  if (isPublishedOfDraft) {
    return {
      success: `The ${title} has been published`,
      loading: 'Publishing post',
      error: 'Failed to publish post',
    }
  }
  return {
    success: `The ${title} has been updated`,
    loading: 'Updating post...',
    error: 'Failed to update post. Please try again.',
  }
}

export async function handleUpdatePostSubmit({
  values,
  meta,
  userId,
  post,
  postPageType,
  form,
}: UpdatePostSubmitProps): Promise<UpdatePostSubmitResult> {
  const formData = buildUpdatePostFormData(
    values,
    userId,
    meta,
    post.id,
    post.post_group_id,
  )

  // No changes check
  const statusNotChanged = post.status === meta
  if (form.state.isDefaultValue && statusNotChanged) {
    toast.info('No changes detected')
    return { noChanges: true }
  }

  // Create a duplicate from the post into draft
  if (meta === 'draft' && !post.has_draft) {
    const dup = await duplicatePostIntoDraftAction({
      postGroupId: post.post_group_id,
    })
    if (dup.success) {
      formData.set('id', JSON.stringify(dup.post.id))
    } else {
      toast.error('Failure to create the post draft duplication', {
        description: dup.errors.code
          ? postErrors[dup.errors.code].client
          : 'Please try again!',
        duration: 3000,
      })
      return { success: false }
    }
  }

  const isDraftOfPublished = meta === 'draft' && postPageType === 'published'
  const isPublishedOfDraft = meta === 'published' && postPageType === 'draft'
  const messages = getMessages(
    post.title,
    isDraftOfPublished,
    isPublishedOfDraft,
  )

  const result = await toast
    .promise(
      withMinDelay(
        updatePostAction({
          formData,
          currentSlug: post.slug,
          isPublishedOfDraftedPost: isPublishedOfDraft,
        }),
        800,
      ),
      { loading: messages.loading, error: messages.error },
    )
    .unwrap()

  if (result.success) {
    toast.success(messages.success, { duration: 1200 })

    const slugChanged = result.post.slug
      ? result.post.slug !== post.slug
      : false

    const shouldNavigate =
      slugChanged || isDraftOfPublished || isPublishedOfDraft
    const shouldClearMedia = isDraftOfPublished || isPublishedOfDraft
    const finalSlug = slugChanged ? result.post.slug! : post.slug

    return {
      success: true,
      slug: finalSlug,
      shouldNavigate,
      shouldClearMedia,
    }
  }

  toast.error('Failure to update the post', {
    description: result.errors.code
      ? postErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false }
}
