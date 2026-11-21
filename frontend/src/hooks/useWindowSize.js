import { useEffect, useState } from 'react'
import useDebounce from './useDebounce'

const RESIZE_DEBOUNCE_MS = 150

/**
 * Single source of truth for the responsive card count. The same breakpoints
 * drive the movie grid and the premieres carousel.
 */
export const COLUMN_BREAKPOINTS = [
  { minWidth: 1280, columns: 4 },
  { minWidth: 960, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
]

export function getColumnsForWidth(width) {
  const safeWidth = Number.isFinite(width) ? width : 0
  const match = COLUMN_BREAKPOINTS.find(({ minWidth }) => safeWidth >= minWidth)
  return match ? match.columns : 1
}

export function getSlidesPerView(width) {
  return Math.min(4, getColumnsForWidth(width))
}

function getViewport() {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  return { width: window.innerWidth, height: window.innerHeight }
}

/**
 * Returns the debounced viewport size. A resize listener updates the raw size
 * and useDebounce prevents a render on every pixel while the window moves.
 */
export default function useWindowSize(delay = RESIZE_DEBOUNCE_MS) {
  const [size, setSize] = useState(getViewport)
  const debouncedSize = useDebounce(size, delay)

  useEffect(() => {
    const handleResize = () => setSize(getViewport())

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return debouncedSize
}
