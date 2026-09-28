import type { MenuType } from '@/types/menu.types'

export const dashboardBaseUrl = '/dashboard'
export const mediaRoute = 'media'
export const productsRoute = 'products'
export const postsRoute = 'posts'
export const commentsRoute = 'comments'
export const analyticsRoute = 'analytics'

export const navMain: MenuType[] = [
  {
    label: 'Media',
    icon: 'media',
    url: dashboardBaseUrl + `/${mediaRoute}`,
    items: [],
  },
  {
    label: 'Posts',
    icon: 'posts',
    items: [
      {
        title: 'All Posts',
        url: dashboardBaseUrl + `/${postsRoute}/all-posts`,
      },
      {
        title: 'New Post',
        url: dashboardBaseUrl + `/${postsRoute}/new-post`,
      },
      {
        title: 'Category',
        url: dashboardBaseUrl + `/${postsRoute}/category`,
      },
    ],
  },
  {
    label: 'Products',
    icon: 'products',
    items: [
      {
        title: 'All Products',
        url: dashboardBaseUrl + `/${productsRoute}/all-products`,
      },
      {
        title: 'New Product',
        url: dashboardBaseUrl + `/${productsRoute}/new-product`,
      },
      {
        title: 'Category',
        url: dashboardBaseUrl + `/${productsRoute}/category`,
      },
      {
        title: 'Brands',
        url: dashboardBaseUrl + `/${productsRoute}/brands`,
      },
      {
        title: 'Offers',
        url: dashboardBaseUrl + `/${productsRoute}/offers`,
      },
      {
        title: 'Guarantees',
        url: dashboardBaseUrl + `/${productsRoute}/guarantees`,
      },
      {
        title: 'Features',
        url: dashboardBaseUrl + `/${productsRoute}/features`,
      },
    ],
  },
  {
    label: 'Comments',
    icon: 'comments',
    url: '',
    items: [],
  },
  {
    label: 'Analytics',
    icon: 'analytics',
    url: '',
    items: [],
  },
]

export const navSecondary: MenuType[] = [
  {
    label: 'Users',
    icon: 'users',
    url: '',
    items: [],
  },
  {
    label: 'Settings',
    icon: 'settings',
    url: '',
    items: [],
  },
]
