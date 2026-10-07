'use client'

import { useSearchParams } from 'next/navigation'

import type { TPostStatus } from '@/views/post'

import { SlotGuard } from '@/components/slot-guard'

export default function PostMedia() {
  const params = useSearchParams()
  const slugQuery = params.get('slug')
  const statusQuery = params.get('status') as TPostStatus
  const groupIdQuery = params.get('group-id')

  const isDraftMode = statusQuery === 'draft'

  let slug = `${isDraftMode ? '/draft' : ''}/${slugQuery}`

  if (isDraftMode && groupIdQuery) {
    const queryGroupId = `group-id=${groupIdQuery}`
    slug += '?' + queryGroupId
  }

  return (
    <SlotGuard
      title="Media picker is not a standalone page"
      description="This media panel only works as a modal inside the Edit Post flow. Please open it from the post editor."
      backHref={`/dashboard/posts/all-posts${slug}`}
      backLabel="Back to Update Post"
    />
  )
}
