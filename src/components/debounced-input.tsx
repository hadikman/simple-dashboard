import React from 'react'

import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

export function DebouncedInput({
  value: externalValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string) => void
  debounce?: number
} & Omit<React.ComponentProps<'input'>, 'onChange' | 'value'>) {
  const [value, setValue] = React.useState(externalValue)
  const debouncedOnChange = useDebounce(onChange, debounce)

  const isInternalChange = React.useRef(false)

  React.useEffect(() => {
    if (!isInternalChange.current) {
      setValue(externalValue)
    }
    isInternalChange.current = false
  }, [externalValue])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    isInternalChange.current = true
    setValue(newValue)
    debouncedOnChange(newValue)
  }

  return <Input {...props} value={value} onChange={handleChange} />
}
