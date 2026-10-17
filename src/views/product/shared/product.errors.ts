import { type TProductErrorCode } from './'

type ErrorConfig = {
  server: string
  client: string
  code: TProductErrorCode
}

export const productErrors = {
  DUPLICATE_SLUG: {
    server: 'Product Slug already exists in database',
    client: 'The Key is already in use.',
    code: 'DUPLICATE_SLUG',
  },
  FAILURE_DRAFT: {
    server: 'Failed to create new product draft in database',
    client: 'Could not add the product draft. Please try again.',
    code: 'FAILURE_DRAFT',
  },
  FAILURE: {
    server: 'Failed to create new product in database',
    client: 'Could not add the product. Please try again.',
    code: 'FAILURE',
  },
  EMPTY_PRODUCTS: {
    server: 'No products found in database',
    client: 'No products To Display',
    code: 'EMPTY_PRODUCTS',
  },
  EMPTY_PRODUCTS_DRAFT: {
    server: 'No products draft found in database',
    client: 'No products draft To Display',
    code: 'EMPTY_PRODUCTS_DRAFT',
  },
  DELETE_DRAFT_FAILURE: {
    server: 'Failed to delete product draft from database',
    client: 'Could not delete the product draft. Please try again.',
    code: 'DELETE_DRAFT_FAILURE',
  },
  DELETE_FAILURE: {
    server: 'Failed to delete product from database',
    client: 'Could not delete the product. Please try again.',
    code: 'DELETE_FAILURE',
  },
  NOT_FOUND_PRODUCTS_PROPS: {
    server: 'Products properties not found',
    client: 'Products properties not found',
    code: 'NOT_FOUND_PRODUCTS_PROPS',
  },
  NOT_FOUND_PRODUCT: {
    server: 'Product not found',
    client: 'Product not found',
    code: 'NOT_FOUND_PRODUCT',
  },
  DUPLICATE_PROP: {
    server: 'Product value already exists in database',
    client: 'The value is already in use.',
    code: 'DUPLICATE_PROP',
  },
  UPDATE_FAILURE: {
    server: 'Failed to update product',
    client: 'Could not update the product. Please try again.',
    code: 'UPDATE_FAILURE',
  },
  NOT_FOUND_PRODUCT_TO_DUPLICATE: {
    server: 'Requested product not found to duplicate',
    client: 'Requested product not found to duplicate',
    code: 'NOT_FOUND_PRODUCT_TO_DUPLICATE',
  },
  DUPLICATE_PRODUCT_INTO_DRAFT_FAILURE: {
    server: 'Failed to duplicate the requested product into draft database',
    client: 'Could not duplicate the product into draft. Please try again.',
    code: 'DUPLICATE_PRODUCT_INTO_DRAFT_FAILURE',
  },
  UPDATE_PRODUCT_PROP_FAILURE: {
    server: 'Failed to update product prop',
    client: 'Could not update the product prop. Please try again.',
    code: 'UPDATE_PRODUCT_PROP_FAILURE',
  },
  DELETE_DRAFTS_FAILURE: {
    server: 'Failed to delete products drafts from database',
    client: 'Could not delete the products drafts. Please try again.',
    code: 'DELETE_DRAFTS_FAILURE',
  },
  DELETE_PRODUCTS_FAILURE: {
    server: 'Failed to delete products from database',
    client: 'Could not delete the products. Please try again.',
    code: 'DELETE_PRODUCTS_FAILURE',
  },
  COPY_FAILURE: {
    server: 'Failed to copy product',
    client: 'Could not make a copy of the product. Please try again.',
    code: 'COPY_FAILURE',
  },
} satisfies Record<TProductErrorCode, ErrorConfig>
