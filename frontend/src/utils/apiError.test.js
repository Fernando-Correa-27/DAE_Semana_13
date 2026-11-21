import { describe, expect, it } from 'vitest'
import { normalizeApiError } from './apiError'

describe('normalizeApiError', () => {
  it('marks a request without response as a network failure', () => {
    const error = normalizeApiError({ request: {}, message: 'Network Error' })

    expect(error.kind).toBe('network')
    expect(error.status).toBeNull()
  })

  it('keeps the status code and the detail returned by the API', () => {
    const error = normalizeApiError({
      response: { status: 401, data: { detail: 'Las credenciales no son válidas.' } },
    })

    expect(error).toMatchObject({
      kind: 'http',
      status: 401,
      detail: 'Las credenciales no son válidas.',
    })
  })

  it('splits DRF field messages for a 400 response', () => {
    const error = normalizeApiError({
      response: {
        status: 400,
        data: { title: ['Este campo no puede estar en blanco.'] },
      },
    })

    expect(error.kind).toBe('http')
    expect(error.status).toBe(400)
    expect(error.fieldErrors.title).toBe('Este campo no puede estar en blanco.')
  })
})
