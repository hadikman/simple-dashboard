import { type OfferSchemaT } from '../../shared'

import { normalizeSlug } from '@/helpers/utils'

// CREATE: Skip null/empty optional fields entirely
export function buildAddOfferFormData(values: OfferSchemaT): FormData {
  const fd = new FormData()
  const {
    name,
    description,
    discount,
    offer_start,
    offer_end,
    status,
    target_items,
  } = values

  // Required
  fd.append('name', name)
  fd.append('slug', normalizeSlug(name))
  fd.append('status', status)

  if (typeof discount === 'number' && discount !== 0) {
    fd.append('discount', String(discount))
  }

  if (offer_start) fd.append('offer_start', offer_start.toISOString())
  if (offer_end) fd.append('offer_end', offer_end.toISOString())

  if (target_items.length) {
    fd.append('target_items', JSON.stringify(target_items))
  }

  // Optional
  if (description) fd.append('description', description)

  return fd
}
