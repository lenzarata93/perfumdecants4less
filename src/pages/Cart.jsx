import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
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

  if (cartIsEmpty) {
    return (
      <>
        <Header />

        <div className="cart-page">
          <main className="cart-container">
            <div className="cart-empty">

              <div className="cart-empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M3.5 5h2l1.8 10.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 1.9-1.4L21 8H6.2" />
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="18" cy="20" r="1" />
                </svg>
              </div>

              <p className="cart-eyebrow">
                КОЛИЧКА
              </p>

              <h1>
                Количката ти е празна.
              </h1>

              <p>
                Добави любимите си аромати и ги
                намери тук, когато си готов.
              </p>

              <Link
                to="/shop"
                className="cart-empty-button"
              >
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

              <h1>
                Твоята количка
              </h1>

              <p>
                Провери избраните аромати преди
                да продължиш към поръчката.
              </p>
            </div>

            <button
              type="button"
              className="cart-clear"
              onClick={clearCart}
            >
              Изчисти количката
            </button>

          </div>

          <div className="cart-layout">

            {/* CART ITEMS */}

            <section className="cart-items">

              {cartItems.map((item) => {
                const itemTotal =
                  Number(item.price) *
                  item.quantity;

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
                          <span>
                            PD4L
                          </span>
                        </div>
                      )}

                    </div>

                    <div className="cart-item-info">

                      <span className="cart-item-brand">
                        {item.brand}
                      </span>

                      <h2>
                        {item.name}
                      </h2>

                      <p>
                        Размер:{" "}
                        <strong>
                          {item.size} ml
                        </strong>
                      </p>

                      <div className="cart-item-bottom">

                        <div className="cart-quantity">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.cartItemId
                              )
                            }
                            aria-label="Намали количеството"
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.cartItemId
                              )
                            }
                            aria-label="Увеличи количеството"
                          >
                            +
                          </button>

                        </div>

                        <div className="cart-item-price">

                          <span>
                            €
                            {Number(
                              item.price
                            ).toFixed(2)}
                            {" "} / бр.
                          </span>

                          <strong>
                            €
                            {itemTotal.toFixed(
                              2
                            )}
                          </strong>

                        </div>

                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() =>
                          removeFromCart(
                            item.cartItemId
                          )
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

              <h2>
                Твоята поръчка
              </h2>

              <div className="cart-summary-row">

                <span>
                  Продукти
                </span>

                <strong>
                  {cartItems.reduce(
                    (total, item) =>
                      total +
                      item.quantity,
                    0
                  )}
                </strong>

              </div>

              <div className="cart-summary-row">

                <span>
                  Междинна сума
                </span>

                <strong>
                  €
                  {cartTotal.toFixed(2)}
                </strong>

              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">

                <span>
                  Общо
                </span>

                <strong>
                  €
                  {cartTotal.toFixed(2)}
                </strong>

              </div>

              <Link to="/checkout" className="cart-checkout-button">
  Към поръчката
</Link>

              <p className="cart-checkout-note">
                Checkout ще бъде активиран,
                след като добавим доставката,
                профила и плащането.
              </p>

              <Link
                to="/shop"
                className="cart-continue"
              >
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