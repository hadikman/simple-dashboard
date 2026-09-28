import { IconDashboard } from '@tabler/icons-react'
import Link from 'next/link'
import React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar'
import { navMain, navSecondary } from '@/lib/menu-structure'
import {
  getUserQueryOptions,
  UserIdHydrationBoundary,
} from '@/views/authentication'
import { NavPrimary } from './nav-primary'
import { NavUser } from './nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="select-none">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <IconDashboard className="size-5!" />
                <span className="text-base font-semibold">
                  Website Dashboard
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="select-none">
        <SidebarGroup>
          <NavPrimary items={navMain} />
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <NavPrimary items={navSecondary} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <React.Suspense fallback={<SidebarMenuSkeleton />}>
          <UserIdHydrationBoundary queryOptions={getUserQueryOptions}>
            {userId => <NavUser userId={userId} />}
          </UserIdHydrationBoundary>
        </React.Suspense>
      </SidebarFooter>
    </Sidebar>
  )
}
