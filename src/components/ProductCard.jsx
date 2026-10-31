import "./ProductCard.css";
import { useState } from "react";

function ProductCard({ product }) {
  const [selectedSize, setSelectedSize] = useState(5);

  const selectedPrice = product.prices[selectedSize];

  return (
    <article className="product-card">

      <div className="product-image">

        {product.badge && (
          <span className="product-badge">
            {product.badge}
          </span>
        )}

        <button
          className="product-favorite"
          aria-label={`Добави ${product.name} в любими`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8C3.2 6 5.2 4 7.8 4c1.6 0 3.1.8 4.2 2.1C13.1 4.8 14.6 4 16.2 4c2.6 0 4.6 2 4.6 4.8Z" />
          </svg>
        </button>

        <div className="product-placeholder">

          <div className="placeholder-glow"></div>

          <div className="placeholder-bottle">
            <div className="placeholder-cap"></div>

            <div className="placeholder-neck"></div>

            <div className="placeholder-body">
              <span>PD4L</span>
            </div>
          </div>

        </div>

        <a
          href={`/product/${product.id}`}
          className="quick-view"
        >
          Бърз преглед
          <span>→</span>
        </a>
      </div>

      <div className="product-info">

        <div className="product-brand">
          {product.brand}
        </div>

        <h3>{product.name}</h3>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-sizes">

          {[5, 10, 20].map((size) => (
            <button
              key={size}
              className={`product-size ${
                selectedSize === size ? "active" : ""
              }`}
              onClick={() => setSelectedSize(size)}
            >
              {size} ml
            </button>
          ))}

        </div>

        <div className="product-bottom">

          <div className="product-price">
            <span>от</span>
            <strong>
              €{selectedPrice.toFixed(2)}
            </strong>
          </div>

          <button
            className="add-to-cart"
            aria-label={`Добави ${product.name} в количката`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 5h2l1.8 10.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 1.9-1.4L21 8H6.2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
          </button>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;