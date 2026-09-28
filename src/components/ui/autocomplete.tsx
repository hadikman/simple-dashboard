'use client'

import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronsUpDownIcon, CircleXIcon } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/helpers/utils'

// ─── Input Variants ─────────────────────────────────────────────────────────

const inputVariants = cva(
  'selection:bg-primary selection:text-primary-foreground min-w-0 rounded-md border py-1 shadow-xs md:text-sm text-foreground placeholder:text-muted-foreground [[readonly]]:bg-muted/80 border-input focus-visible:border-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:bg-input/30 focus-visible:ring-ring/50 flex w-full rounded-lg border bg-transparent transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 [[readonly]]:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-sm [&~[data-slot=autocomplete-clear]]:right-1.75 [&~[data-slot=autocomplete-trigger]]:right-1.75',
        default:
          'h-9 px-3 [&~[data-slot=autocomplete-clear]]:right-2 [&~[data-slot=autocomplete-trigger]]:right-2',
        lg: 'h-10 px-3 [&~[data-slot=autocomplete-clear]]:right-2.25 [&~[data-slot=autocomplete-trigger]]:right-2.25',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

// ─── Grouped Input Variants (for InputGroup mode) ───────────────────────────

const groupedInputVariants = cva(
  'selection:bg-primary selection:text-primary-foreground min-w-0 flex w-full flex-1 rounded-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground shadow-none outline-none transition-[color,box-shadow] focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [[readonly]]:cursor-not-allowed [[readonly]]:bg-muted/80 md:text-sm dark:bg-transparent',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-sm [&~[data-slot=autocomplete-clear]]:right-1.75 [&~[data-slot=autocomplete-trigger]]:right-1.75',
        default:
          'h-9 px-3 [&~[data-slot=autocomplete-clear]]:right-2 [&~[data-slot=autocomplete-trigger]]:right-2',
        lg: 'h-10 px-3 [&~[data-slot=autocomplete-clear]]:right-2.25 [&~[data-slot=autocomplete-trigger]]:right-2.25',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

// ─── Root ───────────────────────────────────────────────────────────────────

const Autocomplete = AutocompletePrimitive.Root

const AutocompleteValue = ({ ...props }: AutocompletePrimitive.Value.Props) => {
  return (
    <AutocompletePrimitive.Value data-slot="autocomplete-value" {...props} />
  )
}

// ─── Input Group Wrapper (NEW) ──────────────────────────────────────────────

/**
 * Wraps the AutocompleteInput and addons together as a single grouped control.
 * Provides the border, focus ring, and layout for addons.
 */
function AutocompleteInputGroup({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="autocomplete-input-group"
      role="group"
      className={cn(
        'group/autocomplete-input-group border-input dark:bg-input/30 relative flex w-full items-center rounded-md border shadow-xs transition-[color,box-shadow] outline-none',
        'h-9 min-w-0',

        // ── FIX: Automated spacing between multiple adjacent addons/buttons/triggers ──
        '[&>*:not(input)+*:not(input)]:ml-1.5',

        // Addon alignment padding adjustments for the inner input
        'has-[>[data-align=inline-start]]:[&>input]:pl-2',
        'has-[>[data-align=inline-end]]:[&>input]:pr-2',
        'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

        // Snugger padding for the input when trigger/clear are present in group flow
        'has-[>[data-slot=autocomplete-clear]]:[&>input]:pr-1.5',
        'has-[>[data-slot=autocomplete-trigger]]:[&>input]:pr-1.5',

        // Transform trigger/clear from absolute to relative flex items inside the group
        '*:data-[slot=autocomplete-clear]:relative *:data-[slot=autocomplete-clear]:top-auto *:data-[slot=autocomplete-clear]:right-auto *:data-[slot=autocomplete-clear]:translate-y-0 *:data-[slot=autocomplete-clear]:px-1',
        '*:data-[slot=autocomplete-trigger]:relative *:data-[slot=autocomplete-trigger]:top-auto *:data-[slot=autocomplete-trigger]:right-auto *:data-[slot=autocomplete-trigger]:translate-y-0 *:data-[slot=autocomplete-trigger]:px-1',

        // Focus state (using data-slot to target the specific input)
        'has-[[data-slot=autocomplete-input]:focus-visible]:border-ring has-[[data-slot=autocomplete-input]:focus-visible]:ring-ring/50 has-[[data-slot=autocomplete-input]:focus-visible]:ring-[3px]',

        // Error state
        'has-[[data-slot=autocomplete-input][aria-invalid=true]]:border-destructive has-[[data-slot=autocomplete-input][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot=autocomplete-input][aria-invalid=true]]:ring-destructive/40',

        className,
      )}
      {...props}
    />
  )
}

// ─── Addon (NEW) ────────────────────────────────────────────────────────────

const autocompleteAddonVariants = cva(
  // ── FIX: Added `[&>svg:not([class*='size-'])]:size-4` to auto-size icons ──
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/autocomplete-input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        'inline-start':
          'order-first pl-1 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]',
        'inline-end':
          'order-last pr-2 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]',
        'block-start':
          'order-first w-full justify-start px-3 pt-3 group-has-[>input]/autocomplete-input-group:pt-2.5 [.border-b]:pb-3',
        'block-end':
          'order-last w-full justify-start px-3 pb-3 group-has-[>input]/autocomplete-input-group:pb-2.5 [.border-t]:pt-3',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
)

function AutocompleteInputAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof autocompleteAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="autocomplete-input-addon"
      data-align={align}
      className={cn(autocompleteAddonVariants({ align }), className)}
      onClick={e => {
        if ((e.target as HTMLElement).closest('button')) return
        e.currentTarget.parentElement?.querySelector('input')?.focus()
      }}
      {...props}
    />
  )
}

