import { TBrandErrorCode } from './'

type ErrorConfig = {
  server: string
  client: string
  code: TBrandErrorCode
}

export const brandErrors = {
  BRAND_EXISTS: {
    server: 'Brand Name or URL already exists in database',
    client:
      'This Name or URL is already in use. Please choose a different one.',
    code: 'BRAND_EXISTS',
  },
  CREATE_FAILURE: {
    server: 'Failed to create new brand in database',
    client: 'Could not add the brand. Please try again.',
    code: 'CREATE_FAILURE',
  },
  EMPTY_BRANDS: {
    server: 'Not found brands',
    client: 'No Brands To Display',
    code: 'EMPTY_BRANDS',
  },
  DELETE_FAILURE: {
    server: 'Failed to delete brand from database',
    client: 'Could not delete the brand. Please try again.',
    code: 'DELETE_FAILURE',
  },
  DUPLICATE_SLUG: {
    server: 'Brand Slug already exists in database',
    client: 'The Key is already in use.',
    code: 'DUPLICATE_SLUG',
  },
  NOT_FOUND_BRANDS_PROPS: {
    server: 'Brands properties not found',
    client: 'Brands properties not found',
    code: 'NOT_FOUND_BRANDS_PROPS',
  },
  NOT_FOUND_BRAND: {
    server: 'Brand not found',
    client: 'Brand not found',
    code: 'NOT_FOUND_BRAND',
  },
  UPDATE_FAILURE: {
    server: 'Failed to update brand',
    client: 'Could not update the brand. Please try again.',
    code: 'UPDATE_FAILURE',
  },
} satisfies Record<TBrandErrorCode, ErrorConfig>
