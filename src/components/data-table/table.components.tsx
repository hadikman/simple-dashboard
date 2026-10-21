import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/helpers/utils'

type CellType = {
  value: string
}
export function Cell({ value }: CellType) {
  return (
    <span className="text-muted-foreground text-xs font-medium text-wrap">
      {value}
    </span>
  )
}

type CellBadgeType = React.ComponentProps<typeof Badge>
export function CellBadge({
  children,
  variant,
  className,
  ...props
}: CellBadgeType) {
  return (
    <Badge
      {...props}
      variant={variant ?? 'outline'}
      className={cn('text-muted-foreground px-1.5', className)}
    >
      {children}
    </Badge>
  )
}

type CellInputType = React.ComponentProps<typeof Input>
export function CellInput({ className, ...props }: CellInputType) {
  return (
    <Input
      {...props}
      className={cn(
        'hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-full border-transparent bg-transparent shadow-none focus-visible:border dark:bg-transparent',
        className,
      )}
    />
  )
}
