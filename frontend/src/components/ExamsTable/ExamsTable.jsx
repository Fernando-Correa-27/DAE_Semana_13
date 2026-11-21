import PropTypes from 'prop-types'
import Button from '../Button/Button'
import { UI_TEXT } from '../../utils/constants'
import './ExamsTable.css'

const DATE_FORMATTER = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date)
}

/**
 * Data state: the rows returned by the API. The delete button owns its own
 * pending flag so only the row being removed is disabled.
 */
function ExamsTable({ exams, deletingId, onDelete }) {
  return (
    <div className="exams-table-wrapper">
      <table className="exams-table">
        <caption className="sr-only">{UI_TEXT.EXAMS_TABLE_CAPTION}</caption>
        <thead>
          <tr>
            <th scope="col">{UI_TEXT.EXAMS_COL_ID}</th>
            <th scope="col">{UI_TEXT.EXAMS_COL_TITLE}</th>
            <th scope="col">{UI_TEXT.EXAMS_COL_QUESTIONS}</th>
            <th scope="col">{UI_TEXT.EXAMS_COL_CREATED}</th>
            <th scope="col">{UI_TEXT.EXAMS_COL_ACTIONS}</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => {
            const isDeleting = deletingId === exam.id
            return (
              <tr key={exam.id}>
                <td data-label={UI_TEXT.EXAMS_COL_ID}>{exam.id}</td>
                <td data-label={UI_TEXT.EXAMS_COL_TITLE} className="exams-table__title">
                  {exam.title}
                </td>
                <td data-label={UI_TEXT.EXAMS_COL_QUESTIONS}>{exam.question_count ?? 0}</td>
                <td data-label={UI_TEXT.EXAMS_COL_CREATED}>{formatDate(exam.created_at)}</td>
                <td data-label={UI_TEXT.EXAMS_COL_ACTIONS}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="exams-table__delete"
                    disabled={isDeleting}
                    onClick={() => onDelete(exam)}
                    aria-label={`${UI_TEXT.EXAMS_DELETE}: ${exam.title}`}
                  >
                    {isDeleting ? UI_TEXT.EXAMS_DELETING : UI_TEXT.EXAMS_DELETE}
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

ExamsTable.propTypes = {
  exams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      created_at: PropTypes.string,
      question_count: PropTypes.number,
    }),
  ).isRequired,
  deletingId: PropTypes.number,
  onDelete: PropTypes.func.isRequired,
}

export default ExamsTable
