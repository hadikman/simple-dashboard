import { ArrowUpIcon, CheckIcon } from 'lucide-react'

import { getCategoryPlaceholder, type RootCategories } from '@/views/category'

import {
  type BrandFormT,
  type TBrandLookupDataWithIdCategoriesWithTitle,
  brandErrors,
  ComboboxItemType,
  queryDuplicateBrand,
  RootCategoriesWithTitle,
} from '../'

import { Badge } from '@/components/ui/badge'
import { FieldGroup, FieldSeparator } from '@/components/ui/field'
import { normalizeSlug } from '@/helpers/utils'

export type BrandFormFieldsPublicProps = {
  isCreate: boolean
  isCategoriesData: boolean
  rootCategories: RootCategories[]
  initialValues: TBrandLookupDataWithIdCategoriesWithTitle
  mediaHref: string
  mediaKey: string
  thumbnailImages: string[]
  setThumbnailImages: (image: string) => void
  brandSlug?: string
}

// Internal props — form is injected by BrandForm
type BrandFormFieldsProps = BrandFormFieldsPublicProps & {
  form: BrandFormT
}

export function BrandFormFields({
  form,
  isCreate,
  isCategoriesData,
  rootCategories,
  initialValues,
  mediaHref,
  mediaKey,
  thumbnailImages,
  setThumbnailImages,
  brandSlug,
}: BrandFormFieldsProps) {
  const mappedCategories: RootCategoriesWithTitle[] = []
  for (let i = 0; i < rootCategories.length; i++) {
    const cat = rootCategories[i]
    mappedCategories.push({ id: cat.id, title: cat.name })
  }

  return (
    <FieldGroup>
      {/* ── Name + Slug ──────────────────────────────── */}
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <form.AppField name="name">
          {field => (
            <field.TextField
              label="Name"
              placeholder="Green Hornet"
              data-required={isCreate}
              initialValue={isCreate ? undefined : initialValues.name}
            />
          )}
        </form.AppField>

        <form.Subscribe selector={s => s.values.name}>
          {name => {
            const suggestion = normalizeSlug(name ?? '')
            return (
              <form.AppField
                name="slug"
                validators={{
                  onChangeAsyncDebounceMs: 1500,
                  onChangeAsync: async v => {
                    if (!v.value) return
                    if (!isCreate && v.value === brandSlug) return

                    const result = await queryDuplicateBrand({ slug: v.value })

                    if (result.isDuplicate) {
                      return {
                        type: 'error',
                        message: result.message.code
                          ? brandErrors[result.message.code].client
                          : 'This brand key already exists',
                      }
                    }
                  },
                }}
              >
                {field => (
                  <field.TextField
                    label="Key"
                    placeholder={`e.g. ${suggestion || 'green-hornet'}`}
                    initialValue={isCreate ? undefined : initialValues.slug}
                    onBlur={e =>
                      form.setFieldValue('slug', normalizeSlug(e.target.value))
                    }
                    renderAfterInput={
                      <span
                        data-suggestion={suggestion || undefined}
                        className="flex flex-wrap items-center justify-start text-xs text-neutral-500 opacity-0 data-suggestion:opacity-100"
                      >
                        <span className="mr-1">Suggestion:</span>
                        <Badge
                          variant="secondary"
                          className="hover:bg-secondary/60 text-wrap whitespace-pre-wrap"
                          onClick={() => field.handleChange(suggestion)}
                        >
                          {suggestion || '—'}{' '}
                          {suggestion === field.state.value ? (
                            <CheckIcon className="shrink-0" />
                          ) : (
                            <ArrowUpIcon className="shrink-0" />
                          )}
                        </Badge>
                      </span>
                    }
                  />
                )}
              </form.AppField>
            )
          }}
        </form.Subscribe>
      </FieldGroup>

      <FieldSeparator />

      {/* ── Description ──────────────────────────────── */}
      <form.AppField name="description">
        {field => (
          <field.TextareaField
            label="Description"
            initialValue={isCreate ? undefined : initialValues.description}
            placeholder="An electronic and technology leader company from California, USA."
          />
        )}
      </form.AppField>

      {/* ── Categories ───────────────────────────────── */}
      <form.AppField name="categories">
        {field => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid

          const effectiveValues = (
            !isCreate && field.state.meta.isPristine
              ? initialValues.categories
              : field.state.value || []
          )! as ComboboxItemType[]

          const displayValues = effectiveValues?.map(({ id }) => id) || []
          const leftCount = mappedCategories.length - displayValues.length

          const placeholder = getCategoryPlaceholder(
            isCategoriesData,
            displayValues.length,
            leftCount,
          )

          return (
            <field.ComboboxField
              label="Select Category"
              placeholder={placeholder}
              disabled={!isCategoriesData}
              items={mappedCategories}
              initialValue={effectiveValues}
              aria-invalid={isInvalid}
            />
          )
        }}
      </form.AppField>

      <FieldSeparator />

      {/* ── Logo ─────────────────────────────────────── */}
      <form.AppField name="logo">
        {field => (
          <field.MediaField
            label="Thumbnail Image"
            description="Select one thumbnail image"
            href={mediaHref}
            mode="single"
            keyValue={mediaKey}
            selectedMediaPreview={thumbnailImages}
            onRemove={setThumbnailImages}
            {...(!isCreate && {
              slug: initialValues.slug!,
            })}
          />
        )}
      </form.AppField>

      <FieldSeparator />

      {/* ── Website ──────────────────────────────────── */}
      <form.AppField name="website">
        {field => (
          <field.TextField
            label="Website"
            initialValue={isCreate ? undefined : initialValues.website}
            placeholder="https://www.green-hornet.com/"
          />
        )}
      </form.AppField>

      {/* ── Email + Phone ────────────────────────────── */}
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <form.AppField name="email">
          {field => (
            <field.TextField
              label="Email"
              initialValue={isCreate ? undefined : initialValues.email}
              placeholder="info@green-hornet.com"
            />
          )}
        </form.AppField>
        <form.AppField name="phone">
          {field => (
            <field.TextField
              label="Phone"
              initialValue={isCreate ? undefined : initialValues.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+1-718-313-3636"
            />
          )}
        </form.AppField>
      </FieldGroup>
    </FieldGroup>
  )
}
