import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from '../Button/Button'
import { UI_TEXT } from '../../utils/constants'
import { formatCurrency } from '../../utils/currency'
import './ProductCard.css'

/** Catalog card with the nested category returned by the product endpoint. */
function ProductCard({ product, onDelete, isDeleting = false }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(product.image) && !imageFailed
  const lowStock = product.stock <= 5

  return (
    <article className="product-card">
      <div className="product-card__media">
        {showImage ? (
          <img
            className="product-card__image"
            src={product.image}
            alt={`${UI_TEXT.CATALOG_IMAGE_ALT} ${product.name}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product-card__image-fallback" aria-hidden="true">
            {product.name.charAt(0)}
          </div>
        )}
        <span className="product-card__category">{product.category?.name}</span>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>

        <dl className="product-card__meta">
          <div>
            <dt>{UI_TEXT.CATALOG_PRICE}</dt>
            <dd className="product-card__price">{formatCurrency(product.price)}</dd>
          </div>
          <div>
            <dt>{UI_TEXT.CATALOG_STOCK}</dt>
            <dd className={lowStock ? 'product-card__stock product-card__stock--low' : 'product-card__stock'}>
              {product.stock} {UI_TEXT.CATALOG_STOCK_UNITS}
            </dd>
          </div>
        </dl>

        <div className="product-card__actions">
          <Link to={`/catalog/${product.id}/edit`} className="btn btn--ghost btn--sm">
            {UI_TEXT.CATALOG_EDIT}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="product-card__delete"
            disabled={isDeleting}
            onClick={() => onDelete(product)}
          >
            {isDeleting ? UI_TEXT.CATALOG_DELETING : UI_TEXT.CATALOG_DELETE}
          </Button>
        </div>
      </div>
    </article>
  )
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.string,
    stock: PropTypes.number,
    image: PropTypes.string,
    category: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
}

export default ProductCard
