import {
  type GuaranteeSchemaT,
  type TGuaranteeLookupDataWithId,
} from '../../shared'

/**
 * Build default values for the update form.
 *
 * All fields are populated from DB. Guarantee has no draft/published mode,
 * so every field carries its current value for the no-change diff check.
 */
export function createUpdateGuaranteeDefaults(
  guarantee: Partial<TGuaranteeLookupDataWithId>,
): GuaranteeSchemaT {
  return {
    name: guarantee.name ?? '',
    brand_id: guarantee.brand_id ?? null,
    duration: guarantee.duration ?? '',
    extra_price: guarantee.extra_price ?? null,
    status: guarantee.status ?? 'active',
    description: guarantee.description ?? null,
    extra_duration: guarantee.extra_duration ?? null,
    target_items: guarantee.target_items ?? [],
  }
}
