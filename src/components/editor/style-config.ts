const MIN_ALLOWED_FONT_SIZE = 8
const MAX_ALLOWED_FONT_SIZE = 72

export const getInheritedStyle = (
  element: HTMLElement,
  property: string,
): string => {
  let current: HTMLElement | null = element

  while (current) {
    const value = current.style.getPropertyValue(property)
    if (value) {
      return value
    }
    // Move up to parent
    current = current.parentElement
  }

  return ''
}

export const parseAllowedFontSize = (input: string): string => {
  // Handle px values
  const pxMatch = input.match(/^(\d+(?:\.\d+)?)px$/)
  if (pxMatch) {
    const n = Number(pxMatch[1])
    if (n >= MIN_ALLOWED_FONT_SIZE && n <= MAX_ALLOWED_FONT_SIZE) {
      return input
    }
  }

  // Handle pt values (Word's default) - convert to px
  const ptMatch = input.match(/^(\d+(?:\.\d+)?)pt$/)
  if (ptMatch) {
    const pt = Number(ptMatch[1])
    const px = Math.round(pt * 1.333) // 1pt ≈ 1.333px
    if (px >= MIN_ALLOWED_FONT_SIZE && px <= MAX_ALLOWED_FONT_SIZE) {
      return `${px}px`
    }
  }

  return ''
}

export function parseAllowedColor(input: string) {
  return /^rgb\(\d+, \d+, \d+\)$/.test(input) ? input : ''
}
