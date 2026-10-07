import { BananaIcon } from 'lucide-react'

import { capitalizeWords } from '@/helpers/utils'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty'

type EmptyViewProps = {
  formName: string
  featureName: string
  title: string
}
export function EmptyView({ featureName, formName, title }: EmptyViewProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BananaIcon />
        </EmptyMedia>
        <EmptyTitle>
          {title ||
            `Empty ${capitalizeWords(featureName)}s, Create A New ${capitalizeWords(featureName)}.`}
        </EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any {featureName} yet. You can start by
          creating your first {featureName} from the{' '}
          <span className="font-medium">
            &quot;{capitalizeWords(formName)}&quot;
          </span>{' '}
          form.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
