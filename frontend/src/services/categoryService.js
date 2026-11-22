import apiClient from './apiClient'

const CATEGORIES_PATH = '/categories/'

/**
 * Category requests. The category viewset is intentionally unpaginated, so
 * `list` returns the array the filter dropdown needs in one request.
 */
export async function list() {
  const { data } = await apiClient.get(CATEGORIES_PATH)
  return data
}

export async function getById(categoryId) {
  const { data } = await apiClient.get(`${CATEGORIES_PATH}${categoryId}/`)
  return data
}

export async function create(payload) {
  const { data } = await apiClient.post(CATEGORIES_PATH, payload)
  return data
}

export async function update(categoryId, payload) {
  const { data } = await apiClient.patch(`${CATEGORIES_PATH}${categoryId}/`, payload)
  return data
}

export async function remove(categoryId) {
  await apiClient.delete(`${CATEGORIES_PATH}${categoryId}/`)
}
