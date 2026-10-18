'use client'

import { useSelector } from '@tanstack/react-form'
import Fuse from 'fuse.js'
import { RotateCcwIcon, SearchIcon, ShieldAlertIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { AnyFieldApi } from '@tanstack/react-form'

import { type TCategoryData } from '@/views/category'

import {
  type CurrencyCode,
  type TProductLookupDataWithId,
  LOCALS_MAP,
} from '@/views/product'

import {
  type GuaranteeFormT,
  type TargetItem,
  type TLockedPricesMap,
} from '@/views/guarantee'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useFieldContext } from '@/hooks/create-react-form-hook'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePersistStorage } from '@/hooks/use-persist-storage'

// ─── Types ───────────────────────────────────────────────────────────────────

type CheckState = boolean | 'indeterminate'

const UNCATEGORIZED_ID = '__uncategorized__'
const UNCATEGORIZED_NAME = 'Uncategorized'
const SELECTION_STORAGE_KEY = 'guarantee-target-selection'

type CachedLeafPrice = {
  id: string
  name: string
  price: number
  ancestorPath: string
}

type CachedProduct = {
  id: string
  title: string
  productGroupId: string
  categoryIds: string[]
  leafPrices: CachedLeafPrice[]
  currency?: string
}

type ProductGroup = {
  categoryFullName: string
  categoryId: string
  products: { id: string; title: string; productGroupId: string }[]
}

type LeafPriceDisplay = {
  priceId: string
  productId: string
  categoryId: string
  name: string
  ancestorPath: string
  productTitle: string
  originalPrice: number
  isLocked: boolean
  lockedByGuaranteeName: string | null
}

type LeafPriceGroup = {
  label: string
  categoryLabel: string
  productId: string
  categoryId: string
  leafPrices: LeafPriceDisplay[]
  currency?: string
}

type SelectionState = {
  categoryIds: Set<string>
  productKeys: Set<string>
  leafKeys: Set<string>
}

type SerializedSelectionState = {
  categoryIds: string[]
  productKeys: string[]
  leafKeys: string[]
}

type SharedRefs = {
  selectionRef: React.RefObject<SelectionState>
  productMapRef: React.RefObject<Map<string, CachedProduct>>
  lockedPricesMapRef: React.RefObject<TLockedPricesMap>
}

type GuaranteeTargetSelectorFieldProps = {
  categories: TCategoryData[]
  products: TProductLookupDataWithId[]
  lockedPricesMap: TLockedPricesMap
  storageKey?: string
}

// ─── Serialization ───────────────────────────────────────────────────────────

const EMPTY_SERIALIZED_SELECTION: SerializedSelectionState = {
  categoryIds: [],
  productKeys: [],
  leafKeys: [],
}

function serializeSelection(state: SelectionState): SerializedSelectionState {
  return {
    categoryIds: [...state.categoryIds],
    productKeys: [...state.productKeys],
    leafKeys: [...state.leafKeys],
  }
}

function deserializeSelection(data: SerializedSelectionState): SelectionState {
  return {
    categoryIds: new Set(data.categoryIds),
    productKeys: new Set(data.productKeys),
    leafKeys: new Set(data.leafKeys),
  }
}

// ─── Category Processing ─────────────────────────────────────────────────────

type ProcessedCategoriesData = {
  categoriesMap: Map<string, { id: string; name: string }>
  childrenMap: Map<string, string[]>
  roots: string[]
}

function processCategoriesData(
  categories: TCategoryData[],
): ProcessedCategoriesData {
  const categoriesMap = new Map<string, { id: string; name: string }>()
  const nameToIds = new Map<string, string[]>()
  const childIds = new Set<string>()

  for (let i = 0; i < categories.length; i++) {
    const { id, name } = categories[i]
    categoriesMap.set(id, { id, name })

    const ids = nameToIds.get(name)
    if (ids) ids.push(id)
    else nameToIds.set(name, [id])
  }

  const childrenMap = new Map<string, string[]>()
  for (let i = 0; i < categories.length; i++) {
    const { id, children } = categories[i]
    if (children.length === 0) continue

    const resolvedChildren: string[] = []
    for (let j = 0; j < children.length; j++) {
      const ids = nameToIds.get(children[j])
      if (!ids || ids.length === 0) continue
      const childId = ids.shift()!
      resolvedChildren.push(childId)
      childIds.add(childId)
    }
    if (resolvedChildren.length > 0) {
      childrenMap.set(id, resolvedChildren)
    }
  }

  const roots: string[] = []
  for (const [id] of categoriesMap) {
    if (!childIds.has(id)) roots.push(id)
  }

  return { categoriesMap, childrenMap, roots }
}

type FlatCategoryNode = {
  id: string
  name: string
  children: string[]
  depth: number
  isLastChild: boolean
  ancestorIds: string[]
}

function buildFlattenedCategoriesList(
  data: ProcessedCategoriesData,
): FlatCategoryNode[] {
  const { categoriesMap, childrenMap, roots } = data
  const result: FlatCategoryNode[] = []
  const processed = new Set<string>()

  function traverse(nodeIds: string[], depth: number, ancestorIds: string[]) {
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i]
      if (processed.has(nodeId)) continue
      processed.add(nodeId)

      const { id, name } = categoriesMap.get(nodeId)!
      const isLastChild = i === nodeIds.length - 1
      const childNodeIds = childrenMap.get(nodeId) || []

      result.push({
        id,
        name,
        children: childNodeIds,
        depth,
        isLastChild,
        ancestorIds: [...ancestorIds],
      })
      if (childNodeIds.length > 0) {
        traverse(childNodeIds, depth + 1, [...ancestorIds, nodeId])
      }
    }
  }

  traverse(roots, 0, [])
  return result
}

// ─── Precomputed Caches ──────────────────────────────────────────────────────

function buildCategoriesWithProductsCache(
  categoryToProductIds: Map<string, string[]>,
  descendantCache: Map<string, string[]>,
  allCategoryIds: Iterable<string>,
): Set<string> {
  const result = new Set<string>()
  for (const catId of allCategoryIds) {
    if ((categoryToProductIds.get(catId)?.length ?? 0) > 0) {
      result.add(catId)
      continue
    }

    const descendants = descendantCache.get(catId) || []
    for (let i = 0; i < descendants.length; i++) {
      if ((categoryToProductIds.get(descendants[i])?.length ?? 0) > 0) {
        result.add(catId)
        break
      }
    }
  }

  return result
}

