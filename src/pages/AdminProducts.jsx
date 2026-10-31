import { useState } from "react";
import "./AdminProducts.css";

const initialFormData = {
  name: "",
  brand: "",
  description: "",
  gender: "",
  category: "",
  image: "",
  pricePerMl: "",
  price5ml: "",
  price10ml: "",
  price20ml: "",
  initialMl: "",
  purchasePrice: "",
  rating: "",
  comments: "",
  active: true,
};

function AdminProducts() {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          description: formData.description,
          gender: formData.gender,
          category: formData.category,
          image: formData.image,
          pricePerMl: Number(formData.pricePerMl),
          price5ml: Number(formData.price5ml),
          price10ml: Number(formData.price10ml),
          price20ml: Number(formData.price20ml),
          availableMl: Number(formData.initialMl),
          rating: formData.rating ? Number(formData.rating) : 0,
          comments: formData.comments,
          active: formData.active,
          bottles: [
            {
              initialMl: Number(formData.initialMl),
              remainingMl: Number(formData.initialMl),
              purchasePrice: Number(formData.purchasePrice),
              purchasePricePerMl:
                Number(formData.purchasePrice) /
                Number(formData.initialMl),
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при създаване на продукта."
        );
      }

      console.log("Продуктът е създаден:", data);

      // Изчистваме формата след успешно добавяне
      setFormData(initialFormData);

      alert("Продуктът е добавен успешно!");
    } catch (error) {
      console.error("Create product error:", error);

      alert(error.message);
    }
  };

  return (
    <main className="admin-products-page">
      <div className="admin-products-container">

        <div className="admin-products-heading">
          <p>ADMIN PANEL</p>

          <h1>Добави продукт</h1>

          <span>
            Добави нов парфюм и информацията за първата му бутилка.
          </span>
        </div>

        <form
          className="admin-product-form"
          onSubmit={handleSubmit}
        >

          {/* 01 — Основна информация */}
          <section className="admin-form-section">
            <div className="admin-form-section-heading">
              <span>01</span>

              <div>
                <h2>Основна информация</h2>
                <p>Данни за парфюма</p>
              </div>
            </div>

            <div className="admin-form-grid">

              <div className="admin-field">
                <label htmlFor="name">
                  Име на парфюма
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Mancera Red Tobacco"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="brand">
                  Бранд
                </label>

                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Mancera"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="gender">
                  Пол
                </label>

                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Избери пол
                  </option>

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
              </div>

              <div className="admin-field">
                <label htmlFor="category">
                  Категория
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Нишови"
                />
              </div>

              <div className="admin-field admin-field-full">
                <label htmlFor="description">
                  Описание
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Кратко описание на аромата..."
                  rows="4"
                />
              </div>

              <div className="admin-field admin-field-full">
                <label htmlFor="image">
                  URL на снимката
                </label>

                <input
                  id="image"
                  name="image"
                  type="text"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

            </div>
          </section>


          {/* 02 — Продажни цени */}
          <section className="admin-form-section">

            <div className="admin-form-section-heading">
              <span>02</span>

              <div>
                <h2>Продажни цени</h2>
                <p>Цени за отливките</p>
              </div>
            </div>

            <div className="admin-form-grid admin-price-grid">

              <div className="admin-field">
                <label htmlFor="pricePerMl">
                  Цена за 1 ml (€)
                </label>

                <input
                  id="pricePerMl"
                  name="pricePerMl"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePerMl}
                  onChange={handleChange}
                  placeholder="1.05"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="price5ml">
                  Цена 5 ml (€)
                </label>

                <input
                  id="price5ml"
                  name="price5ml"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price5ml}
                  onChange={handleChange}
                  placeholder="5.25"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="price10ml">
                  Цена 10 ml (€)
                </label>

                <input
                  id="price10ml"
                  name="price10ml"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price10ml}
                  onChange={handleChange}
                  placeholder="9.35"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="price20ml">
                  Цена 20 ml (€)
                </label>

                <input
                  id="price20ml"
                  name="price20ml"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price20ml}
                  onChange={handleChange}
                  placeholder="17.30"
                  required
                />
              </div>

            </div>
          </section>


          {/* 03 — Първа бутилка */}
          <section className="admin-form-section">

            <div className="admin-form-section-heading">
              <span>03</span>

              <div>
                <h2>Първа бутилка</h2>
                <p>Покупка и наличност</p>
              </div>
            </div>

            <div className="admin-form-grid">

              <div className="admin-field">
                <label htmlFor="initialMl">
                  Количество в бутилката (ml)
                </label>

                <input
                  id="initialMl"
                  name="initialMl"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.initialMl}
                  onChange={handleChange}
                  placeholder="120"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="purchasePrice">
                  Покупна цена на бутилката (€)
                </label>

                <input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  placeholder="95.00"
                  required
                />
              </div>

            </div>
          </section>


          {/* 04 — Допълнителна информация */}
          <section className="admin-form-section">

            <div className="admin-form-section-heading">
              <span>04</span>

              <div>
                <h2>Допълнителна информация</h2>
                <p>Оценка и вътрешни бележки</p>
              </div>
            </div>

            <div className="admin-form-grid">

              <div className="admin-field">
                <label htmlFor="rating">
                  Оценка
                </label>

                <input
                  id="rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="4.8"
                />
              </div>

              <div className="admin-field admin-field-full">
                <label htmlFor="comments">
                  Коментари
                </label>

                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="Вътрешни бележки за продукта..."
                  rows="4"
                />
              </div>

            </div>
          </section>


          {/* Статус */}
          <section className="admin-form-section admin-status-section">

            <div>
              <h2>Продуктът е активен</h2>

              <p>
                Активните продукти се показват в магазина.
              </p>
            </div>

            <label className="admin-switch">

              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />

              <span></span>

            </label>

          </section>


          {/* Submit */}
          <button
            type="submit"
            className="admin-submit-button"
          >
            Добави продукта

            <span>→</span>
          </button>

        </form>

      </div>
    </main>
  );
}

export default AdminProducts;