'use client'

import { usePathname } from 'next/navigation'

import { Toaster as T } from '@/components/ui/sonner'
import { dashboardBaseUrl, mediaRoute } from '@/lib/menu-structure'

const media = dashboardBaseUrl + mediaRoute
const paths = [media]

export function Toaster() {
  const pathname = usePathname()
  let isExpandable = false

  for (let i = 0; i < paths.length; i++) {
    if (pathname.startsWith(paths[i])) {
      isExpandable = true
      break
    }
  }

  return <T expand={isExpandable} closeButton />
}
