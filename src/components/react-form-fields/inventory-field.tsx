import { type ProductFormT, useLocalizedPrice } from '@/views/product'

import { Badge } from '@/components/ui/badge'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { SelectItem } from '@/components/ui/select'

export type PricesLeaf = {
  id: string
  fullName: string
  price: number
}

type Props = {
  pricesLeafs: PricesLeaf[]
  form: ProductFormT
}

export function InventoryField({ pricesLeafs, form }: Props) {
  const indexById = new Map<string, number>()
  for (let i = 0; i < pricesLeafs.length; i++) {
    indexById.set(pricesLeafs[i].id, i)
  }

  return (
    <FieldGroup>
      <FieldSet className="overflow-x-auto p-2">
        {pricesLeafs.map(node => {
          const { id } = node
          const index = indexById.get(id)
          if (index === undefined) return null

          return (
            <FieldGroup key={id}>
              <InventoryRow form={form} index={index} node={node} />
            </FieldGroup>
          )
        })}
      </FieldSet>
    </FieldGroup>
  )
}

type InventoryPropsRow = {
  form: ProductFormT
  index: number
  node: PricesLeaf
}
function InventoryRow(props: InventoryPropsRow) {
  const { form, index, node } = props
  const baseName = `inventory[${index}]` as const

  // When updating styles here, remember to apply the same changes to placeholder component styles.
  return (
    <FieldSet className="rounded-md border p-4">
      <FieldLegendPriceBadge form={form} node={node} />
      <FieldGroup className="gap-4">
        <FieldGroup>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <form.AppField name={`${baseName}.sku`}>
              {field => <field.TextField label="SKU" />}
            </form.AppField>
            <form.AppField name={`${baseName}.product_id`}>
              {field => <field.TextField label="ID" />}
            </form.AppField>
          </FieldGroup>
          <FieldGroup className="sm:grid sm:grid-cols-3">
            <form.AppField name={`${baseName}.isbn`}>
              {field => <field.TextField label="ISBN" />}
            </form.AppField>
            <form.AppField name={`${baseName}.ean`}>
              {field => <field.TextField label="EAN" />}
            </form.AppField>
            <form.AppField name={`${baseName}.gtin`}>
              {field => <field.TextField label="GTIN" />}
            </form.AppField>
          </FieldGroup>
        </FieldGroup>
        <FieldGroup className="gap-4 lg:flex-row">
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <form.AppField name={`${baseName}.stock_quantity`}>
              {field => <field.NumberField label="Stock Quantity" min={0} />}
            </form.AppField>
            <form.AppField name={`${baseName}.stock_status`}>
              {field => (
                <field.SelectField
                  label="Product Status"
                  defaultValue={'available'}
                  renderItems={
                    <>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="preorder">Preorder</SelectItem>
                    </>
                  }
                />
              )}
            </form.AppField>
          </FieldGroup>
          <FieldGroup className="sm:grid sm:grid-cols-2">
            <form.AppField name={`${baseName}.low_stock_threshold`}>
              {field => (
                <field.NumberField label="Low Stock Threshold" min={0} />
              )}
            </form.AppField>
            <form.AppField name={`${baseName}.max_purchase_per_order`}>
              {field => (
                <field.NumberField label="Max Purchase Per Order" min={0} />
              )}
            </form.AppField>
          </FieldGroup>
        </FieldGroup>
      </FieldGroup>
    </FieldSet>
  )
}

type FieldLegendPriceBadgeProps = {
  form: ProductFormT
  node: PricesLeaf
}
function FieldLegendPriceBadge({ form, node }: FieldLegendPriceBadgeProps) {
  const { fullName, price } = node
  const formattedPrice = useLocalizedPrice({ form, price })

  return (
    <FieldLegend>
      <Badge
        className="text-sm"
        variant="outline"
      >{`${fullName || '–'} : ${formattedPrice || '–'}`}</Badge>
    </FieldLegend>
  )
}
