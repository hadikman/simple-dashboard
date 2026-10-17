import { type TGetFeatureLookupResponse } from '../../../shared'

import { Separator } from '@/components/ui/separator'
import { FeatureValueAdd } from './FeatureValueAdd/FeatureValueAdd'
import { FeatureValuesList } from './FeatureValuesList/FeatureValuesList'

type FeatureValuesProps = { featureData: TGetFeatureLookupResponse }
export function FeatureValues({ featureData }: FeatureValuesProps) {
  return (
    <div>
      <FeatureValueAdd featureData={featureData} />
      <Separator className="my-5" />
      <FeatureValuesList featureData={featureData} />
    </div>
  )
}
