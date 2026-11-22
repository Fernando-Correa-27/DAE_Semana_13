import { describe, expect, it } from 'vitest'
import { formatCurrency } from './currency'

describe('formatCurrency', () => {
  it('formats an API decimal string with two cents', () => {
    const formatted = formatCurrency('249.90')

    expect(formatted).toContain('S/')
    expect(formatted).toContain('249.90')
  })

  it('returns an empty string for a non-numeric value', () => {
    expect(formatCurrency('not-a-price')).toBe('')
  })
})
