/**
 * Builds the multipart body used by the product form. Sending FormData even
 * when no image is attached keeps one code path for create and update; the
 * API accepts it because DRF includes MultiPartParser by default.
 */
export function buildProductFormData(values) {
  const formData = new FormData()
  formData.append('name', values.name)
  formData.append('description', values.description)
  formData.append('category_id', values.categoryId)
  formData.append('price', values.price)
  formData.append('stock', values.stock)

  if (values.image instanceof File) {
    formData.append('image', values.image)
  }

  return formData
}
