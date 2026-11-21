import { useCallback, useEffect, useState } from 'react'
import { fetchPremieres } from '../services/premieresService'
import { UI_TEXT } from '../utils/constants'

/**
 * Loads the simulated premiere feed and exposes its three UI states. A
 * cancellation flag prevents late responses from updating an unmounted
 * component or a newer request.
 */
export default function usePremieres() {
  const [premieres, setPremieres] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [requestId, setRequestId] = useState(0)

  const retry = useCallback(() => {
    setStatus('loading')
    setError(null)
    setRequestId((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    fetchPremieres()
      .then((data) => {
        if (cancelled) return
        setPremieres(data)
        setStatus('success')
      })
      .catch((requestError) => {
        if (cancelled) return
        setError(
          requestError instanceof Error
            ? requestError.message
            : UI_TEXT.PREMIERES_ERROR
        )
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [requestId])

  return { premieres, status, error, retry }
}
