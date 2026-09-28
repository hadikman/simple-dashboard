import { DashboardLayout } from '@/layout/DashboardLayout'

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <DashboardLayout>{children}</DashboardLayout>
}
