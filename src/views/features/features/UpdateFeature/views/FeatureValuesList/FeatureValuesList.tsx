import { type TGetFeatureLookupResponse } from '../../../../shared'

import { FeatureValuesListTable } from './components/FeatureValuesListTable'

type FeatureValuesListProps = { featureData: TGetFeatureLookupResponse }
export async function FeatureValuesList({
  featureData,
}: FeatureValuesListProps) {
  return (
    <div>
      <div>
        <h1 className="mb-6 font-medium">Values Table</h1>

        <FeatureValuesListTable featureData={featureData} />
      </div>
    </div>
  )
}
