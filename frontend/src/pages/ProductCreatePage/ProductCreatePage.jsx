import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CatalogLayout from '../../components/CatalogLayout/CatalogLayout'
import ProductForm from '../../components/ProductForm/ProductForm'
import useCategories from '../../hooks/useCategories'
import { create } from '../../services/productService'
import { normalizeApiError } from '../../utils/apiError'
import { UI_TEXT } from '../../utils/constants'
import { buildProductFormData } from '../../utils/productPayload'
import '../CatalogPage/CatalogPage.css'

/** Create page: a successful POST returns to the catalog with the new id. */
function ProductCreatePage() {
  const navigate = useNavigate()
  const categoriesState = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    setApiError(null)

    try {
      const product = await create(buildProductFormData(values))
      navigate('/catalog', {
        state: {
          createdProductId: product.id,
          createdProductName: product.name,
        },
      })
    } catch (requestError) {
      setApiError(normalizeApiError(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldErrors = apiError?.kind === 'http' ? apiError.fieldErrors : {}
  const formError = apiError
    ? apiError.kind === 'network'
      ? UI_TEXT.CATALOG_ERROR_CONNECTION_MESSAGE
      : apiError.detail ||
        (Object.keys(fieldErrors).length > 0 ? UI_TEXT.PRODUCT_FORM_FIELD_ERROR : '')
    : ''

  return (
    <CatalogLayout>
      <section className="catalog-page" aria-labelledby="product-create-title">
        <header className="catalog-page__header">
          <div>
            <p className="catalog-page__eyebrow">{UI_TEXT.CATALOG_EYEBROW}</p>
            <h2 id="product-create-title" className="catalog-page__title">
              {UI_TEXT.PRODUCT_FORM_CREATE_TITLE}
            </h2>
            <p className="catalog-page__subtitle">{UI_TEXT.PRODUCT_FORM_CREATE_SUBTITLE}</p>
          </div>
        </header>

        <ProductForm
          mode="create"
          categories={categoriesState.categories}
          categoriesStatus={categoriesState.status}
          categoriesError={categoriesState.error}
          onRetryCategories={categoriesState.reload}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          fieldErrors={fieldErrors}
          formError={formError}
          onFieldChange={() => setApiError(null)}
        />
      </section>
    </CatalogLayout>
  )
}

export default ProductCreatePage
