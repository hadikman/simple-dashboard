import Image from 'next/image'

import { HOME_DIRECTORY } from '../'

import { SlotModal } from '@/components/slot-modal'

export function MediaPreviewFileSlot({ src }: { src: string }) {
  return (
    <SlotModal
      title="Media Image File"
      description={`Preview of image: ${src}`}
    >
      <Image
        className="bg-primary-foreground object-contain"
        src={`/${HOME_DIRECTORY}/${src}`}
        alt=""
        fill
      />
    </SlotModal>
  )
}
