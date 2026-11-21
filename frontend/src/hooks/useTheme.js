import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../utils/constants'

/**
 * Theme preference shared by the cinema page and the exam pages. It keeps the
 * document attribute and localStorage in sync, exactly as the cinema app did.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (event) => {
      if (!localStorage.getItem(STORAGE_KEYS.THEME)) {
        setTheme(event.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
