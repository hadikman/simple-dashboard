import { type BrandSchemaT } from '../../shared'

import { appendIfDefined } from '@/helpers/utils'

export function buildUpdateBrandFormData(
  values: BrandSchemaT,
  brandId: string,
  hasChangedLogo: boolean,
): FormData {
  const fd = new FormData()
  const { name, slug, description, categories, logo, website, email, phone } =
    values

  // Always sent
  appendIfDefined(fd, 'id', brandId)

  // Required (always has a value)
  appendIfDefined(fd, 'name', name)

  // Optional fields
  appendIfDefined(fd, 'slug', slug)
  appendIfDefined(fd, 'description', description)

  if (categories?.length) {
    appendIfDefined(
      fd,
      'categories',
      categories.map(c => c.id),
    )
  }

  // Media initial value is changed by useEffect not by user,
  // so only send when the user actually changed it.
  if (hasChangedLogo) {
    appendIfDefined(fd, 'src', logo?.src)
    appendIfDefined(fd, 'alt', logo?.alt)
  }

  appendIfDefined(fd, 'website', website)
  appendIfDefined(fd, 'email', email)
  appendIfDefined(fd, 'phone', phone)

  return fd
}
