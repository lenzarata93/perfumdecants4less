import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_URL } from "../config";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartTotal,
    cartIsEmpty,
    clearCart,
  } = useCart();

  const {
    token,
  } = useUser();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "",
    postalCode: "",
    address: "",
    deliveryMethod: "econt",
  });

  const deliveryPrices = {
    econt: 4.0,
    speedy: 3.0,
  };

  const deliveryPrice =
    deliveryPrices[formData.deliveryMethod];

  const orderTotal =
    cartTotal + deliveryPrice;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
        },

        delivery: {
          method: formData.deliveryMethod,
          city: formData.city,
          postalCode: formData.postalCode,
          address: formData.address,
        },

        payment: {
          method: "cash_on_delivery",
        },

        items: cartItems.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        })),
      };

      const headers = {
        "Content-Type": "application/json",
      };

      // Ако потребителят е логнат,
      // изпращаме JWT токена към backend-а.
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Грешка при създаване на поръчката."
        );
      }

      console.log(
        "Created order:",
        data.order
      );

      // Изчистваме количката само след
      // успешно създадена поръчка.
      clearCart();

      alert(
        `Поръчката ${data.order.orderNumber} е създадена успешно!`
      );

      navigate("/");
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      alert(
        error.message ||
          "Възникна грешка при създаване на поръчката."
      );
    }
  };

  if (cartIsEmpty) {
    return (
      <>
        <Header />

        <main className="checkout-page">
          <div className="checkout-empty">
            <p className="checkout-eyebrow">
              CHECKOUT
            </p>

            <h1>
              Количката ти е празна.
            </h1>

            <p>
              Добави поне един аромат, преди
              да продължиш към поръчката.
            </p>

            <Link
              to="/shop"
              className="checkout-empty-button"
            >
              Разгледай парфюмите
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="checkout-page">
        <div className="checkout-container">

          <div className="checkout-header">
            <p className="checkout-eyebrow">
              PERFUMDECANTS4LESS
            </p>

            <h1>
              Завърши поръчката
            </h1>

            <p>
              Въведи данните си, за да
              подготвим поръчката ти.
            </p>
          </div>

          <div className="checkout-layout">

            {/* ЛИЧНИ ДАННИ */}

            <form
              className="checkout-form"
              onSubmit={handleSubmit}
            >

              <section className="checkout-section">

                <div className="checkout-section-header">
                  <span>01</span>

                  <div>
                    <h2>
                      Лични данни
                    </h2>

                    <p>
                      Данните, с които ще
                      обработим поръчката.
                    </p>
                  </div>
                </div>

                <div className="checkout-fields checkout-fields-two">

                  <div className="checkout-field">
                    <label htmlFor="firstName">
                      Име
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Иван"
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="lastName">
                      Фамилия
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Иванов"
                      required
                    />
                  </div>

                </div>

                <div className="checkout-fields checkout-fields-two">

                  <div className="checkout-field">
                    <label htmlFor="phone">
                      Телефон
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08XXXXXXXX"
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="email">
                      Имейл
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ivan@example.com"
                      required
                    />
                  </div>

                </div>

              </section>

              {/* ДОСТАВКА */}

              <section className="checkout-section">

                <div className="checkout-section-header">
                  <span>02</span>

                  <div>
                    <h2>
                      Доставка
                    </h2>

                    <p>
                      Избери куриер и въведи
                      адреса си.
                    </p>
                  </div>
                </div>

                <div className="checkout-fields checkout-fields-two">

                  <div className="checkout-field">
                    <label htmlFor="city">
                      Град
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Пловдив"
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="postalCode">
                      Пощенски код
                    </label>

                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="4000"
                      required
                    />
                  </div>

                </div>

                <div className="checkout-field">
                  <label htmlFor="address">
                    Адрес
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="ул. Пример №10"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="deliveryMethod">
                    Метод на доставка
                  </label>

                  <select
                    id="deliveryMethod"
                    name="deliveryMethod"
                    value={formData.deliveryMethod}
                    onChange={handleChange}
                  >
                    <option value="econt">
                      Еконт — €4.00
                    </option>

                    <option value="speedy">
                      Спиди — €3.00
                    </option>
                  </select>
                </div>

              </section>

              {/* ПЛАЩАНЕ */}

              <section className="checkout-section">

                <div className="checkout-section-header">
                  <span>03</span>

                  <div>
                    <h2>
                      Плащане
                    </h2>

                    <p>
                      Засега приемаме плащане
                      при получаване.
                    </p>
                  </div>
                </div>

                <div className="checkout-payment-option">

                  <div className="checkout-radio active">
                    <span></span>
                  </div>

                  <div>
                    <strong>
                      Наложен платеж
                    </strong>

                    <p>
                      Плащане при получаване
                      на пратката.
                    </p>
                  </div>

                </div>

              </section>

              {/* ПОТВЪРЖДАВАНЕ */}

              <button
                type="submit"
                className="checkout-submit"
              >
                Потвърди поръчката

                <span>→</span>
              </button>

              <button
                type="button"
                className="checkout-back"
                onClick={() =>
                  navigate("/cart")
                }
              >
                ← Назад към количката
              </button>

            </form>

            {/* ОБОБЩЕНИЕ */}

            <aside className="checkout-summary">

              <div className="checkout-summary-card">

                <p className="checkout-summary-eyebrow">
                  ОБОБЩЕНИЕ
                </p>

                <h2>
                  Твоята поръчка
                </h2>

                <div className="checkout-products">

                  {cartItems.map((item) => (
                    <div
                      className="checkout-product"
                      key={item.cartItemId}
                    >

                      <div className="checkout-product-image">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <span>
                            PD4L
                          </span>
                        )}

                      </div>

                      <div className="checkout-product-info">

                        <span>
                          {item.brand}
                        </span>

                        <h3>
                          {item.name}
                        </h3>

                        <p>
                          {item.size} ml ×{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <strong>
                        €
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toFixed(2)}
                      </strong>

                    </div>
                  ))}

                </div>

                <div className="checkout-summary-divider"></div>

                <div className="checkout-summary-row">

                  <span>
                    Продукти
                  </span>

                  <strong>
                    €{cartTotal.toFixed(2)}
                  </strong>

                </div>

                <div className="checkout-summary-row">

                  <span>
                    Доставка (
                    {formData.deliveryMethod ===
                    "econt"
                      ? "Еконт"
                      : "Спиди"}
                    )
                  </span>

                  <strong>
                    €{deliveryPrice.toFixed(2)}
                  </strong>

                </div>

                <div className="checkout-summary-divider"></div>

                <div className="checkout-summary-total">

                  <span>
                    Общо
                  </span>

                  <strong>
                    €{orderTotal.toFixed(2)}
                  </strong>

                </div>

              </div>

              <div className="checkout-trust">

                <div>
                  <strong>✓</strong>

                  <span>
                    Оригинални парфюми
                  </span>
                </div>

                <div>
                  <strong>✓</strong>

                  <span>
                    Точен избран размер
                  </span>
                </div>

                <div>
                  <strong>✓</strong>

                  <span>
                    Сигурна обработка на поръчката
                  </span>
                </div>

              </div>

            </aside>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;