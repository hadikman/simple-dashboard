import { type GuaranteeSchemaT, type TargetItem } from '../../shared'

import {
  appendIfDefined,
  appendIfValidNumber,
  normalizeSlug,
} from '@/helpers/utils'

type BuildUpdateGuaranteeFormDataProps = {
  values: GuaranteeSchemaT
  guaranteeId: string
  initialTargetItems: TargetItem[] | undefined
  targetItemsChanged: boolean
}

export function buildUpdateGuaranteeFormData({
  values,
  guaranteeId,
  initialTargetItems,
  targetItemsChanged,
}: BuildUpdateGuaranteeFormDataProps): FormData {
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

  // Always sent
  appendIfDefined(fd, 'id', guaranteeId)

  // Required (always has a value)
  appendIfDefined(fd, 'name', name)
  if (name) appendIfDefined(fd, 'slug', normalizeSlug(name))
  appendIfDefined(fd, 'duration', duration)
  appendIfDefined(fd, 'status', status)

  // Optional
  appendIfDefined(fd, 'brand_id', brand_id)
  // Clear brand_name on server when brand changes
  appendIfDefined(fd, 'brand_name', null)
  appendIfDefined(fd, 'description', description)
  appendIfValidNumber(fd, 'extra_price', extra_price)
  appendIfDefined(fd, 'extra_duration', extra_duration)

  // Target items: detect detached (removed) prices and mark them for clearing
  // by appending them with guarantee_id = null.
  if (targetItemsChanged) {
    const next = [...(target_items ?? [])]
    const nextPriceIds = new Set(next.map(t => t.price_id))

    initialTargetItems?.forEach(item => {
      if (!nextPriceIds.has(item.price_id)) {
        next.push({ ...item, guarantee_id: null })
      }
    })

    fd.append('target_items', JSON.stringify(next))
  }

  return fd
}
