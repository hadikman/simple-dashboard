import { type TCategoryData } from '@/views/category'

import { type TProductLookupResponse } from '@/views/product'

import {
  type OfferFormT,
  type TLockedPricesMap,
  type TOfferLookupDataWithId,
  OFFER_DISABLED_STATUS,
  OFFER_STATUS,
  offerErrors,
  queryDuplicateOffer,
} from '../'

import { FieldGroup } from '@/components/ui/field'
import { SelectItem } from '@/components/ui/select'
import { capitalizeWords } from '@/helpers/utils'

export type OfferFormFieldsPublicProps = {
  isCreate: boolean
  readyCategoriesData: TCategoryData[]
  readyProductsData: TProductLookupResponse[]
  lockedPricesMap: TLockedPricesMap
  initialValues: Partial<TOfferLookupDataWithId>
  storageKey?: string
  currentName?: string
}

type OfferFormFieldsProps = OfferFormFieldsPublicProps & {
  form: OfferFormT
}

export function OfferFormFields({
  form,
  isCreate,
  readyCategoriesData,
  readyProductsData,
  lockedPricesMap,
  initialValues,
  storageKey,
  currentName,
}: OfferFormFieldsProps) {
  return (
    <FieldGroup>
      {/* ── Name + Discount + Status ──────────────────── */}
      <FieldGroup className="sm:grid sm:grid-cols-3">
        <form.AppField
          name="name"
          validators={{
            onChangeAsyncDebounceMs: 1500,
            onChangeAsync: async v => {
              if (!v.value) return
              if (!isCreate && v.value === currentName) return

              const result = await queryDuplicateOffer({
                key: 'name',
                value: v.value,
              })

              if (result.isDuplicate) {
                return {
                  type: 'error',
                  message: result.message.code
                    ? offerErrors[result.message.code].client
                    : 'This offer name already exists',
                }
              }
            },
          }}
        >
          {field => (
            <field.TextField
              label="Name"
              placeholder="Holiday Offer"
              data-required
              initialValue={isCreate ? undefined : initialValues.name}
            />
          )}
        </form.AppField>

        <form.AppField name="discount">
          {field => (
            <field.NumberField
              label="Discount %"
              min={0.01}
              max={99.99}
              step="any"
              required
              initialValue={isCreate ? undefined : initialValues.discount}
              onInput={e => {
                const val = parseFloat(e.currentTarget.value)
                if (val > 99.99) {
                  e.currentTarget.value = '99.99'
                  field.handleChange(99.99)
                } else if (val < 0) {
                  e.currentTarget.value = '0'
                  field.handleChange(0)
                }
              }}
            />
          )}
        </form.AppField>

        <form.AppField name="status">
          {field => (
            <field.SelectField
              label="Status"
              defaultValue="scheduled"
              required
              initialValue={isCreate ? undefined : initialValues.status}
              renderItems={OFFER_STATUS.map(value => (
                <SelectItem
                  key={value}
                  value={value}
                  disabled={OFFER_DISABLED_STATUS.includes(value)}
                >
                  {capitalizeWords(value)}
                </SelectItem>
              ))}
            />
          )}
        </form.AppField>
      </FieldGroup>

      {/* ── Description ──────────────────────────────── */}
      <form.AppField name="description">
        {field => (
          <field.TextareaField
            label="Description"
            placeholder="Your Description..."
            rows={4}
            initialValue={isCreate ? undefined : initialValues.description}
          />
        )}
      </form.AppField>

      {/* ── Offer Start + End ─────────────────────────── */}
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <form.AppField name="offer_start">
          {field => (
            <field.DateTimeRangeField
              label="Offer Start"
              title="Select Date"
              required
              initialValue={isCreate ? undefined : initialValues.offer_start}
            />
          )}
        </form.AppField>
        <form.AppField name="offer_end">
          {field => (
            <field.DateTimeRangeField
              label="Offer End"
              title="Select Date"
              required
              initialValue={isCreate ? undefined : initialValues.offer_end}
            />
          )}
        </form.AppField>
      </FieldGroup>

      {/* ── Target items ──────────────────────────────── */}
      <form.AppField name="target_items">
        {field => (
          <field.OfferTargetSelectorField
            categories={readyCategoriesData}
            products={readyProductsData}
            lockedPricesMap={lockedPricesMap}
            {...(storageKey && { storageKey })}
          />
        )}
      </form.AppField>
    </FieldGroup>
  )
}
