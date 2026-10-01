import { Prettify, WithId } from '@/helpers/ts-utils'

// New category interfaces & types
export type CategoryGroupType = 'posts' | 'products'

export interface ICategoryDocument {
  category_group: CategoryGroupType
  name: string
  children: string[]
}

export type TCategoryData = WithId<ICategoryDocument>

export type TCategoryErrorCode =
  | 'CATEGORY_EXISTS'
  | 'CREATE_FAILURE'
  | 'EMPTY_CATEGORIES'
  | 'DELETE_FAILURE'
  | 'DUPLICATE_NAME'
  | 'UPDATE_FAILURE'
  | 'CHECK_USAGE_IN'

export interface ICategoryValidation {
  general?: string | undefined
  code?: TCategoryErrorCode | undefined
}

// Add Category
export type TAddCategoryData = Prettify<
  Omit<ICategoryDocument, 'children'> & {
    parentId: string
  }
>

export type TAddCategoryResponse =
  | {
      success: true
      category: { id: string }
    }
  | {
      success: false
      errors: ICategoryValidation
    }

// Get Categories
export type TQueryCategoriesData = {
  category_group: CategoryGroupType
}

export type TGetCategoriesResponse =
  | {
      success: true
      categories: TCategoryData[]
    }
  | {
      success: false
      errors: ICategoryValidation
    }

// Delete Category
export type TDeleteCategoryData = {
  category_group: CategoryGroupType
  parentId?: string
  id: string
  name: string
  childrenId?: string[]
}

export type TDeleteCategoryResponse =
  | {
      success: true
      deleteCount: number
      category: { name: string }
    }
  | {
      success: false
      errors: ICategoryValidation
    }

// Check Duplicate Category
export type TQueryDuplicateCategoryData = {
  category_group: CategoryGroupType
  parentId?: string
  name: string
}

export type TCheckDuplicateCategoryResponse =
  | {
      isDuplicate: true
      message: ICategoryValidation
    }
  | {
      isDuplicate: false
      message: null
    }

// Update Category
export type TUpdateCategoryData = {
  category_group: CategoryGroupType
  id: string
  name: string
  newName: string
  parentId: string
}

export type TUpdateCategoryResponse =
  | {
      success: true
      category: { name: string }
    }
  | {
      success: false
      errors: ICategoryValidation
    }

// Check Category used in category group
export type TQueryCategoriesUsedInGroupData = {
  category_group: CategoryGroupType
  ids: string[]
}

export type TCheckCategoriesUsedInGroupResponse =
  | {
      isDuplicate: true
      message: ICategoryValidation
    }
  | {
      isDuplicate: false
      message: null
    }
