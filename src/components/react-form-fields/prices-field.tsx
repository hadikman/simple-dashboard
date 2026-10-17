import {
  LockIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { toast } from 'sonner'
import z from 'zod'

import type { AnyFieldApi } from '@tanstack/react-form'

import {
  type PriceItem,
  type PricePropSchema,
  type Prices,
  type ProductFormT,
  CURRENCY_OPTIONS,
} from '@/views/product'

import { PricesPlaceholder } from '@/components/placeholders/prices-placeholder'
import { AutocompleteInputAddon } from '@/components/ui/autocomplete'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroupAddon } from '@/components/ui/input-group'
import {
  SelectGroup,
  SelectItem,
  SelectSeparator,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { normalizeSlug } from '@/helpers/utils'
import { useFieldContext } from '@/hooks/create-react-form-hook'

type SelectedCategoryType = { id: string; value: string }[]

type Props = {
  initialCurrencyValue?: string
  form: ProductFormT
  selectedCategory?: SelectedCategoryType
}

export function PricesField({
  initialCurrencyValue,
  form,
  selectedCategory,
}: Props) {
  const field = useFieldContext<Prices>()

  const current = field.state.value ?? []
  const pricesTree = buildPricesTree(current)

  const indexById = new Map<string, number>()
  for (let i = 0; i < current.length; i++) {
    indexById.set(current[i].id, i)
  }

  function addRootVariation() {
    field.pushValue(
      createPriceItem({
        depth: 0,
        parent_id: '',
      }),
    )
  }

  function addChildVariation(parentId: string, parentDepth: number) {
    field.pushValue(
      createPriceItem({
        parent_id: parentId,
        depth: parentDepth + 1,
      }),
    )
  }

  function removeVariation(itemId: string) {
    const idsToRemove = new Set([itemId, ...getDescendantIds(current, itemId)])

    const indicesToRemove = current
      .map((item, index) => (idsToRemove.has(item.id) ? index : -1))
      .filter(index => index !== -1)
      .sort((a, b) => b - a)

    for (let i = 0; i < indicesToRemove.length; i++) {
      field.removeValue(indicesToRemove[i])
    }
  }

  function renderNode(node: PricesTreeNode): React.ReactNode {
    const { id, depth, children } = node

    const index = indexById.get(id)
    if (index === undefined) return null

    const isSinglePrice = indexById.size <= 1
    const isRoot = depth === 0
    const hasChildren = children.length === 0

    return (
      <FieldGroup
        data-is-root={isRoot && !hasChildren}
        className="data-[is-root=true]:mb-8"
        key={id}
      >
        <PriceRow
          form={form}
          field={field}
          index={index}
          node={node}
          selectedCategory={selectedCategory}
          isSinglePrice={isSinglePrice}
          onAddChild={addChildVariation}
          onRemove={removeVariation}
        />

        {children.map(child => renderNode(child))}
      </FieldGroup>
    )
  }

  return (
    <FieldGroup>
      <AddRootVarition
        initialCurrencyValue={initialCurrencyValue}
        form={form}
        onAddRootVariation={addRootVariation}
      />

      <FieldSet className="overflow-x-auto p-2">
        {pricesTree.length === 0 ? (
          <PricesPlaceholder />
        ) : (
          pricesTree.map(node => renderNode(node))
        )}
      </FieldSet>

      {current.length > 3 ? (
        <AddRootVarition
          initialCurrencyValue={initialCurrencyValue}
          form={form}
          onAddRootVariation={addRootVariation}
        />
      ) : null}
    </FieldGroup>
  )
}

type AddRootVaritionProps = {
  initialCurrencyValue?: string
  form: ProductFormT
  onAddRootVariation: () => void
}
function AddRootVarition({
  initialCurrencyValue,
  form,
  onAddRootVariation,
}: AddRootVaritionProps) {
  return (
    <Field orientation="responsive">
      <form.AppField name="pricing.currency">
        {field => (
          <field.SelectField
            fieldClassName="ms-auto"
            initialValue={initialCurrencyValue}
            placeholder={`${CURRENCY_OPTIONS[0][1].sign} ${CURRENCY_OPTIONS[0][1].label}`}
            selectTriggerSize="sm"
            renderItems={
              <>
                <SelectSeparator />
                <SelectGroup>
                  {CURRENCY_OPTIONS.map(([code, { sign, label }]) => (
                    <SelectItem key={code} value={code}>
                      {sign} {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            }
          />
        )}
      </form.AppField>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddRootVariation}
      >
        <PlusIcon className="me-1" />
        Add Root Variation
      </Button>
    </Field>
  )
}

export type PricesTreeNode = PriceItem & {
  children: PricesTreeNode[]
  isLocked: boolean
  hasLockedDescendant: boolean
  lockedDescendantOffers: string[]
  hasGuaranteeDescendant: boolean
  guaranteeDescendantNames: string[]
}
type PriceRowProps = {
  form: ProductFormT
  field: AnyFieldApi
  index: number
  node: PricesTreeNode
  selectedCategory?: SelectedCategoryType
  isSinglePrice: boolean
  onAddChild: (parentId: string, parentDepth: number) => void
  onRemove: (itemId: string) => void
}
function PriceRow(props: PriceRowProps) {
  const {
    form,
    field,
    index,
    node,
    selectedCategory,
    isSinglePrice,
    onAddChild,
    onRemove,
  } = props

  const baseName = `pricing.prices[${index}]` as const
  const {
    id,
    depth,
    children,
    offer_name,
    offer_discount,
    lockedDescendantOffers,
    guarantee_name,
    guaranteeDescendantNames,
    isLocked,
    hasLockedDescendant,
    hasGuaranteeDescendant,
  } = node

  const isLeaf = children.length === 0
  const isDisabled = !isLeaf

  const isDeleteDisabled = isLocked || hasLockedDescendant

  async function handleRemove() {
    const guaranteeWarningMessage =
      guarantee_name || hasGuaranteeDescendant ? (
        <Badge
          variant="secondary"
          className="mt-2 rounded-sm whitespace-normal"
        >
          {guarantee_name &&
            `This price is part of the (${guarantee_name}) guarantee. Deleting it will also remove it from the guarantee.`}
          {hasGuaranteeDescendant &&
            `Contains nested prices part of guarantee(s): ${guaranteeDescendantNames.join(', ')}. Deleting will also remove them from the guarantee(s).`}
        </Badge>
      ) : null

    const confirm = () => {
      return new Promise(resolve => {
        toast(`Removing ${node.name}`, {
          description: (
            <div className="grid">
              <span>Are you sure you want to remove this price?</span>
              <span>You won’t be able to undo this action.</span>
              {guaranteeWarningMessage}
            </div>
          ),
          actionButtonStyle: { marginInlineStart: '0px' },
          action: {
            label: 'Yes',
            onClick: () => resolve(true),
          },
          cancel: {
            label: 'No',
            onClick: () => resolve(false),
          },
          onAutoClose: () => resolve(false),
          onDismiss: () => resolve(false),
        })
      })
    }
    const confirmed = await confirm()
    if (!confirmed) return

    onRemove(id)
  }

  // When updating styles here, remember to apply the same changes to placeholder component styles.
  return (
    <FieldGroup
      className="lg:flex-row lg:items-start [&_input]:h-8"
      style={{ marginInlineStart: `${depth * 24}px` }}
    >
      <form.AppField name={`${baseName}.name`}>
        {field => (
          <field.AutocompleteField
            fieldClassName="lg:min-w-25"
            label="Name"
            items={selectedCategory ?? []}
            required={isSinglePrice ? undefined : true}
            showTrigger
            showClear
            renderAutocompleteInputAddon={
              guarantee_name ? (
                <AutocompleteInputAddon align="inline-end">
                  <Tooltip delayDuration={80}>
                    <TooltipTrigger asChild>
                      <ShieldCheckIcon />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      This price is part of the{' '}
                      <span className="font-semibold">{guarantee_name}</span>{' '}
                      guarantee.{' '}
                      <Link
                        className="font-semibold tracking-wide"
                        href={`/dashboard/products/guarantees/${normalizeSlug(guarantee_name)}`}
                      >
                        View guarantee
                      </Link>
                    </TooltipContent>
                  </Tooltip>
                </AutocompleteInputAddon>
              ) : null
            }
          />
        )}
      </form.AppField>
      <form.AppField name={`${baseName}.price`}>
        {field => (
          <field.NumberField
            fieldClassName="lg:w-25 sm:shrink-0"
            label="Price"
            min={0}
            step="any"
            data-required={!isDisabled}
            disabledLabel={isDisabled || isLocked}
            disabled={isDisabled || isLocked}
          />
        )}
      </form.AppField>
      <form.AppField name={`${baseName}.discount`}>
        {field => (
          <field.NumberField
            fieldClassName="lg:w-25 sm:shrink-0"
            label="Discount %"
            min={0}
            max={99.99}
            step="any"
            disabledLabel={isDisabled || isLocked}
            disabled={isDisabled || isLocked}
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
            renderInputGroupAddon={
              isLocked ? (
                <InputGroupAddon align="inline-end">
                  <Tooltip delayDuration={80}>
                    <TooltipTrigger asChild>
                      <LockIcon />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Locked by{' '}
                      <span className="font-semibold">{offer_name}</span>,{' '}
                      <span className="font-semibold">{offer_discount}</span>
                      %.{' '}
                      <Link
                        className="font-semibold tracking-wide"
                        href={`/dashboard/products/offers/${normalizeSlug(offer_name)}`}
                      >
                        Unlock
                      </Link>
                    </TooltipContent>
                  </Tooltip>
                </InputGroupAddon>
              ) : null
            }
          />
        )}
      </form.AppField>
      <form.AppField name={`${baseName}.offer`}>
        {field => (
          <field.TextareaField
            fieldClassName="lg:min-w-25"
            className="field-sizing-fixed min-h-8"
            label="Offer"
            rows={1}
            disabledLabel={isDisabled}
            disabled={isDisabled}
          />
        )}
      </form.AppField>

      <PropsEditor
        form={form}
        field={field}
        itemIndex={index}
        isDisabled={isDisabled}
      />

      <Field className="lg:w-max">
        <TooltipProvider delayDuration={100}>
          <ButtonGroup
            className="[&>[data-slot=button-group-item]:not(:first-child)>[data-slot=button]]:rounded-t-none [&>[data-slot=button-group-item]:not(:first-child)>[data-slot=button]]:border-t-0 [&>[data-slot=button-group-item]:not(:last-child)>[data-slot=button]]:rounded-b-none"
            orientation="vertical"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  data-slot="button-group-item"
                  className="inline-flex max-lg:w-full"
                >
                  <Button
                    className="max-lg:w-full"
                    type="button"
                    variant={isLeaf ? 'outline' : 'ghost'}
                    size="icon-sm"
                    disabled={isLocked}
                    onClick={() => onAddChild(id, depth)}
                  >
                    <PlusIcon />
                  </Button>
                </span>
              </TooltipTrigger>
              {isLocked && (
                <TooltipContent side="left">
                  Adding child is disabled. This variation is locked by active
                  offer.
                </TooltipContent>
              )}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  data-slot="button-group-item"
                  className="inline-flex max-lg:w-full"
                >
                  <Button
                    className="max-lg:w-full"
                    type="button"
                    variant={isLeaf ? 'outline' : 'ghost'}
                    size="icon-sm"
                    disabled={isDeleteDisabled}
                    onClick={handleRemove}
                  >
                    <Trash2Icon />
                  </Button>
                </span>
              </TooltipTrigger>
              {isDeleteDisabled && (
                <TooltipContent side="left">
                  {isLocked ? (
                    'Cannot delete. This price is locked by active offer.'
                  ) : (
                    <span className="grid">
                      <span>
                        Cannot delete. Contains nested prices locked by
                        offer(s):
                      </span>
                      <span className="font-semibold">
                        {lockedDescendantOffers.join(', ')}
                      </span>
                    </span>
                  )}
                </TooltipContent>
              )}
            </Tooltip>
          </ButtonGroup>
        </TooltipProvider>
      </Field>
    </FieldGroup>
  )
}

type PropsEditorProps = {
  form: ProductFormT
  field: AnyFieldApi
  itemIndex: number
  isDisabled: boolean
}
function PropsEditor({ form, field, itemIndex, isDisabled }: PropsEditorProps) {
  const props: PricesProp[] = React.useMemo(
    () => field.state.value[itemIndex]?.props ?? [],
    [field.state.value, itemIndex],
  )

  const addProp = React.useCallback(() => {
    const current = [...(field.state.value[itemIndex]?.props ?? [])]

    current.push(createPricesProp())
    const items = [...field.state.value]
    items[itemIndex] = {
      ...items[itemIndex],
      props: current,
    }

    field.handleChange(items)
  }, [field, itemIndex])

  const removeProp = React.useCallback(
    (propIndex: number) => {
      const current = [...(field.state.value[itemIndex]?.props ?? [])]

      current.splice(propIndex, 1)
      const items = [...field.state.value]
      items[itemIndex] = {
        ...items[itemIndex],
        props: current,
      }

      field.handleChange(items)
    },
    [field, itemIndex],
  )

  return (
    <Field className="lg:min-w-60">
      <FieldLabel
        data-is-disabled={isDisabled}
        className="data-[is-disabled=true]:text-muted flex justify-between"
      >
        Add Property
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={addProp}
          disabled={isDisabled}
        >
          <PlusIcon />
        </Button>
      </FieldLabel>

      {!isDisabled ? (
        props.length ? (
          props.map((_, propIndex) => (
            <FieldGroup
              key={propIndex}
              className="-mt-1 flex-row items-center gap-2"
            >
              <form.AppField
                name={`pricing.prices[${itemIndex}].props[${propIndex}].title`}
              >
                {field => (
                  <field.TextField
                    className="h-8"
                    label=""
                    placeholder="Color"
                    disabled={isDisabled}
                  />
                )}
              </form.AppField>

              <form.AppField
                name={`pricing.prices[${itemIndex}].props[${propIndex}].values`}
              >
                {field => (
                  <field.TextField
                    className="h-8"
                    label=""
                    placeholder="Black"
                    disabled={isDisabled}
                  />
                )}
              </form.AppField>

              <Field className="w-max" orientation="horizontal">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  title="Remove property"
                  onClick={() => removeProp(propIndex)}
                >
                  <XIcon />
                </Button>
              </Field>
            </FieldGroup>
          ))
        ) : (
          <AddPropertyPlaceholder />
        )
      ) : (
        <AddPropertyPlaceholder />
      )}
    </Field>
  )
}

function AddPropertyPlaceholder() {
  return (
    <FieldGroup className="-mt-1 flex-row items-center gap-2">
      <Input name="props-title" className="h-8" placeholder="Color" disabled />
      <Input name="props-value" className="h-8" placeholder="Black" disabled />
      <Field className="w-max" orientation="horizontal">
        <Button variant="ghost" size="icon-xs" disabled>
          <XIcon />
        </Button>
      </Field>
    </FieldGroup>
  )
}

export function buildPricesTree(items: PriceItem[]): PricesTreeNode[] {
  const nodeMap = new Map<string, PricesTreeNode>()
  const roots: PricesTreeNode[] = []

  // Create all nodes once
  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    nodeMap.set(item.id, {
      id: item.id,
      parent_id: item.parent_id,
      offer_id: item.offer_id,
      guarantee_id: item.guarantee_id,
      name: item.name,
      offer_name: item.offer_name,
      guarantee_name: item.guarantee_name,
      price: item.price,
      discount: item.discount,
      offer_discount: item.offer_discount,
      offer: item.offer,
      props: item.props,
      children: [],
      depth: 0,
      isLocked: false,
      hasLockedDescendant: false,
      lockedDescendantOffers: [],
      hasGuaranteeDescendant: false,
      guaranteeDescendantNames: [],
    })
  }

  // Link parent -> child
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const node = nodeMap.get(item.id)!
    const parentId = item.parent_id

    if (!parentId || parentId === item.id) {
      roots.push(node)
      continue
    }

    const parent = nodeMap.get(parentId)

    if (!parent) {
      roots.push(node)
      continue
    }

    parent.children.push(node)
  }

  // Set depth with BFS and protect against cycles
  const queue: { node: PricesTreeNode; depth: number }[] = []
  for (let i = 0; i < roots.length; i++) {
    queue.push({ node: roots[i], depth: 0 })
  }

  const visited = new Set<string>()
  let idx = 0

  while (idx < queue.length) {
    const { node, depth } = queue[idx++]

    if (visited.has(node.id)) continue
    visited.add(node.id)

    node.depth = depth

    for (let i = 0; i < node.children.length; i++) {
      queue.push({
        node: node.children[i],
        depth: depth + 1,
      })
    }
  }

  for (let i = 0; i < roots.length; i++) {
    enrichLockState(roots[i])
  }

  return roots
}

function enrichLockState(node: PricesTreeNode): {
  hasLocked: boolean
  offers: Set<string>
  hasGuarantee: boolean
  guarantees: Set<string>
} {
  const uniqueOffers = new Set<string>()
  const uniqueGuarantees = new Set<string>()
  let hasLocked = false
  let hasGuarantee = false

  node.isLocked = !!node.offer_id
  if (node.isLocked && node.offer_name) {
    uniqueOffers.add(node.offer_name)
  }
  if (node.guarantee_name) {
    uniqueGuarantees.add(node.guarantee_name)
  }

  const children = node.children
  for (let i = 0; i < children.length; i++) {
    const childResult = enrichLockState(children[i])
    if (childResult.hasLocked || children[i].isLocked) {
      hasLocked = true
    }
    if (childResult.hasGuarantee || !!children[i].guarantee_name) {
      hasGuarantee = true
    }
    childResult.offers.forEach(o => uniqueOffers.add(o))
    childResult.guarantees.forEach(g => uniqueGuarantees.add(g))
  }

  node.hasLockedDescendant = hasLocked
  node.hasGuaranteeDescendant = hasGuarantee

  const descendantOffers = new Set(uniqueOffers)
  if (node.isLocked && node.offer_name) {
    descendantOffers.delete(node.offer_name)
  }
  node.lockedDescendantOffers = Array.from(descendantOffers)

  const descendantGuarantees = new Set(uniqueGuarantees)
  if (node.guarantee_name) {
    descendantGuarantees.delete(node.guarantee_name)
  }
  node.guaranteeDescendantNames = Array.from(descendantGuarantees)

  return {
    hasLocked: hasLocked || node.isLocked,
    offers: uniqueOffers,
    hasGuarantee: hasGuarantee || !!node.guarantee_name,
    guarantees: uniqueGuarantees,
  }
}

function createPriceItem(overrides: Partial<PriceItem> = {}): PriceItem {
  return {
    id: crypto.randomUUID().split('-')[0],
    parent_id: '',
    offer_id: null,
    guarantee_id: null,
    name: '',
    offer_name: '',
    guarantee_name: '',
    depth: 0,
    price: 0,
    offer_discount: 0,
    discount: 0,
    offer: '',
    props: [],
    ...overrides,
  }
}

// Helper functions for the form
export function getDescendantIds(
  items: PriceItem[],
  parentId: string,
): string[] {
  const result: string[] = []
  const stack = [parentId]
  const visited = new Set<string>([parentId])

  const childrenMap = new Map<string, string[]>()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item.parent_id) continue

    const existing = childrenMap.get(item.parent_id)
    if (existing) {
      existing.push(item.id)
    } else {
      childrenMap.set(item.parent_id, [item.id])
    }
  }

  while (stack.length > 0) {
    const currentId = stack.pop()!
    const children = childrenMap.get(currentId) ?? []

    for (let i = 0; i < children.length; i++) {
      const childId = children[i]

      if (visited.has(childId)) continue
      visited.add(childId)

      result.push(childId)
      stack.push(childId)
    }
  }

  return result
}

type PricesProp = z.infer<typeof PricePropSchema>
function createPricesProp(overrides: Partial<PricesProp> = {}): PricesProp {
  return {
    title: '',
    values: '',
    ...overrides,
  }
}
