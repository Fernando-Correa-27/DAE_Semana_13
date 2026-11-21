import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExamsLayout from '../../components/ExamsLayout/ExamsLayout'
import ExamForm from '../../components/ExamForm/ExamForm'
import { createExam } from '../../services/examsService'
import { normalizeApiError } from '../../utils/apiError'
import { UI_TEXT } from '../../utils/constants'
import './ExamCreatePage.css'

/**
 * Create page. A successful POST navigates back to the listing and carries the
 * new identifier so the listing can show that record without a page reload.
 */
function ExamCreatePage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  const handleSubmit = async ({ title }) => {
    setIsSubmitting(true)
    setApiError(null)

    try {
      const exam = await createExam({ title })
      navigate('/exams', {
        state: { createdExamId: exam.id, createdTitle: exam.title },
      })
    } catch (requestError) {
      setApiError(normalizeApiError(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldErrors = apiError?.kind === 'http' ? apiError.fieldErrors : {}

  const formError = apiError
    ? apiError.kind === 'network'
      ? UI_TEXT.EXAMS_ERROR_CONNECTION_MESSAGE
      : apiError.detail ||
        (Object.keys(fieldErrors).length > 0 ? UI_TEXT.EXAM_FORM_FIELD_ERROR : '')
    : ''

  return (
    <ExamsLayout>
      <section className="exams-page exam-create" aria-labelledby="exam-create-title">
        <header className="exams-page__header">
          <div>
            <p className="exams-page__eyebrow">{UI_TEXT.EXAMS_EYEBROW}</p>
            <h2 id="exam-create-title" className="exams-page__title">
              {UI_TEXT.EXAM_FORM_TITLE}
            </h2>
            <p className="exams-page__subtitle">{UI_TEXT.EXAM_FORM_SUBTITLE}</p>
          </div>
        </header>

        <ExamForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          formError={formError}
          onFieldChange={() => setApiError(null)}
        />
      </section>
    </ExamsLayout>
  )
}

export default ExamCreatePage
