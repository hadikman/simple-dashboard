import React from 'react'

const MOBILE_BREAKPOINT = 768

const mediaQuery =
  typeof window !== 'undefined'
    ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    : null

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function subscribe(callback: () => void) {
  if (!mediaQuery) return () => {}
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

function getSnapshot() {
  return mediaQuery?.matches ?? false
}

function getServerSnapshot() {
  return false
}
