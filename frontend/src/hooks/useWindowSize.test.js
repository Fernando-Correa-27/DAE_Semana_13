import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useWindowSize, {
  COLUMN_BREAKPOINTS,
  getColumnsForWidth,
  getSlidesPerView,
} from './useWindowSize'

function setViewport(width, height = 800) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  })
}

describe('responsive column helpers', () => {
  it('maps every breakpoint to its card count', () => {
    expect(COLUMN_BREAKPOINTS.map(({ minWidth }) => minWidth)).toEqual([
      1280, 960, 640, 0,
    ])
    expect(getColumnsForWidth(1280)).toBe(4)
    expect(getColumnsForWidth(1100)).toBe(3)
    expect(getColumnsForWidth(800)).toBe(2)
    expect(getColumnsForWidth(360)).toBe(1)
  })

  it('uses the same scale for carousel slides', () => {
    expect(getSlidesPerView(1280)).toBe(4)
    expect(getSlidesPerView(360)).toBe(1)
    expect(getSlidesPerView(Number.NaN)).toBe(1)
  })
})

describe('useWindowSize', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setViewport(1280, 900)
  })

  afterEach(() => {
    vi.useRealTimers()
    setViewport(1024, 768)
  })

  it('returns the initial viewport immediately', () => {
    const { result } = renderHook(() => useWindowSize(150))

    expect(result.current).toEqual({ width: 1280, height: 900 })
  })

  it('updates only after the debounce delay', () => {
    const { result } = renderHook(() => useWindowSize(150))

    act(() => {
      setViewport(640, 720)
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.width).toBe(1280)

    act(() => vi.advanceTimersByTime(149))
    expect(result.current.width).toBe(1280)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toEqual({ width: 640, height: 720 })
  })

  it('removes the resize listener on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useWindowSize(150))

    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    removeEventListener.mockRestore()
  })
})
