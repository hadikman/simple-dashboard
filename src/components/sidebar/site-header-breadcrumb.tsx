'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getFileExtension } from '@/helpers/utils'

type RouteItem = {
  name: string
  route: string
}

const HIDDEN_ROUTES = new Set(['products', 'file', 'draft'])
const ROUTE_ALIASES: Record<string, string> = {
  dashboard: 'home',
}

export function SiteHeaderBreadcrumb() {
  const pathname = usePathname()

  const routes = React.useMemo<RouteItem[]>(() => {
    if (!pathname) return []

    const segments = pathname.replace(/^\/|\/$/g, '').split('/')

    let accPath = ''

    return segments.reduce<RouteItem[]>((acc, segment) => {
      const decoded = decodeURI(segment)

      if (HIDDEN_ROUTES.has(decoded)) {
        accPath += `/${decoded}` // Continue building route for children
        return acc
      }

      accPath += `/${decoded}`

      acc.push({
        name: formatRouteName(decoded),
        route: accPath,
      })

      return acc
    }, [])
  }, [pathname])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {routes.map(({ name, route }, i) => (
          <React.Fragment key={route}>
            {i !== 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {i === routes.length - 1 ? (
                <BreadcrumbPage>{name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={route}>{name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function formatRouteName(segment: string) {
  const alias = ROUTE_ALIASES[segment] ?? segment

  const extension = getFileExtension(alias)
  if (extension) return alias // keep filename as-is

  return alias.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
