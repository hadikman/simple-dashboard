'use client'

import { useSearchParams } from 'next/navigation'

import { SlotGuard } from '@/components/slot-guard'

export default function BrandMedia() {
  const params = useSearchParams()
  const slugQuery = params.get('slug')

  let href = '/dashboard/products/brands'
  let type = 'New'

  if (slugQuery) {
    href += `/${slugQuery}`
    type = 'Update'
  }

  return (
    <SlotGuard
      title="Media picker is not a standalone page"
      description={`This media panel only works as a modal inside the ${type} Brand flow. Please open it from the brand editor.`}
      backHref={href}
      backLabel={`Back to ${type} Brand`}
    />
  )
}
