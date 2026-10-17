import { type ProductFormT, getPricesLeafs } from '../../shared'

import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { ProductInventoryPlaceholder } from './ProductInventoryPlaceholder'

type ProductInventoryDisplayProps = {
  form: ProductFormT
}

export function ProductInventoryDisplay({
  form,
}: ProductInventoryDisplayProps) {
  return (
    <form.Subscribe
      selector={select => ({
        prices: select.values.pricing.prices,
      })}
    >
      {({ prices }) => {
        const pricesLeafs = getPricesLeafs(prices)
        const hasNoLeafs = pricesLeafs.length === 0

        if (hasNoLeafs) {
          return (
            <FieldSet>
              <FieldLegend>Inventory</FieldLegend>
              <FieldDescription>
                Add price variations first to manage their inventory.
              </FieldDescription>
              <ProductInventoryPlaceholder />
            </FieldSet>
          )
        }

        return (
          <FieldSet>
            <FieldLegend>Inventory</FieldLegend>
            <form.AppField name="inventory">
              {field => (
                <field.InventoryField form={form} pricesLeafs={pricesLeafs} />
              )}
            </form.AppField>
          </FieldSet>
        )
      }}
    </form.Subscribe>
  )
}
