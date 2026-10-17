import { MediaStoresProvider } from '@/views/media'

export default function NewProductLayout({
  children,
  media,
}: Readonly<{
  children: React.ReactNode
  media: React.ReactNode
}>) {
  return (
    <MediaStoresProvider>
      {children}
      {media}
    </MediaStoresProvider>
  )
}