// ─── Addon Button (NEW) ─────────────────────────────────────────────────────

const autocompleteInputButtonVariants = cva(
  'flex items-center gap-2 text-sm shadow-none',
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: 'h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5',
        'icon-xs':
          'size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0',
        'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
)

function AutocompleteInputButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> &
  VariantProps<typeof autocompleteInputButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(autocompleteInputButtonVariants({ size }), className)}
      {...props}
    />
  )
}

// ─── Addon Text (NEW) ───────────────────────────────────────────────────────

function AutocompleteInputText({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

// ─── Input (UPDATED — supports both grouped and standalone modes) ───────────

type AutocompleteInputProps = Omit<AutocompletePrimitive.Input.Props, 'size'> &
  VariantProps<typeof inputVariants> & {
    showClear?: boolean
    showTrigger?: boolean
    /**
     * When `true`, the input renders in "grouped" mode (no border/padding),
     * meant to be used inside <AutocompleteInputGroup>.
     * When `false` (default), it renders standalone with its own border.
     */
    grouped?: boolean
  }

const AutocompleteInput = ({
  className,
  size = 'default',
  showClear = false,
  showTrigger = false,
  required,
  grouped = false,
  ...props
}: AutocompleteInputProps) => {
  // ── Grouped mode: no wrapper, no border, addons handled by <AutocompleteInputGroup> ──
  if (grouped) {
    return (
      <>
        <AutocompletePrimitive.Input
          data-slot="autocomplete-input"
          data-size={size}
          className={cn(groupedInputVariants({ size }), className)}
          {...props}
        />
        {showTrigger && <AutocompleteTrigger />}
        {showClear && <AutocompleteClear />}
      </>
    )
  }

  // ── Standalone mode (original behavior) ──
  return (
    <div data-required={required} className="relative w-full">
      <AutocompletePrimitive.Input
        data-slot="autocomplete-input"
        data-size={size}
        data-required={required}
        className={cn(inputVariants({ size }), className)}
        required={required}
        {...props}
      />
      {showTrigger && <AutocompleteTrigger />}
      {showClear && <AutocompleteClear />}
    </div>
  )
}

// ─── Status ─────────────────────────────────────────────────────────────────

const AutocompleteStatus = ({
  className,
  ...props
}: AutocompletePrimitive.Status.Props) => {
  return (
    <AutocompletePrimitive.Status
      data-slot="autocomplete-status"
      className={cn(
        'text-muted-foreground px-2 py-1.5 text-sm empty:m-0 empty:p-0',
        className,
      )}
      {...props}
    />
  )
}

// ─── Portal / Backdrop / Positioner ─────────────────────────────────────────

const AutocompletePortal = ({
  ...props
}: AutocompletePrimitive.Portal.Props) => {
  return (
    <AutocompletePrimitive.Portal data-slot="autocomplete-portal" {...props} />
  )
}

const AutocompleteBackdrop = ({
  ...props
}: AutocompletePrimitive.Backdrop.Props) => {
  return (
    <AutocompletePrimitive.Backdrop
      data-slot="autocomplete-backdrop"
      {...props}
    />
  )
}

const AutocompletePositioner = ({
  className,
  ...props
}: AutocompletePrimitive.Positioner.Props) => {
  return (
    <AutocompletePrimitive.Positioner
      data-slot="autocomplete-positioner"
      className={cn('z-50 outline-none', className)}
      {...props}
    />
  )
}

// ─── List ───────────────────────────────────────────────────────────────────

const AutocompleteList = ({
  className,
  scrollAreaClassName,
  ...props
}: AutocompletePrimitive.List.Props & {
  scrollAreaClassName?: string
  scrollFade?: boolean
  scrollbarGutter?: boolean
}) => {
  return (
    <ScrollArea
      className={cn(
        'size-full min-h-0 **:data-[slot=scroll-area-viewport]:h-full **:data-[slot=scroll-area-viewport]:overscroll-contain',
        scrollAreaClassName,
      )}
    >
      <AutocompletePrimitive.List
        data-slot="autocomplete-list"
        className={cn(
          'not-empty:scroll-py-1 not-empty:px-1 not-empty:py-1 in-data-has-overflow-y:mr-3',
          className,
        )}
        {...props}
      />
    </ScrollArea>
  )
}

const AutocompleteCollection = ({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Collection>) => {
  return (
    <AutocompletePrimitive.Collection
      data-slot="autocomplete-collection"
      {...props}
    />
  )
}

const AutocompleteRow = ({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Row>) => {
  return (
    <AutocompletePrimitive.Row
      data-slot="autocomplete-row"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

const AutocompleteItem = ({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>) => {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "text-foreground data-highlighted:text-foreground data-highlighted:before:bg-accent relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:relative data-highlighted:z-0 data-highlighted:before:absolute data-highlighted:before:inset-x-0 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([role=img]):not([class*=text-])]:opacity-60",
        className,
      )}
      {...props}
    />
  )
}

// ─── Content ────────────────────────────────────────────────────────────────

export interface AutocompleteContentProps extends React.ComponentProps<
  typeof AutocompletePrimitive.Popup
> {
  align?: AutocompletePrimitive.Positioner.Props['align']
  sideOffset?: AutocompletePrimitive.Positioner.Props['sideOffset']
  alignOffset?: AutocompletePrimitive.Positioner.Props['alignOffset']
  side?: AutocompletePrimitive.Positioner.Props['side']
  anchor?: AutocompletePrimitive.Positioner.Props['anchor']
  showBackdrop?: boolean
}

const AutocompleteContent = ({
  className,
  children,
  showBackdrop = false,
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  side = 'bottom',
  anchor,
  ...props
}: AutocompleteContentProps) => {
  return (
    <AutocompletePortal>
      {showBackdrop && <AutocompleteBackdrop />}
      <AutocompletePositioner
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        side={side}
        anchor={anchor}
      >
        <div className="relative flex max-h-full">
          <AutocompletePrimitive.Popup
            data-slot="autocomplete-popup"
            className={cn(
              'text-popover-foreground ring-foreground/10 bg-background flex max-h-[min(var(--available-height),24rem)] w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) scroll-pt-2 scroll-pb-2 flex-col overscroll-contain rounded-lg py-0.5 shadow-md ring-1 transition-[scale,opacity] has-data-starting-style:scale-98 has-data-starting-style:opacity-0 has-data-[side=none]:scale-100 has-data-[side=none]:transition-none',
              className,
            )}
            {...props}
          >
            {children}
          </AutocompletePrimitive.Popup>
        </div>
      </AutocompletePositioner>
    </AutocompletePortal>
  )
}

// ─── Group / Group Label / Empty ────────────────────────────────────────────

const AutocompleteGroup = ({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Group>) => {
  return (
    <AutocompletePrimitive.Group data-slot="autocomplete-group" {...props} />
  )
}

const AutocompleteGroupLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.GroupLabel>) => {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="autocomplete-group-label"
      className={cn(
        'text-muted-foreground px-1.5 py-1 text-xs font-medium',
        className,
      )}
      {...props}
    />
  )
}

const AutocompleteEmpty = ({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Empty>) => {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={cn(
        'text-muted-foreground px-2 py-1.5 text-center text-sm empty:m-0 empty:p-0',
        className,
      )}
      {...props}
    />
  )
}

// ─── Clear / Trigger / Arrow / Separator ────────────────────────────────────

const AutocompleteClear = ({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Clear>) => {
  return (
    <AutocompletePrimitive.Clear
      data-slot="autocomplete-clear"
      className={cn(
        'ring-offset-background focus:ring-ring absolute top-1/2 -translate-y-1/2 cursor-pointer opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none data-disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <CircleXIcon className="size-4" />
    </AutocompletePrimitive.Clear>
  )
}

const AutocompleteTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Trigger>) => {
  return (
    <AutocompletePrimitive.Trigger
      data-slot="autocomplete-trigger"
      className={cn(
        'focus:ring-ring ring-offset-background absolute top-1/2 -translate-y-1/2 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none has-[+[data-slot=autocomplete-clear]]:hidden data-disabled:pointer-events-none',
        className,
      )}
      {...props}
    >
      <ChevronsUpDownIcon className="size-4 opacity-70" />
    </AutocompletePrimitive.Trigger>
  )
}

const AutocompleteArrow = ({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Arrow>) => {
  return (
    <AutocompletePrimitive.Arrow data-slot="autocomplete-arrow" {...props} />
  )
}

const AutocompleteSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Separator>) => {
  return (
    <AutocompletePrimitive.Separator
      data-slot="autocomplete-separator"
      className={cn('bg-border my-1.5 h-px', className)}
      {...props}
    />
  )
}

export {
  Autocomplete,
  AutocompleteArrow,
  AutocompleteBackdrop,
  AutocompleteClear,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteInputAddon,
  AutocompleteInputButton,
  AutocompleteInputGroup,
  AutocompleteInputText,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteRow,
  AutocompleteSeparator,
  AutocompleteStatus,
  AutocompleteTrigger,
  AutocompleteValue,
}
