import { type BrandSchemaT } from '../../shared'

export function createAddBrandDefaults(): BrandSchemaT {
  return {
    name: '',
    slug: null,
    description: null,
    categories: [],
    logo: { src: null, alt: null },
    website: null,
    email: '',
    phone: null,
  }
}
