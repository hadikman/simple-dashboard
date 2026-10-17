'use client'

import { ArrowUpIcon, CheckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import z from 'zod'

import { type FlatCategoryNode } from '@/views/category'

import {
  type TFeatureLookupDataWithId,
  type TGetFeatureLookupResponse,
  featureErrors,
  queryDuplicateFeature,
} from '../../../../shared'

import { Badge } from '@/components/ui/badge'
import {
  Field,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import {
  SelectGroup,
  SelectItem,
  SelectSeparator,
} from '@/components/ui/select'
import { normalizeSlug, withMinDelay } from '@/helpers/utils'
import { useAppForm } from '@/hooks/create-react-form-hook'
import { updateFeatureAction } from './update-feature.action'

const FeatureSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  slug: z.string().trim().min(1, 'Key is required'),
  description: z.string().trim().nullable(),
  type: z.string().trim().nullable(),
  category: z.string().trim().nullable(),
  is_required: z.boolean(),
  display_order: z.number().min(1),
  status: z.enum(['active', 'inactive']),
  applicable_category_id: z.string().nullable(),
})

type FeatureSchemaT = z.input<typeof FeatureSchema>

type FeaturePropertiesProps = {
  featureData: TGetFeatureLookupResponse
  flattenedCategoriesData: FlatCategoryNode[]
}
export function FeatureProperties({
  featureData,
  flattenedCategoriesData,
}: FeaturePropertiesProps) {
  const route = useRouter()

  const isFeatureData = featureData.success
  const isCategoriesData = !!flattenedCategoriesData.length

  const categoriesMap = new Map<string, FlatCategoryNode>()
  flattenedCategoriesData.forEach(cat => categoriesMap.set(cat.id, cat))

  const flattenedCategoryList = flattenedCategoriesData

  let initialValues: Partial<TFeatureLookupDataWithId> = {}

  if (isFeatureData) {
    initialValues = featureData.feature
    Object.freeze(initialValues)
  }

  const defaultValues: FeatureSchemaT = {
    name: initialValues.name!,
    slug: initialValues.slug!,
    description: initialValues.description || null,
    type: initialValues.type || null,
    category: initialValues.category || null,
    is_required: initialValues.is_required!,
    display_order: initialValues.display_order!,
    status: initialValues.status!,
    applicable_category_id: initialValues.applicable_category_id || null,
  }

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: FeatureSchema,
    },
    onSubmit: async props => {
      if (!isFeatureData) return

      const {
        name,
        slug,
        description,
        type,
        category,
        is_required,
        display_order,
        status,
        applicable_category_id,
      } = FeatureSchema.parse(props.value)

      const formData = new FormData()

      // Basic Information
      appendIfChanged(formData, 'id', featureData.feature.id)

      // Optional Information
      appendIfChanged(formData, 'name', name)
      appendIfChanged(formData, 'slug', slug)
      appendIfChanged(formData, 'description', description)
      appendIfChanged(formData, 'type', type)
      appendIfChanged(formData, 'category', category)
      appendIfChanged(formData, 'is_required', is_required)
      appendIfChanged(formData, 'display_order', display_order)
      appendIfChanged(formData, 'status', status)
      appendIfChanged(
        formData,
        'applicable_category_id',
        applicable_category_id,
      )

      if (form.state.isDefaultValue) {
        toast.info('No changes detected')
        return
      }

      const result = await toast
        .promise(
          withMinDelay(
            updateFeatureAction({ formData, currentSlug: initialValues.slug! }),
            500,
          ),
          {
            loading: 'Updating feature...',
            error: 'Failed to edit feature. Please try again.',
          },
        )
        .unwrap()

      if (result.success) {
        toast.success(`The ${initialValues.name} has been edited`, {
          duration: 1200,
        })

        if (slug !== initialValues.slug) {
          form.reset()
        }

        if (result.feature.slug) {
          route.replace(`/dashboard/products/features/${result.feature.slug}`)
        }
      } else {
        toast.error('Failure to create a new feature', {
          description: result.errors.code
            ? featureErrors[result.errors.code].client
            : 'Please try again!',
          duration: 3000,
        })
      }
    },
  })

  return (
    <FieldSet>
      <form id="edit-properties-form" onSubmit={e => e.preventDefault()}>
        <FieldGroup className="select-none">
          <FieldGroup>
            <form.AppField
              name="name"
              validators={{
                onChangeAsyncDebounceMs: 1500,
                onChangeAsync: async v => {
                  if (!v.value) return

                  if (isFeatureData && v.value === featureData.feature.name) {
                    return
                  }

                  const result = await queryDuplicateFeature({
                    key: 'name',
                    value: v.value,
                  })

                  if (result.isDuplicate) {
                    return {
                      type: 'error',
                      message: result.message.code
                        ? featureErrors[result.message.code].client
                        : 'This feature key already exists',
                    }
                  }
                },
              }}
            >
              {field => (
                <field.TextField
                  label="Name"
                  initialValue={initialValues.name}
                />
              )}
            </form.AppField>
            <form.AppField name="applicable_category_id">
              {field => {
                const placeholder = isCategoriesData
                  ? `↓ ${flattenedCategoryList[0].name}`
                  : 'No Category'

                return (
                  <field.SelectField
                    label="Select Applicable Category"
                    placeholder={placeholder}
                    initialValue={initialValues.applicable_category_name}
                    renderItems={
                      <>
                        <SelectSeparator />
                        <SelectGroup>
                          {flattenedCategoryList.map(({ id, name, depth }) => (
                            <SelectItem
                              key={id}
                              value={id}
                              className="pl-(--depth)"
                              style={
                                {
                                  '--depth': `calc(var(--spacing)*${depth + 2})`,
                                } as React.CSSProperties
                              }
                            >
                              {name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    }
                  />
                )
              }}
            </form.AppField>
          </FieldGroup>

          <FieldGroup>
            <form.Subscribe
              selector={select => ({
                name: select.values['name'],
                applicable_category_id: select.values['applicable_category_id'],
              })}
            >
              {values => {
                const { name, applicable_category_id } = values
                const {
                  name: initialName,
                  applicable_category_name: initialAppCat,
                } = initialValues

                const isAppCatPristine = form.getFieldMeta(
                  'applicable_category_id',
                )?.isPristine

                const fieldAppCat = `${applicable_category_id ? `${categoriesMap.get(applicable_category_id)?.name}-` : name && isAppCatPristine ? `${initialAppCat ?? ''}-` : ''}`
                const fieldName = `${name || initialName}`

                const suggestion = normalizeSlug(fieldAppCat + fieldName)
                const isSuggestion = name || applicable_category_id

                return (
                  <form.AppField
                    name="slug"
                    validators={{
                      onChangeAsyncDebounceMs: 1500,
                      onChangeAsync: async v => {
                        if (!v.value) return

                        if (v.value === initialValues.slug) {
                          return
                        }

                        const result = await queryDuplicateFeature({
                          key: 'slug',
                          value: v.value,
                        })

                        if (result.isDuplicate) {
                          return {
                            type: 'error',
                            message: result.message.code
                              ? featureErrors[result.message.code].client
                              : 'This feature key already exists',
                          }
                        }
                      },
                    }}
                  >
                    {field => (
                      <field.TextField
                        label="Key"
                        initialValue={initialValues.slug}
                        renderAfterInput={
                          <span
                            data-suggestion={isSuggestion || undefined}
                            className="flex flex-wrap items-center justify-start text-xs text-neutral-500 opacity-0 data-suggestion:opacity-100"
                          >
                            <span className="mr-1">Suggestion:</span>
                            <Badge
                              variant="secondary"
                              className="hover:bg-secondary/60 text-wrap whitespace-pre-wrap"
                              onClick={() => field.handleChange(suggestion)}
                            >
                              {suggestion}{' '}
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
            <form.AppField name="description">
              {field => (
                <field.TextField
                  label="Description"
                  initialValue={initialValues.description}
                  placeholder="Feature description (e.g. Width of the product)"
                />
              )}
            </form.AppField>
          </FieldGroup>

          <FieldGroup>
            <form.AppField name="type">
              {field => (
                <field.TextField
                  label="Type"
                  initialValue={initialValues.type}
                  placeholder="Feature type (e.g. Dimension, Color)"
                />
              )}
            </form.AppField>
            <form.AppField name="category">
              {field => (
                <field.TextField
                  label="Category"
                  initialValue={initialValues.category}
                  placeholder="Feature category (e.g. Technical, Physical, Visual)"
                />
              )}
            </form.AppField>
          </FieldGroup>

          <FieldSeparator />

          <FieldGroup>
            <form.AppField name="display_order">
              {field => (
                <field.NumberField
                  label="Dispaly Order"
                  initialValue={initialValues.display_order}
                />
              )}
            </form.AppField>
            <form.AppField name="status">
              {field => (
                <field.SelectField
                  label="Status"
                  initialValue={initialValues.status}
                  defaultValue={initialValues.status || ''}
                  renderItems={
                    <>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </>
                  }
                />
              )}
            </form.AppField>
            <form.AppField name="is_required">
              {field => (
                <field.CheckboxField
                  label="Require"
                  description="When enabled, this feature will mark as required."
                  initialValue={initialValues.is_required}
                />
              )}
            </form.AppField>
          </FieldGroup>

          <FieldSeparator />

          <Field orientation="responsive">
            <form.AppForm>
              <form.SubscribeButton
                form="edit-properties-form"
                label="Update"
              />
            </form.AppForm>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  )
}

function appendIfChanged<T>(fd: FormData, key: string, value: T | null) {
  if (value !== null) {
    fd.append(key, JSON.stringify(value))
  }
}
