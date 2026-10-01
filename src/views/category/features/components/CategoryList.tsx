'use client'

import { ListTreeIcon } from 'lucide-react'

import {
  type CategoryTreeNode,
  type TGetCategoriesResponse,
  categoryErrors,
} from '../../shared'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { CategoryNode } from './ui/CategoryNode'

type CategoryListProps = {
  categoriesData: TGetCategoriesResponse
  categoriesTreeData: CategoryTreeNode[]
}
export function CategoryList({
  categoriesData,
  categoriesTreeData,
}: CategoryListProps) {
  const { success } = categoriesData

  return success && categoriesData.categories.length > 0 ? (
    <CategoryTree categoriesTreeData={categoriesTreeData} />
  ) : (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListTreeIcon />
        </EmptyMedia>
        <EmptyTitle>
          {!success && categoriesData?.errors?.code
            ? categoryErrors[categoriesData.errors.code].client
            : 'Empty Category, Create A New Category.'}
        </EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any categories yet. You can start by creating
          your first category from the{' '}
          <span className="font-medium">&quot;Add New Category&quot;</span>{' '}
          form.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

type CategoryTreeProps = {
  categoriesTreeData: CategoryTreeNode[]
}
function CategoryTree({ categoriesTreeData }: CategoryTreeProps) {
  return (
    <div>
      <h1 className="mb-6 font-medium">Category Tree List</h1>

      <ul className="pl-6">
        {categoriesTreeData.map(node => (
          <CategoryNode key={node.id} node={node} />
        ))}
      </ul>
    </div>
  )
}
