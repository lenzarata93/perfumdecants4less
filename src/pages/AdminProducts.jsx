
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { API_URL } from "../config";
import "./AdminProducts.css";

const PRODUCTS_API_URL = `${API_URL}/api/products`;

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedProductId, setExpandedProductId] = useState(null);

  const [bottleForm, setBottleForm] = useState({
    initialMl: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  });

  const [addingBottleId, setAddingBottleId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(PRODUCTS_API_URL);

      if (!response.ok) {
        throw new Error("Грешка при зареждане на продуктите.");
      }

      const data = await response.json();

      const sortedProducts = [...data].sort(
        (a, b) =>
          Number(a.availableMl || 0) -
          Number(b.availableMl || 0)
      );

      setProducts(sortedProducts);
    } catch (error) {
      console.error("Admin products fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setBottleForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openBottleForm = (productId) => {
    setExpandedProductId(productId);
    setAddingBottleId(productId);
    setSuccessMessage("");
    setError("");

    setBottleForm({
      initialMl: "",
      purchasePrice: "",
      purchaseDate: new Date().toISOString().slice(0, 10),
    });
  };

  const closeBottleForm = () => {
    setAddingBottleId(null);

    setBottleForm({
      initialMl: "",
      purchasePrice: "",
      purchaseDate: new Date().toISOString().slice(0, 10),
    });
  };

  const handleAddBottle = async (event, productId) => {
    event.preventDefault();

    const initialMl = Number(bottleForm.initialMl);
    const purchasePrice = Number(bottleForm.purchasePrice);

    if (!Number.isFinite(initialMl) || initialMl <= 0) {
      setError("Количеството ml трябва да бъде по-голямо от 0.");
      return;
    }

    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
      setError("Покупната цена не е валидна.");
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${PRODUCTS_API_URL}/${productId}/bottles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initialMl,
            purchasePrice,
            purchaseDate: bottleForm.purchaseDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при добавяне на бутилката."
        );
      }

      setProducts((currentProducts) =>
        currentProducts
          .map((product) =>
            product._id === productId
              ? data.product
              : product
          )
          .sort(
            (a, b) =>
              Number(a.availableMl || 0) -
              Number(b.availableMl || 0)
          )
      );

      setSuccessMessage("Бутилката е добавена успешно.");

      setBottleForm({
        initialMl: "",
        purchasePrice: "",
        purchaseDate: new Date().toISOString().slice(0, 10),
      });

      setAddingBottleId(null);
    } catch (error) {
      console.error("Add bottle error:", error);
      setError(error.message);
    }
  };

  const toggleProduct = (productId) => {
    setExpandedProductId((currentId) =>
      currentId === productId ? null : productId
    );

    setError("");
    setSuccessMessage("");
  };

  const getBottleCostPerMl = (bottle) => {
    const value = Number(bottle.purchasePricePerMl);

    return Number.isFinite(value)
      ? value.toFixed(3)
      : "0.000";
  };

  const getActiveBottleIndex = (bottles) => {
    return bottles.findIndex(
      (bottle) => Number(bottle.remainingMl) > 0
    );
  };

  const formatPrice = (value) => {
    const price = Number(value);
    return Number.isFinite(price) ? `€${price.toFixed(2)}` : "€0.00";
  };

  if (loading) {
    return (
      <>
        <Header />

        <main className="admin-products-page">
          <div className="admin-products-container">
            <div className="admin-loading">
              Зареждаме продуктите...
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="admin-products-page">
        <div className="admin-products-container">

          <header className="admin-products-header">
            <div>
              <p className="admin-eyebrow">
                ADMIN PANEL
              </p>

              <h1>Продукти и наличности</h1>

              <p>
                Управлявай продуктите и отделните закупени
                бутилки.
              </p>
            </div>

            <div className="admin-products-count">
              <span>{products.length}</span>
              <small>продукта</small>
            </div>
          </header>

          {error && (
            <div className="admin-message admin-message-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="admin-message admin-message-success">
              {successMessage}
            </div>
          )}

          {products.length === 0 ? (
            <div className="admin-empty">
              <h2>Няма продукти</h2>
              <p>
                Все още няма добавени продукти в базата данни.
              </p>
            </div>
          ) : (
            <section className="admin-product-list">

              {products.map((product) => {
                const isExpanded =
                  expandedProductId === product._id;

                const bottles = Array.isArray(product.bottles)
                  ? product.bottles
                  : [];

                const activeBottleIndex = getActiveBottleIndex(bottles);
                const activeBottle =
                  activeBottleIndex >= 0 ? bottles[activeBottleIndex] : null;

                return (
                  <article
                    key={product._id}
                    className={`admin-product ${
                      isExpanded ? "expanded" : ""
                    }`}
                  >
                    <div className="admin-product-main">

                      <div className="admin-product-image">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          <div className="admin-image-placeholder">
                            PD4L
                          </div>
                        )}
                      </div>

                      <div className="admin-product-info">
                        <span className="admin-product-brand">
                          {product.brand}
                        </span>

                        <h2>{product.name}</h2>

                        <div className="admin-product-stats">
                          <div>
                            <span>Наличност</span>
                            <strong>
                              {Number(
                                product.availableMl || 0
                              ).toFixed(0)}{" "}
                              ml
                            </strong>
                          </div>

                          <div>
                            <span>Бутилки</span>
                            <strong>
                              {bottles.length}
                            </strong>
                          </div>

                          <div>
                            <span>Продадени</span>
                            <strong>
                              {product.timesPurchased || 0}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="admin-product-actions">
                        <button
                          type="button"
                          className="admin-button secondary"
                          onClick={() =>
                            toggleProduct(product._id)
                          }
                        >
                          {isExpanded
                            ? "Скрий"
                            : "Виж бутилки"}
                        </button>

                        <button
                          type="button"
                          className="admin-button primary"
                          onClick={() =>
                            openBottleForm(product._id)
                          }
                        >
                          + Добави бутилка
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="admin-product-details">

                        {addingBottleId === product._id && (
                          <form
                            className="bottle-form"
                            onSubmit={(event) =>
                              handleAddBottle(
                                event,
                                product._id
                              )
                            }
                          >
                            <div className="bottle-form-header">
                              <div>
                                <span>
                                  НОВА ПАРТИДА
                                </span>

                                <h3>
                                  Добави бутилка
                                </h3>
                              </div>

                              <button
                                type="button"
                                className="form-close"
                                onClick={
                                  closeBottleForm
                                }
                              >
                                ×
                              </button>
                            </div>

                            <div className="bottle-form-grid">

                              <label>
                                <span>
                                  Количество
                                </span>

                                <div className="input-with-unit">
                                  <input
                                    type="number"
                                    name="initialMl"
                                    min="1"
                                    step="1"
                                    placeholder="100"
                                    value={
                                      bottleForm.initialMl
                                    }
                                    onChange={
                                      handleFormChange
                                    }
                                    required
                                  />

                                  <b>ml</b>
                                </div>
                              </label>

                              <label>
                                <span>
                                  Покупна цена
                                </span>

                                <div className="input-with-unit">
                                  <input
                                    type="number"
                                    name="purchasePrice"
                                    min="0"
                                    step="0.01"
                                    placeholder="130.00"
                                    value={
                                      bottleForm.purchasePrice
                                    }
                                    onChange={
                                      handleFormChange
                                    }
                                    required
                                  />

                                  <b>€</b>
                                </div>
                              </label>

                              <label>
                                <span>
                                  Дата на покупка
                                </span>

                                <input
                                  type="date"
                                  name="purchaseDate"
                                  value={
                                    bottleForm.purchaseDate
                                  }
                                  onChange={
                                    handleFormChange
                                  }
                                  required
                                />
                              </label>

                              <div className="bottle-form-preview">
                                <span>Себестойност / ml</span>

                                <strong>
                                  {Number(
                                    bottleForm.initialMl
                                  ) > 0
                                    ? (
                                        Number(
                                          bottleForm.purchasePrice
                                        ) /
                                        Number(
                                          bottleForm.initialMl
                                        )
                                      ).toFixed(3)
                                    : "0.000"}{" "}
                                  €/ml
                                </strong>
                              </div>
                            </div>

                            <div className="bottle-form-actions">
                              <button
                                type="button"
                                className="admin-button secondary"
                                onClick={
                                  closeBottleForm
                                }
                              >
                                Отказ
                              </button>

                              <button
                                type="submit"
                                className="admin-button primary"
                              >
                                Добави бутилката
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="bottles-section">
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                              gap: "12px",
                              marginBottom: "24px",
                            }}
                          >
                            {[
                              ["3 ml", product.price3ml],
                              ["5 ml", product.price5ml],
                              ["10 ml", product.price10ml],
                              ["20 ml", product.price20ml],
                            ].map(([size, price]) => (
                              <div
                                key={size}
                                style={{
                                  padding: "14px 16px",
                                  border: "1px solid rgba(180, 145, 70, 0.25)",
                                  borderRadius: "12px",
                                }}
                              >
                                <span style={{ display: "block", fontSize: "12px", opacity: 0.65, marginBottom: "5px" }}>
                                  ПРОДАЖНА ЦЕНА {size}
                                </span>
                                <strong style={{ fontSize: "20px" }}>
                                  {formatPrice(price)}
                                </strong>
                              </div>
                            ))}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "16px",
                              padding: "16px 18px",
                              marginBottom: "20px",
                              borderRadius: "12px",
                              background: "rgba(180, 145, 70, 0.10)",
                              border: "1px solid rgba(180, 145, 70, 0.22)",
                            }}
                          >
                            <div>
                              <span style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.65, marginBottom: "4px" }}>
                                АКТИВНА ЦЕНОВА БУТИЛКА
                              </span>
                              <strong>
                                {activeBottle
                                  ? `Бутилка #${activeBottleIndex + 1}`
                                  : "Няма налична бутилка"}
                              </strong>
                            </div>

                            {activeBottle && (
                              <div style={{ textAlign: "right" }}>
                                <strong>
                                  {Number(activeBottle.remainingMl || 0).toFixed(0)} ml
                                </strong>
                                <span style={{ display: "block", fontSize: "13px", opacity: 0.7, marginTop: "3px" }}>
                                  себестойност {getBottleCostPerMl(activeBottle)} €/ml
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="bottles-section-header">
                            <div>
                              <span>
                                ИНВЕНТАР
                              </span>

                              <h3>
                                Закупени бутилки
                              </h3>
                            </div>

                            <strong>
                              Общо:{" "}
                              {Number(
                                product.availableMl || 0
                              ).toFixed(0)}{" "}
                              ml
                            </strong>
                          </div>

                          {bottles.length === 0 ? (
                            <div className="no-bottles">
                              Няма въведени бутилки.
                            </div>
                          ) : (
                            <div className="bottles-table">

                              <div className="bottles-table-head">
                                <span>#</span>
                                <span>Дата</span>
                                <span>Начално</span>
                                <span>Оставащо</span>
                                <span>Покупка</span>
                                <span>€/ml</span>
                              </div>

                              {bottles.map(
                                (bottle, index) => (
                                  <div
                                    className="bottle-row"
                                    key={
                                      bottle._id ||
                                      index
                                    }
                                  >
                                    <span className="bottle-number">
                                      {index + 1}
                                      {index === activeBottleIndex && Number(bottle.remainingMl) > 0 && (
                                        <small style={{ display: "block", marginTop: "3px", fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em" }}>
                                          АКТИВНА
                                        </small>
                                      )}
                                    </span>

                                    <span>
                                      {new Date(
                                        bottle.purchaseDate
                                      ).toLocaleDateString(
                                        "bg-BG"
                                      )}
                                    </span>

                                    <span>
                                      {bottle.initialMl} ml
                                    </span>

                                    <span
                                      className={
                                        Number(
                                          bottle.remainingMl
                                        ) <= 0
                                          ? "bottle-empty"
                                          : ""
                                      }
                                    >
                                      {
                                        bottle.remainingMl
                                      }{" "}
                                      ml
                                    </span>

                                    <span>
                                      €
                                      {Number(
                                        bottle.purchasePrice
                                      ).toFixed(2)}
                                    </span>

                                    <span>
                                      €
                                      {getBottleCostPerMl(
                                        bottle
                                      )}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default AdminProducts;
