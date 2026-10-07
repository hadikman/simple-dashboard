import React from 'react'

import { useFormContext } from '@/hooks/create-react-form-hook'
import { Button } from '../ui/button'

type Props = {
  label: string
  icon?: React.JSX.Element
  formSubmitMeta?: string
} & React.ComponentProps<typeof Button>

export function SubscribeButton({
  label,
  icon,
  type = 'submit',
  disabled,
  formSubmitMeta,
  onClick,
  ...props
}: Props) {
  const form = useFormContext()

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (type === 'submit') {
      form.handleSubmit(formSubmitMeta)
    }
    onClick?.(e)
  }

  return (
    <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          {...props}
          disabled={disabled || !canSubmit || isSubmitting}
          type={type}
          onClick={handleClick}
        >
          {icon}
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}
