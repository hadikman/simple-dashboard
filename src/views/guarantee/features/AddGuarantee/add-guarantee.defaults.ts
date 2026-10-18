import { type GuaranteeSchemaT } from '../../shared'

export function createAddGuaranteeDefaults(): GuaranteeSchemaT {
  return {
    name: '',
    brand_id: null,
    duration: '',
    extra_price: 0,
    status: 'active',
    description: null,
    extra_duration: [],
    target_items: [],
  }
}
