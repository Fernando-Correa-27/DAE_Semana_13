import PropTypes from 'prop-types'
import { UI_TEXT } from '../../utils/constants'
import './CategoryFilter.css'

/**
 * Category dropdown fed by the API. While the categories load it stays
 * disabled; if the request fails it explains the problem and offers a retry
 * without blocking the product listing.
 */
function CategoryFilter({ categories, value, onChange, status, error, onRetry }) {
  const isLoading = status === 'loading'
  const hasError = status === 'error'

  return (
    <div className="category-filter">
      <label className="category-filter__label" htmlFor="catalog-category">
        {UI_TEXT.CATALOG_FILTER_LABEL}
      </label>
      <select
        id="catalog-category"
        className="category-filter__select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isLoading || hasError}
        aria-describedby={hasError ? 'catalog-category-error' : undefined}
      >
        <option value="">
          {isLoading ? UI_TEXT.CATALOG_FILTER_LOADING : UI_TEXT.CATALOG_FILTER_ALL}
        </option>
        {categories.map((category) => (
          <option key={category.id} value={String(category.id)}>
            {category.name}
          </option>
        ))}
      </select>
      {hasError && (
        <p className="category-filter__error" id="catalog-category-error" role="alert">
          {UI_TEXT.CATALOG_FILTER_ERROR}
          {error?.detail ? ` ${error.detail}` : ''}{' '}
          <button type="button" className="category-filter__retry" onClick={onRetry}>
            {UI_TEXT.CATALOG_FILTER_RETRY}
          </button>
        </p>
      )}
    </div>
  )
}

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  status: PropTypes.oneOf(['loading', 'success', 'error']).isRequired,
  error: PropTypes.shape({
    detail: PropTypes.string,
  }),
  onRetry: PropTypes.func.isRequired,
}

export default CategoryFilter
