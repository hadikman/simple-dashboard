'use client'

import { Edit2Icon, MoreVerticalIcon, XIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import z from 'zod'

import {
  type TGetFeatureLookupResponse,
  featureErrors,
} from '../../../../../shared'

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
import {
  Table,
  TableBody,
  TableCell,
  TableCol,
  TableColgroup,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { withMinDelay } from '@/helpers/utils'
import { useAppForm } from '@/hooks/create-react-form-hook'

import { deleteFeatureValueAction } from '../delete-feature-value.action'
import { updateFeatureValueAction } from '../update-feature-value.action'

const FeatureValueSchema = z.object({
  value: z.string().trim().min(1, 'The value is required.'),
})
type FeatureValueSchemaT = z.input<typeof FeatureValueSchema>
const defaultValues: FeatureValueSchemaT = {
  value: '',
}
// TODO use TanStack Table
type FeatureValuesListTableProps = { featureData: TGetFeatureLookupResponse }
export function FeatureValuesListTable({
  featureData,
}: FeatureValuesListTableProps) {
  const { success } = featureData
  const [editId, setEditId] = React.useState<number>()

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: FeatureValueSchema,
    },
    onSubmit: async props => {
      if (!success) return

      const formData = new FormData()
      const { value } = FeatureValueSchema.parse(props.value)

      // Basic Information
      formData.append('featureId', featureData.feature.id)
      formData.append('id', `${editId}`)
      formData.append('value', value)

      const result = await toast
        .promise(withMinDelay(updateFeatureValueAction(formData), 500), {
          loading: 'Updating value...',
          error: 'Failed to update value. Please try again.',
        })
        .unwrap()

      if (result.success) {
        toast.success(`The ${value} has been updated`, {
          duration: 1200,
        })
        form.reset()
        setEditId(undefined)
      } else {
        toast.error('Failure to update value', {
          description: result.errors.code
            ? featureErrors[result.errors.code].client
            : 'Please try again!',
          duration: 3000,
        })
      }
    },
  })

  async function handleDelete(featureId: string, id: number, value: string) {
    if (
      !confirm(
        `Are you sure you want to delete ${value}?\nYou won’t be able to undo this action.`,
      )
    )
      return

    const result = await toast
      .promise(withMinDelay(deleteFeatureValueAction({ featureId, id }), 500), {
        loading: 'Deleting value...',
        error: 'Failed to delete value. Please try again.',
      })
      .unwrap()
    if (result.success) {
      toast.success(`The ${value} has been deleted`, {
        duration: 1200,
      })
      form.reset()
      setEditId(undefined)
    } else {
      toast.error('Failure to delete value', {
        description: result.errors.code
          ? featureErrors[result.errors.code].client
          : 'Please try again!',
        duration: 3000,
      })
    }
  }

  const hasValues = success && featureData.feature.values.length > 0

  return (
    <div className="@container/table">
      <Table className="w-full table-fixed border-spacing-0 [word-break:break-word]">
        {hasValues && (
          <TableColgroup>
            <TableCol className="w-auto" />
            <TableCol className="w-12" />
          </TableColgroup>
        )}
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead colSpan={hasValues ? 2 : 1}>
              Items{' '}
              <Badge
                data-no-value={
                  success && featureData.feature.values.length === 0
                }
                variant="secondary"
                className="data-[no-value=true]:text-neutral-400"
              >
                {success && featureData.feature.values.length}
              </Badge>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasValues ? (
            featureData.feature.values.map(({ id, value }) => (
              <TableRow key={id + value} className="h-13.5">
                <TableCell
                  data-edit={id === editId}
                  className="data-[edit=true]:flex data-[edit=true]:gap-2 data-[edit=true]:@max-xl/table:flex-col @max-md/table:whitespace-pre-wrap data-[edit=true]:@xl/table:items-center"
                >
                  {value}
                  {id === editId && (
                    <FieldSet className="w-full">
                      <form
                        id="update-value-form"
                        onSubmit={e => e.preventDefault()}
                      >
                        <FieldGroup className="flex flex-row gap-2 @xl/table:pl-4">
                          <form.AppField name="value">
                            {field => <field.TextField label="" />}
                          </form.AppField>
                          <Field
                            orientation="horizontal"
                            className="w-max items-center gap-0.5"
                          >
                            <form.AppForm>
                              <form.SubscribeButton
                                form="update-value-form"
                                label=""
                                variant="ghost"
                                size="icon-sm"
                                icon={<Edit2Icon />}
                              />
                              <form.SubscribeButton
                                form="update-value-form"
                                label=""
                                variant="ghost"
                                size="icon-sm"
                                type="reset"
                                icon={<XIcon />}
                                onClick={() => setEditId(undefined)}
                              />
                            </form.AppForm>
                          </Field>
                        </FieldGroup>
                      </form>
                    </FieldSet>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
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
                      <DropdownMenuItem onClick={() => setEditId(id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>Make a copy</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                          handleDelete(featureData.feature.id, id, value)
                        }
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="text-center">No results.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
