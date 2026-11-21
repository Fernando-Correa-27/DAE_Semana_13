import { useCallback, useEffect, useRef, useState } from 'react'
import { listExams } from '../services/examsService'
import { normalizeApiError } from '../utils/apiError'

const FIRST_PAGE_URL = '/exams/'

/**
 * Loads the paginated exam listing and keeps the current page URL. When the
 * listing is opened right after creating a record, it walks the next links
 * until that record is on screen, so the new row is visible without a reload.
 */
export default function useExams({ focusExamId = null } = {}) {
  const [status, setStatus] = useState('loading')
  const [exams, setExams] = useState([])
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })
  const [error, setError] = useState(null)
  const lastUrlRef = useRef(FIRST_PAGE_URL)
  const requestIdRef = useRef(0)

  const load = useCallback(async (pageUrl = FIRST_PAGE_URL, { focusId = null } = {}) => {
    const requestId = ++requestIdRef.current
    lastUrlRef.current = pageUrl

    try {
      let data = await listExams(pageUrl)
      let loadedUrl = pageUrl

      while (focusId && data.next && !data.results.some((exam) => exam.id === focusId)) {
        loadedUrl = data.next
        data = await listExams(loadedUrl)
      }

      if (requestId !== requestIdRef.current) return

      lastUrlRef.current = loadedUrl
      setExams(data.results ?? [])
      setPagination({
        count: data.count ?? 0,
        next: data.next ?? null,
        previous: data.previous ?? null,
      })
      setError(null)
      setStatus('success')
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return
      setError(normalizeApiError(requestError))
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    // Fetching on mount is the intended synchronization with the API.
    // oxlint-disable-next-line react/set-state-in-effect
    load(FIRST_PAGE_URL, { focusId: focusExamId })
  }, [load, focusExamId])

  const reload = useCallback(() => {
    setStatus('loading')
    load(lastUrlRef.current)
  }, [load])
  const goToNextPage = useCallback(() => {
    if (!pagination.next) return
    setStatus('loading')
    load(pagination.next)
  }, [load, pagination.next])
  const goToPreviousPage = useCallback(() => {
    if (!pagination.previous) return
    setStatus('loading')
    load(pagination.previous)
  }, [load, pagination.previous])

  return {
    status,
    exams,
    pagination,
    error,
    reload,
    goToNextPage,
    goToPreviousPage,
  }
}
