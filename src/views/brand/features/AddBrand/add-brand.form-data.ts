import { type BrandSchemaT } from '../../shared'

import { getFilename } from '@/helpers/utils'

// CREATE: Skip null/empty optional fields entirely
export function buildAddBrandFormData(
  values: BrandSchemaT,
  suggestionSlug: string,
): FormData {
  const fd = new FormData()
  const { name, slug, description, categories, logo, website, email, phone } =
    values

  fd.append('name', name)
  fd.append('slug', slug || suggestionSlug)

  if (description) fd.append('description', description)

  if (categories?.length) {
    fd.append('categories', JSON.stringify(categories.map(c => c.id)))
  }

  if (logo?.src) {
    fd.append('src', logo.src)
    fd.append('alt', getFilename(logo.src))
  }

  if (website) fd.append('website', website)
  if (email) fd.append('email', email)
  if (phone) fd.append('phone', phone)

  return fd
}
