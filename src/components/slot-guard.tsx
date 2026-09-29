import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

type SlotGuardProps = {
  title?: string
  description?: string
  backHref: string
  backLabel?: string
  icon?: React.ReactNode
}
export function SlotGuard({
  title = 'This view cannot be opened directly',
  description = 'This panel is part of a contextual modal flow. Please open it from the main page.',
  backHref,
  backLabel = 'Go back',
  icon = <AlertTriangle />,
}: SlotGuardProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
        <div className="mt-4">
          <Link
            href={backHref}
            className="hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition"
          >
            {backLabel}
          </Link>
        </div>
      </EmptyHeader>
    </Empty>
  )
}
