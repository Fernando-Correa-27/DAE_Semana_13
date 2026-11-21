function toMessage(value) {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(toMessage).filter(Boolean).join(' ')
  if (typeof value === 'object') return Object.values(value).map(toMessage).filter(Boolean).join(' ')
  return String(value)
}

/**
 * Turns an Axios failure into a shape the interface can render without
 * guessing: a network failure (no response) is not the same as an HTTP error,
 * and a 400 keeps the per-field messages returned by DRF.
 */
export function normalizeApiError(error) {
  const response = error?.response

  if (response) {
    const data = response.data
    const fieldErrors = {}
    let detail = ''

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.entries(data).forEach(([field, value]) => {
        if (field === 'detail' || field === 'non_field_errors') {
          detail = toMessage(value)
        } else {
          fieldErrors[field] = toMessage(value)
        }
      })
    } else {
      detail = toMessage(data)
    }

    return {
      kind: 'http',
      status: response.status,
      detail,
      fieldErrors,
    }
  }

  if (error?.request) {
    return { kind: 'network', status: null, detail: '', fieldErrors: {} }
  }

  return {
    kind: 'unknown',
    status: null,
    detail: toMessage(error?.message),
    fieldErrors: {},
  }
}
