import premieresData from '../data/premieres'
import { UI_TEXT } from '../utils/constants'
import { adaptPremiere } from '../utils/movieAdapter'

const REQUEST_DELAY_MS = 1500

function shouldSimulateError() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  return params.get('premieres') === 'error'
}

/**
 * Simulates a premiere request. The artificial delay lets the UI demonstrate
 * its loading state; in development, ?premieres=error forces the error branch.
 */
export function fetchPremieres() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSimulateError()) {
        reject(new Error(UI_TEXT.PREMIERES_ERROR))
        return
      }

      resolve(premieresData.map(adaptPremiere))
    }, REQUEST_DELAY_MS)
  })
}
