import { useCallback, useEffect, useRef, useState } from 'react'
import { list } from '../services/productService'
import { getPageNumber, unwrapList } from '../utils/apiResponse'
import { normalizeApiError } from '../utils/apiError'

const INITIAL_PAGE = 1

/**
 * Loads the paginated product catalog for one category. When the catalog is
 * opened right after creating or editing a record, it follows the next links
 * until that product is on screen, so the change is visible without a reload.
 */
export default function useProducts({ categoryId = '', focusProductId = null } = {}) {
  const [status, setStatus] = useState('loading')
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  })
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)
  const lastRequestRef = useRef({ categoryId, page: INITIAL_PAGE })
  // The product created or edited is searched only on the first load; a later
  // filter change must not walk every page looking for it again.
  const focusUsedRef = useRef(false)

  const load = useCallback(
    async ({ categoryId: activeCategory = '', page = INITIAL_PAGE, pageUrl = '', focusId = null } = {}) => {
      const requestId = ++requestIdRef.current
      let loadedPage = page
      const focusTarget = focusUsedRef.current ? null : focusId

      try {
        let data = await list({ categoryId: activeCategory, page, pageUrl })

        while (
          focusTarget &&
          data.next &&
          !data.results?.some((item) => item.id === focusTarget)
        ) {
          const nextUrl = data.next
          data = await list({ pageUrl: nextUrl })
          loadedPage = getPageNumber(nextUrl)
        }

        if (requestId !== requestIdRef.current) return

        const normalized = unwrapList(data)
        if (focusTarget) focusUsedRef.current = true
        lastRequestRef.current = { categoryId: activeCategory, page: loadedPage }
        setProducts(normalized.results)
        setPagination({
          count: normalized.count,
          next: normalized.next,
          previous: normalized.previous,
        })
        setError(null)
        setStatus('success')
      } catch (requestError) {
        if (requestId !== requestIdRef.current) return
        setError(normalizeApiError(requestError))
        setStatus('error')
      }
    },
    [],
  )

  useEffect(() => {
    // Fetching on mount and when the filter changes is the intended
    // synchronization with the API.
    // oxlint-disable-next-line react/set-state-in-effect
    setStatus('loading')
    load({ categoryId, focusId: focusProductId })
  }, [categoryId, focusProductId, load])

  const reload = useCallback(() => {
    setStatus('loading')
    load(lastRequestRef.current)
  }, [load])

  const goToNextPage = useCallback(() => {
    if (!pagination.next) return
    setStatus('loading')
    load({ categoryId, pageUrl: pagination.next })
  }, [categoryId, load, pagination.next])

  const goToPreviousPage = useCallback(() => {
    if (!pagination.previous) return
    setStatus('loading')
    load({ categoryId, pageUrl: pagination.previous })
  }, [categoryId, load, pagination.previous])

  const removeLocal = useCallback((productId) => {
    setProducts((current) => current.filter((item) => item.id !== productId))
    setPagination((current) => ({
      ...current,
      count: Math.max(0, current.count - 1),
    }))
  }, [])

  return {
    status,
    products,
    pagination,
    error,
    reload,
    goToNextPage,
    goToPreviousPage,
    removeLocal,
  }
}
