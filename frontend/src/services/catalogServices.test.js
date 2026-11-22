import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import apiClient from './apiClient'
import { list as listCategories } from './categoryService'
import { create, getById, list, remove, update } from './productService'

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the category and page as query parameters', async () => {
    apiClient.get.mockResolvedValue({ data: { count: 0, results: [] } })

    await list({ categoryId: 2, page: 3 })

    expect(apiClient.get).toHaveBeenCalledWith('/products/', {
      params: { page: 3, category: 2 },
    })
  })

  it('follows a next or previous link without rebuilding it', async () => {
    apiClient.get.mockResolvedValue({ data: { count: 0, results: [] } })

    await list({ pageUrl: 'http://127.0.0.1:8000/api/products/?page=2' })

    expect(apiClient.get).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/products/?page=2',
    )
  })

  it('reads one product by id', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 7 } })

    await expect(getById(7)).resolves.toEqual({ id: 7 })
    expect(apiClient.get).toHaveBeenCalledWith('/products/7/')
  })

  it('posts multipart data when creating a product', async () => {
    const formData = new FormData()
    formData.append('name', 'Producto')
    apiClient.post.mockResolvedValue({ data: { id: 10 } })

    await expect(create(formData)).resolves.toEqual({ id: 10 })
    expect(apiClient.post).toHaveBeenCalledWith('/products/', formData)
  })

  it('patches an existing product', async () => {
    const formData = new FormData()
    apiClient.patch.mockResolvedValue({ data: { id: 7 } })

    await update(7, formData)

    expect(apiClient.patch).toHaveBeenCalledWith('/products/7/', formData)
  })

  it('deletes a product', async () => {
    apiClient.delete.mockResolvedValue({})

    await remove(7)

    expect(apiClient.delete).toHaveBeenCalledWith('/products/7/')
  })
})

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists the unpaginated categories', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 1, name: 'Hogar' }] })

    await expect(listCategories()).resolves.toEqual([{ id: 1, name: 'Hogar' }])
    expect(apiClient.get).toHaveBeenCalledWith('/categories/')
  })
})
