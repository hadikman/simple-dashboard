import { SlotGuard } from '@/components/slot-guard'

export default function NewProductMedia() {
  return (
    <SlotGuard
      title="Media picker is not a standalone page"
      description="This media panel only works as a modal inside the New Product flow. Please open it from the product editor."
      backHref="/dashboard/products/new-product"
      backLabel="Back to New Product"
    />
  )
}
