import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from '../Button/Button'
import { UI_TEXT } from '../../utils/constants'
import './ProductForm.css'

const EMPTY_VALUES = {
  name: '',
  description: '',
  categoryId: '',
  price: '',
  stock: '',
}

/**
 * Controlled product form shared by create and edit. It deliberately lets the
 * API validate the data so the 400 response and its per-field messages are the
 * ones shown to the user, exactly as the lab requests.
 */
function ProductForm({
  mode = 'create',
  initialValues = EMPTY_VALUES,
  categories,
  categoriesStatus,
  categoriesError,
  onRetryCategories,
  onSubmit,
  isSubmitting = false,
  fieldErrors = {},
  formError = '',
  onFieldChange,
  currentImageUrl = '',
}) {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    // The edit page receives its values asynchronously; mirror them once the
    // product arrives without turning the inputs into uncontrolled fields.
    // oxlint-disable-next-line react/set-state-in-effect
    setValues({
      name: initialValues.name ?? '',
      description: initialValues.description ?? '',
      categoryId: initialValues.categoryId ?? '',
      price: initialValues.price ?? '',
      stock: initialValues.stock ?? '',
    })
    // oxlint-disable-next-line react/set-state-in-effect
    setImageFile(null)
  }, [initialValues])

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    if (onFieldChange) onFieldChange()
  }

  const handleImageChange = (event) => {
    setImageFile(event.target.files?.[0] ?? null)
    if (onFieldChange) onFieldChange()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ ...values, image: imageFile })
  }

  const categoriesUnavailable = categoriesStatus === 'loading' || categoriesStatus === 'error'
  const isEdit = mode === 'edit'

  const fieldClass = (field) =>
    `product-form__input${fieldErrors[field] ? ' product-form__input--invalid' : ''}`

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <div className="product-form__grid">
        <div className="product-form__field product-form__field--wide">
          <label className="product-form__label" htmlFor="product-name">
            {UI_TEXT.PRODUCT_FORM_NAME}
          </label>
          <input
            id="product-name"
            className={fieldClass('name')}
            name="name"
            type="text"
            value={values.name}
            maxLength={150}
            placeholder={UI_TEXT.PRODUCT_FORM_NAME_PLACEHOLDER}
            onChange={handleChange('name')}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? 'product-name-error' : undefined}
            autoFocus
          />
          {fieldErrors.name && (
            <p id="product-name-error" className="product-form__field-error" role="alert">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="product-form__field product-form__field--wide">
          <label className="product-form__label" htmlFor="product-description">
            {UI_TEXT.PRODUCT_FORM_DESCRIPTION}
          </label>
          <textarea
            id="product-description"
            className={`${fieldClass('description')} product-form__textarea`}
            name="description"
            rows={4}
            value={values.description}
            placeholder={UI_TEXT.PRODUCT_FORM_DESCRIPTION_PLACEHOLDER}
            onChange={handleChange('description')}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={fieldErrors.description ? 'product-description-error' : undefined}
          />
          {fieldErrors.description && (
            <p id="product-description-error" className="product-form__field-error" role="alert">
              {fieldErrors.description}
            </p>
          )}
        </div>

        <div className="product-form__field">
          <label className="product-form__label" htmlFor="product-category">
            {UI_TEXT.PRODUCT_FORM_CATEGORY}
          </label>
          <select
            id="product-category"
            className={fieldClass('category_id')}
            name="category_id"
            value={values.categoryId}
            onChange={handleChange('categoryId')}
            disabled={categoriesUnavailable}
            aria-invalid={Boolean(fieldErrors.category_id)}
            aria-describedby={fieldErrors.category_id ? 'product-category-error' : undefined}
          >
            <option value="">
              {categoriesStatus === 'loading'
                ? UI_TEXT.CATALOG_FILTER_LOADING
                : UI_TEXT.PRODUCT_FORM_CATEGORY_PLACEHOLDER}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          {categoriesStatus === 'error' && (
            <p className="product-form__field-error" role="alert">
              {UI_TEXT.CATALOG_FILTER_ERROR}
              {categoriesError?.detail ? ` ${categoriesError.detail}` : ''}{' '}
              <button
                type="button"
                className="product-form__inline-button"
                onClick={onRetryCategories}
              >
                {UI_TEXT.CATALOG_FILTER_RETRY}
              </button>
            </p>
          )}
          {fieldErrors.category_id && (
            <p id="product-category-error" className="product-form__field-error" role="alert">
              {fieldErrors.category_id}
            </p>
          )}
        </div>

        <div className="product-form__field">
          <label className="product-form__label" htmlFor="product-price">
            {UI_TEXT.PRODUCT_FORM_PRICE}
          </label>
          <input
            id="product-price"
            className={fieldClass('price')}
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            placeholder={UI_TEXT.PRODUCT_FORM_PRICE_PLACEHOLDER}
            onChange={handleChange('price')}
            aria-invalid={Boolean(fieldErrors.price)}
            aria-describedby={fieldErrors.price ? 'product-price-error' : undefined}
          />
          {fieldErrors.price && (
            <p id="product-price-error" className="product-form__field-error" role="alert">
              {fieldErrors.price}
            </p>
          )}
        </div>

        <div className="product-form__field">
          <label className="product-form__label" htmlFor="product-stock">
            {UI_TEXT.PRODUCT_FORM_STOCK}
          </label>
          <input
            id="product-stock"
            className={fieldClass('stock')}
            name="stock"
            type="number"
            min="0"
            step="1"
            value={values.stock}
            placeholder={UI_TEXT.PRODUCT_FORM_STOCK_PLACEHOLDER}
            onChange={handleChange('stock')}
            aria-invalid={Boolean(fieldErrors.stock)}
            aria-describedby={fieldErrors.stock ? 'product-stock-error' : undefined}
          />
          {fieldErrors.stock && (
            <p id="product-stock-error" className="product-form__field-error" role="alert">
              {fieldErrors.stock}
            </p>
          )}
        </div>

        <div className="product-form__field">
          <label className="product-form__label" htmlFor="product-image">
            {UI_TEXT.PRODUCT_FORM_IMAGE}
          </label>
          <input
            id="product-image"
            className="product-form__file"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            aria-describedby="product-image-help"
          />
          <p id="product-image-help" className="product-form__help">
            {UI_TEXT.PRODUCT_FORM_IMAGE_HELP}
          </p>
          {imageFile && <p className="product-form__file-name">{imageFile.name}</p>}
          {isEdit && currentImageUrl && (
            <div className="product-form__current-image">
              <span>{UI_TEXT.PRODUCT_FORM_CURRENT_IMAGE}</span>
              <img src={currentImageUrl} alt="" />
            </div>
          )}
          {fieldErrors.image && (
            <p className="product-form__field-error" role="alert">
              {fieldErrors.image}
            </p>
          )}
        </div>
      </div>

      {formError && (
        <p className="product-form__error" role="alert">
          {formError}
        </p>
      )}

      <div className="product-form__actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? UI_TEXT.PRODUCT_FORM_SUBMITTING
            : isEdit
              ? UI_TEXT.PRODUCT_FORM_SUBMIT_EDIT
              : UI_TEXT.PRODUCT_FORM_SUBMIT_CREATE}
        </Button>
        <Link to="/catalog" className="product-form__cancel">
          {UI_TEXT.PRODUCT_FORM_CANCEL}
        </Link>
      </div>
    </form>
  )
}

ProductForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']),
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    categoryId: PropTypes.string,
    price: PropTypes.string,
    stock: PropTypes.string,
  }),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ).isRequired,
  categoriesStatus: PropTypes.oneOf(['loading', 'success', 'error']).isRequired,
  categoriesError: PropTypes.shape({ detail: PropTypes.string }),
  onRetryCategories: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  fieldErrors: PropTypes.objectOf(PropTypes.string),
  formError: PropTypes.string,
  onFieldChange: PropTypes.func,
  currentImageUrl: PropTypes.string,
}

export default ProductForm
