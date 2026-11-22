import PropTypes from 'prop-types'
import Button from '../Button/Button'
import { UI_TEXT } from '../../utils/constants'
import './CatalogError.css'

/** Error state for the catalog, with a retry action that repeats the request. */
function CatalogError({ error, onRetry }) {
  const isNetwork = error?.kind === 'network'
  const isHttp = error?.kind === 'http'

  const title = isNetwork
    ? UI_TEXT.CATALOG_ERROR_CONNECTION_TITLE
    : isHttp
      ? UI_TEXT.CATALOG_ERROR_HTTP_TITLE
      : UI_TEXT.CATALOG_ERROR_UNKNOWN_TITLE

  const message = isNetwork
    ? UI_TEXT.CATALOG_ERROR_CONNECTION_MESSAGE
    : isHttp
      ? UI_TEXT.CATALOG_ERROR_HTTP_MESSAGE
      : UI_TEXT.CATALOG_ERROR_UNKNOWN_MESSAGE

  return (
    <div className="catalog-error" role="alert">
      <span className={`catalog-error__badge${isHttp ? ' catalog-error__badge--http' : ''}`}>
        {isHttp ? `HTTP ${error.status}` : UI_TEXT.CATALOG_ERROR_CONNECTION_TITLE}
      </span>
      <h3 className="catalog-error__title">{title}</h3>
      <p className="catalog-error__message">{message}</p>
      {error?.detail && <p className="catalog-error__detail">{error.detail}</p>}
      <Button onClick={onRetry}>{UI_TEXT.CATALOG_RETRY}</Button>
    </div>
  )
}

CatalogError.propTypes = {
  error: PropTypes.shape({
    kind: PropTypes.oneOf(['network', 'http', 'unknown']),
    status: PropTypes.number,
    detail: PropTypes.string,
  }),
  onRetry: PropTypes.func.isRequired,
}

export default CatalogError
