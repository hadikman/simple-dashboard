import { SlotGuard } from '@/components/slot-guard'

export default function AddPostMedia() {
  return (
    <SlotGuard
      title="Media picker is not a standalone page"
      description="This media panel only works as a modal inside the New Post flow. Please open it from the post editor."
      backHref="/dashboard/posts/new-post"
      backLabel="Back to New Post"
    />
  )
}
