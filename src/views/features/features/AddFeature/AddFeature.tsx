'use client'

import { ArrowUpIcon, CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import z from 'zod'

import {
  type TCategoryData,
  type TGetCategoriesResponse,
  buildFlattenedCategoriesList,
  processCategoriesData,
} from '@/views/category'

import { featureErrors, queryDuplicateFeature } from '../../shared'

import { Badge } from '@/components/ui/badge'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import {
  SelectGroup,
  SelectItem,
  SelectSeparator,
} from '@/components/ui/select'
import { normalizeSlug, withMinDelay } from '@/helpers/utils'
import { useAppForm } from '@/hooks/create-react-form-hook'
import { addFeatureAction } from './add-feature.action'

const FeatureSchema = z.object({
  name: z.string().trim().min(1, 'The value is required.'),
  slug: z.string().trim().nullable(),
  applicable_category_id: z.string().nullable(),
})
type FeatureSchemaT = z.input<typeof FeatureSchema>
const defaultValues: FeatureSchemaT = {
  name: '',
  slug: null,
  applicable_category_id: null,
}

type FeatureAddProps = { categoriesData: TGetCategoriesResponse }
export function FeatureAdd({ categoriesData }: FeatureAddProps) {
  const { success } = categoriesData

  const categoriesMap = new Map<string, TCategoryData>()
  if (success) {
    categoriesData.categories.forEach(cat => categoriesMap.set(cat.id, cat))
  }

  const categories = categoriesData.success ? categoriesData.categories : []
  const processedCategoriesData = processCategoriesData(categories)
  const flattenedCategoryList = buildFlattenedCategoriesList(
    processedCategoriesData,
  )

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: FeatureSchema,
    },
    onSubmit: async props => {
      const formData = new FormData()
      const { name, slug, applicable_category_id } = FeatureSchema.parse(
        props.value,
      )

      let suggestionSlug = ''

      // Basic Information
      formData.append('name', name)

      if (!slug) {
        const applicableCategoryName = applicable_category_id
          ? categoriesMap.get(applicable_category_id)?.name
          : ''

        suggestionSlug = normalizeSlug(`${applicableCategoryName}-${name}`)

        const result = await queryDuplicateFeature({
          key: 'slug',
          value: suggestionSlug,
        })

        if (result.isDuplicate) {
          form.setErrorMap({
            onSubmit: {
              fields: {
                slug: [
                  {
                    message: `The generated key "${suggestionSlug}" (based on the name) already exists. Please enter a unique key.`,
                  },
                ],
              },
            },
          })

          return
        }
      }
      formData.append('slug', slug ?? suggestionSlug)

      // Optional Information
      if (applicable_category_id) {
        formData.append('applicable_category_id', applicable_category_id)
      }

      const result = await toast
        .promise(withMinDelay(addFeatureAction(formData), 500), {
          loading: 'Adding feature...',
          error: 'Failed to add feature. Please try again.',
        })
        .unwrap()

      if (result.success) {
        toast.success(`The ${name} has been added`, {
          duration: 1200,
        })
        form.reset()
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
      <FieldLegend>Add New Feature</FieldLegend>
      <FieldDescription>Fill the following fields</FieldDescription>
      <form id="add-feature-form" onSubmit={e => e.preventDefault()}>
        <FieldGroup className="select-none">
          <FieldGroup className="sm:grid sm:grid-cols-2 lg:grid-cols-3">
            <form.AppField
              name="name"
              validators={{
                onChangeAsyncDebounceMs: 1500,
                onChangeAsync: async v => {
                  if (!v.value) return

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
                  placeholder="Color"
                  data-required
                />
              )}
            </form.AppField>
            <form.AppField name="applicable_category_id">
              {field => {
                const placeholder = success
                  ? `↓ ${categoriesData.categories[0].name}`
                  : 'No Category'

                return (
                  <field.SelectField
                    label="Select Applicable Category"
                    placeholder={placeholder}
                    disabled={!success}
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
            <form.Subscribe
              selector={select => ({
                name: select.values['name'],
                applicable_category_id: select.values['applicable_category_id'],
              })}
            >
              {values => {
                const { name, applicable_category_id } = values
                const applicableCategory = applicable_category_id
                  ? categoriesMap.get(applicable_category_id)?.name
                  : ''

                const suggestion = normalizeSlug(
                  `${applicableCategory}-${name}`,
                )

                return (
                  <form.AppField
                    name="slug"
                    validators={{
                      onChangeAsyncDebounceMs: 1500,
                      onChangeAsync: async v => {
                        if (!v.value) return

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
                        placeholder={`e.g. ${name ? name.toLowerCase() : 'color'}`}
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
                              {suggestion ? suggestion : '—'}{' '}
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

          <Field orientation="responsive">
            <form.AppForm>
              <form.SubscribeButton form="add-feature-form" label="Add" />
            </form.AppForm>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  )
}
