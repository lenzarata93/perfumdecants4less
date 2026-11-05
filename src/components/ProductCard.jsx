
import "./ProductCard.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product, bestsellerRank = null }) {
  const [selectedSize, setSelectedSize] = useState(5);

  const {
    cartItems,
    addToCart,
  } = useCart();

  const prices = {
    3: product.price3ml,
    5: product.price5ml,
    10: product.price10ml,
    20: product.price20ml,
  };

  const availableMl = Number(product.availableMl || 0);

  /*
   * Колко ml от този продукт вече има в количката.
   */
  const cartProductMl = cartItems
    .filter(
      (item) =>
        item.productId?.toString() ===
        product._id?.toString()
    )
    .reduce(
      (total, item) =>
        total +
        Number(item.size) * Number(item.quantity),
      0
    );

  /*
   * Реално оставащото количество.
   */
  const remainingMl = Math.max(
    availableMl - cartProductMl,
    0
  );

  const selectedPrice = prices[selectedSize];

  const handleAddToCart = () => {
    if (remainingMl < selectedSize) {
      return;
    }

    addToCart(product, selectedSize, 1);
  };

  const handleSizeChange = (size) => {
    const price = Number(prices[size] || 0);

    if (remainingMl < size || price <= 0) {
      return;
    }

    setSelectedSize(size);
  };

  return (
    <article
      className={`product-card ${
        bestsellerRank
          ? "product-card--bestseller"
          : ""
      }`}
    >
      <div className="product-image">

        {bestsellerRank >= 1 && bestsellerRank <= 10 && (
          <div
            className={`bestseller-rank bestseller-rank-${bestsellerRank}`}
            aria-label={`Място ${bestsellerRank} в класацията`}
          >
            <span className="bestseller-rank-number">
              {String(bestsellerRank).padStart(2, "0")}
            </span>

            {bestsellerRank <= 3 && (
              <span className="bestseller-rank-label">
                {bestsellerRank === 1
                  ? "WINNER"
                  : bestsellerRank === 2
                  ? "SECOND"
                  : "THIRD"}
              </span>
            )}
          </div>
        )}

        {product.active && (
          <span className="product-badge">
            Налично
          </span>
        )}

        <button
          type="button"
          className="product-favorite"
          aria-label={`Добави ${product.name} в любими`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8C3.2 6 5.2 4 7.8 4c1.6 0 3.1.8 4.2 2.1C13.1 4.8 14.6 4 16.2 4c2.6 0 4.6 2 4.6 4.8Z" />
          </svg>
        </button>

        <div className="product-placeholder">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-image-real"
            />
          ) : (
            <div className="placeholder-bottle">
              <div className="placeholder-cap"></div>
              <div className="placeholder-neck"></div>
              <div className="placeholder-body">
                <span>PD4L</span>
              </div>
            </div>
          )}
        </div>

        <Link
          to={`/product/${product._id}`}
          className="quick-view"
        >
          Бърз преглед
          <span>→</span>
        </Link>
      </div>

      <div className="product-info">
        <div className="product-brand">
          {product.brand}
        </div>

        <h3>{product.name}</h3>

        {product.description && (
          <p className="product-description">
            {product.description}
          </p>
        )}

        <div className="product-sizes">
          {[3, 5, 10, 20].map((size) => {
            const price = Number(
              prices[size] || 0
            );

            const sizeAvailable =
              remainingMl >= size &&
              price > 0;

            return (
              <button
                key={size}
                type="button"
                className={`product-size ${
                  selectedSize === size
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleSizeChange(size)
                }
                disabled={!sizeAvailable}
              >
                {size} ml
              </button>
            );
          })}
        </div>

        <div className="product-bottom">
          <div className="product-price">
            <span>от</span>

            <strong>
              €{Number(
                selectedPrice || 0
              ).toFixed(2)}
            </strong>
          </div>

          <button
            type="button"
            className="add-to-cart"
            aria-label={`Добави ${product.name} ${selectedSize} ml в количката`}
            onClick={handleAddToCart}
            disabled={
              remainingMl < selectedSize ||
              Number(selectedPrice || 0) <= 0
            }
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3.5 5h2l1.8 10.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 1.9-1.4L21 8H6.2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
          </button>
        </div>

        <div className="product-availability">
          {remainingMl > 0
            ? `Налични: ${remainingMl} ml`
            : "Няма повече наличност за количката"}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
