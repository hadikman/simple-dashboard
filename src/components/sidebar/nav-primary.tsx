'use client'

import {
  IconChartBar,
  IconChevronRight,
  IconMessageCircle,
  IconPhotoVideo,
  IconPin,
  IconSettings,
  IconShoppingBag,
  IconUsers,
  type Icon,
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { MenuIconName, NavMainProps } from '@/types/menu.types'

export function NavPrimary({ items }: NavMainProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map(item => (
        <NavItem key={item.label} {...item} pathname={pathname} />
      ))}
    </SidebarMenu>
  )
}

const iconMap: Record<MenuIconName, Icon> = {
  media: IconPhotoVideo,
  posts: IconPin,
  products: IconShoppingBag,
  comments: IconMessageCircle,
  analytics: IconChartBar,
  users: IconUsers,
  settings: IconSettings,
}

function NavItem({
  label,
  icon,
  url,
  items,
  pathname,
}: {
  label: string
  icon: MenuIconName
  url?: string
  items?: { title: string; url?: string }[]
  pathname: string
}) {
  const Icon = iconMap[icon]
  const hasSubmenu = items ? items?.length > 0 : []

  const isActive = url
    ? isPathActive(pathname, url)
    : (items?.some(sub => isPathActive(pathname, sub.url)) ?? false)

  const [open, setOpen] = React.useState(isActive)

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isActive) setOpen(true)
  }, [isActive])

  if (hasSubmenu) {
    return (
      <SidebarMenuItem>
        <Collapsible
          className="group/collapsible"
          open={open}
          onOpenChange={setOpen}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={label} isActive={isActive}>
              {Icon && <Icon />}
              <span>{label}</span>
              <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub>
              {items?.map(({ title, url }) => {
                const subIsActive = isPathActive(pathname, url)

                return (
                  <SidebarMenuSubItem
                    key={title}
                    data-has-url={!!url}
                    className="data-[has-url=false]:opacity-50"
                  >
                    {url ? (
                      <SidebarMenuSubButton isActive={subIsActive} asChild>
                        <Link href={url}>{title}</Link>
                      </SidebarMenuSubButton>
                    ) : (
                      <SidebarMenuSubButton disabled={!url}>
                        {title}
                      </SidebarMenuSubButton>
                    )}
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      {url ? (
        <SidebarMenuButton asChild tooltip={label} isActive={isActive}>
          <Link href={url}>
            {Icon && <Icon />}
            {label}
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton tooltip={label} isActive={isActive}>
          {Icon && <Icon />}
          {label}
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  )
}

function isPathActive(pathname: string, href?: string) {
  if (!href) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}
