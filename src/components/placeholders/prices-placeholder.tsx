import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function PricesPlaceholder() {
  return (
    <FieldGroup>
      <FieldGroup className="lg:flex-row lg:items-start [&_input]:h-8">
        <Field className="lg:min-w-25">
          <FieldLabel>Name</FieldLabel>
          <Input disabled />
        </Field>
        <Field className="sm:shrink-0 lg:w-25">
          <FieldLabel>Price</FieldLabel>
          <Input type="number" disabled data-required />
        </Field>
        <Field className="sm:shrink-0 lg:w-25">
          <FieldLabel>Discount</FieldLabel>
          <Input type="number" disabled />
        </Field>
        <Field className="lg:min-w-25">
          <FieldLabel className="sm:shrink-0 lg:w-25">Offer</FieldLabel>
          <Textarea className="field-sizing-fixed min-h-8" rows={1} disabled />
        </Field>

        <Field className="lg:min-w-60">
          <FieldLabel className="flex justify-between">
            Add Property
            <Button type="button" variant="ghost" size="icon-xs" disabled>
              <PlusIcon />
            </Button>
          </FieldLabel>
          <FieldGroup className="-mt-1 flex-row items-center gap-2">
            <Input className="h-8" disabled />
            <Input className="h-8" disabled />
            <Field className="w-max" orientation="horizontal">
              <Button variant="ghost" size="icon-xs" disabled>
                <XIcon />
              </Button>
            </Field>
          </FieldGroup>
        </Field>

        <Field className="lg:w-max">
          <ButtonGroup orientation="vertical">
            <Button
              className="max-lg:w-full"
              variant="outline"
              size="icon-sm"
              disabled
            >
              <PlusIcon />
            </Button>
            <Button
              className="max-lg:w-full"
              variant="outline"
              size="icon-sm"
              disabled
            >
              <Trash2Icon />
            </Button>
          </ButtonGroup>
        </Field>
      </FieldGroup>
    </FieldGroup>
  )
}
