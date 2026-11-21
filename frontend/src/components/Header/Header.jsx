import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from '../Button/Button'
import { UI_TEXT } from '../../utils/constants'

/**
 * Site header with brand, primary navigation, favorites counter and theme
 * switch. It receives only the derived favorites count, never the full list.
 */
function Header({ theme, onToggleTheme, favoritesCount = 0, showFavorites = true }) {
  const themeLabel = theme === 'dark' ? UI_TEXT.THEME_TO_LIGHT : UI_TEXT.THEME_TO_DARK

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__brand">
          <span className="header__logo" aria-hidden="true">
            &#9654;
          </span>
          <h1 className="header__title">{UI_TEXT.APP_TITLE}</h1>
        </Link>

        <nav className="header__nav" aria-label={UI_TEXT.NAV_LABEL}>
          <Link to="/#featured" className="header__link">
            {UI_TEXT.NAV_FEATURED}
          </Link>
          <Link to="/#movies" className="header__link">
            {UI_TEXT.NAV_MOVIES}
          </Link>
          <Link to="/#footer" className="header__link">
            {UI_TEXT.NAV_CONTACT}
          </Link>
          <Link to="/exams" className="header__link header__link--exams">
            {UI_TEXT.NAV_EXAMS}
          </Link>
        </nav>

        <div className="header__actions">
          {showFavorites && (
            <span
              className="header__favorites"
              role="status"
              aria-live="polite"
              title={`${UI_TEXT.FAVORITES_COUNT_LABEL}: ${favoritesCount}`}
            >
              <svg className="header__favorites-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="currentColor"
                />
              </svg>
              <span className="sr-only">{`${UI_TEXT.FAVORITES_COUNT_LABEL}: ${favoritesCount}`}</span>
              <span className="header__favorites-count" aria-hidden="true">
                {favoritesCount}
              </span>
            </span>
          )}

          <Button
            variant="ghost"
            iconOnly
            className={`header__theme-toggle${theme === 'light' ? ' header__theme-toggle--light' : ''}`}
            onClick={onToggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {theme === 'dark' ? (
              <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
              </svg>
            ) : (
              <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  theme: PropTypes.oneOf(['dark', 'light']),
  onToggleTheme: PropTypes.func,
  favoritesCount: PropTypes.number,
  showFavorites: PropTypes.bool,
}

export default Header