function buildDescendantCache(
  childrenMap: Map<string, string[]>,
  allNodeIds: Iterable<string>,
): Map<string, string[]> {
  const cache = new Map<string, string[]>()

  for (const nodeId of allNodeIds) {
    const descendants: string[] = []
    const stack = [...(childrenMap.get(nodeId) || [])]

    while (stack.length > 0) {
      const current = stack.pop()!
      descendants.push(current)
      const children = childrenMap.get(current) || []
      for (let i = 0; i < children.length; i++) stack.push(children[i])
    }

    cache.set(nodeId, descendants)
  }

  return cache
}

function buildFullPathCache(
  flatList: FlatCategoryNode[],
  categoriesMap: Map<string, { id: string; name: string }>,
): Map<string, string> {
  const cache = new Map<string, string>()
  cache.set(UNCATEGORIZED_ID, UNCATEGORIZED_NAME)

  for (let i = 0; i < flatList.length; i++) {
    const node = flatList[i]
    const ancestorIds = node.ancestorIds
    const parts: string[] = []

    for (let j = 0; j < ancestorIds.length; j++) {
      const name = categoriesMap.get(ancestorIds[j])?.name
      if (name) parts.push(name)
    }
    if (node.name) parts.push(node.name)

    cache.set(node.id, parts.join(' > '))
  }

  return cache
}

function buildFlatCategoryMap(
  flatList: FlatCategoryNode[],
): Map<string, FlatCategoryNode> {
  const map = new Map<string, FlatCategoryNode>()
  for (let i = 0; i < flatList.length; i++) {
    const node = flatList[i]
    map.set(node.id, node)
  }
  return map
}

function buildProductCaches(products: TProductLookupDataWithId[]): {
  productMap: Map<string, CachedProduct>
  categoryToProductIds: Map<string, string[]>
  uncategorizedProductIds: string[]
} {
  const productMap = new Map<string, CachedProduct>()
  const categoryToProductIds = new Map<string, string[]>()
  const uncategorizedProductIds: string[] = []

  for (let i = 0; i < products.length; i++) {
    const product = products[i]

    if (product.status !== 'published') continue

    const prices = product.pricing.prices

    const parentOfIds = new Set<string>()
    for (let j = 0; j < prices.length; j++) {
      const p = prices[j]
      if (p.parent_id && p.parent_id !== p.id) {
        parentOfIds.add(p.parent_id)
      }
    }

    const priceById = new Map<string, (typeof prices)[0]>()
    for (let j = 0; j < prices.length; j++) {
      priceById.set(prices[j].id, prices[j])
    }

    const leafPrices: CachedLeafPrice[] = []
    for (let j = 0; j < prices.length; j++) {
      const p = prices[j]
      if (parentOfIds.has(p.id)) continue

      const names: string[] = []
      let currentId: string = p.id
      while (currentId) {
        const price = priceById.get(currentId)
        if (!price) break
        names.unshift(price.name)
        if (price.parent_id && price.parent_id !== currentId) {
          currentId = price.parent_id
        } else {
          break
        }
      }

      leafPrices.push({
        id: p.id,
        name: p.name,
        price: p.price,
        ancestorPath: names.join(' > '),
      })
    }

    const categoryIds: string[] = []
    const cats = product.categories
    for (let j = 0; j < cats.length; j++) {
      categoryIds.push(cats[j].id)
    }

    productMap.set(product.id, {
      id: product.id,
      title: product.title,
      productGroupId: product.product_group_id,
      categoryIds,
      leafPrices,
      currency: product.pricing.currency,
    })

    if (categoryIds.length === 0) {
      uncategorizedProductIds.push(product.id)
    } else {
      for (let j = 0; j < categoryIds.length; j++) {
        const catId = categoryIds[j]
        let arr = categoryToProductIds.get(catId)
        if (!arr) {
          arr = []
          categoryToProductIds.set(catId, arr)
        }
        arr.push(product.id)
      }
    }
  }

  return { productMap, categoryToProductIds, uncategorizedProductIds }
}

type LockCaches = {
  fullyLockedProducts: Set<string>
  fullyLockedCategories: Set<string>
  isUncategorizedFullyLocked: boolean
}

function buildLockCaches(
  productMap: Map<string, CachedProduct>,
  categoryToProductIds: Map<string, string[]>,
  uncategorizedProductIds: string[],
  descendantCache: Map<string, string[]>,
  lockedPricesMap: TLockedPricesMap,
): LockCaches {
  const fullyLockedProducts = new Set<string>()
  const fullyLockedCategories = new Set<string>()

  for (const [productId, product] of productMap) {
    const leaves = product.leafPrices
    if (leaves.length === 0) continue

    let allLocked = true
    for (let i = 0; i < leaves.length; i++) {
      if (lockedPricesMap[leaves[i].id] === undefined) {
        allLocked = false
        break
      }
    }

    if (allLocked) {
      fullyLockedProducts.add(productId)
    }
  }

  function isCategoryFullyLocked(catId: string): boolean {
    const directProductIds = categoryToProductIds.get(catId) || []
    const descendantIds = descendantCache.get(catId) || []

    let hasAnyProduct = false

    for (let i = 0; i < directProductIds.length; i++) {
      const pid = directProductIds[i]
      const product = productMap.get(pid)
      if (!product || product.leafPrices.length === 0) continue
      hasAnyProduct = true
      if (!fullyLockedProducts.has(pid)) return false
    }

    for (let i = 0; i < descendantIds.length; i++) {
      const descProductIds = categoryToProductIds.get(descendantIds[i]) || []
      for (let j = 0; j < descProductIds.length; j++) {
        const pid = descProductIds[j]
        const product = productMap.get(pid)
        if (!product || product.leafPrices.length === 0) continue
        hasAnyProduct = true
        if (!fullyLockedProducts.has(pid)) return false
      }
    }

    return hasAnyProduct
  }

  for (const catId of categoryToProductIds.keys()) {
    if (isCategoryFullyLocked(catId)) fullyLockedCategories.add(catId)
  }
  for (const [catId] of descendantCache) {
    if (fullyLockedCategories.has(catId)) continue
    if (isCategoryFullyLocked(catId)) {
      fullyLockedCategories.add(catId)
    }
  }

  let isUncategorizedFullyLocked = uncategorizedProductIds.length > 0
  if (isUncategorizedFullyLocked) {
    for (let i = 0; i < uncategorizedProductIds.length; i++) {
      if (!fullyLockedProducts.has(uncategorizedProductIds[i])) {
        isUncategorizedFullyLocked = false
        break
      }
    }
  }

  return {
    fullyLockedProducts,
    fullyLockedCategories,
    isUncategorizedFullyLocked,
  }
}

