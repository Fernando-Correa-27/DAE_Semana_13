/**
 * Normalizes a listing response that may or may not be paginated. The catalog
 * uses the paginated product endpoint while categories are a plain array, so
 * every hook can work with the same shape.
 */
export function unwrapList(data) {
  if (Array.isArray(data)) {
    return { results: data, count: data.length, next: null, previous: null }
  }

  return {
    results: data?.results ?? [],
    count: data?.count ?? 0,
    next: data?.next ?? null,
    previous: data?.previous ?? null,
  }
}

/** Extracts the page number from an API next/previous link. */
export function getPageNumber(url) {
  if (!url) return 1

  try {
    const value = new URL(url, window.location.origin).searchParams.get('page')
    return value ? Number(value) : 1
  } catch {
    return 1
  }
}
