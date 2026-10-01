import {
  CheckIcon,
  ChevronDownIcon,
  MoreVerticalIcon,
  XIcon,
} from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import z from 'zod'

import {
  type CategoryTreeNode,
  categoryErrors,
  deleteCategoryAction,
  queryCategoriesUsedInGroup,
  queryDuplicateCategory,
  updateCategoryAction,
  useCategoryStore,
} from '../../../shared'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldGroup, FieldSet } from '@/components/ui/field'
import { withMinDelay } from '@/helpers/utils'
import { useAppForm } from '@/hooks/create-react-form-hook'

const CategoryValueSchema = z.object({
  value: z.string().trim().min(1, 'The value is required.'),
})
type CategoryValueSchemaT = z.input<typeof CategoryValueSchema>
const defaultValues: CategoryValueSchemaT = {
  value: '',
}

type CategoryNodeProps = {
  node: CategoryTreeNode
  parentId?: string
}
export function CategoryNode({ node, parentId }: CategoryNodeProps) {
  const categoryGroup = useCategoryStore(s => s.categoryGroup)
  const [showEdit, setShowEdit] = React.useState<boolean>(false)
  const { id, name, children, depth } = node

  const hasChildren = children.length > 0

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: CategoryValueSchema,
    },
    onSubmit: async props => {
      const formData = new FormData()
      const { value } = CategoryValueSchema.parse(props.value)

      // Basic Information
      formData.append('category_group', categoryGroup)
      formData.append('id', `${node.id}`)
      formData.append('name', node.name)
      formData.append('newName', value)

      // Optional Information
      if (parentId) {
        formData.append('parentId', parentId)
      }

      const result = await toast
        .promise(withMinDelay(updateCategoryAction(formData), 500), {
          loading: 'Updating category...',
          error: 'Failed to update category. Please try again.',
        })
        .unwrap()

      if (result.success) {
        toast.success(`The ${node.name} has been updated`, {
          duration: 1200,
        })
        form.reset()
        setShowEdit(false)
      } else {
        toast.error('Failure to update category', {
          description: result.errors.code
            ? categoryErrors[result.errors.code].client
            : 'Please try again!',
          duration: 3000,
        })
      }
    },
  })

  async function handleDelete() {
    const childrenId = node.children.map(c => c.id)
    const categoryAndSubCatsIds = [node.id].concat(childrenId)
    const sPlural = categoryAndSubCatsIds.length > 1 ? 'ies' : 'y'

    const checkResult = await toast
      .promise(
        withMinDelay(
          queryCategoriesUsedInGroup({
            category_group: categoryGroup,
            ids: categoryAndSubCatsIds,
          }),
          500,
        ),
        {
          loading: `Checking can delete categor${sPlural}...`,
          error: `Failed to checking can categor${sPlural}. Please try again.`,
          onDismiss: async info => {
            const resultToast = await info.promise
            if (resultToast.isDuplicate) return

            setTimeout(async () => {
              toast(`Deleting ${node.name}`, {
                description: (
                  <div className="grid">
                    <span>Are you sure you want to delete?</span>
                    <span>You won’t be able to undo this action.</span>
                  </div>
                ),
                actionButtonStyle: { marginInlineStart: '0px' },
                action: {
                  label: 'Yes',
                  onClick: async () => {
                    const result = await toast
                      .promise(
                        withMinDelay(
                          deleteCategoryAction({
                            category_group: categoryGroup,
                            parentId,
                            id: node.id,
                            name: node.name,
                            childrenId,
                          }),
                          500,
                        ),
                        {
                          loading: 'Deleting category...',
                          error: 'Failed to delete category. Please try again.',
                        },
                      )
                      .unwrap()

                    if (result.success) {
                      toast.success(`The ${node.name} has been deleted`, {
                        description:
                          childrenId && childrenId.length > 0 ? (
                            <p>All relevent sub category deleted too.</p>
                          ) : null,
                        duration: 1200,
                      })
                    } else {
                      toast.error(`Failure to delete the ${node.name}`, {
                        description: result.errors.code
                          ? categoryErrors[result.errors.code].client
                          : 'Please try again!',
                        duration: 3000,
                      })
                    }
                  },
                },
                cancel: { label: 'No', onClick: () => null },
                duration: 5000,
              })
            }, 150)
          },
        },
      )
      .unwrap()

    if (checkResult.isDuplicate) {
      toast.error(`Failure to delete the ${node.name} (or subcategories)`, {
        description: checkResult.message.code
          ? categoryErrors[checkResult.message.code].client
          : 'Please try again!',
        duration: 3000,
      })

      return
    }
  }

  return (
    <li
      data-has-children={hasChildren}
      className="group/item data-[has-children=false]:mb-0"
      style={{ marginBottom: `${depth === 0 ? 1 : 0}rem` }}
    >
      <div className="group/content flex items-center [--width:--spacing(4)]">
        {/* Tree Structure Elements */}
        <div className="flex items-center self-stretch">
          {/* Vertical Connector */}
          {((!hasChildren && depth === 0) || depth > 0) && (
            <div className="ml-[calc(var(--width)/2)] flex h-full w-px">
              <span className="bg-ring ml-auto h-full w-px" />
            </div>
          )}

          {/* Icon */}
          {hasChildren && depth === 0 && (
            <ChevronDownIcon className="text-ring z-1 w-(--width) bg-white" />
          )}

          {/* Horizontal Connector */}
          {(!hasChildren || depth > 0) && (
            <div
              className="flex h-full w-(--width) items-center"
              style={{ marginLeft: `${depth > 1 ? depth * 1 : 0}rem` }}
            >
              <span className="bg-ring h-px w-full" />
            </div>
          )}
        </div>

        <div
          data-show-edit={showEdit}
          className="hover:bg-muted data-[show-edit=true]:bg-muted flex w-full items-center justify-between rounded-sm px-[calc(var(--width)*0.75)] py-1 transition-[background-color]"
        >
          <div className="flex grow flex-wrap items-center justify-between gap-2">
            <div>
              {/* Label */}
              <span>{name}</span>
              {/* Badge */}
              {hasChildren && (
                <Badge className="ml-2" variant="outline">
                  {children.length}
                </Badge>
              )}
            </div>

            {showEdit && (
              <FieldSet className="w-full max-w-3xs">
                <form
                  id="update-category-form"
                  onSubmit={e => e.preventDefault()}
                >
                  <FieldGroup className="flex flex-col gap-2 sm:flex-row">
                    <form.AppField
                      name="value"
                      validators={{
                        onChangeAsyncDebounceMs: 1500,
                        onChangeAsync: async v => {
                          if (!v.value) return

                          if (v.value === name) {
                            return
                          }

                          const result = await queryDuplicateCategory({
                            category_group: categoryGroup,
                            parentId,
                            name: v.value,
                          })

                          if (result.isDuplicate) {
                            return {
                              type: 'error',
                              message: '', // Just need red visual error
                            }
                          }
                        },
                      }}
                    >
                      {field => (
                        <field.TextField className="h-auto bg-white" label="" />
                      )}
                    </form.AppField>
                    <Field
                      orientation="horizontal"
                      className="w-max items-center gap-0.5"
                    >
                      <form.AppForm>
                        <form.SubscribeButton
                          form="update-category-form"
                          label=""
                          variant="ghost"
                          size="icon-sm"
                          icon={<CheckIcon />}
                        />
                        <form.SubscribeButton
                          form="update-category-form"
                          label=""
                          variant="ghost"
                          size="icon-sm"
                          type="reset"
                          icon={<XIcon />}
                          onClick={() => setShowEdit(!showEdit)}
                        />
                      </form.AppForm>
                    </Field>
                  </FieldGroup>
                </form>
              </FieldSet>
            )}
          </div>

          <div>
            <DropdownMenu
              onOpenChange={() => {
                form.reset()
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-muted text-muted-foreground size-8"
                  size="icon"
                >
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete()}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {hasChildren && (
        <ul>
          {children.map(child => (
            <CategoryNode key={child.id} parentId={id} node={child} />
          ))}
        </ul>
      )}
    </li>
  )
}
