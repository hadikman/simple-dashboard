import { VisuallyHidden } from 'radix-ui'

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/helpers/utils'
import { DialogSlot } from './dialog-slot'

type SlotModalProps = {
  title: string
  description: string
  className?: string
  children: React.ReactNode
}
export function SlotModal({
  title = 'Modal',
  description = 'Modal overlay',
  className,
  children,
}: SlotModalProps) {
  return (
    <DialogSlot>
      <DialogContent
        className={cn(
          className,
          'z-51 grid h-[95svh] grid-rows-[max-content_1fr] overflow-hidden md:max-w-[calc(100%-(--spacing(32)))]',
        )}
      >
        <VisuallyHidden.Root>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </VisuallyHidden.Root>
        {children}
      </DialogContent>
    </DialogSlot>
  )
}
