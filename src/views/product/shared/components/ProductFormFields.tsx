'use client'

import { ArrowUpIcon, CheckIcon } from 'lucide-react'
import React, { useMemo } from 'react'

import {
  type FlatCategoryNode,
  getCategoryPlaceholder,
  resolveParentChildConflicts,
} from '@/views/category'

import { type TGetBrandsResponse } from '@/views/brand'

import { type TGetFeaturesResponse } from '@/views/features'

import {
  type BuildUpdateProductFormHelperProps,
  type ComboboxItemType,
  type FlatCategoryNodeWithTitle,
  type TProductsForLinkingResponse,
  NO_ID,
  productErrors,
  ProductFormT,
  queryDuplicateProduct,
} from '..'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ComboboxItem } from '@/components/ui/combobox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { normalizeSlug } from '@/helpers/utils'
import { ProductInventoryDisplay } from '../../features/ProductInventory/ProductInventoryDisplay'
import { ProductInventorySync } from '../../features/ProductInventory/ProductInventorySync'

export type ProductFormFieldsPublicProps = {
  isCreate: boolean
  isCategoriesData: boolean
  isProductsForLinkingData: boolean
  flattenedCategoriesData: FlatCategoryNode[]
  brandsData: TGetBrandsResponse
  productsForLinking: TProductsForLinkingResponse[]
  featuresData: TGetFeaturesResponse
  mediaHref: string
  mediaKey: string
  thumbnailImages: string[]
  images: string[]
  setThumbnailImages: (image: string) => void
  toggleImages: (image: string) => void
  productGroupId?: string
  productSlug?: string
  isMobile: boolean
  editorResetKey?: number
} & BuildUpdateProductFormHelperProps

type ProductFormFieldsProps = ProductFormFieldsPublicProps & {
  form: ProductFormT
}

