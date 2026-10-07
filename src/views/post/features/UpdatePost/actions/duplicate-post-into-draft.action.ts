'use server'

import { updateTag } from 'next/cache'

import { queryPost, type TDuplicatePostIntoDraftData } from '../../../shared'

import { duplicatePostIntoDraft } from '../db/duplicate-post-into-draft.db'

export async function duplicatePostIntoDraftAction(
  data: TDuplicatePostIntoDraftData,
) {
  const result = await duplicatePostIntoDraft(data)

  if (result.success) {
    // To solve the issue "not post found" when switching from published mode to draft mode, get the duplicated post data to add it into post draft cache
    await queryPost({
      slug: result.post.slug,
      type: 'draft',
      groupId: data.postGroupId,
    })

    updateTag('posts-props-draft')
    updateTag('posts-draft-list')
  }

  return result
}
