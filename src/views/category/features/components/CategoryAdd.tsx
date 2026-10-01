'use client'

import React from 'react'
import { toast } from 'sonner'
import z from 'zod'

import {
  type FlatCategoryNode,
  addCategoryAction,
  categoryErrors,
  useCategoryStore,
} from '../../shared'

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
import { withMinDelay } from '@/helpers/utils'
import { useAppForm } from '@/hooks/create-react-form-hook'

const NewCategorySchema = z.object({
  name: z.string().trim().min(1, 'The value is required.'),
  parent_id: z.string().trim().nullable(),
})
type NewCategorySchemaT = z.input<typeof NewCategorySchema>
const defaultValues: NewCategorySchemaT = { name: '', parent_id: null }

type CategoryAddProps = { flattenedCategoriesData: FlatCategoryNode[] }
export function CategoryAdd({ flattenedCategoriesData }: CategoryAddProps) {
  const categoryGroup = useCategoryStore(s => s.categoryGroup)
  const placeholder =
    categoryGroup === 'posts' ? 'e.g. Graphic Article' : 'e.g. Graphic'

  const isEmptyCategories = flattenedCategoriesData?.length === 0

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: NewCategorySchema,
    },
    onSubmit: async props => {
      const formData = new FormData()
      const { name, parent_id } = NewCategorySchema.parse(props.value)

      let extractedParent

      // Basic Information
      formData.append('category_group', categoryGroup)
      formData.append('name', name)

      if (parent_id) {
        formData.append('parentId', parent_id)
      }

      const result = await toast
        .promise(withMinDelay(addCategoryAction(formData), 500), {
          loading: 'Adding category...',
          error: 'Failed to add category. Please try again.',
        })
        .unwrap()

      if (result.success) {
        toast.success(`The ${name} has been added`, {
          description: parent ? (
            <p>
              The category: {extractedParent} &gt; {name}
            </p>
          ) : null,
          duration: 1200,
        })
        form.reset()
      } else {
        toast.error('Failure to create a new category', {
          description: result.errors.code
            ? categoryErrors[result.errors.code].client
            : 'Please try again!',
          duration: 3000,
        })
      }
    },
  })

  return (
    <FieldSet>
      <FieldLegend>Add New Category</FieldLegend>
      <FieldDescription>Fill the following fields</FieldDescription>
      <form id="new-category-form" onSubmit={e => e.preventDefault()}>
        <FieldGroup className="select-none">
          <form.AppField name="name">
            {field => (
              <field.TextField
                label="Category"
                placeholder={placeholder}
                data-required
              />
            )}
          </form.AppField>
          <form.AppField name="parent_id">
            {field => {
              const placeholder = isEmptyCategories
                ? 'No Category'
                : `↓ ${flattenedCategoriesData[0].name}`

              return (
                <field.SelectField
                  label="Select Parent Category"
                  placeholder={placeholder}
                  disabled={isEmptyCategories}
                  renderItems={
                    <>
                      <SelectSeparator />
                      <SelectGroup>
                        {flattenedCategoriesData.map(({ id, name, depth }) => {
                          return (
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
                          )
                        })}
                      </SelectGroup>
                    </>
                  }
                />
              )
            }}
          </form.AppField>

          <Field orientation="responsive">
            <form.AppForm>
              <form.SubscribeButton form="new-category-form" label="Add" />
            </form.AppForm>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  )
}
