import apiClient from './apiClient'

const PRODUCTS_PATH = '/products/'

/**
 * Product requests. The API answers the listing with a paginated envelope
 * ({ count, next, previous, results }) and accepts a category id as a filter.
 * Passing `pageUrl` follows the next/previous links exactly as the API built
 * them, which keeps filtering and paging consistent.
 */
export async function list({ categoryId = '', page = 1, pageUrl = '' } = {}) {
  if (pageUrl) {
    const { data } = await apiClient.get(pageUrl)
    return data
  }

  const params = { page }
  if (categoryId) params.category = categoryId

  const { data } = await apiClient.get(PRODUCTS_PATH, { params })
  return data
}

export async function getById(productId) {
  const { data } = await apiClient.get(`${PRODUCTS_PATH}${productId}/`)
  return data
}

export async function create(payload) {
  const { data } = await apiClient.post(PRODUCTS_PATH, payload)
  return data
}

export async function update(productId, payload) {
  const { data } = await apiClient.patch(`${PRODUCTS_PATH}${productId}/`, payload)
  return data
}

export async function remove(productId) {
  await apiClient.delete(`${PRODUCTS_PATH}${productId}/`)
}
