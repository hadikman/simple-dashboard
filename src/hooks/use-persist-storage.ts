import { useSearchParams } from 'next/navigation'
import React from 'react'

type Updater<T> = T | ((old: T) => T)
type Props<T> = {
  key: string
  initialState: T
  /** @default 3000 - Set to 0 to disable auto save feature */
  autoSaveDebounce?: number
  /**
   * Which browser storage to use for persistence
   * - 'sessionStorage': Cleared when tab closes
   * - 'localStorage': Persists across browser sessions
   * @default 'sessionStorage'
   */
  storage?: 'sessionStorage' | 'localStorage'
  /** Set to true to enable URL sync */
  enableUrlStore?: boolean
}

export function usePersistStorage<T>({
  key,
  initialState,
  autoSaveDebounce = 3000,
  storage = 'sessionStorage',
  enableUrlStore,
}: Props<T>) {
  const params = useSearchParams()
  const [value, setValue] = React.useState<T>(() => {
    if (!enableUrlStore) return initialState

    const query = params.get(key)
    if (query) {
      return JSON.parse(query)
    }

    return initialState
  })

  // Update both state and URL (using window.history directly to avoid infinite loop
  // that occurs with useRouter/useSearchParams in dependency arrays)
  const set = React.useCallback(
    (updaterOrValue: Updater<T>) => {
      // If value causes re-render, use valueRef instead of value to remove value from dependency
      // const value = valueRef.current

      const updatedValue =
        typeof updaterOrValue === 'function'
          ? (updaterOrValue as (old: T) => T)(value)
          : updaterOrValue

      // Prevent unnecessary updates and re-renders
      if (JSON.stringify(updatedValue) === JSON.stringify(value)) {
        return
      }

      setValue(updatedValue)

      // Direct history API avoids Next.js router re-render cycle
      if (enableUrlStore) {
        const url = new URL(window.location.href)
        url.searchParams.set(key, JSON.stringify(updatedValue))
        window.history.replaceState({}, '', url.toString())
      }
    },
    [enableUrlStore, key, value],
  )

  // Load initial value from storage if URL param is missing
  React.useEffect(() => {
    const isUrlStore = enableUrlStore && params.get(key)
    if (key && !isUrlStore) {
      const storedValue = window[storage].getItem(key)!
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedValue) set(JSON.parse(storedValue) as T)
    }
  }, [])

  // Manually persist current value to storage
  const save = React.useCallback(
    (value: T) => {
      if (typeof window !== undefined) {
        const result = JSON.stringify(value)
        try {
          window[storage].setItem(key, result)
        } catch (e) {
          console.warn('Error at calling sessionStorage, draft not saved')
        }
      }
    },
    [key, storage],
  )

  // Auto-persist to storage after debounced changes
  React.useEffect(() => {
    if (autoSaveDebounce === 0) return

    // Prevent of set item into store immediately, after clear stores
    if (JSON.stringify(initialState) === JSON.stringify(value)) {
      return
    }

    const timer = setTimeout(() => {
      if (key && typeof window !== undefined) {
        const result = JSON.stringify(value)
        try {
          window[storage].setItem(key, result)
        } catch (e) {
          console.warn('Error at calling sessionStorage, draft not saved')
        }
      }
    }, autoSaveDebounce)

    return () => clearTimeout(timer)
  }, [autoSaveDebounce, value])

  // Clear both URL param and storage entry
  const clear = React.useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete(key)
    window.history.replaceState({}, '', url.toString())

    if (typeof window !== undefined) {
      window[storage].removeItem(key)
    }
  }, [key, storage])

  return { value, set, save, clear }
}