// ─── Price Helpers ───────────────────────────────────────────────────────────

function buildTargetItems(
  leafKeys: Set<string>,
  productMap: Map<string, CachedProduct>,
  lockedPricesMap: TLockedPricesMap,
): TargetItem[] {
  const items: TargetItem[] = []
  const leafCache = new Map<string, CachedLeafPrice>()

  for (const key of leafKeys) {
    const sep1 = key.indexOf('::')
    const sep2 = key.indexOf('::', sep1 + 2)
    const categoryId = key.slice(0, sep1)
    const productId = key.slice(sep1 + 2, sep2)
    const priceId = key.slice(sep2 + 2)

    const product = productMap.get(productId)

    if (lockedPricesMap[priceId]) continue

    const cacheKey = `${productId}::${priceId}`
    let leaf = leafCache.get(cacheKey)

    if (!leaf) {
      if (!product) continue
      const leaves = product.leafPrices

      for (let i = 0; i < leaves.length; i++) {
        leafCache.set(`${productId}::${leaves[i].id}`, leaves[i])
      }
      leaf = leafCache.get(cacheKey)
      if (!leaf) continue
    }

    items.push({
      product_group_id: product?.productGroupId || '',
      product_id: productId,
      category_id: categoryId === UNCATEGORIZED_ID ? null : categoryId,
      price_id: priceId,
    })
  }

  return items
}

// ─── Selection Helpers ───────────────────────────────────────────────────────

function cloneSelection(state: SelectionState): SelectionState {
  return {
    categoryIds: new Set(state.categoryIds),
    productKeys: new Set(state.productKeys),
    leafKeys: new Set(state.leafKeys),
  }
}

function selectProductsForCategory(
  catId: string,
  productMap: Map<string, CachedProduct>,
  categoryToProductIds: Map<string, string[]>,
  uncategorizedProductIds: string[],
  state: SelectionState,
  lockedPricesMap: TLockedPricesMap,
  globallySelectedProductIds: Set<string>,
) {
  const productIds =
    catId === UNCATEGORIZED_ID
      ? uncategorizedProductIds
      : categoryToProductIds.get(catId) || []
  for (let i = 0; i < productIds.length; i++) {
    const pid = productIds[i]
    if (globallySelectedProductIds.has(pid)) continue
    const product = productMap.get(pid)
    if (!product) continue
    const selectableLeaves: CachedLeafPrice[] = []
    for (let j = 0; j < product.leafPrices.length; j++) {
      if (!lockedPricesMap[product.leafPrices[j].id]) {
        selectableLeaves.push(product.leafPrices[j])
      }
    }
    if (selectableLeaves.length === 0) continue
    state.productKeys.add(`${catId}::${pid}`)
    for (let j = 0; j < selectableLeaves.length; j++) {
      state.leafKeys.add(`${catId}::${pid}::${selectableLeaves[j].id}`)
    }
    globallySelectedProductIds.add(pid)
  }
}

function deselectProductsForCategories(
  catIds: string[],
  productMap: Map<string, CachedProduct>,
  categoryToProductIds: Map<string, string[]>,
  uncategorizedProductIds: string[],
  state: SelectionState,
) {
  for (let i = 0; i < catIds.length; i++) {
    const catId = catIds[i]
    const productIds =
      catId === UNCATEGORIZED_ID
        ? uncategorizedProductIds
        : categoryToProductIds.get(catId) || []
    for (let j = 0; j < productIds.length; j++) {
      const pid = productIds[j]
      state.productKeys.delete(`${catId}::${pid}`)
      const product = productMap.get(pid)
      if (!product) continue
      for (let k = 0; k < product.leafPrices.length; k++) {
        state.leafKeys.delete(`${catId}::${pid}::${product.leafPrices[k].id}`)
      }
    }
  }
}

function propagateAncestorsOnCheck(
  nodeId: string,
  flatCategoryMap: Map<string, FlatCategoryNode>,
  childrenMap: Map<string, string[]>,
  nextCategoryIds: Set<string>,
  categoriesWithProducts: Set<string>,
) {
  const flatNode = flatCategoryMap.get(nodeId)
  if (!flatNode) return
  for (let i = flatNode.ancestorIds.length - 1; i >= 0; i--) {
    const ancestorId = flatNode.ancestorIds[i]
    const siblingIds = childrenMap.get(ancestorId) || []
    let allChecked = true
    for (let j = 0; j < siblingIds.length; j++) {
      if (!categoriesWithProducts.has(siblingIds[j])) continue
      if (!nextCategoryIds.has(siblingIds[j])) {
        allChecked = false
        break
      }
    }
    if (allChecked) nextCategoryIds.add(ancestorId)
    else break
  }
}

function propagateAncestorsOnUncheck(
  nodeId: string,
  flatCategoryMap: Map<string, FlatCategoryNode>,
  descendantCache: Map<string, string[]>,
  categoryToProductIds: Map<string, string[]>,
  uncategorizedProductIds: string[],
  productKeys: Set<string>,
  nextCategoryIds: Set<string>,
) {
  const flatNode = flatCategoryMap.get(nodeId)
  if (!flatNode) return
  for (let i = flatNode.ancestorIds.length - 1; i >= 0; i--) {
    const ancestorId = flatNode.ancestorIds[i]
    if (
      hasAnySelectedProductInSubtree(
        ancestorId,
        descendantCache,
        categoryToProductIds,
        uncategorizedProductIds,
        productKeys,
      )
    ) {
      break
    }
    nextCategoryIds.delete(ancestorId)
  }
}

function hasAnySelectedProductInSubtree(
  rootId: string,
  descendantCache: Map<string, string[]>,
  categoryToProductIds: Map<string, string[]>,
  uncategorizedProductIds: string[],
  productKeys: Set<string>,
): boolean {
  if (
    checkAnyProductForCategory(
      rootId,
      categoryToProductIds,
      uncategorizedProductIds,
      productKeys,
    )
  )
    return true
  const descendants = descendantCache.get(rootId) || []
  for (let i = 0; i < descendants.length; i++) {
    if (
      checkAnyProductForCategory(
        descendants[i],
        categoryToProductIds,
        uncategorizedProductIds,
        productKeys,
      )
    )
      return true
  }
  return false
}

function checkAnyProductForCategory(
  categoryId: string,
  categoryToProductIds: Map<string, string[]>,
  uncategorizedProductIds: string[],
  productKeys: Set<string>,
): boolean {
  const productIds =
    categoryId === UNCATEGORIZED_ID
      ? uncategorizedProductIds
      : categoryToProductIds.get(categoryId) || []
  for (let i = 0; i < productIds.length; i++) {
    if (productKeys.has(`${categoryId}::${productIds[i]}`)) return true
  }
  return false
}

