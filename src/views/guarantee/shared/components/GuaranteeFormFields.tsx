import { PlusIcon, XIcon } from 'lucide-react'
import React from 'react'

import { type TCategoryData } from '@/views/category'

import { type TProductLookupDataWithId } from '@/views/product'

import { type TBrandLookupResponse } from '@/views/brand'

import {
  type GuaranteeFormT,
  type TGuaranteeLookupDataWithId,
  type TLockedPricesMap,
  GUARANTEE_STATUS,
  guaranteeErrors,
} from '../'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select'
import { capitalizeWords } from '@/helpers/utils'
import { queryDuplicateGuarantee } from '../queries/query-duplicate-guarantee'

export type GuaranteeFormFieldsPublicProps = {
  isCreate: boolean
  isBrandsData: boolean
  brandsPlaceholder?: string
  groupedBrands: [string, TBrandLookupResponse[] | undefined][]
  readyCategoriesData: TCategoryData[]
  readyProductsData: TProductLookupDataWithId[]
  lockedPricesMap: TLockedPricesMap
  initialValues: Partial<TGuaranteeLookupDataWithId>
  storageKey?: string
  currentName?: string
}

type GuaranteeFormFieldsProps = GuaranteeFormFieldsPublicProps & {
  form: GuaranteeFormT
}

export function GuaranteeFormFields({
  form,
  isCreate,
  isBrandsData,
  brandsPlaceholder,
  groupedBrands,
  readyCategoriesData,
  readyProductsData,
  lockedPricesMap,
  initialValues,
  storageKey,
  currentName,
}: GuaranteeFormFieldsProps) {
  return (
    <FieldGroup>
      {/* ── Name + Duration + Extra Price ─────────────── */}
      <FieldGroup className="sm:grid sm:grid-cols-3">
        <form.AppField
          name="name"
          validators={{
            onChangeAsyncDebounceMs: 1500,
            onChangeAsync: async v => {
              if (!v.value) return
              if (!isCreate && v.value === currentName) return

              const result = await queryDuplicateGuarantee({
                key: 'name',
                value: v.value,
              })

              if (result.isDuplicate) {
                return {
                  type: 'error',
                  message: result.message.code
                    ? guaranteeErrors[result.message.code].client
                    : 'This guarantee name already exists',
                }
              }
            },
          }}
        >
          {field => (
            <field.TextField
              label="Name"
              placeholder="Standard Warranty"
              data-required
              initialValue={isCreate ? undefined : initialValues.name}
            />
          )}
        </form.AppField>

        <form.AppField name="duration">
          {field => (
            <field.TextField
              label="Duration"
              placeholder="2 Years"
              data-required
              initialValue={isCreate ? undefined : initialValues.duration}
            />
          )}
        </form.AppField>

        <form.AppField name="extra_price">
          {field => (
            <field.NumberField
              label="Extra Price"
              min={0}
              step="any"
              initialValue={isCreate ? undefined : initialValues.extra_price}
            />
          )}
        </form.AppField>
      </FieldGroup>

      {/* ── Brand + Status ────────────────────────────── */}
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <form.AppField name="brand_id">
          {field => {
            const placeholder = isBrandsData
              ? `↓ ${brandsPlaceholder}`
              : 'No Brand'

            return (
              <field.SelectField
                label="Brand"
                placeholder={placeholder}
                initialValue={
                  isCreate ? undefined : (initialValues.brand_name ?? undefined)
                }
                renderItems={groupedBrands.map(([category, items]) => (
                  <React.Fragment key={category}>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel id={category}>{category}</SelectLabel>
                      {items?.map(({ id, name, categories }) => (
                        <SelectItem key={id} value={id}>
                          <span>{name}</span>
                          {categories.length > 0 && (
                            <span className="text-muted-foreground text-xs">
                              - {categories.map(({ name }) => name).join(', ')}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </React.Fragment>
                ))}
              />
            )
          }}
        </form.AppField>

        <form.AppField name="status">
          {field => (
            <field.SelectField
              label="Status"
              defaultValue="active"
              initialValue={isCreate ? undefined : initialValues.status}
              renderItems={GUARANTEE_STATUS.map(value => (
                <SelectItem key={value} value={value}>
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
            placeholder="e.g. Covers manufacturing defects and hardware failures under normal use conditions."
            rows={4}
            initialValue={isCreate ? undefined : initialValues.description}
          />
        )}
      </form.AppField>

      {/* ── Extra Duration (array) ────────────────────── */}
      <form.AppField name="extra_duration" mode="array">
        {field => {
          const items = field.state.value ?? []
          return (
            <Field>
              <FieldLabel className="flex w-full items-center justify-between">
                <span>Extra Duration Options</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    field.pushValue({
                      id: crypto.randomUUID(),
                      duration: '',
                      price: 0,
                    })
                  }
                >
                  <PlusIcon className="mr-1" />
                  Add
                </Button>
              </FieldLabel>

              {items.length === 0 ? (
                <FieldDescription className="text-sm">
                  No extra duration options added.
                </FieldDescription>
              ) : (
                <FieldGroup className="gap-2">
                  {items.map((_, index) => (
                    <FieldGroup
                      key={items[index]?.id ?? index}
                      className="sm:flex-row sm:items-center"
                    >
                      <form.AppField name={`extra_duration[${index}].duration`}>
                        {subField => (
                          <subField.TextField label="" placeholder="1 Year" />
                        )}
                      </form.AppField>

                      <form.AppField name={`extra_duration[${index}].price`}>
                        {subField => (
                          <subField.NumberField
                            label=""
                            placeholder="Price"
                            min={0}
                            step="any"
                          />
                        )}
                      </form.AppField>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => field.removeValue(index)}
                      >
                        <XIcon />
                      </Button>
                    </FieldGroup>
                  ))}
                </FieldGroup>
              )}
            </Field>
          )
        }}
      </form.AppField>

      {/* ── Target items ──────────────────────────────── */}
      <form.AppField name="target_items">
        {field => (
          <field.GuaranteeTargetSelectorField
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
