export type ProcessedCategoriesData = {
  categoriesMap: Map<string, { id: string; name: string }>
  childrenMap: Map<string, string[]>
  roots: string[]
}

export type CategoryTreeNode = {
  id: string
  name: string
  children: CategoryTreeNode[]
  depth: number
}

export type FlatCategoryNode = {
  id: string
  name: string
  children: string[]
  depth: number
  isLastChild: boolean
  ancestorIds: string[]
  descendantIds: string[]
}

export type RootCategories = {
  id: string
  name: string
}
