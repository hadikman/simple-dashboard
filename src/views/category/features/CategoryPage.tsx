import React from 'react'

import {
  type CategoryGroupType,
  CategoryStoreProvider,
  buildCategoriesTreeList,
  buildFlattenedCategoriesList,
  processCategoriesData,
  queryCategories,
} from '../shared'

import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { CategoryAdd } from './components/CategoryAdd'
import { CategoryList } from './components/CategoryList'

type CategoryPageProps = {
  categoryGroup: CategoryGroupType
}
export function CategoryPage({ categoryGroup }: CategoryPageProps) {
  const categoriesData = React.use(
    queryCategories({ category_group: categoryGroup }),
  )

  const categories = categoriesData.success ? categoriesData.categories : []
  const processedCategoriesData = processCategoriesData(categories)

  const flattenedCategoryList = buildFlattenedCategoriesList(
    processedCategoriesData,
  )
  const categoryTreeList = buildCategoriesTreeList(processedCategoriesData)

  return (
    <CategoryStoreProvider initialValues={{ categoryGroup }}>
      <React.Suspense fallback={<Spinner />}>
        <CategoryAdd flattenedCategoriesData={flattenedCategoryList} />
        <Separator className="my-5" />
        <CategoryList
          categoriesData={categoriesData}
          categoriesTreeData={categoryTreeList}
        />
      </React.Suspense>
    </CategoryStoreProvider>
  )
}
