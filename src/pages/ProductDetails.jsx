import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(5);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Продуктът не е намерен.");
        }

        const data = await response.json();

        setProduct(data);
      } catch (error) {
        console.error("Fetch product error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />

        <div className="product-details-page">
          <div className="product-details-status">
            <p>Зареждаме продукта...</p>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />

        <div className="product-details-page">
          <div className="product-details-status">
            <h2>Продуктът не е намерен</h2>

            <p>{error || "Възникна грешка."}</p>

            <Link to="/shop" className="back-to-shop">
              ← Обратно към магазина
            </Link>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  const prices = {
    3: product.price3ml,
    5: product.price5ml,
    10: product.price10ml,
    20: product.price20ml,
  };

  const selectedPrice = Number(prices[selectedSize] || 0);

  const availableMl = Number(product.availableMl || 0);

  /*
   * Максимален брой бройки от избрания размер.
   *
   * Например:
   *
   * availableMl = 10
   * selectedSize = 5
   * maxQuantity = 2
   *
   * availableMl = 10
   * selectedSize = 10
   * maxQuantity = 1
   *
   * availableMl = 10
   * selectedSize = 20
   * maxQuantity = 0
   */
  const maxQuantity =
    availableMl >= selectedSize
      ? Math.floor(availableMl / selectedSize)
      : 0;

  const canAddToCart =
    maxQuantity > 0 && selectedPrice > 0;

  const totalPrice = selectedPrice * quantity;

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity((current) => current + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1);
    }
  };

  const handleSizeChange = (size) => {
    const price = Number(prices[size] || 0);

    const newMaxQuantity =
      availableMl >= size && price > 0
        ? Math.floor(availableMl / size)
        : 0;

    /*
     * Не позволяваме избор на размер,
     * който няма достатъчно налични ml.
     */
    if (newMaxQuantity === 0) {
      return;
    }

    setSelectedSize(size);

    /*
     * Ако текущото количество е по-голямо
     * от допустимото за новия размер,
     * намаляваме го автоматично.
     */
    if (quantity > newMaxQuantity) {
      setQuantity(newMaxQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!canAddToCart) {
      return;
    }

    if (quantity > maxQuantity) {
      return;
    }

    addToCart(product, selectedSize, quantity);
  };

  return (
    <>
      <Header />

      <div className="product-details-page">
        <main className="product-details-container">

          {/* BREADCRUMB */}

          <div className="product-breadcrumb">
            <Link to="/">
              Начало
            </Link>

            <span>/</span>

            <Link to="/shop">
              Магазин
            </Link>

            <span>/</span>

            <span>
              {product.name}
            </span>
          </div>

          {/* PRODUCT */}

          <section className="product-details">

            {/* IMAGE */}

            <div className="product-details-image-wrapper">
              <div className="product-details-image">

                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                  />
                ) : (
                  <div className="product-details-placeholder">

                    <div className="placeholder-bottle-large">

                      <div className="placeholder-cap-large"></div>

                      <div className="placeholder-neck-large"></div>

                      <div className="placeholder-body-large">
                        <span>
                          PD4L
                        </span>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* INFO */}

            <div className="product-details-info">

              <div className="product-details-brand">
                {product.brand}
              </div>

              <h1>
                {product.name}
              </h1>

              {product.rating > 0 && (
                <div className="product-rating">

                  <div className="stars">
                    {"★".repeat(
                      Math.round(product.rating)
                    )}

                    {"☆".repeat(
                      5 - Math.round(product.rating)
                    )}
                  </div>

                  <span>
                    {Number(product.rating).toFixed(1)}
                  </span>

                </div>
              )}

              {product.description && (
                <p className="product-details-description">
                  {product.description}
                </p>
              )}

              <div className="product-divider"></div>

              {/* SIZE */}

              <div className="product-option">

                <div className="product-option-header">
                  <span>
                    Размер
                  </span>

                  <strong>
                    {selectedSize} ml
                  </strong>
                </div>

                <div className="product-details-sizes">

                  {[3, 5, 10, 20].map(
                    (size) => {
                      const price = Number(
                        prices[size] || 0
                      );

                      const sizeAvailable =
                        availableMl >= size &&
                        price > 0;

                      return (
                        <button
                          key={size}
                          type="button"
                          className={`details-size ${
                            selectedSize === size
                              ? "active"
                              : ""
                          }`}
                          disabled={!sizeAvailable}
                          onClick={() =>
                            handleSizeChange(size)
                          }
                        >
                          <span>
                            {size} ml
                          </span>

                          <small>
                            €
                            {price.toFixed(2)}
                          </small>
                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              {/* QUANTITY */}

              <div className="product-option">

                <div className="product-option-header">

                  <span>
                    Количество
                  </span>

                  <span className="stock-info">
                    {maxQuantity > 0
                      ? `Налични: ${maxQuantity}`
                      : "Изчерпано"}
                  </span>

                </div>

                <div className="quantity-control">

                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>

                  <span>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= maxQuantity}
                  >
                    +
                  </button>

                </div>

              </div>

              {/* PRICE */}

              <div className="product-details-price">

                <span>
                  Общо
                </span>

                <strong>
                  €
                  {totalPrice.toFixed(2)}
                </strong>

              </div>

              {/* CART */}

              <button
                type="button"
                className="product-details-cart"
                disabled={!canAddToCart}
                onClick={handleAddToCart}
              >
                {canAddToCart
                  ? "Добави в количката"
                  : "Изчерпано"}
              </button>

              {/* INFO */}

              <div className="product-details-features">

                <div className="details-feature">

                  <span className="feature-icon">
                    ✓
                  </span>

                  <div>
                    <strong>
                      Оригинален парфюм
                    </strong>

                    <p>
                      100% оригинален аромат.
                    </p>
                  </div>

                </div>

                <div className="details-feature">

                  <span className="feature-icon">
                    ✓
                  </span>

                  <div>
                    <strong>
                      Точен размер
                    </strong>

                    <p>
                      Получаваш точно избраното
                      количество.
                    </p>
                  </div>

                </div>

                <div className="details-feature">

                  <span className="feature-icon">
                    ✓
                  </span>

                  <div>
                    <strong>
                      Сигурна опаковка
                    </strong>

                    <p>
                      Всеки отлив е подготвен
                      внимателно за доставка.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ADDITIONAL INFORMATION */}

          <section className="product-extra">

            <div className="product-extra-card">

              <span>
                Пол
              </span>

              <strong>
                {product.gender === "male"
                  ? "Мъжки"
                  : product.gender === "female"
                  ? "Дамски"
                  : "Унисекс"}
              </strong>

            </div>

            <div className="product-extra-card">

              <span>
                Категория
              </span>

              <strong>
                {product.category || "Парфюм"}
              </strong>

            </div>

            <div className="product-extra-card">

              <span>
                Наличност
              </span>

              <strong>
                {availableMl > 0
                  ? `${availableMl} ml`
                  : "Изчерпано"}
              </strong>

            </div>

          </section>

          {/* BACK */}

          <div className="product-details-back">

            <Link to="/shop">
              ← Продължи пазаруването
            </Link>

          </div>

        </main>
      </div>

      <Footer />
    </>
  );
}

export default ProductDetails;