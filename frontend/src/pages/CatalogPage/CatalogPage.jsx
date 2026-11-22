import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CatalogLayout from '../../components/CatalogLayout/CatalogLayout'
import CatalogSkeleton from '../../components/CatalogSkeleton/CatalogSkeleton'
import CatalogError from '../../components/CatalogError/CatalogError'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter'
import ProductCard from '../../components/ProductCard/ProductCard'
import Button from '../../components/Button/Button'
import useCategories from '../../hooks/useCategories'
import useProducts from '../../hooks/useProducts'
import { remove } from '../../services/productService'
import { normalizeApiError } from '../../utils/apiError'
import { UI_TEXT } from '../../utils/constants'
import './CatalogPage.css'

/**
 * Catalog listing. Products arrive paginated and filtered by category; the
 * loading, data, error and empty branches are visually distinct.
 */
function CatalogPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [focusProductId, setFocusProductId] = useState(
    () => location.state?.createdProductId ?? location.state?.updatedProductId ?? null,
  )
  const [flash, setFlash] = useState(() => {
    if (location.state?.createdProductName) {
      return `${UI_TEXT.CATALOG_CREATED} «${location.state.createdProductName}»`
    }
    if (location.state?.updatedProductName) {
      return `${UI_TEXT.CATALOG_UPDATED} «${location.state.updatedProductName}»`
    }
    return ''
  })
  const [categoryId, setCategoryId] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const {
    status,
    products,
    pagination,
    error,
    reload,
    goToNextPage,
    goToPreviousPage,
    removeLocal,
  } = useProducts({ categoryId, focusProductId })
  const categoriesState = useCategories()

  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const handleCategoryChange = (value) => {
    setFocusProductId(null)
    setCategoryId(value)
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `${UI_TEXT.CATALOG_DELETE_CONFIRM} «${product.name}»?`,
    )
    if (!confirmed) return

    setDeletingId(product.id)
    setActionError(null)

    try {
      await remove(product.id)
      const wasLastOnPage = products.length === 1
      removeLocal(product.id)
      setFlash(`${UI_TEXT.CATALOG_DELETED} «${product.name}»`)

      if (wasLastOnPage && pagination.previous) {
        goToPreviousPage()
      } else {
        reload()
      }
    } catch (requestError) {
      setActionError(normalizeApiError(requestError))
    } finally {
      setDeletingId(null)
    }
  }

  const showPagination = Boolean(pagination.next || pagination.previous)
  const hasProducts = status === 'success' && products.length > 0

  return (
    <CatalogLayout>
      <section className="catalog-page" aria-labelledby="catalog-title">
        <header className="catalog-page__header">
          <div>
            <p className="catalog-page__eyebrow">{UI_TEXT.CATALOG_EYEBROW}</p>
            <h2 id="catalog-title" className="catalog-page__title">
              {UI_TEXT.CATALOG_TITLE}
            </h2>
            <p className="catalog-page__subtitle">{UI_TEXT.CATALOG_SUBTITLE}</p>
          </div>
          <Link to="/catalog/new" className="btn btn--primary btn--md">
            {UI_TEXT.CATALOG_NEW}
          </Link>
        </header>

        <div className="catalog-page__toolbar">
          <CategoryFilter
            categories={categoriesState.categories}
            value={categoryId}
            onChange={handleCategoryChange}
            status={categoriesState.status}
            error={categoriesState.error}
            onRetry={categoriesState.reload}
          />
          {status === 'success' && (
            <p className="catalog-page__count">
              {pagination.count} {UI_TEXT.CATALOG_PAGE_SUMMARY}
            </p>
          )}
        </div>

        {flash && (
          <p className="catalog-page__flash" role="status">
            {flash}
          </p>
        )}

        {actionError && (
          <div className="catalog-page__action-error" role="alert">
            <span>
              {UI_TEXT.CATALOG_DELETE_ERROR}
              {actionError.kind === 'http' ? ` HTTP ${actionError.status}.` : ''}{' '}
              {actionError.detail}
            </span>
            <button type="button" onClick={() => setActionError(null)}>
              {UI_TEXT.CATALOG_CLOSE}
            </button>
          </div>
        )}

        {status === 'loading' && <CatalogSkeleton />}

        {status === 'error' && <CatalogError error={error} onRetry={reload} />}

        {status === 'success' && products.length === 0 && (
          <div className="catalog-page__empty">
            <h3>{UI_TEXT.CATALOG_EMPTY_TITLE}</h3>
            <p>{UI_TEXT.CATALOG_EMPTY_MESSAGE}</p>
            {categoryId ? (
              <Button variant="secondary" onClick={() => handleCategoryChange('')}>
                {UI_TEXT.CATALOG_EMPTY_ACTION}
              </Button>
            ) : (
              <Link to="/catalog/new" className="btn btn--primary btn--md">
                {UI_TEXT.CATALOG_EMPTY_CREATE}
              </Link>
            )}
          </div>
        )}

        {hasProducts && (
          <>
            <div className="catalog-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDelete}
                  isDeleting={deletingId === product.id}
                />
              ))}
            </div>

            {showPagination && (
              <footer className="catalog-page__pagination">
                <span className="catalog-page__pagination-info">
                  {pagination.count} {UI_TEXT.CATALOG_PAGE_SUMMARY}
                </span>
                <div className="catalog-page__pagination-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!pagination.previous}
                    onClick={goToPreviousPage}
                  >
                    {UI_TEXT.CATALOG_PREVIOUS}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!pagination.next}
                    onClick={goToNextPage}
                  >
                    {UI_TEXT.CATALOG_NEXT}
                  </Button>
                </div>
              </footer>
            )}
          </>
        )}
      </section>
    </CatalogLayout>
  )
}

export default CatalogPage
