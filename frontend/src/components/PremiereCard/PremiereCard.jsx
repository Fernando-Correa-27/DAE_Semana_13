import PropTypes from 'prop-types'
import { formatReleaseDate } from '../../utils/formatters'
import { UI_TEXT } from '../../utils/constants'
import './PremiereCard.css'

/**
 * Read-only card for a forthcoming premiere. The data arrives already adapted
 * to the application movie model, so the card only formats it for display.
 */
function PremiereCard({ premiere }) {
  const releaseDate = formatReleaseDate(premiere.releaseDate)

  return (
    <article className="premiere-card" aria-label={`Estreno: ${premiere.title}`}>
      <div className="premiere-card__poster">
        <img
          src={premiere.poster}
          alt={`Póster de ${premiere.title}`}
          loading="lazy"
          className="premiere-card__image"
        />
        <span className="premiere-card__badge">{UI_TEXT.PREMIERE_BADGE}</span>
        <span
          className="premiere-card__score"
          aria-label={`${UI_TEXT.SCORE_LABEL}: ${premiere.score} ${UI_TEXT.SCORE_OUT_OF}`}
        >
          <svg className="premiere-card__score-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          {premiere.score}
        </span>
      </div>

      <div className="premiere-card__content">
        <h3 className="premiere-card__title">{premiere.title}</h3>

        <div className="premiere-card__meta">
          <span className="premiere-card__age">{premiere.ageRating}</span>
          {releaseDate && (
            <span className="premiere-card__date">
              <span className="premiere-card__date-label">
                {UI_TEXT.RELEASE_DATE_LABEL}:
              </span>{' '}
              {releaseDate}
            </span>
          )}
        </div>

        {premiere.genres.length > 0 && (
          <div className="premiere-card__genres">
            {premiere.genres.map((genre) => (
              <span key={genre} className="premiere-card__genre">
                {genre}
              </span>
            ))}
          </div>
        )}

        <p className="premiere-card__synopsis">{premiere.synopsis}</p>
      </div>
    </article>
  )
}

PremiereCard.propTypes = {
  premiere: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    poster: PropTypes.string.isRequired,
    synopsis: PropTypes.string.isRequired,
    ageRating: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    genres: PropTypes.arrayOf(PropTypes.string).isRequired,
    releaseDate: PropTypes.string,
  }).isRequired,
}

export default PremiereCard
