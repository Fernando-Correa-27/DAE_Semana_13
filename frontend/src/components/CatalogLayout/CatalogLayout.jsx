import PropTypes from 'prop-types'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import useTheme from '../../hooks/useTheme'
import './CatalogLayout.css'

/** Shared shell for the catalog pages, keeping the site header and footer. */
function CatalogLayout({ children }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggleTheme} showFavorites={false} />
      <main className="app__main catalog-layout__main">{children}</main>
      <Footer />
    </div>
  )
}

CatalogLayout.propTypes = {
  children: PropTypes.node,
}

export default CatalogLayout
