'use client'

import { useSearchParams } from 'next/navigation'

import { type TProductStatus } from '@/views/product'

import { SlotGuard } from '@/components/slot-guard'

export default function ProductMedia() {
  const params = useSearchParams()
  const slugQuery = params.get('slug')
  const statusQuery = params.get('status') as TProductStatus
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
      description="This media panel only works as a modal inside the Edit Product flow. Please open it from the product editor."
      backHref={`/dashboard/products/all-products${slug}`}
      backLabel="Back to Product"
    />
  )
}
