import { UI_TEXT } from '../../utils/constants'
import './CatalogSkeleton.css'

const SKELETON_CARDS = 6

/** Loading state: card-shaped placeholders that mirror the final grid. */
function CatalogSkeleton() {
  return (
    <div className="catalog-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{UI_TEXT.CATALOG_LOADING}</span>
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <div className="catalog-skeleton__card" key={index} aria-hidden="true">
          <span className="catalog-skeleton__image" />
          <span className="catalog-skeleton__line catalog-skeleton__line--short" />
          <span className="catalog-skeleton__line" />
          <span className="catalog-skeleton__line catalog-skeleton__line--medium" />
          <div className="catalog-skeleton__footer">
            <span className="catalog-skeleton__price" />
            <span className="catalog-skeleton__button" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default CatalogSkeleton
