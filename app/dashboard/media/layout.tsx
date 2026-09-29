import { MediaStoresProvider } from '@/views/media'

export default function MediaLayout({
  children,
  preview,
}: Readonly<{
  children: React.ReactNode
  preview: React.ReactNode
}>) {
  return (
    <MediaStoresProvider>
      {children}
      {preview}
    </MediaStoresProvider>
  )
}
