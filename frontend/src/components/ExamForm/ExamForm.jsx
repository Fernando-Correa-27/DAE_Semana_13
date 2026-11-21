import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from '../Button/Button'
import { UI_TEXT } from '../../utils/constants'
import './ExamForm.css'

/**
 * Controlled form for the only writable field of an exam. It deliberately does
 * not validate on the client: an empty title travels to the API so the 400
 * response can be shown, exactly as the lab asks.
 */
function ExamForm({ onSubmit, isSubmitting, fieldErrors = {}, formError, onFieldChange }) {
  const [title, setTitle] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ title })
  }

  const handleChange = (event) => {
    setTitle(event.target.value)
    if (onFieldChange) onFieldChange()
  }

  const titleError = fieldErrors.title

  return (
    <form className="exam-form" onSubmit={handleSubmit} noValidate>
      <div className="exam-form__field">
        <label className="exam-form__label" htmlFor="exam-title">
          {UI_TEXT.EXAM_FORM_TITLE_LABEL}
        </label>
        <input
          id="exam-title"
          className={`exam-form__input${titleError ? ' exam-form__input--invalid' : ''}`}
          name="title"
          type="text"
          value={title}
          maxLength={120}
          placeholder={UI_TEXT.EXAM_FORM_TITLE_PLACEHOLDER}
          onChange={handleChange}
          aria-invalid={Boolean(titleError)}
          aria-describedby={titleError ? 'exam-title-error' : undefined}
          autoFocus
        />
        {titleError && (
          <p id="exam-title-error" className="exam-form__field-error" role="alert">
            {titleError}
          </p>
        )}
      </div>

      {formError && (
        <p className="exam-form__error" role="alert">
          {formError}
        </p>
      )}

      <div className="exam-form__actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? UI_TEXT.EXAM_FORM_SUBMITTING : UI_TEXT.EXAM_FORM_SUBMIT}
        </Button>
        <Link to="/exams" className="exam-form__cancel">
          {UI_TEXT.EXAM_FORM_CANCEL}
        </Link>
      </div>
    </form>
  )
}

ExamForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  fieldErrors: PropTypes.objectOf(PropTypes.string),
  formError: PropTypes.string,
  onFieldChange: PropTypes.func,
}

export default ExamForm
