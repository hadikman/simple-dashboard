import { type InventoryItem, type PriceItem, type PriceLeaf } from '../'

type CreateInventoryItemProps = { id: string }
export function createInventoryItem({
  id,
}: CreateInventoryItemProps): InventoryItem {
  return {
    id,
    sku: '',
    product_id: '',
    isbn: '',
    ean: '',
    gtin: '',
    stock_quantity: 0,
    stock_status: 'available',
    low_stock_threshold: 0,
    max_purchase_per_order: 0,
  }
}

export function getPricesLeafs(
  items: PriceItem[] | null | undefined,
): PriceLeaf[] {
  if (!items || items.length === 0) return []

  // Build lookups
  const itemById = new Map<string, PriceItem>()
  const parentIds = new Set<string>()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    itemById.set(item.id, item)

    if (item.parent_id) {
      parentIds.add(item.parent_id)
    }
  }

  const result: PriceLeaf[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Skip non-leaf nodes
    if (parentIds.has(item.id)) continue

    // Collect path from root to this leaf
    const path: string[] = []
    let current: PriceItem | undefined = item

    while (current) {
      path.push(current.name)
      current = current.parent_id ? itemById.get(current.parent_id) : undefined
    }

    // Reverse because we collected leaf -> root
    path.reverse()

    result.push({
      id: item.id,
      fullName: path.join(' > '),
      price: item.price,
    })
  }

  return result
}

export function cleanPrices(items: PriceItem[]): PriceItem[] {
  const parentIds = new Set<string>()
  for (let i = 0; i < items.length; i++) {
    if (items[i].parent_id) parentIds.add(items[i].parent_id)
  }
  return items.map(item => {
    const isLeaf = !parentIds.has(item.id)
    if (isLeaf) return item
    return { ...item, price: 0, discount: 0, offer: '', props: [] }
  })
}
