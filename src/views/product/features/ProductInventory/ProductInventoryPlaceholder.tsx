import { Badge } from '@/components/ui/badge'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function ProductInventoryPlaceholder() {
  return (
    <FieldSet className="rounded-md border p-4">
      <FieldLegend>
        <Badge className="text-sm" variant="secondary">
          Item : 0.00
        </Badge>
      </FieldLegend>
      <FieldGroup className="gap-4">
        <FieldGroup>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel>SKU</FieldLabel>
              <Input disabled />
            </Field>
            <Field>
              <FieldLabel>ID</FieldLabel>
              <Input disabled />
            </Field>
          </FieldGroup>
          <FieldGroup className="sm:grid sm:grid-cols-3">
            <Field>
              <FieldLabel>ISBN</FieldLabel>
              <Input disabled />
            </Field>
            <Field>
              <FieldLabel>EAN</FieldLabel>
              <Input disabled />
            </Field>
            <Field>
              <FieldLabel>GTIN</FieldLabel>
              <Input disabled />
            </Field>
          </FieldGroup>
        </FieldGroup>
        <FieldGroup className="gap-4 lg:flex-row">
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel>Stock Quantity</FieldLabel>
              <Input disabled type="number" />
            </Field>
            <Field>
              <FieldLabel>Product Status</FieldLabel>
              <Input disabled placeholder="Available" />
            </Field>
          </FieldGroup>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel>Low Stock Threshold</FieldLabel>
              <Input disabled type="number" />
            </Field>
            <Field>
              <FieldLabel>Max Purchase Per Order</FieldLabel>
              <Input disabled type="number" />
            </Field>
          </FieldGroup>
        </FieldGroup>
      </FieldGroup>
    </FieldSet>
  )
}
