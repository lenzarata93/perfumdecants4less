import "./Shop.css";

function Shop() {
  return (
    <div className="shop-page">

      <header className="shop-page-header">
        <div className="section-container">

          <p className="section-eyebrow">
            PERFUMDECANTS4LESS
          </p>

          <h1>
            Открий своя
            <br />
            <span>следващ аромат.</span>
          </h1>

          <p>
            Дизайнерски и нишови парфюми в удобни размери.
            Избери аромат, размер и го добави в колекцията си.
          </p>

        </div>
      </header>

      <main className="shop-content">
        <div className="section-container">

          <div className="shop-toolbar">

            <div className="shop-search">
              <input
                type="text"
                placeholder="Търси парфюм или марка..."
              />

              <button aria-label="Търси">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                  />

                  <path d="M16 16L21 21" />
                </svg>
              </button>
            </div>

            <div className="shop-sort">
              <label htmlFor="sort">
                Сортирай
              </label>

              <select id="sort">
                <option value="popular">
                  Популярност
                </option>

                <option value="newest">
                  Най-нови
                </option>

                <option value="price-low">
                  Цена: ниска към висока
                </option>

                <option value="price-high">
                  Цена: висока към ниска
                </option>
              </select>
            </div>

          </div>

          <div className="shop-layout">

            <aside className="shop-filters">

              <div className="filter-group">
                <h3>Пол</h3>

                <label>
                  <input type="checkbox" />
                  <span>Мъжки</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Дамски</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Унисекс</span>
                </label>
              </div>

              <div className="filter-group">
                <h3>Размер</h3>

                <label>
                  <input type="checkbox" />
                  <span>5 ml</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>10 ml</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>20 ml</span>
                </label>
              </div>

              <div className="filter-group">
                <h3>Категория</h3>

                <label>
                  <input type="checkbox" />
                  <span>Дизайнерски</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Нишови</span>
                </label>

                <label>
                  <input type="checkbox" />
                  <span>Бестселъри</span>
                </label>
              </div>

            </aside>

            <section className="shop-products">

              <div className="shop-products-header">
                <span>
                  Парфюми
                </span>

                <span>
                  0 продукта
                </span>
              </div>

              <div className="shop-empty">
                <p>Продуктите ще бъдат добавени тук.</p>
              </div>

            </section>

          </div>

        </div>
      </main>

    </div>
  );
}

export default Shop;