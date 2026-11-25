
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { API_URL } from "../config";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    cartTotal,
    cartIsEmpty,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState(false);

  const discountAmount = appliedPromo
    ? Number(appliedPromo.discountAmount || 0)
    : 0;

  const finalTotal = Math.max(
    0,
    Number(cartTotal) - discountAmount
  );

  const resetPromo = () => {
    setAppliedPromo(null);
    setPromoMessage("");
    setPromoError(false);
  };

  const handlePromoInputChange = (event) => {
    setPromoCodeInput(event.target.value);
    resetPromo();
  };

  const handleApplyPromo = async (event) => {
    event.preventDefault();

    const code = promoCodeInput.trim().toUpperCase();

    if (!code) {
      setPromoError(true);
      setPromoMessage("Въведи промокод.");
      return;
    }

    try {
      setPromoLoading(true);
      setPromoMessage("");
      setPromoError(false);

      const items = cartItems.map((item) => ({
        productId: item.productId,
        size: Number(item.size),
        quantity: Number(item.quantity),
      }));

      const response = await fetch(
        `${API_URL}/api/orders/validate-promo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            promoCode: code,
            items,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Промокодът не може да бъде приложен."
        );
      }

      setAppliedPromo({
        code: data.promoCode,
        discountAmount: Number(data.discountAmount || 0),
        discountedSubtotal: Number(data.discountedSubtotal),
      });

      setPromoCodeInput(data.promoCode);

      setPromoError(false);
      setPromoMessage(
        data.message || "Промокодът е приложен успешно."
      );
    } catch (error) {
      console.error("Apply promo error:", error);

      setAppliedPromo(null);
      setPromoError(true);
      setPromoMessage(error.message);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoMessage("");
    setPromoError(false);
  };

  const handleIncreaseQuantity = (cartItemId) => {
    resetPromo();
    increaseQuantity(cartItemId);
  };

  const handleDecreaseQuantity = (cartItemId) => {
    resetPromo();
    decreaseQuantity(cartItemId);
  };

  const handleRemoveItem = (cartItemId) => {
    resetPromo();
    removeFromCart(cartItemId);
  };

  const handleClearCart = () => {
    resetPromo();
    setPromoCodeInput("");
    clearCart();
  };

  if (cartIsEmpty) {
    return (
      <>
        <Header />

        <div className="cart-page">
          <main className="cart-container">
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3.5 5h2l1.8 10.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 1.9-1.4L21 8H6.2" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
              </div>

              <p className="cart-eyebrow">КОЛИЧКА</p>

              <h1>Количката ти е празна.</h1>

              <p>
                Добави любимите си аромати и ги
                намери тук, когато си готов.
              </p>

              <Link to="/shop" className="cart-empty-button">
                Разгледай парфюмите
              </Link>
            </div>
          </main>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="cart-page">
        <main className="cart-container">
          <div className="cart-header">
            <div>
              <p className="cart-eyebrow">
                PERFUMDECANTS4LESS
              </p>

              <h1>Твоята количка</h1>

              <p>
                Провери избраните аромати преди
                да продължиш към поръчката.
              </p>
            </div>

            <button
              type="button"
              className="cart-clear"
              onClick={handleClearCart}
            >
              Изчисти количката
            </button>
          </div>

          <div className="cart-layout">
            {/* CART ITEMS */}
            <section className="cart-items">
              {cartItems.map((item) => {
                const itemTotal =
                  Number(item.price) * item.quantity;

                return (
                  <article
                    className="cart-item"
                    key={item.cartItemId}
                  >
                    <div className="cart-item-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <div className="cart-placeholder">
                          <span>PD4L</span>
                        </div>
                      )}
                    </div>

                    <div className="cart-item-info">
                      <span className="cart-item-brand">
                        {item.brand}
                      </span>

                      <h2>{item.name}</h2>

                      <p>
                        Размер:{" "}
                        <strong>{item.size} ml</strong>
                      </p>

                      <div className="cart-item-bottom">
                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() =>
                              handleDecreaseQuantity(item.cartItemId)
                            }
                            aria-label="Намали количеството"
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              handleIncreaseQuantity(item.cartItemId)
                            }
                            aria-label="Увеличи количеството"
                          >
                            +
                          </button>
                        </div>

                        <div className="cart-item-price">
                          <span>
                            €{Number(item.price).toFixed(2)} / бр.
                          </span>

                          <strong>
                            €{itemTotal.toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() =>
                          handleRemoveItem(item.cartItemId)
                        }
                      >
                        Премахни
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* SUMMARY */}
            <aside className="cart-summary">
              <p className="cart-summary-eyebrow">
                ОБОБЩЕНИЕ
              </p>

              <h2>Твоята поръчка</h2>

              <div className="cart-summary-row">
                <span>Продукти</span>

                <strong>
                  {cartItems.reduce(
                    (total, item) =>
                      total + Number(item.quantity || 0),
                    0
                  )}
                </strong>
              </div>

              <div className="cart-summary-row">
                <span>Междинна сума</span>

                <strong>€{Number(cartTotal).toFixed(2)}</strong>
              </div>

              {/* PROMO CODE */}
              <div className="cart-promo">
                <h3>Имаш промокод?</h3>

                <p>
                  Въведи кода си и получи своята отстъпка.
                </p>

                {!appliedPromo ? (
                  <form
                    className="cart-promo-form"
                    onSubmit={handleApplyPromo}
                  >
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={handlePromoInputChange}
                      placeholder="Въведи промокод"
                      autoComplete="off"
                      disabled={promoLoading}
                    />

                    <button
                      type="submit"
                      disabled={promoLoading}
                    >
                      {promoLoading ? "Проверка..." : "Приложи"}
                    </button>
                  </form>
                ) : (
                  <div className="cart-promo-applied">
                    <div>
                      <span>Приложен код</span>
                      <strong>{appliedPromo.code}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemovePromo}
                    >
                      Премахни
                    </button>
                  </div>
                )}

                {promoMessage && (
                  <p
                    className={`cart-promo-message ${
                      promoError ? "error" : "success"
                    }`}
                  >
                    {promoMessage}
                  </p>
                )}
              </div>

              {appliedPromo && (
                <div className="cart-summary-row cart-discount-row">
                  <span>Отстъпка</span>

                  <strong>
                    −€{discountAmount.toFixed(2)}
                  </strong>
                </div>
              )}

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">
                <span>Общо</span>

                <strong>€{finalTotal.toFixed(2)}</strong>
              </div>

              <Link
                to="/checkout"
                state={{ appliedPromo }}
                className="cart-checkout-button"
              >
                Към поръчката
              </Link>

              <p className="cart-checkout-note">
                Доставката се изчислява при оформяне на поръчката.
              </p>

              <Link to="/shop" className="cart-continue">
                ← Продължи пазаруването
              </Link>
            </aside>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

export default Cart;
