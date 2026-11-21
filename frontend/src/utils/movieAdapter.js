import { FALLBACK_POSTER } from './formatters'

const DEFAULT_AGE_RATING = 'NR'
const DEFAULT_TITLE = 'Sin título'

/**
 * Returns the value when it is a non-empty string; otherwise returns the
 * fallback. It never mutates the source object.
 */
function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

/**
 * Returns a new array with string values only. The source array is untouched.
 */
function normalizeStringArray(value) {
  if (!Array.isArray(value)) return []
  return value.filter((item) => typeof item === 'string')
}

/**
 * Converts any numeric-like score to a number between 0 and 5.
 */
function normalizeScore(value) {
  const score = Number(value)
  if (!Number.isFinite(score)) return 0
  return Math.min(5, Math.max(0, score))
}

/**
 * Normalizes a catalogue record to the movie model used by the application.
 * The id is copied verbatim so stored favourites keep working across labs.
 */
export function adaptMovie(raw = {}) {
  const source = raw ?? {}
  const poster = normalizeText(source.poster, FALLBACK_POSTER)

  return {
    id: source.id,
    title: normalizeText(source.title, DEFAULT_TITLE),
    poster,
    backdrop: normalizeText(source.backdrop, poster),
    synopsis: normalizeText(source.synopsis),
    ageRating: normalizeText(source.ageRating, DEFAULT_AGE_RATING),
    score: normalizeScore(source.score),
    showtimes: normalizeStringArray(source.showtimes),
    genres: normalizeStringArray(source.genres),
    runtime: normalizeText(source.runtime),
    releaseDate: normalizeText(source.releaseDate),
    trailer: normalizeText(source.trailer),
    featured: Boolean(source.featured),
  }
}

/**
 * Adapts every record in a catalogue list. Non-array input becomes an empty
 * list so consumers never receive undefined collections.
 */
export function adaptMovies(list = []) {
  if (!Array.isArray(list)) return []
  return list.map(adaptMovie)
}

/**
 * Adapts an external premiere record (for example, an API response with
 * name, poster_url, overview, age_rating, score and release_date) to the
 * application movie model.
 */
export function adaptPremiere(raw = {}) {
  const source = raw ?? {}
  const normalized = {
    ...source,
    title: source.name ?? source.title,
    poster: source.poster_url ?? source.poster,
    backdrop: source.backdrop_url ?? source.backdrop,
    synopsis: source.overview ?? source.synopsis,
    ageRating: source.age_rating ?? source.ageRating,
    releaseDate: source.release_date ?? source.releaseDate,
    trailer: source.trailer_url ?? source.trailer,
  }

  return adaptMovie(normalized)
}
