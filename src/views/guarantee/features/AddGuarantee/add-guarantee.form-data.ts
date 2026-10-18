import { type GuaranteeSchemaT } from '../../shared'

import { normalizeSlug } from '@/helpers/utils'

// CREATE: Skip null/empty optional fields entirely
export function buildAddGuaranteeFormData(values: GuaranteeSchemaT): FormData {
  const fd = new FormData()
  const {
    name,
    brand_id,
    duration,
    extra_price,
    status,
    description,
    extra_duration,
    target_items,
  } = values

  // Required
  fd.append('name', name)
  fd.append('slug', normalizeSlug(name))
  fd.append('duration', duration)
  fd.append('status', status)

  if (target_items.length) {
    fd.append('target_items', JSON.stringify(target_items))
  }

  // Optional
  if (brand_id) {
    fd.append('brand_id', brand_id)
  }

  if (description) {
    fd.append('description', description)
  }

  if (typeof extra_price === 'number') {
    fd.append('extra_price', extra_price.toString())
  }

  if (extra_duration?.length) {
    fd.append('extra_duration', JSON.stringify(extra_duration))
  }

  return fd
}
