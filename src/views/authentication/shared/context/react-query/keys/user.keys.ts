export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters: string) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id: string) => [...userKeys.details(), id],
  current: () => [...userKeys.details(), 'current'],
}
