import { describe, expect, it } from 'vitest'
import { adaptMovie, adaptMovies, adaptPremiere } from './movieAdapter'

const rawMovie = {
  id: 7,
  title: 'The Running Man',
  poster: '/assets/posters/the-running-man.webp',
  backdrop: '/assets/backdrops/the-running-man.webp',
  synopsis: 'Un concursante debe huir de cazadores letales.',
  ageRating: 'R',
  score: '4.2',
  showtimes: ['16:00', '19:00'],
  genres: ['Acción', 'Thriller'],
  runtime: '111 min',
  releaseDate: '2025-11-14',
  trailer: 'https://www.youtube.com/embed/KD18ddeFuyM',
  featured: false,
}

describe('adaptMovie', () => {
  it('normalizes the record without mutating the source', () => {
    const source = {
      ...rawMovie,
      showtimes: [...rawMovie.showtimes],
      genres: [...rawMovie.genres],
    }
    const snapshot = structuredClone(source)

    const movie = adaptMovie(source)

    expect(movie).toMatchObject({
      id: 7,
      title: 'The Running Man',
      score: 4.2,
      showtimes: ['16:00', '19:00'],
      genres: ['Acción', 'Thriller'],
    })
    expect(source).toEqual(snapshot)
    expect(movie.showtimes).not.toBe(source.showtimes)
    expect(movie.genres).not.toBe(source.genres)
  })

  it('preserves the original id exactly', () => {
    expect(adaptMovie({ id: 3, title: 'TRON: Ares' }).id).toBe(3)
    expect(adaptMovie({ id: '3', title: 'TRON: Ares' }).id).toBe('3')
  })

  it('applies defaults for missing or invalid values', () => {
    const movie = adaptMovie({ score: 'not-a-number', showtimes: '14:00', genres: null })

    expect(movie.title).toBe('Sin título')
    expect(movie.poster).toBe('/assets/posters/fallback.svg')
    expect(movie.backdrop).toBe('/assets/posters/fallback.svg')
    expect(movie.ageRating).toBe('NR')
    expect(movie.score).toBe(0)
    expect(movie.showtimes).toEqual([])
    expect(movie.genres).toEqual([])
  })

  it('clamps scores to the five-point scale', () => {
    expect(adaptMovie({ score: 9 }).score).toBe(5)
    expect(adaptMovie({ score: -1 }).score).toBe(0)
  })
})

describe('adaptMovies', () => {
  it('adapts every item and returns an empty list for invalid input', () => {
    const movies = adaptMovies([rawMovie, { id: 8, title: 'Springsteen' }])

    expect(movies).toHaveLength(2)
    expect(movies[0].id).toBe(7)
    expect(movies[1].id).toBe(8)
    expect(adaptMovies(null)).toEqual([])
  })
})

describe('adaptPremiere', () => {
  it('maps external fields to the application model', () => {
    const premiere = adaptPremiere({
      id: 101,
      name: 'Zootopia 2',
      poster_url: '/assets/posters/zootopia-2.webp',
      backdrop_url: '/assets/backdrops/zootopia-2.webp',
      overview: 'Judy y Nick regresan.',
      age_rating: 'PG',
      score: 4.6,
      release_date: '2026-01-15',
      runtime: '108 min',
      genres: ['Animación'],
      trailer_url: 'https://www.youtube.com/embed/J13BsdX7JZU',
    })

    expect(premiere).toMatchObject({
      id: 101,
      title: 'Zootopia 2',
      poster: '/assets/posters/zootopia-2.webp',
      backdrop: '/assets/backdrops/zootopia-2.webp',
      synopsis: 'Judy y Nick regresan.',
      ageRating: 'PG',
      score: 4.6,
      releaseDate: '2026-01-15',
      runtime: '108 min',
      genres: ['Animación'],
      trailer: 'https://www.youtube.com/embed/J13BsdX7JZU',
    })
  })
})
