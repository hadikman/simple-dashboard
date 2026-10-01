import {
  RootCategories,
  type CategoryTreeNode,
  type FlatCategoryNode,
  type ProcessedCategoriesData,
  type TCategoryData,
} from '..'

// Shared processing function - resolves names to IDs and builds relationships
export function processCategoriesData(
  categories: TCategoryData[],
): ProcessedCategoriesData {
  const categoriesMap = new Map<string, { id: string; name: string }>()
  const nameToIds = new Map<string, string[]>()
  const childIds = new Set<string>()

  // Single pass: map categories and build name-to-id mapping
  for (let i = 0; i < categories.length; i++) {
    const { id, name } = categories[i]
    categoriesMap.set(id, { id, name })

    const ids = nameToIds.get(name)
    if (ids) {
      ids.push(id)
    } else {
      nameToIds.set(name, [id])
    }
  }

  // Build parent-child relationships
  const childrenMap = new Map<string, string[]>()

  for (let i = 0; i < categories.length; i++) {
    const { id, children } = categories[i]

    if (children.length === 0) continue

    const resolvedChildren: string[] = []

    for (let j = 0; j < children.length; j++) {
      const childName = children[j]
      const ids = nameToIds.get(childName)

      if (!ids || ids.length === 0) continue

      const childId = ids.shift()!
      resolvedChildren.push(childId)
      childIds.add(childId)
    }

    if (resolvedChildren.length > 0) {
      childrenMap.set(id, resolvedChildren)
    }
  }

  // Find roots
  const roots: string[] = []
  for (const [id] of categoriesMap) {
    if (!childIds.has(id)) {
      roots.push(id)
    }
  }

  return { categoriesMap, childrenMap, roots }
}

export function buildFlattenedCategoriesList(
  processedCategoriesData: ProcessedCategoriesData,
): FlatCategoryNode[] {
  const { categoriesMap, childrenMap, roots } = processedCategoriesData

  const result: FlatCategoryNode[] = []
  const processed = new Set<string>()

  // Cache descendants per node to avoid recomputation
  const descendantsCache = new Map<string, string[]>()

  function getDescendants(nodeId: string): string[] {
    const cached = descendantsCache.get(nodeId)
    if (cached) return cached

    const childNodeIds = childrenMap.get(nodeId) || []
    const descendants: string[] = []

    for (let i = 0; i < childNodeIds.length; i++) {
      const childId = childNodeIds[i]
      descendants.push(childId)
      const childDescendants = getDescendants(childId)
      for (let j = 0; j < childDescendants.length; j++) {
        descendants.push(childDescendants[j])
      }
    }

    descendantsCache.set(nodeId, descendants)
    return descendants
  }

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
        descendantIds: getDescendants(nodeId),
      })

      if (childNodeIds.length > 0) {
        traverse(childNodeIds, depth + 1, [...ancestorIds, nodeId])
      }
    }
  }

  traverse(roots, 0, [])

  return result
}

export function buildCategoriesTreeList(
  processedCategoriesData: ProcessedCategoriesData,
): CategoryTreeNode[] {
  const { categoriesMap, childrenMap, roots } = processedCategoriesData

  // Build tree nodes
  const nodeMap = new Map<string, CategoryTreeNode>()

  for (const [id, data] of categoriesMap) {
    nodeMap.set(id, {
      id: data.id,
      name: data.name,
      children: [],
      depth: 0,
    })
  }

  // Link children
  for (const [parentId, childIds] of childrenMap) {
    const parent = nodeMap.get(parentId)!

    for (let i = 0; i < childIds.length; i++) {
      const child = nodeMap.get(childIds[i])
      if (child) {
        parent.children.push(child)
      }
    }
  }

  // Set depths using BFS
  const rootNodes = roots.map(id => nodeMap.get(id)!)
  const queue: CategoryTreeNode[] = [...rootNodes]

  let idx = 0
  while (idx < queue.length) {
    const node = queue[idx++]
    const nextDepth = node.depth + 1

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      child.depth = nextDepth
      queue.push(child)
    }
  }

  return rootNodes
}

// Helper function to handle parent-child mutual exclusivity
export function resolveParentChildConflicts(
  selectedIds: string[],
  flatList: FlatCategoryNode[],
): string[] {
  const nodeMap = new Map(flatList.map(node => [node.id, node]))
  const finalSet = new Set<string>()

  for (const id of selectedIds) {
    const node = nodeMap.get(id)
    // Handle case where node isn't found (shouldn't happen with valid data)
    if (!node) {
      finalSet.add(id)
      continue
    }

    // Check if any descendant is already in the final set
    let hasDescendantInFinal = false
    for (const descendantId of node.descendantIds) {
      if (finalSet.has(descendantId)) {
        hasDescendantInFinal = true
        break
      }
    }

    // If a descendant is already selected, skip this ancestor
    if (hasDescendantInFinal) {
      continue
    }

    // Remove any ancestors from the final set
    for (const ancestorId of node.ancestorIds) {
      finalSet.delete(ancestorId)
    }

    // Add current item
    finalSet.add(id)
  }

  return Array.from(finalSet)
}

export function buildRootCategories(
  categories: TCategoryData[],
): RootCategories[] {
  const clonedCategories = structuredClone(categories) as TCategoryData[]
  const resultMap = new Map<
    string,
    RootCategories & { parent?: string | null }
  >()

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]

    if (!resultMap.has(cat.id)) {
      resultMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        parent: null,
      })
    }

    if (cat.children.length > 0) {
      cat.children.forEach(child => {
        const catIdx = clonedCategories.findIndex(c => c.name === child)
        if (catIdx > -1) {
          const extractedCat = clonedCategories.splice(catIdx, 1)[0]
          resultMap.set(extractedCat.id, {
            id: extractedCat.id,
            name: extractedCat.name,
            parent: cat.name,
          })
        }
      })
    }
  }

  const categoriesWithParent = [...resultMap.values()]
  const roots: RootCategories[] = []
  for (let i = 0; i < categoriesWithParent.length; i++) {
    const { id, name, parent } = categoriesWithParent[i]
    if (!parent) roots.push({ id, name })
  }

  return roots
}
