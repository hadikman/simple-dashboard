import React from 'react'

import { queryCategories } from '@/views/category'

import { featureErrors, queryFeatures } from '../'

import { EmptyView } from '@/components/empty-view'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { FeatureAdd } from '../../features/AddFeature/AddFeature'
import { FeaturesTable } from '../../features/ViewFeatures/FeaturesTable'

export function AddViewFeaturesPage() {
  const featuresData = React.use(queryFeatures())
  const categoriesData = React.use(
    queryCategories({ category_group: 'products' }),
  )

  const isFeaturesData = featuresData.success

  return (
    <React.Suspense fallback={<Spinner />}>
      <FeatureAdd categoriesData={categoriesData} />
      <Separator className="my-5" />

      <div>
        <h1 className="mb-6 font-medium">Features Table</h1>

        {isFeaturesData ? (
          <FeaturesTable featuresData={featuresData.features} />
        ) : (
          <EmptyView
            title={
              !isFeaturesData && featuresData?.errors?.code
                ? featureErrors[featuresData.errors.code].client
                : 'Empty Products, Create A New Product.'
            }
            featureName="feature"
            formName="add feature"
          />
        )}
      </div>
    </React.Suspense>
  )
}
