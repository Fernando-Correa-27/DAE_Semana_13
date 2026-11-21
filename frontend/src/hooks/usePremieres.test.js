import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchPremieres } from '../services/premieresService'
import usePremieres from './usePremieres'

vi.mock('../services/premieresService', () => ({
  fetchPremieres: vi.fn(),
}))

const premiere = { id: 101, title: 'Zootopia 2' }

describe('usePremieres', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts in loading state and resolves with the adapted feed', async () => {
    fetchPremieres.mockResolvedValue([premiere])

    const { result } = renderHook(() => usePremieres())

    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('success'))

    expect(result.current.premieres).toEqual([premiere])
    expect(result.current.error).toBeNull()
    expect(fetchPremieres).toHaveBeenCalledTimes(1)
  })

  it('exposes the error message when the request fails', async () => {
    fetchPremieres.mockRejectedValue(new Error('Servicio no disponible'))

    const { result } = renderHook(() => usePremieres())

    await waitFor(() => expect(result.current.status).toBe('error'))

    expect(result.current.error).toBe('Servicio no disponible')
    expect(result.current.premieres).toEqual([])
  })

  it('retries the request and can recover from an error', async () => {
    fetchPremieres
      .mockRejectedValueOnce(new Error('Servicio no disponible'))
      .mockResolvedValueOnce([premiere])

    const { result } = renderHook(() => usePremieres())

    await waitFor(() => expect(result.current.status).toBe('error'))

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.status).toBe('success'))

    expect(fetchPremieres).toHaveBeenCalledTimes(2)
    expect(result.current.premieres).toEqual([premiere])
  })

  it('ignores a response that arrives after unmount', async () => {
    let resolveRequest
    fetchPremieres.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    const { unmount } = renderHook(() => usePremieres())

    unmount()
    await act(async () => {
      resolveRequest([premiere])
      await Promise.resolve()
    })

    expect(fetchPremieres).toHaveBeenCalledTimes(1)
  })
})
