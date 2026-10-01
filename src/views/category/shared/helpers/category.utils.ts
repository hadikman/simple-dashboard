export function getCategoryPlaceholder(
  isCategory: boolean,
  selectedCount: number,
  leftCount: number,
) {
  if (!isCategory) return 'No Category'
  if (leftCount === 0) return 'All categories selected'
  if (selectedCount === 0) return 'Search categories...'
  return `Search ${leftCount} remaining ${leftCount === 1 ? 'category' : 'categories'}...`
}
