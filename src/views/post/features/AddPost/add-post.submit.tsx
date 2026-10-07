import Link from 'next/link'
import { toast } from 'sonner'

import {
  type PostFormT,
  type PostSchemaT,
  type TPostStatus,
  postErrors,
  queryDuplicatePost,
} from '../../shared'

import { normalizeSlug, withMinDelay } from '@/helpers/utils'
import { addPostAction } from './add-post.action'
import { buildAddPostFormData } from './add-post.form-data'

type AddPostSubmitProps = {
  values: PostSchemaT
  meta: TPostStatus
  userId: string
  form: PostFormT
}

export async function handleAddPostSubmit({
  values,
  meta,
  userId,
  form,
}: AddPostSubmitProps) {
  let suggestionSlug = ''

  if (!values.slug && values.title) {
    suggestionSlug = normalizeSlug(values.title)
    const dup = await queryDuplicatePost({ slug: suggestionSlug })

    if (dup.isDuplicate) {
      form.setErrorMap({
        onSubmit: {
          fields: {
            slug: [
              {
                message: `The generated key "${suggestionSlug}" already exists. Please enter a unique key.`,
              },
            ],
          },
        },
      })
      return
    }
  }

  const formData = buildAddPostFormData(values, userId, meta, suggestionSlug)

  const result = await toast
    .promise(withMinDelay(addPostAction(formData), 800), {
      loading: 'Adding post...',
      error: 'Failed to add post.',
    })
    .unwrap()

  if (result.success) {
    const slug = values.slug || suggestionSlug
    let slugPath = `/${slug}`
    if (meta === 'draft') {
      slugPath = `/draft/${slug}?group-id=${result.post.post_group_id}`
    }

    toast.success(`The ${values.title} has been added`, {
      description: (
        <p>
          Edit{' '}
          <Link
            href={`/dashboard/posts/all-posts${slugPath}`}
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

  toast.error('Failure to create a new post', {
    description: result.errors.code
      ? postErrors[result.errors.code].client
      : 'Please try again!',
    duration: 3000,
  })

  return { success: false as const }
}
