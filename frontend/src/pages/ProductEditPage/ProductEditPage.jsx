import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CatalogLayout from '../../components/CatalogLayout/CatalogLayout'
import CatalogError from '../../components/CatalogError/CatalogError'
import ProductForm from '../../components/ProductForm/ProductForm'
import Button from '../../components/Button/Button'
import useCategories from '../../hooks/useCategories'
import useProduct from '../../hooks/useProduct'
import { update } from '../../services/productService'
import { normalizeApiError } from '../../utils/apiError'
import { UI_TEXT } from '../../utils/constants'
import { buildProductFormData } from '../../utils/productPayload'
import '../CatalogPage/CatalogPage.css'

/** Edit page: loads one product and reuses the create form. */
function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const productId = Number(id)
  const productState = useProduct(productId)
  const categoriesState = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  const initialValues = useMemo(() => {
    if (!productState.product) return undefined
    return {
      name: productState.product.name,
      description: productState.product.description ?? '',
      categoryId: String(productState.product.category?.id ?? ''),
      price: String(productState.product.price ?? ''),
      stock: String(productState.product.stock ?? ''),
    }
  }, [productState.product])

  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    setApiError(null)

    try {
      const product = await update(productId, buildProductFormData(values))
      navigate('/catalog', {
        state: {
          updatedProductId: product.id,
          updatedProductName: product.name,
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

  const renderContent = () => {
    if (!Number.isInteger(productId) || productId <= 0) {
      return (
        <div className="catalog-page__empty">
          <h3>{UI_TEXT.PRODUCT_FORM_NOT_FOUND}</h3>
          <Button variant="secondary" onClick={() => navigate('/catalog')}>
            {UI_TEXT.PRODUCT_FORM_CANCEL}
          </Button>
        </div>
      )
    }

    if (productState.status === 'loading') {
      return (
        <div className="catalog-page__empty" role="status" aria-live="polite">
          <h3>{UI_TEXT.PRODUCT_FORM_LOADING}</h3>
        </div>
      )
    }

    if (productState.status === 'error') {
      if (productState.error?.status === 404) {
        return (
          <div className="catalog-page__empty">
            <h3>{UI_TEXT.PRODUCT_FORM_NOT_FOUND}</h3>
            <Button variant="secondary" onClick={() => navigate('/catalog')}>
              {UI_TEXT.PRODUCT_FORM_CANCEL}
            </Button>
          </div>
        )
      }

      return <CatalogError error={productState.error} onRetry={productState.reload} />
    }

    return (
      <ProductForm
        mode="edit"
        initialValues={initialValues}
        categories={categoriesState.categories}
        categoriesStatus={categoriesState.status}
        categoriesError={categoriesState.error}
        onRetryCategories={categoriesState.reload}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        fieldErrors={fieldErrors}
        formError={formError}
        onFieldChange={() => setApiError(null)}
        currentImageUrl={productState.product?.image ?? ''}
      />
    )
  }

  return (
    <CatalogLayout>
      <section className="catalog-page" aria-labelledby="product-edit-title">
        <header className="catalog-page__header">
          <div>
            <p className="catalog-page__eyebrow">{UI_TEXT.CATALOG_EYEBROW}</p>
            <h2 id="product-edit-title" className="catalog-page__title">
              {UI_TEXT.PRODUCT_FORM_EDIT_TITLE}
            </h2>
            <p className="catalog-page__subtitle">{UI_TEXT.PRODUCT_FORM_EDIT_SUBTITLE}</p>
          </div>
        </header>

        {renderContent()}
      </section>
    </CatalogLayout>
  )
}

export default ProductEditPage