// ─── Derive / Validate Selection ─────────────────────────────────────────────

function propagateCategoryAncestors(
  categoryIds: Set<string>,
  flatCategoryMap: Map<string, FlatCategoryNode>,
  childrenMap: Map<string, string[]>,
) {
  const processed = new Set<string>()
  for (const catId of [...categoryIds]) {
    if (catId === UNCATEGORIZED_ID || processed.has(catId)) continue
    processed.add(catId)
    const flatNode = flatCategoryMap.get(catId)
    if (!flatNode) continue
    for (let i = flatNode.ancestorIds.length - 1; i >= 0; i--) {
      const ancestorId = flatNode.ancestorIds[i]
      if (processed.has(ancestorId)) continue
      processed.add(ancestorId)
      const siblingIds = childrenMap.get(ancestorId) || []
      let allPresent = true
      for (let j = 0; j < siblingIds.length; j++) {
        if (!categoryIds.has(siblingIds[j])) {
          allPresent = false
          break
        }
      }
      if (allPresent) categoryIds.add(ancestorId)
      else break
    }
  }
}

function deriveSelectionFromTargetItems(
  targetItems: TargetItem[],
  productMap: Map<string, CachedProduct>,
  flatCategoryMap: Map<string, FlatCategoryNode>,
  childrenMap: Map<string, string[]>,
): SelectionState {
  const categoryIds = new Set<string>()
  const productKeys = new Set<string>()
  const leafKeys = new Set<string>()
  if (!targetItems || targetItems.length === 0)
    return { categoryIds, productKeys, leafKeys }

  for (let i = 0; i < targetItems.length; i++) {
    const { category_id, product_id, price_id } = targetItems[i]
    const product = productMap.get(product_id)
    if (!product) continue
    let leafExists = false
    for (let j = 0; j < product.leafPrices.length; j++) {
      if (product.leafPrices[j].id === price_id) {
        leafExists = true
        break
      }
    }
    if (!leafExists) continue
    const resolvedCategoryId =
      category_id === null ? UNCATEGORIZED_ID : category_id
    leafKeys.add(`${resolvedCategoryId}::${product_id}::${price_id}`)
    productKeys.add(`${resolvedCategoryId}::${product_id}`)
    categoryIds.add(resolvedCategoryId)
  }

  propagateCategoryAncestors(categoryIds, flatCategoryMap, childrenMap)
  return { categoryIds, productKeys, leafKeys }
}

function validateRestoredSelection(
  restored: SelectionState,
  productMap: Map<string, CachedProduct>,
  flatCategoryMap: Map<string, FlatCategoryNode>,
  childrenMap: Map<string, string[]>,
  lockedPricesMap: TLockedPricesMap,
): SelectionState {
  const categoryIds = new Set<string>()
  const productKeys = new Set<string>()
  const leafKeys = new Set<string>()

  for (const key of restored.leafKeys) {
    const sep1 = key.indexOf('::')
    const sep2 = key.indexOf('::', sep1 + 2)
    const categoryId = key.slice(0, sep1)
    const productId = key.slice(sep1 + 2, sep2)
    const priceId = key.slice(sep2 + 2)
    if (lockedPricesMap[priceId]) continue
    const product = productMap.get(productId)
    if (!product) continue
    let leafExists = false
    for (let i = 0; i < product.leafPrices.length; i++) {
      if (product.leafPrices[i].id === priceId) {
        leafExists = true
        break
      }
    }
    if (!leafExists) continue
    if (categoryId !== UNCATEGORIZED_ID && !flatCategoryMap.has(categoryId))
      continue
    leafKeys.add(key)
    productKeys.add(`${categoryId}::${productId}`)
    categoryIds.add(categoryId)
  }

  propagateCategoryAncestors(categoryIds, flatCategoryMap, childrenMap)
  return { categoryIds, productKeys, leafKeys }
}

// ─── Fuzzy Search ────────────────────────────────────────────────────────────

