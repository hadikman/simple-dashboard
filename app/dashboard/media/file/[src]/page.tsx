import { SlotGuard } from '@/components/slot-guard'

const PLACEHOLDER = '__placeholder__'

export async function generateStaticParams() {
  return [{ src: PLACEHOLDER }]
}

export async function generateMetadata({
  params,
}: PageProps<'/dashboard/media/file/[src]'>) {
  const src = decodeURI((await params).src)

  return {
    title: src,
  }
}

export default function MediaFile() {
  return (
    <SlotGuard
      title="Direct access not supported"
      description="This preview panel is part of a modal flow and cannot be accessed directly. Please open a file from the media library."
      backLabel="Go to Media Library"
      backHref={'/dashboard/media'}
    />
  )
}
