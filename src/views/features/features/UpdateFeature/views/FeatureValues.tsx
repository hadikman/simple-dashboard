import { type TGetFeatureLookupResponse } from '../../../shared'

import { EmptyView } from '@/components/empty-view'
import { Separator } from '@/components/ui/separator'
import { AddFeatureValue } from './AddFeatureValue/AddFeatureValue'
import { FeatureValuesTable } from './ViewFeatureValues/FeatureValuesTable'

type FeatureValuesProps = { featureData: TGetFeatureLookupResponse }
export function FeatureValues({ featureData }: FeatureValuesProps) {
  const isFeatureValues =
    featureData.success && !!featureData.feature.values.length

  return (
    <div>
      <AddFeatureValue featureData={featureData} />
      <Separator className="my-5" />
      {isFeatureValues ? (
        <div>
          <h1 className="mb-6 font-medium">Values Table</h1>
          <FeatureValuesTable featureData={featureData} />
        </div>
      ) : (
        <EmptyView
          title="Empty Feature Values, Add A New Value."
          featureName="feature value"
          formName="value"
        />
      )}
    </div>
  )
}
