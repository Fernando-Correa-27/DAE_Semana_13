import PropTypes from 'prop-types'
import { UI_TEXT } from '../../utils/constants'
import './PremiereSkeleton.css'

/**
 * Decorative placeholder that mirrors the real premiere card dimensions.
 * The first skeleton carries the accessible loading text so the section
 * announces the state once, without repeating it for every placeholder.
 */
function PremiereSkeleton({ showLabel = false }) {
  return (
    <div className="premiere-skeleton" aria-busy="true">
      {showLabel && <span className="sr-only">{UI_TEXT.PREMIERES_LOADING}</span>}

      <div className="premiere-skeleton__poster skeleton" aria-hidden="true" />

      <div className="premiere-skeleton__content" aria-hidden="true">
        <div className="premiere-skeleton__line premiere-skeleton__line--title skeleton" />
        <div className="premiere-skeleton__line premiere-skeleton__line--meta skeleton" />
        <div className="premiere-skeleton__chips">
          <span className="premiere-skeleton__chip skeleton" />
          <span className="premiere-skeleton__chip skeleton" />
        </div>
        <div className="premiere-skeleton__line skeleton" />
        <div className="premiere-skeleton__line skeleton" />
        <div className="premiere-skeleton__line premiere-skeleton__line--medium skeleton" />
      </div>
    </div>
  )
}

PremiereSkeleton.propTypes = {
  showLabel: PropTypes.bool,
}

export default PremiereSkeleton
