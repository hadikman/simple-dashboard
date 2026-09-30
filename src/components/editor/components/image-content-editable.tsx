import { ContentEditable } from '@lexical/react/LexicalContentEditable'

type Props = {
  className?: string
  placeholderClassName?: string
  placeholder: string
}

export function ImageContentEditable({
  className,
  placeholder,
  placeholderClassName,
}: Props) {
  return (
    <ContentEditable
      className={className ?? 'ContentEditable__root'}
      aria-placeholder={placeholder}
      placeholder={
        <div className={placeholderClassName ?? 'ContentEditable__placeholder'}>
          {placeholder}
        </div>
      }
    />
  )
}
