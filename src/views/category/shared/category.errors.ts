import { type TCategoryErrorCode } from './'

type ErrorConfig = {
  server: string
  client: string
  code: TCategoryErrorCode
}

export const categoryErrors = {
  CATEGORY_EXISTS: {
    server: 'Category id and path already exists in database',
    client: 'This category is already in use. Please choose a different one.',
    code: 'CATEGORY_EXISTS',
  },
  CREATE_FAILURE: {
    server: 'Failed to create new category in database',
    client: 'Could not add the category. Please try again.',
    code: 'CREATE_FAILURE',
  },
  EMPTY_CATEGORIES: {
    server: 'No categories found',
    client: 'No Categories To Display',
    code: 'EMPTY_CATEGORIES',
  },
  DELETE_FAILURE: {
    server: 'Failed to delete category from database',
    client: 'Could not delete the category. Please try again.',
    code: 'DELETE_FAILURE',
  },
  DUPLICATE_NAME: {
    server: 'Category name already exists in database',
    client: 'The name is already in use.',
    code: 'DUPLICATE_NAME',
  },
  UPDATE_FAILURE: {
    server: 'Failed to update category',
    client: 'Could not update the category. Please try again.',
    code: 'UPDATE_FAILURE',
  },
  CHECK_USAGE_IN: {
    server: 'Category or its subcategories are already used in',
    client:
      'This category or its subcategories are being used in (or in drafts). Please reassign or remove them first.',
    code: 'CHECK_USAGE_IN',
  },
} satisfies Record<TCategoryErrorCode, ErrorConfig>
