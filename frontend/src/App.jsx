import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import Hero from './components/Hero/Hero'
import PremieresSection from './components/PremieresSection/PremieresSection'
import MovieList from './components/MovieList/MovieList'
import MovieDetailModal from './components/MovieDetailModal/MovieDetailModal'
import moviesData from './data/cartelera'
import useDebounce from './hooks/useDebounce'
import useTheme from './hooks/useTheme'
import { UI_TEXT } from './utils/constants'
import { readFavoriteIds, writeFavoriteIds } from './utils/favorites'

import './styles/component-overrides.css'

const SEARCH_DEBOUNCE_MS = 300

function App() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const [favoriteIds, setFavoriteIds] = useState(() =>
    readFavoriteIds(moviesData.map((movie) => movie.id))
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [detailSection, setDetailSection] = useState('details')
  const [heroIndex, setHeroIndex] = useState(0)
  // Derived from the single source of truth; never stored as separate state.
  const favoritesCount = favoriteIds.length
  const searchInputRef = useRef(null)
  // The immediate value controls the input; only the debounced value filters.
  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS)

  // const list = useMemo(() => moviesData.filter((m) => !m.featured), [])

  // const carouselMovies = useMemo(() => {
  //   const featuredMovies = moviesData.filter((m) => m.featured)
  //   if (featuredMovies.length > 0) return featuredMovies
  //   return moviesData.slice(0, 3)
  // }, [])

  // antes: const list = useMemo(() => moviesData.filter((m) => !m.featured), [])
  
  const list = moviesData

  const carouselMovies = useMemo(
    () => [...moviesData].sort((a, b) => b.score - a.score).slice(0, 5),
    []
  )

  // Genre list
  const genres = useMemo(() => {
    const allGenres = moviesData.flatMap((m) => m.genres || [])
    return [...new Set(allGenres)].sort()
  }, [])

  // Filtered movies
  const filteredMovies = useMemo(() => {
    let filtered = list

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.synopsis.toLowerCase().includes(query)
      )
    }

    if (genreFilter) {
      filtered = filtered.filter((m) => (m.genres || []).includes(genreFilter))
    }

    return filtered
  }, [list, debouncedSearch, genreFilter])

  // Scroll to the section named in the hash (shared navigation).
  useEffect(() => {
    const targetId = location.hash.replace('#', '')
    if (!targetId) return

    const target = document.getElementById(targetId)
    if (!target) return

    const frame = requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [location.hash])

  // Persist favorites after their lazy initial read
  useEffect(() => {
    writeFavoriteIds(favoriteIds)
  }, [favoriteIds])

  // Carousel auto-rotation
    useEffect(() => {
    if (carouselMovies.length <= 1) return
    const id = setTimeout(
      () => setHeroIndex((prev) => (prev + 1) % carouselMovies.length),
      6000
    )
    return () => clearTimeout(id)
  }, [heroIndex, carouselMovies.length])

  // Pause on page hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        document.body.style.setProperty('--carousel-paused', 'true')
      } else {
        document.body.style.setProperty('--carousel-paused', 'false')
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Handlers
  const handleToggleFavorite = useCallback(
    (movieId) => {
      const movie = moviesData.find((item) => item.id === movieId)
      const movieTitle = movie?.title ?? ''
      const wasFavorite = favoriteIds.includes(movieId)

      setFavoriteIds((prev) =>
        wasFavorite
          ? prev.filter((id) => id !== movieId)
          : [...prev, movieId]
      )

      if (wasFavorite) {
        toast(`${UI_TEXT.FAVORITE_REMOVED_TOAST} "${movieTitle}"`, {
          id: `favorite-${movieId}`,
          icon: '💔',
        })
      } else {
        toast.success(`${UI_TEXT.FAVORITE_ADDED_TOAST} "${movieTitle}"`, {
          id: `favorite-${movieId}`,
        })
      }
    },
    [favoriteIds]
  )

  const handleClearFilters = useCallback(() => {
    setSearchQuery('')
    setGenreFilter('')
    searchInputRef.current?.focus()
  }, [])

  const handleSelectMovie = useCallback((movie) => {
    setSelectedMovie(movie)
    setDetailSection('details')
  }, [])

  const handleShowTrailer = useCallback((movie) => {
    setSelectedMovie(movie)
    setDetailSection('trailer')
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedMovie(null)
  }, [])

  const handleNextSlide = useCallback(() => {
    setHeroIndex((prev) => (prev + 1) % carouselMovies.length)
  }, [carouselMovies.length])

  const handlePrevSlide = useCallback(() => {
    setHeroIndex((prev) =>
      prev === 0 ? carouselMovies.length - 1 : prev - 1
    )
  }, [carouselMovies.length])

  // Touch state for swipe
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.touches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50
    if (distance > minSwipeDistance) {
      handleNextSlide()
    } else if (distance < -minSwipeDistance) {
      handlePrevSlide()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }, [touchStart, touchEnd, handleNextSlide, handlePrevSlide])

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        favoritesCount={favoritesCount}
      />
      <main className="app__main">
        <Hero
          movies={carouselMovies}
          currentIndex={heroIndex}
          onSelect={handleSelectMovie}
          onTrailer={handleShowTrailer}
          onSelectIndex={setHeroIndex}
          onNext={handleNextSlide}
          onPrev={handlePrevSlide}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          hasActiveFilters={Boolean(searchQuery || genreFilter)}
          onClearFilters={handleClearFilters}
          searchInputRef={searchInputRef}
        />
        <PremieresSection />
        <MovieList
          movies={filteredMovies}
          onSelect={handleSelectMovie}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          activeQuery={debouncedSearch}
          genres={genres}
          genreFilter={genreFilter}
          onGenreChange={setGenreFilter}
          onClearFilters={handleClearFilters}
        />
      </main>
      <Footer />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2600,
          className: 'app-toast',
        }}
      />

      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={handleCloseDetail}
          initialSection={detailSection}
        />
      )}
    </div>
  )
}

export default App
