import PropTypes from 'prop-types'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import useTheme from '../../hooks/useTheme'
import './ExamsLayout.css'

/**
 * Shared shell for the exam pages: the cinema header and footer stay in place
 * so the new section feels part of the same application.
 */
function ExamsLayout({ children }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggleTheme} showFavorites={false} />
      <main className="app__main exams-layout__main">{children}</main>
      <Footer />
    </div>
  )
}

ExamsLayout.propTypes = {
  children: PropTypes.node,
}

export default ExamsLayout
