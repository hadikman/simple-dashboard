export type MenuIconName =
  | 'media'
  | 'posts'
  | 'products'
  | 'comments'
  | 'analytics'
  | 'users'
  | 'settings'

export type MenuType = {
  label: string
  icon: MenuIconName
  url?: string
  items: { title: string; url: string }[] | []
}

export type NavMainProps = { items: MenuType[] }
