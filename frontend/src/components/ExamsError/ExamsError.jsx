import PropTypes from 'prop-types'
import Button from '../Button/Button'
import { UI_TEXT } from '../../utils/constants'
import './ExamsError.css'

/**
 * Error state. A network failure and an HTTP failure read differently: the
 * latter shows the status code and the detail returned by the API.
 */
function ExamsError({ error, onRetry }) {
  const isNetwork = error?.kind === 'network'
  const isHttp = error?.kind === 'http'

  const title = isNetwork
    ? UI_TEXT.EXAMS_ERROR_CONNECTION_TITLE
    : isHttp
      ? UI_TEXT.EXAMS_ERROR_HTTP_TITLE
      : UI_TEXT.EXAMS_ERROR_UNKNOWN_TITLE

  const message = isNetwork
    ? UI_TEXT.EXAMS_ERROR_CONNECTION_MESSAGE
    : isHttp
      ? UI_TEXT.EXAMS_ERROR_HTTP_MESSAGE
      : UI_TEXT.EXAMS_ERROR_UNKNOWN_MESSAGE

  return (
    <div className="exams-error" role="alert">
      <span className={`exams-error__badge${isHttp ? ' exams-error__badge--http' : ''}`}>
        {isHttp ? `HTTP ${error.status}` : UI_TEXT.EXAMS_ERROR_CONNECTION_TITLE}
      </span>
      <h3 className="exams-error__title">{title}</h3>
      <p className="exams-error__message">{message}</p>
      {isHttp && error.detail && <p className="exams-error__detail">{error.detail}</p>}
      {!isHttp && !isNetwork && error?.detail && (
        <p className="exams-error__detail">{error.detail}</p>
      )}
      <Button onClick={onRetry}>{UI_TEXT.EXAMS_RETRY}</Button>
    </div>
  )
}

ExamsError.propTypes = {
  error: PropTypes.shape({
    kind: PropTypes.oneOf(['network', 'http', 'unknown']),
    status: PropTypes.number,
    detail: PropTypes.string,
  }),
  onRetry: PropTypes.func.isRequired,
}

export default ExamsError
