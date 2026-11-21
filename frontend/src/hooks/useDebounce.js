import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of any value. The timer is reset on every change
 * and cleared on unmount, so callers can defer expensive work until the user
 * stops typing or resizing. The hook owns no domain logic and is shared by
 * the search field, the viewport hook and future consumers.
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
