import { type OfferSchemaT, type TOfferLookupDataWithId } from '../../shared'

/**
 * Build default values for the update form.
 *
 * All fields are populated from DB. Offer has no draft/published mode,
 * so every field carries its current value for the no-change diff check.
 */
export function createUpdateOfferDefaults(
  offer: Partial<TOfferLookupDataWithId>,
): OfferSchemaT {
  return {
    name: offer.name ?? '',
    description: offer.description ?? null,
    discount: offer.discount ?? 0,
    offer_start: offer.offer_start ?? null!,
    offer_end: offer.offer_end ?? null!,
    status: offer.status ?? 'scheduled',
    target_items: offer.target_items ?? [],
  }
}
