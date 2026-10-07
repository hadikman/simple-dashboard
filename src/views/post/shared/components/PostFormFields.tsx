'use client'

import { ArrowUpIcon, CheckIcon } from 'lucide-react'
import React from 'react'

import {
  getCategoryPlaceholder,
  resolveParentChildConflicts,
  type FlatCategoryNode,
} from '@/views/category'

import {
  postErrors,
  queryDuplicatePost,
  type ComboboxItemType,
  type FlatCategoryNodeWithTitle,
  type PostFormT,
  type TPostLookupDataWithIdCategoriesWithTitle,
  type TPostsForLinkingResponse,
} from '../../shared'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ComboboxItem } from '@/components/ui/combobox'
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { normalizeSlug } from '@/helpers/utils'

export type PostFormFieldsPublicProps = {
  isCreate: boolean
  isCategoriesData: boolean
  isPostsForLinkingData: boolean
  flattenedCategoriesData: FlatCategoryNode[]
  postsForLinking: TPostsForLinkingResponse[]
  initialValues: TPostLookupDataWithIdCategoriesWithTitle
  mediaHref: string
  mediaKey: string
  thumbnailImages: string[]
  setThumbnailImages: (image: string) => void
  postGroupId?: string
  postSlug?: string
  isMobile: boolean
}

// Internal props — form is injected by PostForm
type PostFormFieldsProps = PostFormFieldsPublicProps & {
  form: PostFormT
}

export function PostFormFields({
  form,
  isCreate,
  isCategoriesData,
  isPostsForLinkingData,
  flattenedCategoriesData,
  postsForLinking,
  initialValues,
  mediaHref,
  mediaKey,
  thumbnailImages,
  setThumbnailImages,
  postGroupId,
  postSlug,
  isMobile,
}: PostFormFieldsProps) {
  // Convert categories data { id, title } for the combobox
  const mappedCategories: FlatCategoryNodeWithTitle[] = []
  for (let i = 0; i < flattenedCategoriesData.length; i++) {
    const cat = flattenedCategoriesData[i]
    mappedCategories.push({
      id: cat.id,
      title: cat.name, // Maps original DB field to title for combobox compatibility
      depth: cat.depth,
      descendantIds: cat.descendantIds,
    })
  }

  return (
    <FieldGroup>
      {/* ── Title ─────────────────────────────────────── */}
      <form.AppField name="title">
        {field => (
          <field.TextField
            label="Title"
            placeholder="How to install GeForce RTX 5090"
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
                  if (!isCreate && v.value === postSlug) return

                  const result = await queryDuplicatePost({
                    ...(postGroupId && { postGroupId }),
                    slug: v.value,
                  })

                  if (result.isDuplicate) {
                    return {
                      type: 'error',
                      message: result.message.code
                        ? postErrors[result.message.code].client
                        : 'This post key already exists',
                    }
                  }
                },
              }}
            >
              {field => (
                <field.TextField
                  label="Key"
                  placeholder={`e.g. ${suggestion || 'how-to-install-rtx-5090'}`}
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

      {/* ── Categories + Excerpt ──────────────────────── */}
      <FieldGroup className="sm:grid sm:grid-cols-2">
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

                  // Convert resolvedIds to a Set to reduce lookup time from O(N) to O(1)
                  const resolvedSet = new Set(resolvedIds)

                  // Map back from resolved IDs to { id, title } to fit the Zod validation schema
                  const finalMappedValues = []
                  for (let i = 0; i < mappedCategories.length; i++) {
                    const cat = mappedCategories[i]
                    if (resolvedSet.has(cat.id)) {
                      finalMappedValues.push({
                        id: cat.id,
                        title: cat.title,
                      })
                    }
                  }

                  field.handleChange(finalMappedValues)
                }}
                renderItems={item => {
                  const { id, title, depth, descendantIds } =
                    item as FlatCategoryNodeWithTitle
                  // Use item.descendantIds to check if option should be disabled
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

        <form.AppField name="excerpt">
          {field => (
            <field.TextareaField
              label="Excerpt"
              initialValue={isCreate ? undefined : initialValues.excerpt}
            />
          )}
        </form.AppField>
      </FieldGroup>

      {/* ── Content Editor ────────────────────────────── */}
      <form.AppField name="content">
        {field => (
          <field.EditorField
            label="Content"
            wrapperContentEditableClassName="min-h-120"
            {...(isCreate
              ? {}
              : {
                  initialJsonValue: initialValues.content?.json,
                  initialHtmlValue: initialValues.content?.html,
                  initialTextValue: initialValues.content?.text,
                })}
          />
        )}
      </form.AppField>

      <FieldSeparator />

      {/* ── Thumbnail ─────────────────────────────────── */}
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
              groupId: postGroupId!,
              slug: initialValues.slug!,
              status: initialValues.status!,
            })}
          />
        )}
      </form.AppField>

      <Separator className="my-8" />

      {/* ── Tabs ──────────────────────────────────────── */}
      <Tabs
        defaultValue="linked-posts"
        orientation={isMobile ? 'vertical' : 'horizontal'}
      >
        <TabsList>
          <TabsTrigger value="linked-posts">Linked Posts</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="linked-posts">
          <Card>
            <CardContent>
              <FieldSet>
                <FieldLegend>Linked Posts</FieldLegend>
                <FieldGroup>
                  <form.AppField name="linked_posts.related">
                    {field => {
                      const selectedCount = (field.state.value || []).length
                      const leftCount =
                        (postsForLinking?.length || 0) - selectedCount

                      const placeholder = !isPostsForLinkingData
                        ? 'No Post For Linking'
                        : leftCount === 0
                          ? 'All posts selected'
                          : selectedCount === 0
                            ? 'Search posts...'
                            : `Search ${leftCount} remaining ${leftCount === 1 ? 'post' : 'posts'}...`

                      return (
                        <field.ComboboxField
                          label="Related Posts"
                          placeholder={placeholder}
                          items={postsForLinking || []}
                          initialValue={initialValues.linked_posts?.related}
                          disabled={!isPostsForLinkingData}
                        />
                      )
                    }}
                  </form.AppField>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardContent>
              <FieldSet>
                <FieldLegend>Advanced</FieldLegend>
                <FieldGroup>
                  <form.AppField name="advanced.enable_comments">
                    {field => (
                      <field.CheckboxField
                        label="Enable Comments"
                        description="When enabled, users will be able to add comments."
                        initialValue={
                          isCreate
                            ? undefined
                            : initialValues.advanced?.enable_comments
                        }
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="advanced.scheduled_publish">
                    {field => (
                      <field.DateTimeRangeField
                        label="Scheduled Publish"
                        title="Scheduled Publish"
                        description="Select a scheduled publish date."
                        initialValue={
                          isCreate
                            ? undefined
                            : initialValues.advanced?.scheduled_publish ||
                              undefined
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
