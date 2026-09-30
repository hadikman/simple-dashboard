import { cn } from '@/helpers/utils'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Popover } from '@/components/ui/popover'

type DialogComponentProps = {
  renderTrigger: React.ReactNode
  contentClassname?: string
  contentStyle?: React.CSSProperties
  contentKey?: React.Key
  renderContent: React.ReactNode
  contentAsChild?: boolean
  showCloseButton?: boolean
  container?: HTMLElement | null
} & React.ComponentProps<typeof Popover>

export function DialogComponent({
  open,
  onOpenChange,
  renderTrigger,
  contentClassname,
  contentStyle,
  contentKey,
  renderContent,
  contentAsChild,
  showCloseButton = false,
  container,
}: DialogComponentProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {renderTrigger && <DialogTrigger asChild>{renderTrigger}</DialogTrigger>}
      <DialogContent
        className={cn('w-xs', contentClassname, !contentAsChild && 'px-4 py-3')}
        key={contentKey}
        showCloseButton={showCloseButton}
        container={container}
        style={contentStyle}
        asChild={contentAsChild}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        {renderContent}
      </DialogContent>
    </Dialog>
  )
}

// STANDBY Preveious version
// export function DialogComponent({
//   open,
//   onOpenChange,
//   renderTrigger,
//   contentClassname,
//   contentStyle,
//   contentKey,
//   renderContent,
//   contentAsChild,
// }: DialogComponentProps) {
//   return (
//     <Popover open={open} onOpenChange={onOpenChange}>
//       <PopoverTrigger asChild>{renderTrigger}</PopoverTrigger>
//       <PopoverContent
//         key={contentKey}
//         className={cn(
//           contentClassname,
//           !contentAsChild && 'px-4 py-3 shadow-xs',
//         )}
//         align="center"
//         style={contentStyle}
//         asChild={contentAsChild}
//       >
//         {renderContent}
//       </PopoverContent>
//     </Popover>
//   )
// }
