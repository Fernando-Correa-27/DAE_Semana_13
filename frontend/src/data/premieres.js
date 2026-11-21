/**
 * Simulated external premiere feed. Records intentionally use an external
 * shape (name, poster_url, overview, age_rating, release_date) so the
 * adapter is exercised by the service before the UI receives them.
 */
const premieres = [
  {
    id: 101,
    name: 'Zootopia 2',
    poster_url: '/assets/posters/zootopia-2.webp',
    backdrop_url: '/assets/backdrops/zootopia-2.webp',
    overview:
      'Judy Hopps y Nick Wilde regresan para resolver un caso que pondrá a prueba su amistad y el equilibrio de la ciudad.',
    age_rating: 'PG',
    score: 4.6,
    release_date: '2026-01-15',
    runtime: '108 min',
    genres: ['Animación', 'Comedia', 'Aventura'],
    trailer_url: 'https://www.youtube.com/embed/J13BsdX7JZU',
  },
  {
    id: 102,
    name: 'Predator: Badlands',
    poster_url: '/assets/posters/predator-badlands.webp',
    backdrop_url: '/assets/backdrops/predator-badlands.webp',
    overview:
      'Un joven Predator exiliado encuentra una aliada inesperada en un planeta remoto y deberá enfrentar a cazadores implacables.',
    age_rating: 'R',
    score: 4.4,
    release_date: '2026-02-05',
    runtime: '115 min',
    genres: ['Acción', 'Ciencia Ficción', 'Terror'],
    trailer_url: 'https://www.youtube.com/embed/43R9l7EkJwE',
  },
  {
    id: 103,
    name: 'The Running Man',
    poster_url: '/assets/posters/the-running-man.webp',
    backdrop_url: '/assets/backdrops/the-running-man.webp',
    overview:
      'En un futuro distópico, un hombre inocente participa en un reality show mortal donde debe huir de cazadores letales.',
    age_rating: 'R',
    score: 4.2,
    release_date: '2026-02-19',
    runtime: '111 min',
    genres: ['Acción', 'Ciencia Ficción', 'Thriller'],
    trailer_url: 'https://www.youtube.com/embed/KD18ddeFuyM',
  },
  {
    id: 104,
    name: 'Now You See Me: Now You Don\'t',
    poster_url: '/assets/posters/now-you-see-me-now-you-dont.webp',
    backdrop_url: '/assets/backdrops/now-you-see-me-now-you-dont.webp',
    overview:
      'Los magos regresan con nuevas ilusiones para enfrentar a un magnate tecnológico que desafía sus habilidades.',
    age_rating: 'PG-13',
    score: 4.1,
    release_date: '2026-03-12',
    runtime: '130 min',
    genres: ['Thriller', 'Acción', 'Misterio'],
    trailer_url: 'https://www.youtube.com/embed/-E3lMRx7HRQ',
  },
  {
    id: 105,
    name: 'TRON: Ares',
    poster_url: '/assets/posters/tron-ares.webp',
    backdrop_url: '/assets/backdrops/tron-ares.webp',
    overview:
      'Una entidad digital llega a la Tierra con una misión que podría transformar para siempre ambos mundos.',
    age_rating: 'PG-13',
    score: 4.0,
    release_date: '2026-03-26',
    runtime: '125 min',
    genres: ['Ciencia Ficción', 'Acción', 'Aventura'],
    trailer_url: 'https://www.youtube.com/embed/zvahPW14Qos',
  },
  {
    id: 106,
    name: 'Avatar: Fire and Ash',
    poster_url: '/assets/posters/avatar-fire-and-ash.webp',
    backdrop_url: '/assets/backdrops/avatar-fire-and-ash.webp',
    overview:
      'La familia Sully enfrenta una nueva tribu de Pandora con poderes elementales en una batalla por la supervivencia.',
    age_rating: 'PG-13',
    score: 4.9,
    release_date: '2026-04-09',
    runtime: '190 min',
    genres: ['Ciencia Ficción', 'Aventura', 'Fantasía'],
    trailer_url: 'https://www.youtube.com/embed/nb_fFj_0rq8',
  },
]

export default premieres
