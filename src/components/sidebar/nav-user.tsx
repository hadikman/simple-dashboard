'use client'

import {
  IconAlertTriangle,
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from '@tabler/icons-react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

import {
  getUserQueryOptions,
  logoutUserAction,
  userErrors,
  userKeys,
} from '@/views/authentication'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'

export function NavUser({ userId }: { userId: string }) {
  const queryClient = useQueryClient()
  const { isMobile } = useSidebar()

  const {
    data: user,
    isPending,
    isError,
    error,
  } = useSuspenseQuery(getUserQueryOptions(userId))

  async function handleLogout() {
    queryClient.setQueryData(userKeys.current(), null)

    const logoutResult = await logoutUserAction()

    if (logoutResult.success) {
      toast.success('Logged out successfully')
      redirect('/login')
    } else {
      toast.error('Failed to log out')
    }
  }

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="bg-sidebar-accent/50 h-12 animate-pulse rounded-lg" />
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (isError) {
    const errorCode = error.message as keyof typeof userErrors
    const errorMessage = userErrors[errorCode]?.client ?? 'Failed to load user'

    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border p-2">
            <IconAlertTriangle className="size-4 shrink-0" />
            <div className="grid flex-1 text-left text-xs leading-tight">
              <span className="font-semibold">Account Error</span>
              <span className="text-muted-foreground truncate">
                {errorMessage}
              </span>
            </div>
            <Button
              variant="ghost"
              size="xs"
              className="hover:bg-destructive/20 hover:text-destructive h-7 px-2 text-xs"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!user) return <Spinner className="size-8" />

  const avatarContent = (
    <>
      <AvatarImage
        src={user.profile?.avatar || undefined}
        alt={user.profile?.name || undefined}
      />
      <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground rounded-lg font-semibold">
        {user.username.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {avatarContent}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.username}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">{avatarContent}</Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.username}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle className="mr-2 size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard className="mr-2 size-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification className="mr-2 size-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <IconLogout className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
