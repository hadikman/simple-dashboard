import { MediaPage } from '@/views/media'

import { SlotModal } from '@/components/slot-modal'

export function AddPostMediaModalSlot() {
  return (
    <SlotModal title="Media Library" description="Select your file">
      <MediaPage />
    </SlotModal>
  )
}
