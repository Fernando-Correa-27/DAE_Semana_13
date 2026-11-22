import { describe, expect, it } from 'vitest'
import { getPageNumber, unwrapList } from './apiResponse'

describe('unwrapList', () => {
  it('normalizes a plain array as a single page', () => {
    const data = unwrapList([{ id: 1 }, { id: 2 }])

    expect(data.results).toHaveLength(2)
    expect(data.count).toBe(2)
    expect(data.next).toBeNull()
  })

  it('keeps the paginated envelope returned by DRF', () => {
    const data = unwrapList({
      count: 9,
      next: 'http://127.0.0.1:8000/api/products/?page=2',
      previous: null,
      results: [{ id: 1 }],
    })

    expect(data.count).toBe(9)
    expect(data.results).toHaveLength(1)
    expect(data.next).toContain('page=2')
  })
})

describe('getPageNumber', () => {
  it('reads the page from an API next link', () => {
    expect(getPageNumber('http://127.0.0.1:8000/api/products/?page=3')).toBe(3)
  })

  it('defaults to page one for a missing link', () => {
    expect(getPageNumber(null)).toBe(1)
    expect(getPageNumber('not a url')).toBe(1)
  })
})