function fuzzySearch<T>(items: T[], keys: string[], query: string): T[] {
  if (!query.trim()) return items
  const fuse = new Fuse(items, { keys, threshold: 0.4, ignoreLocation: true })
  const results = fuse.search(query)
  const out: T[] = []
  for (let i = 0; i < results.length; i++) out.push(results[i].item)
  return out
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GuaranteeTargetSelectorField({
  categories,
  products,
  lockedPricesMap,
  storageKey = SELECTION_STORAGE_KEY,
}: GuaranteeTargetSelectorFieldProps) {
  const field = useFieldContext<TargetItem[]>()
  const form = field.form as GuaranteeFormT

  // ── Precomputed data ──
  const processedData = useMemo(
    () => processCategoriesData(categories),
    [categories],
  )
  const flatCategories = useMemo(
    () => buildFlattenedCategoriesList(processedData),
    [processedData],
  )
  const { categoriesMap, childrenMap } = processedData

  const flatCategoryMap = useMemo(
    () => buildFlatCategoryMap(flatCategories),
    [flatCategories],
  )
  const descendantCache = useMemo(
    () => buildDescendantCache(childrenMap, categoriesMap.keys()),
    [childrenMap, categoriesMap],
  )
  const fullPathCache = useMemo(
    () => buildFullPathCache(flatCategories, categoriesMap),
    [flatCategories, categoriesMap],
  )

  const { productMap, categoryToProductIds, uncategorizedProductIds } = useMemo(
    () => buildProductCaches(products),
    [products],
  )

  const categoriesWithProducts = useMemo(
    () =>
      buildCategoriesWithProductsCache(
        categoryToProductIds,
        descendantCache,
        categoriesMap.keys(),
      ),
    [categoryToProductIds, descendantCache, categoriesMap],
  )

  const hasUncategorized = uncategorizedProductIds.length > 0

  const lockCaches = useMemo(
    () =>
      buildLockCaches(
        productMap,
        categoryToProductIds,
        uncategorizedProductIds,
        descendantCache,
        lockedPricesMap,
      ),
    [
      productMap,
      categoryToProductIds,
      uncategorizedProductIds,
      descendantCache,
      lockedPricesMap,
    ],
  )

  // ── Persist selection ──
  const {
    value: persistedSelection,
    set: setPersistedSelection,
    clear: clearPersistedSelection,
  } = usePersistStorage<SerializedSelectionState>({
    key: storageKey,
    initialState: EMPTY_SERIALIZED_SELECTION,
    storage: 'sessionStorage',
  })

  // ── Selection state ──
  const [selection, setSelection] = useState<SelectionState>(() =>
    deriveSelectionFromTargetItems(
      field.state.value,
      productMap,
      flatCategoryMap,
      childrenMap,
    ),
  )

  const selectionRef = useRef(selection)
  const productMapRef = useRef(productMap)
  const lockedPricesMapRef = useRef(lockedPricesMap)

  useEffect(() => {
    selectionRef.current = selection
  }, [selection])
  useEffect(() => {
    productMapRef.current = productMap
    lockedPricesMapRef.current = lockedPricesMap
  }, [productMap, lockedPricesMap])

  const sharedRefs: SharedRefs = {
    selectionRef,
    productMapRef,
    lockedPricesMapRef,
  }

  const checkedCategoryIds = selection.categoryIds
  const checkedProductKeys = selection.productKeys
  const checkedLeafPriceKeys = selection.leafKeys

  const selectedProductIds = useMemo(() => {
    const ids = new Set<string>()
    for (const key of checkedProductKeys) {
      const sep = key.indexOf('::')
      ids.add(key.slice(sep + 2))
    }
    return ids
  }, [checkedProductKeys])

  const [categorySearch, setCategorySearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [priceSearch, setPriceSearch] = useState('')

  // ── Recovery notice ──
  const [dismissed, setDismissed] = useState(false)

  const isSelectionDifferent = useMemo(() => {
    if (
      !persistedSelection.leafKeys ||
      persistedSelection.leafKeys.length === 0
    )
      return false
    if (persistedSelection.leafKeys.length !== selection.leafKeys.size)
      return true
    for (const key of persistedSelection.leafKeys) {
      if (!selection.leafKeys.has(key)) return true
    }
    return false
  }, [persistedSelection.leafKeys, selection.leafKeys])

  const recoverableCount =
    !dismissed && isSelectionDifferent ? persistedSelection.leafKeys.length : 0

  function handleRestore() {
    const restored = deserializeSelection(persistedSelection)
    const validated = validateRestoredSelection(
      restored,
      productMap,
      flatCategoryMap,
      childrenMap,
      lockedPricesMap,
    )
    if (validated.leafKeys.size > 0) {
      setSelection(validated)
      const items = buildTargetItems(
        validated.leafKeys,
        productMap,
        lockedPricesMap,
      )
      field.handleChange(items)
    }
    setDismissed(true)
  }

  // ── Commit helper ──
  function commitSelection(state: SelectionState) {
    setSelection(state)
    setPersistedSelection(serializeSelection(state))
    const items = buildTargetItems(state.leafKeys, productMap, lockedPricesMap)
    field.handleChange(items)
  }

  function clearSelection() {
    const empty: SelectionState = {
      categoryIds: new Set(),
      productKeys: new Set(),
      leafKeys: new Set(),
    }
    setSelection(empty)
    setDismissed(false)
    field.handleChange([])
  }

  // ── Track form reset ──
  const isDirty = field.state.meta.isDirty
  const wasDirtyRef = useRef(false)

  useEffect(() => {
    if (isDirty) wasDirtyRef.current = true
  }, [isDirty])

  useEffect(() => {
    if (wasDirtyRef.current && !isDirty) {
      clearPersistedSelection()
      wasDirtyRef.current = false
      if (field.state.value.length === 0 && selection.leafKeys.size > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelection({
          categoryIds: new Set(),
          productKeys: new Set(),
          leafKeys: new Set(),
        })
        setDismissed(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  // ── Check state helpers ──
  function getCategoryCheckState(nodeId: string): CheckState {
    const descendants = descendantCache.get(nodeId) || []
    const nodeHasProducts = (categoryToProductIds.get(nodeId)?.length ?? 0) > 0
    let total = nodeHasProducts ? 1 : 0
    let count = nodeHasProducts && checkedCategoryIds.has(nodeId) ? 1 : 0
    for (let i = 0; i < descendants.length; i++) {
      const hasProducts =
        (categoryToProductIds.get(descendants[i])?.length ?? 0) > 0
      if (!hasProducts) continue
      total++
      if (checkedCategoryIds.has(descendants[i])) count++
    }
    if (total === 0) return false
    if (count === 0) return false
    if (count === total) return true
    return 'indeterminate'
  }

  function getUncategorizedCheckState(): CheckState {
    if (!hasUncategorized) return false
    if (!checkedCategoryIds.has(UNCATEGORIZED_ID)) return false
    let allChecked = true,
      anyChecked = false
    for (let i = 0; i < uncategorizedProductIds.length; i++) {
      if (
        checkedProductKeys.has(
          `${UNCATEGORIZED_ID}::${uncategorizedProductIds[i]}`,
        )
      )
        anyChecked = true
      else allChecked = false
    }
    if (!anyChecked) return false
    if (allChecked) return true
    return 'indeterminate'
  }

  function getProductCheckState(
    categoryId: string,
    productId: string,
  ): CheckState {
    const productKey = `${categoryId}::${productId}`
    if (
      selectedProductIds.has(productId) &&
      !checkedProductKeys.has(productKey)
    )
      return false
    if (!checkedProductKeys.has(productKey)) return false
    const product = productMap.get(productId)
    if (!product || product.leafPrices.length === 0)
      return checkedProductKeys.has(productKey)
    let selectableCount = 0,
      checkedCount = 0
    for (let i = 0; i < product.leafPrices.length; i++) {
      if (!lockedPricesMap[product.leafPrices[i].id]) {
        selectableCount++
        if (
          checkedLeafPriceKeys.has(
            `${categoryId}::${productId}::${product.leafPrices[i].id}`,
          )
        )
          checkedCount++
      }
    }
    if (selectableCount === 0) return false
    if (checkedCount === 0) return false
    if (checkedCount === selectableCount) return true
    return 'indeterminate'
  }

  // ── Handlers ──
  function handleCategoryCheck(nodeId: string, checked: boolean) {
    const descendants = descendantCache.get(nodeId) || []
    const state = cloneSelection(selection)
    const idsWithProducts: string[] = [nodeId]
    for (let i = 0; i < descendants.length; i++) {
      if ((categoryToProductIds.get(descendants[i])?.length ?? 0) > 0)
        idsWithProducts.push(descendants[i])
    }
    if (checked) {
      const globallySelected = new Set(selectedProductIds)
      for (let i = 0; i < idsWithProducts.length; i++) {
        state.categoryIds.add(idsWithProducts[i])
        selectProductsForCategory(
          idsWithProducts[i],
          productMap,
          categoryToProductIds,
          uncategorizedProductIds,
          state,
          lockedPricesMap,
          globallySelected,
        )
      }
      propagateAncestorsOnCheck(
        nodeId,
        flatCategoryMap,
        childrenMap,
        state.categoryIds,
        categoriesWithProducts,
      )
    } else {
      for (let i = 0; i < idsWithProducts.length; i++)
        state.categoryIds.delete(idsWithProducts[i])
      deselectProductsForCategories(
        idsWithProducts,
        productMap,
        categoryToProductIds,
        uncategorizedProductIds,
        state,
      )
      propagateAncestorsOnUncheck(
        nodeId,
        flatCategoryMap,
        descendantCache,
        categoryToProductIds,
        uncategorizedProductIds,
        state.productKeys,
        state.categoryIds,
      )
    }
    commitSelection(state)
  }

  function handleUncategorizedCheck(checked: boolean) {
    const state = cloneSelection(selection)
    if (checked) {
      const globallySelected = new Set(selectedProductIds)
      state.categoryIds.add(UNCATEGORIZED_ID)
      selectProductsForCategory(
        UNCATEGORIZED_ID,
        productMap,
        categoryToProductIds,
        uncategorizedProductIds,
        state,
        lockedPricesMap,
        globallySelected,
      )
    } else {
      state.categoryIds.delete(UNCATEGORIZED_ID)
      deselectProductsForCategories(
        [UNCATEGORIZED_ID],
        productMap,
        categoryToProductIds,
        uncategorizedProductIds,
        state,
      )
    }
    commitSelection(state)
  }

  function handleProductCheck(
    categoryId: string,
    productId: string,
    checked: boolean,
  ) {
    const product = productMap.get(productId)
    if (!product) return
    const state = cloneSelection(selection)
    const productKey = `${categoryId}::${productId}`
    if (checked) {
      const selectableLeaves: CachedLeafPrice[] = []
      for (let i = 0; i < product.leafPrices.length; i++) {
        if (!lockedPricesMap[product.leafPrices[i].id])
          selectableLeaves.push(product.leafPrices[i])
      }
      if (selectableLeaves.length === 0) return
      state.productKeys.add(productKey)
      for (let i = 0; i < selectableLeaves.length; i++)
        state.leafKeys.add(`${productKey}::${selectableLeaves[i].id}`)
    } else {
      state.productKeys.delete(productKey)
      for (let i = 0; i < product.leafPrices.length; i++)
        state.leafKeys.delete(`${productKey}::${product.leafPrices[i].id}`)
      if (
        !checkAnyProductForCategory(
          categoryId,
          categoryToProductIds,
          uncategorizedProductIds,
          state.productKeys,
        )
      ) {
        state.categoryIds.delete(categoryId)
        propagateAncestorsOnUncheck(
          categoryId,
          flatCategoryMap,
          descendantCache,
          categoryToProductIds,
          uncategorizedProductIds,
          state.productKeys,
          state.categoryIds,
        )
      }
    }
    commitSelection(state)
  }

  function handleLeafPriceCheck(
    categoryId: string,
    productId: string,
    priceId: string,
    checked: boolean,
  ) {
    const product = productMap.get(productId)
    if (!product) return
    const state = cloneSelection(selection)
    const productKey = `${categoryId}::${productId}`
    const leafKey = `${productKey}::${priceId}`
    if (checked) {
      state.leafKeys.add(leafKey)
      if (!state.productKeys.has(productKey)) state.productKeys.add(productKey)
    } else {
      state.leafKeys.delete(leafKey)
      let anyLeafRemaining = false
      for (let i = 0; i < product.leafPrices.length; i++) {
        if (state.leafKeys.has(`${productKey}::${product.leafPrices[i].id}`)) {
          anyLeafRemaining = true
          break
        }
      }
      if (!anyLeafRemaining) {
        state.productKeys.delete(productKey)
        if (
          !checkAnyProductForCategory(
            categoryId,
            categoryToProductIds,
            uncategorizedProductIds,
            state.productKeys,
          )
        ) {
          state.categoryIds.delete(categoryId)
          propagateAncestorsOnUncheck(
            categoryId,
            flatCategoryMap,
            descendantCache,
            categoryToProductIds,
            uncategorizedProductIds,
            state.productKeys,
            state.categoryIds,
          )
        }
      }
    }
    commitSelection(state)
  }

  // ── Derived display data ──
  const productGroups: ProductGroup[] = useMemo(() => {
    if (checkedCategoryIds.size === 0) return []
    const seen = new Set<string>()
    const groups: ProductGroup[] = []
    if (checkedCategoryIds.has(UNCATEGORIZED_ID) && hasUncategorized) {
      const deduped: ProductGroup['products'] = []
      for (let i = 0; i < uncategorizedProductIds.length; i++) {
        const pid = uncategorizedProductIds[i]
        const key = `${UNCATEGORIZED_ID}::${pid}`
        if (seen.has(key)) continue
        seen.add(key)
        const product = productMap.get(pid)
        if (!product) continue
        deduped.push({
          id: product.id,
          title: product.title,
          productGroupId: product.productGroupId,
        })
      }
      if (deduped.length > 0)
        groups.push({
          categoryFullName: UNCATEGORIZED_NAME,
          categoryId: UNCATEGORIZED_ID,
          products: deduped,
        })
    }
    for (const catId of checkedCategoryIds) {
      if (catId === UNCATEGORIZED_ID) continue
      const productIds = categoryToProductIds.get(catId) || []
      if (productIds.length === 0) continue
      const deduped: ProductGroup['products'] = []
      for (let i = 0; i < productIds.length; i++) {
        const key = `${catId}::${productIds[i]}`
        if (seen.has(key)) continue
        seen.add(key)
        const product = productMap.get(productIds[i])
        if (!product) continue
        deduped.push({
          id: product.id,
          title: product.title,
          productGroupId: product.productGroupId,
        })
      }
      if (deduped.length > 0)
        groups.push({
          categoryFullName: fullPathCache.get(catId) || '',
          categoryId: catId,
          products: deduped,
        })
    }
    return groups
  }, [
    checkedCategoryIds,
    hasUncategorized,
    uncategorizedProductIds,
    productMap,
    categoryToProductIds,
    fullPathCache,
  ])

  const leafPriceGroups: LeafPriceGroup[] = useMemo(() => {
    if (productGroups.length === 0) return []
    const groups: LeafPriceGroup[] = []
    const seen = new Set<string>()
    for (let i = 0; i < productGroups.length; i++) {
      const pg = productGroups[i]
      for (let j = 0; j < pg.products.length; j++) {
        const p = pg.products[j]
        const compositeKey = `${pg.categoryId}::${p.id}`
        if (seen.has(compositeKey)) continue
        seen.add(compositeKey)
        const product = productMap.get(p.id)
        if (!product || product.leafPrices.length === 0) continue
        const leafPrices: LeafPriceDisplay[] = []
        for (let k = 0; k < product.leafPrices.length; k++) {
          const leaf = product.leafPrices[k]
          const lockInfo = lockedPricesMap[leaf.id]
          leafPrices.push({
            priceId: leaf.id,
            productId: p.id,
            categoryId: pg.categoryId,
            name: leaf.name,
            ancestorPath: leaf.ancestorPath,
            productTitle: product.title,
            originalPrice: leaf.price,
            isLocked: lockInfo !== undefined,
            lockedByGuaranteeName: lockInfo?.guarantee_name ?? null,
          })
        }
        groups.push({
          label: product.title,
          categoryLabel: pg.categoryFullName,
          productId: p.id,
          categoryId: pg.categoryId,
          leafPrices,
          currency: product.currency,
        })
      }
    }
    return groups
  }, [productGroups, productMap, lockedPricesMap])

  // ── Filtered for search ──
  const filteredCategories = useMemo(
    () =>
      categorySearch.trim()
        ? fuzzySearch(flatCategories, ['name'], categorySearch)
        : flatCategories,
    [categorySearch, flatCategories],
  )

  const filteredProductGroups = useMemo(
    () =>
      productSearch.trim()
        ? (() => {
            const r: ProductGroup[] = []
            for (let i = 0; i < productGroups.length; i++) {
              const f = fuzzySearch(
                productGroups[i].products,
                ['title'],
                productSearch,
              )
              if (f.length > 0) r.push({ ...productGroups[i], products: f })
            }
            return r
          })()
        : productGroups,
    [productSearch, productGroups],
  )

  const filteredLeafPriceGroups = useMemo(
    () =>
      priceSearch.trim()
        ? (() => {
            const r: LeafPriceGroup[] = []
            for (let i = 0; i < leafPriceGroups.length; i++) {
              const f = fuzzySearch(
                leafPriceGroups[i].leafPrices,
                ['name', 'ancestorPath'],
                priceSearch,
              )
              if (f.length > 0) r.push({ ...leafPriceGroups[i], leafPrices: f })
            }
            return r
          })()
        : leafPriceGroups,
    [priceSearch, leafPriceGroups],
  )

  return (
    <Card>
      <ExtraPriceSync field={field} sharedRefs={sharedRefs} />
      <CardHeader>
        <CardTitle>Target Items: {selection.leafKeys.size} selected</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            disabled={selection.leafKeys.size === 0}
            onClick={clearSelection}
          >
            Clear Items
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        {recoverableCount > 0 ? (
          <Item className="rounded-none" size="sm" variant="muted">
            <ItemMedia variant="icon">
              <ShieldAlertIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Restore Selected Items</ItemTitle>
              <ItemDescription>
                Your previous selection of{' '}
                <span className="font-medium">{recoverableCount}</span>{' '}
                {recoverableCount === 1 ? 'item is' : 'items are'} available to
                restore.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                size="xs"
                variant="link"
                onClick={() => setDismissed(true)}
              >
                Dismiss
              </Button>
              <Button size="xs" onClick={handleRestore}>
                <RotateCcwIcon />
                Restore
              </Button>
            </ItemActions>
          </Item>
        ) : null}

        <ResponsiveResizablePanelGroup className="rounded-b-lg border-t">
          {/* ── Categories ── */}
          <ResizablePanel defaultSize="33%" minSize={20}>
            <div className="flex h-full flex-col">
              <div className="border-b p-2">
                <SearchInput
                  value={categorySearch}
                  onChange={setCategorySearch}
                  placeholder="Search categories..."
                />
              </div>
              <ScrollArea className="h-90">
                <div className="p-2">
                  {hasUncategorized && (
                    <>
                      <div className="hover:bg-muted/50 flex items-center gap-2 rounded-sm px-2 py-1.5">
                        <Checkbox
                          checked={getUncategorizedCheckState()}
                          disabled={lockCaches.isUncategorizedFullyLocked}
                          onCheckedChange={c =>
                            handleUncategorizedCheck(c === true)
                          }
                        />
                        <span className="text-sm leading-none">
                          {UNCATEGORIZED_NAME}
                        </span>
                      </div>
                      <Separator className="my-1.5" />
                    </>
                  )}
                  {filteredCategories
                    .filter(node => categoriesWithProducts.has(node.id))
                    .map(node => {
                      const isLocked = lockCaches.fullyLockedCategories.has(
                        node.id,
                      )
                      return (
                        <div
                          key={node.id}
                          className="hover:bg-muted/50 flex items-center gap-2 rounded-sm px-2 py-1.5 data-[is-locked=true]:opacity-60"
                          data-is-locked={isLocked}
                          style={{ paddingLeft: `${node.depth * 20 + 8}px` }}
                        >
                          <Checkbox
                            checked={getCategoryCheckState(node.id)}
                            disabled={isLocked}
                            onCheckedChange={c =>
                              handleCategoryCheck(node.id, c === true)
                            }
                          />
                          <span className="text-sm leading-none">
                            {node.name}
                          </span>
                        </div>
                      )
                    })}
                  {filteredCategories.length === 0 && !hasUncategorized && (
                    <p className="text-muted-foreground p-4 text-center text-sm">
                      No categories found
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Products ── */}
          <ResizablePanel defaultSize="34%" minSize={20}>
            <div className="flex h-full flex-col">
              <div className="border-b p-2">
                <SearchInput
                  value={productSearch}
                  onChange={setProductSearch}
                  placeholder="Search products..."
                />
              </div>
              <ScrollArea className="h-90">
                <div className="p-2">
                  {filteredProductGroups.length === 0 && (
                    <p className="text-muted-foreground p-4 text-center text-sm">
                      {checkedCategoryIds.size === 0
                        ? 'Select categories to view products'
                        : 'No products found'}
                    </p>
                  )}
                  {filteredProductGroups.map(group => (
                    <div key={group.categoryId} className="mb-3">
                      <p className="text-muted-foreground px-2 text-xs font-medium tracking-wide">
                        {group.categoryFullName}
                      </p>
                      {group.products.map(product => {
                        const productKey = `${group.categoryId}::${product.id}`
                        const isLocked = lockCaches.fullyLockedProducts.has(
                          product.id,
                        )
                        const isSelectedElsewhere =
                          selectedProductIds.has(product.id) &&
                          !checkedProductKeys.has(productKey)

                        return (
                          <div
                            key={productKey}
                            className="hover:bg-muted/50 flex items-center gap-2 rounded-sm px-2 py-1.5 data-[is-locked=true]:opacity-60"
                            data-is-locked={isLocked || isSelectedElsewhere}
                          >
                            <Checkbox
                              checked={getProductCheckState(
                                group.categoryId,
                                product.id,
                              )}
                              disabled={isLocked || isSelectedElsewhere}
                              onCheckedChange={c =>
                                handleProductCheck(
                                  group.categoryId,
                                  product.id,
                                  c === true,
                                )
                              }
                            />
                            <span className="text-sm leading-none">
                              {product.title}
                              {isSelectedElsewhere && (
                                <span className="text-muted-foreground ms-1 text-xs italic">
                                  (selected elsewhere)
                                </span>
                              )}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Leaf Prices ── */}
          <ResizablePanel defaultSize="33%" minSize={20}>
            <div className="flex h-full flex-col">
              <div className="border-b p-2">
                <SearchInput
                  value={priceSearch}
                  onChange={setPriceSearch}
                  placeholder="Search prices..."
                />
              </div>
              <ScrollArea className="h-90">
                <div className="p-2">
                  {filteredLeafPriceGroups.length === 0 && (
                    <p className="text-muted-foreground p-4 text-center text-sm">
                      {checkedProductKeys.size === 0
                        ? 'Select products to view prices'
                        : 'No prices found'}
                    </p>
                  )}
                  {filteredLeafPriceGroups.map(group => (
                    <div
                      key={`${group.categoryId}::${group.productId}`}
                      className="mb-3"
                    >
                      <p className="text-foreground px-2 text-sm font-medium">
                        {group.label}
                      </p>
                      <p className="text-muted-foreground mb-1 px-2 text-xs font-medium tracking-wide">
                        {group.categoryLabel}
                      </p>
                      {group.leafPrices.map(leaf => {
                        const leafKey = `${leaf.categoryId}::${leaf.productId}::${leaf.priceId}`
                        const currency = group.currency
                          ? (LOCALS_MAP[group.currency as CurrencyCode]?.sign ??
                            null)
                          : null
                        const isChecked = checkedLeafPriceKeys.has(leafKey)
                        const isSelectedElsewhere =
                          selectedProductIds.has(leaf.productId) &&
                          !checkedProductKeys.has(
                            `${leaf.categoryId}::${leaf.productId}`,
                          )
                        return (
                          <LeafPriceRow
                            key={leafKey}
                            form={form}
                            leaf={leaf}
                            currency={currency}
                            isChecked={isChecked}
                            isDisabledElsewhere={isSelectedElsewhere}
                            onCheckedChange={c =>
                              handleLeafPriceCheck(
                                leaf.categoryId,
                                leaf.productId,
                                leaf.priceId,
                                c,
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
        </ResponsiveResizablePanelGroup>
      </CardContent>
      {!field.getMeta().isValid && filteredLeafPriceGroups.length === 0 && (
        <CardFooter>
          <Item className="rounded-none" size="sm" variant="muted">
            <ItemMedia variant="icon">
              <ShieldAlertIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Empty Target Items</ItemTitle>
              <ItemDescription>
                At least one price must be selected.
              </ItemDescription>
            </ItemContent>
          </Item>
        </CardFooter>
      )}
    </Card>
  )
}

// ─── Search Input Component ──────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (val: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 pr-8 pl-8 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── Sync Component ─────────────────────────────────────────────────────────

type ExtraPriceSyncProps = {
  field: AnyFieldApi
  sharedRefs: SharedRefs
}

function ExtraPriceSync({ field, sharedRefs }: ExtraPriceSyncProps) {
  const extraPrice = useSelector(
    (field.form as GuaranteeFormT).store,
    s => s.values.extra_price,
  )

  useEffect(() => {
    const isDirty = field.form
      .getFieldInfo('extra_price')
      .instance?.getMeta()?.isDirty

    if (!isDirty) return

    const items = buildTargetItems(
      sharedRefs.selectionRef.current.leafKeys,
      sharedRefs.productMapRef.current,
      sharedRefs.lockedPricesMapRef.current,
    )
    field.handleChange(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraPrice])

  return null
}

// ─── Leaf Price Row Component ────────────────────────────────────────────────

type LeafPriceRowProps = {
  form: GuaranteeFormT
  leaf: LeafPriceDisplay
  currency: string | null
  isChecked: boolean
  isDisabledElsewhere: boolean
  onCheckedChange: (checked: boolean) => void
}

function LeafPriceRow({
  form,
  leaf,
  currency,
  isChecked,
  isDisabledElsewhere,
  onCheckedChange,
}: LeafPriceRowProps) {
  const extraPrice = useSelector(form.store, s => s.values.extra_price) ?? 0
  const finalPrice = leaf.originalPrice + extraPrice
  const isLocked = leaf.isLocked || isDisabledElsewhere

  return (
    <div
      data-is-locked={isLocked}
      className="hover:bg-muted/50 flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 data-[is-locked=true]:opacity-60"
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isChecked}
          disabled={isLocked}
          onCheckedChange={c => onCheckedChange(c === true)}
        />
        <div className="flex flex-col">
          <span className="text-sm leading-none">
            {leaf.ancestorPath}
            {isLocked && leaf.lockedByGuaranteeName && (
              <span className="text-muted-foreground ms-1 text-xs italic">
                In use by{' '}
                <span className="font-medium">
                  {leaf.lockedByGuaranteeName}
                </span>
              </span>
            )}
          </span>
        </div>
      </div>
      {!isLocked && (
        <div className="flex flex-col items-end">
          <span className="text-muted-foreground text-xs">
            {currency}
            {leaf.originalPrice.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs font-medium">
            + {currency}
            {extraPrice.toLocaleString()} = {currency}
            {finalPrice.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  )
}

type ResponsiveResizablePanelGroupProps = React.PropsWithChildren<
  Omit<React.ComponentProps<typeof ResizablePanelGroup>, 'orientation'>
>

function ResponsiveResizablePanelGroup({
  children,
  ...props
}: ResponsiveResizablePanelGroupProps) {
  const isMobile = useIsMobile()

  return (
    <ResizablePanelGroup
      {...props}
      orientation={isMobile ? 'vertical' : 'horizontal'}
    >
      {children}
    </ResizablePanelGroup>
  )
}
