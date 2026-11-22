import { useCallback, useEffect, useRef, useState } from 'react'
import { list } from '../services/categoryService'
import { unwrapList } from '../utils/apiResponse'
import { normalizeApiError } from '../utils/apiError'

/** Loads the complete category list used by the filter and the product form. */
export default function useCategories() {
  const [status, setStatus] = useState('loading')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setStatus('loading')

    try {
      const data = await list()
      if (requestId !== requestIdRef.current) return
      setCategories(unwrapList(data).results)
      setError(null)
      setStatus('success')
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return
      setError(normalizeApiError(requestError))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  return { status, categories, error, reload: load }
}
