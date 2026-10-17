import React from 'react'

import {
  type InventoryItem,
  type PriceItem,
  type ProductFormT,
  createInventoryItem,
  getPricesLeafs,
} from '../../shared'

type ProductInventorySyncProps = {
  form: ProductFormT
}

export function ProductInventorySync({ form }: ProductInventorySyncProps) {
  return (
    <form.Subscribe
      selector={select => ({
        prices: select.values.pricing.prices,
        inventory: select.values.inventory,
      })}
    >
      {({ prices, inventory }) => (
        <InventorySyncEffect
          form={form}
          prices={prices || []}
          inventory={inventory || []}
        />
      )}
    </form.Subscribe>
  )
}

type InventorySyncEffectProps = {
  form: ProductFormT
  prices: PriceItem[]
  inventory: InventoryItem[]
}

function InventorySyncEffect({
  form,
  prices,
  inventory,
}: InventorySyncEffectProps) {
  React.useEffect(() => {
    const pricesLeafs = getPricesLeafs(prices)

    // Runtime: check if sync needed
    const leafIds = pricesLeafs.map(l => l.id)
    const currentIds = inventory.map(inv => inv.id)

    const isInSync =
      leafIds.length === currentIds.length &&
      leafIds.every((id, i) => id === currentIds[i])

    if (isInSync) return

    // Merge: keep existing, add missing
    const inventoryById = new Map<string, InventoryItem>()
    for (let i = 0; i < inventory.length; i++) {
      inventoryById.set(inventory[i].id, inventory[i])
    }

    const synced: InventoryItem[] = pricesLeafs.map(leaf => {
      const existing = inventoryById.get(leaf.id)
      return existing ?? createInventoryItem({ id: leaf.id })
    })

    form.setFieldValue('inventory', synced)
  }, [prices, inventory, form])

  return null
}
