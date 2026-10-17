import React from 'react'

import {
  buildFlattenedCategoriesList,
  processCategoriesData,
  queryCategories,
} from '@/views/category'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { queryFeature } from './query-feature'
import { FeatureProperties } from './views/FeatureProperties/FeatureProperties'
import { FeatureValues } from './views/FeatureValues'

export function UpdateFeaturePage({ slug }: { slug: string }) {
  const featureData = React.use(queryFeature({ slug }))
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )

  const categories = categoriesData.success ? categoriesData.categories : []
  const processedCategoriesData = processCategoriesData(categories)
  const flattenedCategoriesData = buildFlattenedCategoriesList(
    processedCategoriesData,
  )

  return (
    <FieldSet>
      <FieldLegend>
        Edit {featureData.success ? featureData.feature.name : ''} Feature
      </FieldLegend>
      <FieldDescription>Fill the desire fields</FieldDescription>

      <FieldGroup className="lg:grid lg:grid-cols-[1fr_var(--container-xs)]">
        <React.Suspense fallback={<Spinner />}>
          <FeatureValues featureData={featureData} />
        </React.Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>Edit the desire fields</CardDescription>
          </CardHeader>
          <CardContent>
            <React.Suspense fallback={<Spinner />}>
              <FeatureProperties
                featureData={featureData}
                flattenedCategoriesData={flattenedCategoriesData}
              />
            </React.Suspense>
          </CardContent>
        </Card>
      </FieldGroup>
    </FieldSet>
  )
}
