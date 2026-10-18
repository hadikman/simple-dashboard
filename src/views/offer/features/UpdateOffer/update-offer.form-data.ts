import { type OfferSchemaT, type TargetItem } from '../../shared'

import {
  appendIfDefined,
  appendIfValidNumber,
  normalizeSlug,
} from '@/helpers/utils'

type BuildUpdateOfferFormDataProps = {
  values: OfferSchemaT
  offerId: string
  initialTargetItems: TargetItem[] | undefined
  targetItemsChanged: boolean
}

export function buildUpdateOfferFormData({
  values,
  offerId,
  initialTargetItems,
  targetItemsChanged,
}: BuildUpdateOfferFormDataProps): FormData {
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

  // Always sent
  appendIfDefined(fd, 'id', offerId)

  // Required (always has a value)
  appendIfDefined(fd, 'name', name)
  if (name) appendIfDefined(fd, 'slug', normalizeSlug(name))
  appendIfDefined(fd, 'status', status)

  // Optional
  appendIfDefined(fd, 'description', description)
  appendIfValidNumber(fd, 'discount', discount)

  if (offer_start) {
    appendIfDefined(fd, 'offer_start', offer_start.toISOString())
  }
  if (offer_end) {
    appendIfDefined(fd, 'offer_end', offer_end.toISOString())
  }

  // Target items: detect detached (removed) prices and mark them for clearing
  // by appending them with offer_id = null.
  if (targetItemsChanged) {
    const next = [...(target_items ?? [])]
    const nextPriceIds = new Set(next.map(t => t.price_id))

    initialTargetItems?.forEach(item => {
      if (!nextPriceIds.has(item.price_id)) {
        next.push({ ...item, offer_id: null })
      }
    })

    fd.append('target_items', JSON.stringify(next))
  }

  return fd
}