export function ProductFormFields({
  form,
  isCreate,
  isCategoriesData,
  isProductsForLinkingData,
  flattenedCategoriesData,
  brandsData,
  productsForLinking,
  featuresData,
  initialValues,
  categoriesWithParentMap,
  featuresIdxsMap,
  groupedFeaturesSorted,
  mediaHref,
  mediaKey,
  thumbnailImages,
  images,
  setThumbnailImages,
  toggleImages,
  productGroupId,
  productSlug,
  isMobile,
  editorResetKey = 0,
}: ProductFormFieldsProps) {
  const isBrandsData = brandsData.success
  const isFeaturesData = featuresData.success

  const groupedBrands = useMemo(
    () =>
      isBrandsData
        ? Object.entries(
            Object.groupBy(brandsData.brands, ({ categories }) =>
              categories.length === 0 ? 'General' : 'Categorized',
            ),
          )
        : [],
    [brandsData, isBrandsData],
  )

  // Convert categories data for combobox (title field)
  const mappedCategories = useMemo<FlatCategoryNodeWithTitle[]>(() => {
    const result: FlatCategoryNodeWithTitle[] = []
    for (let i = 0; i < flattenedCategoriesData.length; i++) {
      const cat = flattenedCategoriesData[i]
      result.push({
        id: cat.id,
        title: cat.name,
        depth: cat.depth,
        descendantIds: cat.descendantIds,
      })
    }
    return result
  }, [flattenedCategoriesData])

  const initialFeaturesMap = new Map<
    string,
    { feature_id: string; value_id: number; value: string }
  >()
  initialValues.features?.forEach(({ feature_id, ...rest }) =>
    initialFeaturesMap.set(feature_id, {
      feature_id,
      value_id: rest.value_id,
      value: rest.value_name,
    }),
  )

  const readyFeaturesData = useMemo(
    () => (isFeaturesData ? featuresData.features : []),
    [featuresData, isFeaturesData],
  )

  return (
    <FieldGroup>
      {/* ── Title ─────────────────────────────────────── */}
      <form.AppField name="title">
        {field => (
          <field.TextField
            label="Title"
            placeholder="GeForce RTX 5090 Graphics Cards"
            data-required={isCreate}
            initialValue={isCreate ? undefined : initialValues.title}
          />
        )}
      </form.AppField>

      {/* ── Slug ──────────────────────────────────────── */}
      <form.Subscribe selector={s => s.values.title}>
        {title => {
          const suggestion = normalizeSlug(title ?? '')
          return (
            <form.AppField
              name="slug"
              validators={{
                onChangeAsyncDebounceMs: 1500,
                onChangeAsync: async v => {
                  if (!v.value) return
                  if (!isCreate && v.value === productSlug) return
                  const result = await queryDuplicateProduct({
                    ...(productGroupId && { productGroupId }),
                    slug: v.value,
                  })
                  if (result.isDuplicate) {
                    return {
                      type: 'error',
                      message: result.message.code
                        ? productErrors[result.message.code].client
                        : 'This product key already exists',
                    }
                  }
                },
              }}
            >
              {field => (
                <field.TextField
                  label="Key"
                  placeholder={`e.g. ${suggestion || 'geforce-rtx-5090-graphics-cards'}`}
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

      <FieldSeparator />

      {/* ── Short Description + Description ───────────── */}
      <form.AppField name="short_description">
        {field => (
          <field.EditorField
            key={editorResetKey}
            label="Short Description"
            minimal
            {...(!isCreate && {
              initialJsonValue: initialValues.short_description?.json,
              initialHtmlValue: initialValues.short_description?.html,
              initialTextValue: initialValues.short_description?.text,
            })}
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {field => (
          <field.EditorField
            key={editorResetKey + 1}
            label="Description"
            wrapperToolbarClassName="sticky top-0 z-10 pb-2"
            wrapperSelectionMonitorClassName="sticky inset-x-0 bottom-0 z-10"
            {...(!isCreate && {
              initialJsonValue: initialValues.description?.json,
              initialHtmlValue: initialValues.description?.html,
              initialTextValue: initialValues.description?.text,
            })}
          />
        )}
      </form.AppField>

      <FieldSeparator />

      {/* ── Brand + Categories ────────────────────────── */}
      <FieldGroup className="sm:grid sm:grid-cols-2">
        <form.AppField name="brand_name">
          {field => {
            const placeholder = isBrandsData
              ? `↓ ${brandsData.brands[0]?.name ?? ''}`
              : 'No Brand'
            return (
              <field.SelectField
                label="Select Brand"
                initialValue={
                  isCreate ? undefined : (initialValues.brand_name ?? undefined)
                }
                placeholder={placeholder}
                disabled={!isBrandsData}
                renderItems={groupedBrands.map(([category, items]) => (
                  <React.Fragment key={category}>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel id={category}>{category}</SelectLabel>
                      {items?.map(({ name, categories }) => (
                        <SelectItem key={name} value={name}>
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
            const leftCount =
              flattenedCategoriesData.length - displayValues.length

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
                onChange={selectedItems => {
                  const selectedIds = selectedItems.map(item => item.id)
                  const resolvedIds = resolveParentChildConflicts(
                    selectedIds,
                    flattenedCategoriesData,
                  )
                  const resolvedSet = new Set(resolvedIds)
                  const finalMappedValues = []
                  for (let i = 0; i < mappedCategories.length; i++) {
                    const cat = mappedCategories[i]
                    if (resolvedSet.has(cat.id)) {
                      finalMappedValues.push({ id: cat.id, title: cat.title })
                    }
                  }
                  field.handleChange(finalMappedValues)
                }}
                renderItems={item => {
                  const { id, title, depth, descendantIds } =
                    item as FlatCategoryNodeWithTitle
                  const isDisabled = descendantIds.some((d: string) =>
                    displayValues.includes(d),
                  )
                  return (
                    <ComboboxItem
                      key={id}
                      value={id}
                      className="pl-(--depth)"
                      style={
                        {
                          '--depth': `calc(var(--spacing)*${depth + 2})`,
                        } as React.CSSProperties
                      }
                      disabled={isDisabled}
                    >
                      <span>{title}</span>
                    </ComboboxItem>
                  )
                }}
              />
            )
          }}
        </form.AppField>
      </FieldGroup>

      <FieldSeparator />

      {/* ── Images ────────────────────────────────────── */}
      <FieldSet>
        <FieldLegend>Images</FieldLegend>
        <FieldGroup className="sm:grid sm:grid-cols-2">
          <form.AppField name="thumbnail_image">
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
                  groupId: productGroupId!,
                  slug: initialValues.slug!,
                  status: initialValues.status!,
                })}
              />
            )}
          </form.AppField>
          <form.AppField name="images">
            {field => (
              <field.MediaField
                label="Images"
                description="Select several images"
                href={mediaHref}
                mode="multi"
                keyValue={mediaKey}
                selectedMediaPreview={images}
                onRemove={toggleImages}
                {...(!isCreate && {
                  groupId: productGroupId!,
                  slug: initialValues.slug!,
                  status: initialValues.status!,
                })}
              />
            )}
          </form.AppField>
        </FieldGroup>
      </FieldSet>

      <Separator className="my-8" />

      {/* Keep inventory synced with pricing leafs */}
      <ProductInventorySync form={form} />

      {/* ── Tabs ──────────────────────────────────────── */}
      <Tabs
        defaultValue="pricing"
        orientation={isMobile ? 'vertical' : 'horizontal'}
      >
        <TabsList className="group-data-[orientation=vertical]/tabs:sticky group-data-[orientation=vertical]/tabs:top-4">
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="linked-products">Linked Products</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* ── Pricing ─────────────────────────────────── */}
        <TabsContent value="pricing">
          <Card>
            <CardContent>
              <FieldSet>
                <FieldLegend>Pricing</FieldLegend>
                <FieldGroup>
                  <FieldSet>
                    <FieldLegend>Price Variations</FieldLegend>
                    <FieldDescription>
                      You can add prices in a single list or organize them into
                      groups. For nested options, create groups like
                      &quot;Model&quot;, then add options such as &quot;Founders
                      Edition — $1,999&quot; or &quot;ROG Strix OC —
                      $2,349&quot; — only the final selectable options need
                      prices assigned.
                    </FieldDescription>
                    <form.Subscribe selector={s => s.values.categories}>
                      {categories => {
                        const uniqueCategoriesId = [
                          ...new Set(
                            (categories || initialValues.categories || [])
                              .map(cat => cat.id)
                              .flatMap(id => categoriesWithParentMap.get(id)),
                          ),
                        ]
                        const selectedGroupMap = new Map()
                        for (let i = 0; i < readyFeaturesData.length; i++) {
                          const { applicable_category_id, id, values } =
                            readyFeaturesData[i]
                          if (
                            applicable_category_id &&
                            uniqueCategoriesId?.includes(applicable_category_id)
                          ) {
                            for (let j = 0; j < values.length; j++) {
                              const { id: valueId, value } = values[j]
                              if (!selectedGroupMap.has(value)) {
                                selectedGroupMap.set(value, {
                                  id: id + valueId,
                                  value,
                                })
                              }
                            }
                          }
                        }
                        const selectedCategory = Array.from(
                          selectedGroupMap.values(),
                        )

                        return (
                          <form.AppField name="pricing.prices" mode="array">
                            {field => (
                              <field.PricesField
                                form={form}
                                selectedCategory={selectedCategory}
                              />
                            )}
                          </form.AppField>
                        )
                      }}
                    </form.Subscribe>
                  </FieldSet>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Inventory ───────────────────────────────── */}
        <TabsContent value="inventory">
          <Card>
            <CardContent>
              <ProductInventoryDisplay form={form} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Shipping ────────────────────────────────── */}
        <TabsContent value="shipping">
          <Card>
            <CardContent>
              <FieldSet>
                <FieldLegend>Shipping</FieldLegend>
                <FieldGroup>
                  <FieldGroup className="sm:grid sm:grid-cols-2">
                    <form.AppField name="shipping.weight">
                      {field => (
                        <field.NumberField label="Weight" min={0} step="any" />
                      )}
                    </form.AppField>
                    <form.AppField name="shipping.weight_unit">
                      {field => (
                        <field.SelectField
                          label="Weight Unit"
                          placeholder="↓ Kg"
                          renderItems={
                            <>
                              <SelectSeparator />
                              <SelectGroup>
                                <SelectItem value="kg">Kg</SelectItem>
                              </SelectGroup>
                            </>
                          }
                        />
                      )}
                    </form.AppField>
                  </FieldGroup>
                  <FieldGroup className="sm:grid sm:grid-cols-2">
                    <FieldGroup className="grid grid-cols-2">
                      <form.AppField name="shipping.dimensions.length">
                        {field => (
                          <field.NumberField
                            label="Length"
                            min={0}
                            step="any"
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="shipping.dimensions.width">
                        {field => (
                          <field.NumberField label="Width" min={0} step="any" />
                        )}
                      </form.AppField>
                    </FieldGroup>
                    <FieldGroup className="sm:grid sm:grid-cols-2">
                      <form.AppField name="shipping.dimensions.height">
                        {field => (
                          <field.NumberField
                            label="Height"
                            min={0}
                            step="any"
                          />
                        )}
                      </form.AppField>
                      <form.AppField name="shipping.dimensions.unit">
                        {field => (
                          <field.SelectField
                            label="Dimensions Unit"
                            placeholder="↓ Millimetre"
                            renderItems={
                              <>
                                <SelectSeparator />
                                <SelectGroup>
                                  <SelectItem value="mm">Millimetre</SelectItem>
                                  <SelectItem value="cm">Centimetre</SelectItem>
                                  <SelectItem value="m">Metre</SelectItem>
                                </SelectGroup>
                              </>
                            }
                          />
                        )}
                      </form.AppField>
                    </FieldGroup>
                  </FieldGroup>
                  <form.AppField name="shipping.shipping_class">
                    {field => <field.TextField label="Shipping Class" />}
                  </form.AppField>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Linked Products ─────────────────────────── */}
        <TabsContent value="linked-products">
          <Card>
            <CardContent>
              <FieldSet>
                <FieldLegend>Linked Products</FieldLegend>
                <FieldGroup>
                  <LinkedProductsCombobox
                    form={form}
                    name="linked_products.upsells"
                    label="Up Sells Products"
                    productsForLinking={productsForLinking}
                    isProductsForLinkingData={isProductsForLinkingData}
                    initialValue={initialValues.linked_products?.upsells}
                  />
                  <LinkedProductsCombobox
                    form={form}
                    name="linked_products.cross_sells"
                    label="Cross Sells Products"
                    productsForLinking={productsForLinking}
                    isProductsForLinkingData={isProductsForLinkingData}
                    initialValue={initialValues.linked_products?.cross_sells}
                  />
                  <LinkedProductsCombobox
                    form={form}
                    name="linked_products.related"
                    label="Related Products"
                    productsForLinking={productsForLinking}
                    isProductsForLinkingData={isProductsForLinkingData}
                    initialValue={initialValues.linked_products?.related}
                  />
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Features ────────────────────────────────── */}
        <TabsContent value="features">
          <Card>
            <CardContent>
              <FieldSet>
                <FieldLegend>Features</FieldLegend>
                <FieldDescription>
                  With selecting <span className="font-medium">Category</span>{' '}
                  relevant features will appear.
                </FieldDescription>
                <FieldGroup>
                  <form.Subscribe selector={s => s.values.categories}>
                    {categories => {
                      const uniqueCategoriesId = [
                        ...new Set(
                          (categories || initialValues.categories || [])
                            .map(cat => cat.id)
                            .flatMap(id => categoriesWithParentMap.get(id)),
                        ),
                      ]

                      const selectedGroup = groupedFeaturesSorted.map(group => {
                        const id = group[0]
                        return uniqueCategoriesId?.includes(id) || id === NO_ID
                          ? group
                          : null
                      })

                      return (
                        <form.Field name="features" mode="array">
                          {() =>
                            selectedGroup.map(group => {
                              if (!group) return null

                              const [id, { category, features }] = group

                              return (
                                <FieldContent key={id} className="px-1">
                                  <FieldTitle className="text-muted-foreground">
                                    {category}
                                  </FieldTitle>
                                  <FieldGroup className="@container flex flex-row flex-wrap px-1">
                                    {features.map(feature => {
                                      const featureIndex = featuresIdxsMap.get(
                                        feature.id,
                                      )!

                                      return (
                                        <form.Field
                                          key={feature.id}
                                          name={`features[${featureIndex}]`}
                                          validators={{
                                            onSubmit: ({ value, fieldApi }) => {
                                              const { isDirty } =
                                                fieldApi.getMeta()

                                              const isRequired =
                                                feature.is_required &&
                                                isDirty &&
                                                !value?.value
                                              return isRequired
                                                ? {
                                                    type: 'error',
                                                    message:
                                                      'The value is required.',
                                                  }
                                                : undefined
                                            },
                                          }}
                                        >
                                          {subField => {
                                            const {
                                              state,
                                              name,
                                              handleChange,
                                            } = subField
                                            const { value, meta } = state

                                            const isInvalid =
                                              meta.isTouched && !meta.isValid
                                            const isUndefined =
                                              value === undefined
                                            const isChooseLater =
                                              value?.value === '' &&
                                              meta.isBlurred
                                            const hasValues =
                                              feature.values.length > 0

                                            const placeholder = hasValues
                                              ? `↓ ${feature.values[0].value}`
                                              : 'No Feature'

                                            let displayValue

                                            displayValue = isUndefined
                                              ? ''
                                              : isChooseLater
                                                ? '__none'
                                                : (value?.value ?? '') // '' is a guard for controlled or uncontrolled value

                                            if (meta.isPristine) {
                                              displayValue =
                                                initialFeaturesMap.get(
                                                  feature.id,
                                                )?.value ?? '' // '' is a guard for controlled or uncontrolled value
                                            }

                                            return (
                                              <Field
                                                data-invalid={isInvalid}
                                                className="@xs:w-38 @xs:shrink-0"
                                              >
                                                <FieldLabel
                                                  htmlFor={
                                                    feature.name + feature.id
                                                  }
                                                >
                                                  {feature.name}
                                                </FieldLabel>
                                                <Select
                                                  name={name}
                                                  value={displayValue}
                                                  onValueChange={value => {
                                                    // Initiate features with an array of a combination of initial features or undefined to prevent feature selection issue
                                                    // if (
                                                    //   !isDraftMode &&
                                                    //   !field.state.value
                                                    // ) {
                                                    //   field.handleChange(
                                                    //     getInitialFeatures(),
                                                    //   )
                                                    // }

                                                    if (
                                                      !value ||
                                                      value === '__none'
                                                    ) {
                                                      handleChange(null)
                                                      return
                                                    }

                                                    const valueObj =
                                                      feature.values.find(
                                                        v => v.value === value,
                                                      )!

                                                    handleChange({
                                                      feature_id: feature.id,
                                                      value_id: valueObj.id,
                                                      value: valueObj.value,
                                                    })
                                                  }}
                                                  aria-invalid={isInvalid}
                                                >
                                                  <SelectTrigger
                                                    id={
                                                      feature.name + feature.id
                                                    }
                                                    data-required={
                                                      feature.is_required
                                                    }
                                                    disabled={!hasValues}
                                                  >
                                                    <SelectValue
                                                      placeholder={placeholder}
                                                    />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectGroup>
                                                      <SelectItem value="__none">
                                                        Choose later
                                                      </SelectItem>
                                                    </SelectGroup>
                                                    <SelectSeparator />
                                                    <SelectGroup>
                                                      {feature.values.map(
                                                        ({ id, value }) => (
                                                          <SelectItem
                                                            key={id}
                                                            value={value}
                                                          >
                                                            {value}
                                                          </SelectItem>
                                                        ),
                                                      )}
                                                    </SelectGroup>
                                                  </SelectContent>
                                                </Select>
                                                {isInvalid && (
                                                  <FieldError
                                                    errors={meta.errors}
                                                  />
                                                )}
                                              </Field>
                                            )
                                          }}
                                        </form.Field>
                                      )
                                    })}
                                  </FieldGroup>
                                </FieldContent>
                              )
                            })
                          }
                        </form.Field>
                      )
                    }}
                  </form.Subscribe>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Advanced ───────────────────────────────── */}
        <TabsContent value="advanced">
          <Card>
            <CardContent>
              <FieldSet>
                <FieldLegend>Advanced</FieldLegend>
                <FieldGroup>
                  <form.AppField name="advanced.purchase_note">
                    {field => (
                      <field.TextareaField
                        label="Purchase Note"
                        placeholder="Write the information customers will see after purchase."
                        rows={4}
                        initialValue={
                          isCreate
                            ? undefined
                            : initialValues.advanced?.purchase_note
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="advanced.enable_reviews">
                    {field => (
                      <field.CheckboxField
                        label="Enable Reviews"
                        description="When enabled, users will be able to add reviews."
                        initialValue={
                          isCreate
                            ? undefined
                            : initialValues.advanced?.enable_reviews
                        }
                      />
                    )}
                  </form.AppField>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </FieldGroup>
  )
}

// ─── Linked products reusable combobox ────────────────────
type LinkedProductsComboboxProps = {
  form: ProductFormT
  name:
    | 'linked_products.upsells'
    | 'linked_products.cross_sells'
    | 'linked_products.related'
  label: string
  productsForLinking: TProductsForLinkingResponse[]
  isProductsForLinkingData: boolean
  initialValue?: { id: string; title: string }[] | null
}

function LinkedProductsCombobox({
  form,
  name,
  label,
  productsForLinking,
  isProductsForLinkingData,
  initialValue,
}: LinkedProductsComboboxProps) {
  return (
    <form.AppField name={name}>
      {field => {
        const selectedCount = (field.state.value || []).length
        const leftCount = (productsForLinking?.length || 0) - selectedCount

        const placeholder = !isProductsForLinkingData
          ? 'No Product For Linking'
          : leftCount === 0
            ? 'All products selected'
            : selectedCount === 0
              ? 'Search products...'
              : `Search ${leftCount} remaining ${leftCount === 1 ? 'product' : 'products'}...`

        return (
          <field.ComboboxField
            label={label}
            placeholder={placeholder}
            items={productsForLinking || []}
            initialValue={initialValue ?? undefined}
            disabled={!isProductsForLinkingData}
          />
        )
      }}
    </form.AppField>
  )
}
