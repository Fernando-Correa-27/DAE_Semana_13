import { useCallback, useEffect, useRef, useState } from 'react'
import { getById } from '../services/productService'
import { normalizeApiError } from '../utils/apiError'

/** Loads one product for the edit form. */
export default function useProduct(productId) {
  const [status, setStatus] = useState('loading')
  const [product, setProduct] = useState(null)
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setStatus('loading')

    try {
      const data = await getById(productId)
      if (requestId !== requestIdRef.current) return
      setProduct(data)
      setError(null)
      setStatus('success')
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return
      setError(normalizeApiError(requestError))
      setStatus('error')
    }
  }, [productId])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    load()
  }, [load])

  return { status, product, error, reload: load }
}
