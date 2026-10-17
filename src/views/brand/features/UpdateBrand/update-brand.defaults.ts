import {
  type BrandSchemaT,
  type TBrandLookupDataWithIdCategoriesWithTitle,
} from '../../shared'

/**
 * Build default values for the update form.
 *
 * All fields are populated from DB (Brand has no draft/published
 * three-state distinction — every field always carries its current value).
 */
export function createUpdateBrandDefaults(
  brand: Partial<TBrandLookupDataWithIdCategoriesWithTitle>,
): BrandSchemaT {
  return {
    name: brand.name ?? '',
    slug: brand.slug ?? null,
    description: brand.description ?? null,
    categories: brand.categories ?? null,
    logo: brand.logo ?? { src: null, alt: null },
    website: brand.website ?? null,
    email: brand.email ?? null,
    phone: brand.phone ?? null,
  }
}
