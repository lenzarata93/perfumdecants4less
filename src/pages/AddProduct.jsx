import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import { API_URL } from "../config";
import "./AddProduct.css";

const PRODUCTS_API_URL = `${API_URL}/api/products`;
const PRICING_API_URL = `${API_URL}/api/pricing`;

function roundUp(price, step = 0.05) {
  if (!Number.isFinite(price) || price < 0) {
    return 0;
  }

  return Number(
    (Math.ceil((price - 0.0000001) / step) * step).toFixed(2)
  );
}

function calculatePrice(pricePerMl, size, multiplier, consumables) {
  const rawPrice =
    pricePerMl * size * multiplier + consumables;

  return roundUp(rawPrice);
}

function AddProduct() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    gender: "unisex",
    category: "",
    image: "",
    initialMl: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  });

  const [pricingSettings, setPricingSettings] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Зареждаме ценовите настройки от backend-а,
   * за да няма различни формули във frontend/backend.
   */
  useEffect(() => {
    const fetchPricingSettings = async () => {
      try {
        setPricingLoading(true);

        const response = await fetch(PRICING_API_URL);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Грешка при зареждане на ценовите настройки."
          );
        }

        setPricingSettings(data);
      } catch (error) {
        console.error(
          "Pricing settings error:",
          error
        );

        setError(error.message);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricingSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const initialMl = Number(form.initialMl);
  const purchasePrice = Number(form.purchasePrice);

  const pricePerMl =
    Number.isFinite(initialMl) &&
    initialMl > 0 &&
    Number.isFinite(purchasePrice) &&
    purchasePrice >= 0
      ? purchasePrice / initialMl
      : 0;

  /*
   * Продажни цени за визуализация.
   * Използваме реалните PricingSettings от MongoDB.
   */
  const price3ml =
    pricingSettings && pricePerMl > 0
      ? calculatePrice(
          pricePerMl,
          3,
          Number(pricingSettings.sizes?.[3]?.multiplier),
          Number(pricingSettings.sizes?.[3]?.consumablesCost)
        )
      : 0;

  const price5ml =
    pricingSettings && pricePerMl > 0
      ? calculatePrice(
          pricePerMl,
          5,
          Number(pricingSettings.sizes?.[5]?.multiplier),
          Number(pricingSettings.sizes?.[5]?.consumablesCost)
        )
      : 0;

  const price10ml =
    pricingSettings && pricePerMl > 0
      ? calculatePrice(
          pricePerMl,
          10,
          Number(pricingSettings.sizes?.[10]?.multiplier),
          Number(pricingSettings.sizes?.[10]?.consumablesCost)
        )
      : 0;

  const price20ml =
    pricingSettings && pricePerMl > 0
      ? calculatePrice(
          pricePerMl,
          20,
          Number(pricingSettings.sizes?.[20]?.multiplier),
          Number(pricingSettings.sizes?.[20]?.consumablesCost)
        )
      : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Въведи име на парфюма.");
      return;
    }

    if (!form.brand.trim()) {
      setError("Въведи марка.");
      return;
    }

    if (
      !Number.isFinite(initialMl) ||
      initialMl <= 0
    ) {
      setError(
        "Количество на първата бутилка трябва да бъде по-голямо от 0 ml."
      );
      return;
    }

    if (
      !Number.isFinite(purchasePrice) ||
      purchasePrice < 0
    ) {
      setError("Въведи валидна покупна цена.");
      return;
    }

    if (!form.purchaseDate) {
      setError("Избери дата на покупка.");
      return;
    }

    /*
     * ВАЖНО:
     *
     * Backend-ът вече създава:
     * - първата бутилка
     * - remainingMl
     * - purchasePricePerMl
     * - всички продажни цени
     *
     * Затова тук изпращаме само входните данни.
     */
    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      gender: form.gender,
      category: form.category.trim(),
      image: form.image.trim(),

      initialMl: Number(form.initialMl),
      purchasePrice: Number(form.purchasePrice),
      purchaseDate: form.purchaseDate,
    };

    try {
      setLoading(true);

      const response = await fetch(PRODUCTS_API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Грешка при създаване на парфюма."
        );
      }

      setSuccess(
        "Парфюмът беше добавен успешно."
      );

      setTimeout(() => {
        navigate("/admin/products");
      }, 900);
    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="add-product-page">
        <div className="add-product-container">

          {/* HEADER */}
          <header className="add-product-header">
            <div>
              <p className="add-product-eyebrow">
                ADMIN PANEL
              </p>

              <h1>Добави нов парфюм</h1>

              <p>
                Създай нов продукт и въведи първата закупена бутилка.
              </p>
            </div>

            <button
              type="button"
              className="add-product-back"
              onClick={() =>
                navigate("/admin/products")
              }
            >
              ← Назад към продуктите
            </button>
          </header>

          {/* ERROR */}
          {error && (
            <div className="add-product-message error">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="add-product-message success">
              {success}
            </div>
          )}

          <form
            className="add-product-form"
            onSubmit={handleSubmit}
          >

            {/* =========================
                PRODUCT INFORMATION
            ========================= */}

            <section className="add-product-card">

              <div className="add-product-card-header">
                <div>
                  <span>ПРОДУКТ</span>
                  <h2>Основна информация</h2>
                </div>
              </div>

              <div className="add-product-grid">

                <label>
                  <span>Име на парфюма</span>

                  <input
                    type="text"
                    name="name"
                    placeholder="Intense Cafe Eau de Parfum"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Марка</span>

                  <input
                    type="text"
                    name="brand"
                    placeholder="Montale"
                    value={form.brand}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Категория</span>

                  <input
                    type="text"
                    name="category"
                    placeholder="Нишов"
                    value={form.category}
                    onChange={handleChange}
                  />
                </label>

                <label>
                  <span>Пол</span>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="unisex">
                      Унисекс
                    </option>

                    <option value="male">
                      Мъжки
                    </option>

                    <option value="female">
                      Дамски
                    </option>
                  </select>
                </label>

                <label className="full-width">
                  <span>URL на снимката</span>

                  <input
                    type="text"
                    name="image"
                    placeholder="https://..."
                    value={form.image}
                    onChange={handleChange}
                  />
                </label>

                <label className="full-width">
                  <span>Описание</span>

                  <textarea
                    name="description"
                    rows="5"
                    placeholder="Описание на парфюма..."
                    value={form.description}
                    onChange={handleChange}
                  />
                </label>

              </div>
            </section>

            {/* =========================
                FIRST BOTTLE
            ========================= */}

            <section className="add-product-card">

              <div className="add-product-card-header">
                <div>
                  <span>ПЪРВА ПАРТИДА</span>
                  <h2>Закупена бутилка</h2>
                </div>
              </div>

              <div className="add-product-grid">

                <label>
                  <span>Количество</span>

                  <div className="add-product-input-unit">
                    <input
                      type="number"
                      name="initialMl"
                      min="1"
                      step="1"
                      placeholder="100"
                      value={form.initialMl}
                      onChange={handleChange}
                      required
                    />

                    <b>ml</b>
                  </div>
                </label>

                <label>
                  <span>Покупна цена</span>

                  <div className="add-product-input-unit">
                    <input
                      type="number"
                      name="purchasePrice"
                      min="0"
                      step="0.01"
                      placeholder="130.00"
                      value={form.purchasePrice}
                      onChange={handleChange}
                      required
                    />

                    <b>€</b>
                  </div>
                </label>

                <label>
                  <span>Дата на покупка</span>

                  <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                    required
                  />
                </label>

              </div>
            </section>

            {/* =========================
                PRICING PREVIEW
            ========================= */}

            <section className="add-product-card">

              <div className="add-product-card-header">
                <div>
                  <span>
                    АВТОМАТИЧНО ИЗЧИСЛЕНИЕ
                  </span>

                  <h2>Продажни цени</h2>
                </div>

                <div className="add-product-cost">
                  Себестойност

                  <strong>
                    €{pricePerMl.toFixed(3)} / ml
                  </strong>
                </div>
              </div>

              {pricingLoading ? (
                <div className="add-product-prices">
                  <p>
                    Зареждане на ценовите настройки...
                  </p>
                </div>
              ) : (
                <div className="add-product-prices">

                  <div>
                    <span>3 ML</span>

                    <strong>
                      €{price3ml.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>5 ML</span>

                    <strong>
                      €{price5ml.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>10 ML</span>

                    <strong>
                      €{price10ml.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>20 ML</span>

                    <strong>
                      €{price20ml.toFixed(2)}
                    </strong>
                  </div>

                </div>
              )}

            </section>

            {/* =========================
                ACTIONS
            ========================= */}

            <div className="add-product-actions">

              <button
                type="button"
                className="add-product-cancel"
                onClick={() =>
                  navigate("/admin/products")
                }
              >
                Отказ
              </button>

              <button
                type="submit"
                className="add-product-submit"
                disabled={
                  loading || pricingLoading
                }
              >
                {loading
                  ? "Добавяме..."
                  : "Добави парфюма"}
              </button>

            </div>

          </form>
        </div>
      </main>
    </>
  );
}

export default AddProduct;