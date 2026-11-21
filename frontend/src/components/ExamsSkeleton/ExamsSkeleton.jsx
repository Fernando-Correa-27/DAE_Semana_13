import { UI_TEXT } from '../../utils/constants'
import './ExamsSkeleton.css'

const SKELETON_ROWS = 5

/**
 * Loading state: a table-shaped skeleton, clearly different from the data
 * table and from the error panel.
 */
function ExamsSkeleton() {
  return (
    <div className="exams-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{UI_TEXT.EXAMS_LOADING}</span>
      <div className="exams-skeleton__row exams-skeleton__row--head" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div className="exams-skeleton__row" key={index} aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  )
}

export default ExamsSkeleton
