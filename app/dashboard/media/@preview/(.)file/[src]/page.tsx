import { MediaPreviewFileSlot } from '@/views/media'

export async function generateMetadata({
  params,
}: PageProps<'/dashboard/media/file/[src]'>) {
  const src = decodeURI((await params).src)

  return {
    title: src,
  }
}

export default async function MediaPreviewFile({
  params,
}: PageProps<'/dashboard/media/file/[src]'>) {
  const src = decodeURI((await params).src)

  return <MediaPreviewFileSlot src={src} />
}
