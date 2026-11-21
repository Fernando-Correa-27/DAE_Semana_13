import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ExamsLayout from '../../components/ExamsLayout/ExamsLayout'
import ExamsTable from '../../components/ExamsTable/ExamsTable'
import ExamsSkeleton from '../../components/ExamsSkeleton/ExamsSkeleton'
import ExamsError from '../../components/ExamsError/ExamsError'
import Button from '../../components/Button/Button'
import useExams from '../../hooks/useExams'
import { deleteExam } from '../../services/examsService'
import { normalizeApiError } from '../../utils/apiError'
import { UI_TEXT } from '../../utils/constants'

/**
 * Exam listing: loading, data and error are separate, visually distinct
 * branches. Pagination follows the next/previous links returned by the API.
 */
function ExamsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  // The created record is searched once, on mount, and the history state is
  // cleared afterwards so paging does not repeat the search.
  const [createdExamId] = useState(() => location.state?.createdExamId ?? null)
  const [flash] = useState(() => {
    const createdTitle = location.state?.createdTitle
    return createdTitle ? `${UI_TEXT.EXAMS_CREATED} «${createdTitle}»` : ''
  })
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const {
    status,
    exams,
    pagination,
    error,
    reload,
    goToNextPage,
    goToPreviousPage,
  } = useExams({ focusExamId: createdExamId })

  useEffect(() => {
    if (createdExamId && location.state) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [createdExamId, location.pathname, location.state, navigate])

  useEffect(() => {
    if (status === 'success' && exams.length === 0 && pagination.previous) {
      goToPreviousPage()
    }
  }, [exams.length, goToPreviousPage, pagination.previous, status])

  const handleDelete = async (exam) => {
    const confirmed = window.confirm(`${UI_TEXT.EXAMS_DELETE_CONFIRM} «${exam.title}»?`)
    if (!confirmed) return

    setDeletingId(exam.id)
    setActionError(null)

    try {
      await deleteExam(exam.id)
      await reload()
    } catch (requestError) {
      setActionError(normalizeApiError(requestError))
    } finally {
      setDeletingId(null)
    }
  }

  const showPagination = Boolean(pagination.next || pagination.previous)

  return (
    <ExamsLayout>
      <section className="exams-page" aria-labelledby="exams-title">
        <header className="exams-page__header">
          <div>
            <p className="exams-page__eyebrow">{UI_TEXT.EXAMS_EYEBROW}</p>
            <h2 id="exams-title" className="exams-page__title">
              {UI_TEXT.EXAMS_TITLE}
            </h2>
            <p className="exams-page__subtitle">{UI_TEXT.EXAMS_SUBTITLE}</p>
          </div>
          <Link to="/exams/new" className="btn btn--primary btn--md">
            {UI_TEXT.EXAMS_NEW}
          </Link>
        </header>

        {flash && (
          <p className="exams-page__flash" role="status">
            {flash}
          </p>
        )}

        {actionError && (
          <div className="exams-page__action-error" role="alert">
            <span>
              {UI_TEXT.EXAMS_DELETE_ERROR}
              {actionError.kind === 'http' ? ` HTTP ${actionError.status}.` : ''}{' '}
              {actionError.detail}
            </span>
            <button type="button" onClick={() => setActionError(null)}>
              {UI_TEXT.EXAMS_CLOSE}
            </button>
          </div>
        )}

        {status === 'loading' && <ExamsSkeleton />}

        {status === 'error' && <ExamsError error={error} onRetry={reload} />}

        {status === 'success' && exams.length === 0 && (
          <div className="exams-page__empty">
            <h3>{UI_TEXT.EXAMS_EMPTY_TITLE}</h3>
            <p>{UI_TEXT.EXAMS_EMPTY_MESSAGE}</p>
            <Link to="/exams/new" className="btn btn--primary btn--md">
              {UI_TEXT.EXAMS_EMPTY_ACTION}
            </Link>
          </div>
        )}

        {status === 'success' && exams.length > 0 && (
          <>
            <ExamsTable exams={exams} deletingId={deletingId} onDelete={handleDelete} />
            {showPagination && (
              <footer className="exams-page__pagination">
                <span className="exams-page__count">
                  {pagination.count} {UI_TEXT.EXAMS_PAGE_SUMMARY}
                </span>
                <div className="exams-page__pagination-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!pagination.previous}
                    onClick={goToPreviousPage}
                  >
                    {UI_TEXT.EXAMS_PREVIOUS}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!pagination.next}
                    onClick={goToNextPage}
                  >
                    {UI_TEXT.EXAMS_NEXT}
                  </Button>
                </div>
              </footer>
            )}
          </>
        )}
      </section>
    </ExamsLayout>
  )
}

export default ExamsPage
