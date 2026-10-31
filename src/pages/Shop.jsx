import { useEffect, useState } from "react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import "./Shop.css";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        if (!response.ok) {
          throw new Error("Грешка при зареждане на продуктите.");
        }

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error("Fetch products error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Header />

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

                <button
                  type="button"
                  aria-label="Търси"
                >
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
                  <span>Парфюми</span>

                  <span>
                    {loading
                      ? "Зареждане..."
                      : `${products.length} продукта`}
                  </span>
                </div>

                {loading && (
                  <div className="shop-empty">
                    <p>
                      Зареждаме продуктите...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="shop-empty">
                    <p>{error}</p>
                  </div>
                )}

                {!loading &&
                  !error &&
                  products.length === 0 && (
                    <div className="shop-empty">
                      <p>
                        Все още няма налични продукти.
                      </p>
                    </div>
                  )}

                {!loading &&
                  !error &&
                  products.length > 0 && (
                    <div className="shop-product-grid">
                      {products.map((product) => (
                        <ProductCard
                          key={product._id}
                          product={product}
                        />
                      ))}
                    </div>
                  )}

              </section>

            </div>

          </div>
        </main>
      </div>
    </>
  );
}

export default Shop;