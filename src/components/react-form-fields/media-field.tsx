import { XIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { HOME_DIRECTORY } from '@/views/media'

import { getFilename } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Field, FieldContent, FieldDescription, FieldLabel } from '../ui/field'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

type ModeType = {
  single: { src: string; alt: string }
  multi: { src: string; alt: string }[]
}
type Props = {
  label: string
  description?: string
  href: string
  groupId?: string
  slug?: string
  status?: 'draft' | 'published'
  mode: keyof ModeType
  keyValue: string
  required?: boolean
  selectedMediaPreview: string[]
  onRemove: (name: string) => void
}

export function MediaField({
  label,
  description,
  href,
  groupId,
  slug,
  status,
  mode,
  keyValue,
  required,
  selectedMediaPreview,
  onRemove,
}: Props) {
  const field = useFieldContext<ModeType[typeof mode]>()

  const nextValue = React.useMemo(() => {
    if (mode === 'single') {
      const filename = selectedMediaPreview[0] ?? ''
      return getImageValue(filename) as ModeType[typeof mode]
    }

    return selectedMediaPreview.map(src =>
      getImageValue(src),
    ) as ModeType[typeof mode]
  }, [mode, selectedMediaPreview])

  React.useEffect(() => {
    const currentValue = field.state.value

    const same =
      mode === 'single'
        ? isSameSingle(
            currentValue as ModeType['single'] | undefined,
            nextValue as ModeType['single'],
          )
        : isSameMulti(
            currentValue as ModeType['multi'] | undefined,
            nextValue as ModeType['multi'],
          )

    if (same) return

    field.handleChange(nextValue)
  }, [field.state.value, field, mode, nextValue])

  const params = new URLSearchParams()
  params.set('selection', mode)
  params.set('key', keyValue)
  // The following three params required if need to navigate back to dynamic route that opened the media (static route don't need these params)
  if (groupId) params.set('group-id', groupId)
  if (slug) params.set('slug', slug)
  if (status) params.set('status', status)

  return (
    <Field className="sm:max-w-xs" onBlur={field.handleBlur}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}

      {keyValue ? (
        <Button asChild data-required={required}>
          <Link href={`${href}?${params.toString()}`}>Open Media Library</Link>
        </Button>
      ) : (
        <Badge variant="destructive">Key value not provided</Badge>
      )}

      <FieldContent>
        {selectedMediaPreview?.length > 0 && (
          <FieldSelectedMediaPreview
            files={selectedMediaPreview}
            mode={mode}
            onRemove={onRemove}
          />
        )}
      </FieldContent>
    </Field>
  )
}

function getImageValue(filename: string) {
  return { src: filename, alt: getFilename(filename) }
}

function isSameSingle(
  a: ModeType['single'] | undefined,
  b: ModeType['single'],
) {
  return (a?.src ?? '') === b.src && (a?.alt ?? '') === b.alt
}

function isSameMulti(a: ModeType['multi'] | undefined, b: ModeType['multi']) {
  if (!a || a.length !== b.length) return false
  return a.every((item, i) => item.src === b[i]?.src && item.alt === b[i]?.alt)
}

type FieldSelectedMediaLibraryPreviewProps = {
  files: string[]
  mode: 'single' | 'multi'
  onRemove: (name: string) => void
}
function FieldSelectedMediaPreview({
  files,
  mode,
  onRemove,
}: FieldSelectedMediaLibraryPreviewProps) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-4">
      {files.map((name, i) => (
        <div key={name + i} className="relative">
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div className="relative size-24 overflow-clip rounded-md border">
                <Image
                  className="object-contain"
                  src={`/${HOME_DIRECTORY}/${name}`}
                  alt=""
                  fill
                  sizes="70px"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">{name}</TooltipContent>
          </Tooltip>

          <Button
            className="absolute -top-2.5 -right-2.5 rounded-full"
            variant="secondary"
            size="icon-xs"
            onClick={() => onRemove(mode === 'single' ? '' : name)}
          >
            <XIcon />
          </Button>
        </div>
      ))}
    </div>
  )
}
