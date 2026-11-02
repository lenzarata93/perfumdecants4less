import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import "./Shop.css";

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // FILTER STATE
  // ================================

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState("popular");

  // ================================
  // SYNC SEARCH WITH URL
  // ================================

  useEffect(() => {
    const searchFromUrl = searchParams.get("search") || "";

    setSearchTerm(searchFromUrl);
  }, [searchParams]);

  // ================================
  // FETCH PRODUCTS
  // ================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/products"
        );

        if (!response.ok) {
          throw new Error(
            "Грешка при зареждане на продуктите."
          );
        }

        const data = await response.json();

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(
          "Fetch products error:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ================================
  // CHECKBOX HANDLER
  // ================================

  const handleCheckboxChange = (
    value,
    setter
  ) => {
    setter((currentValues) => {
      if (currentValues.includes(value)) {
        return currentValues.filter(
          (item) => item !== value
        );
      }

      return [
        ...currentValues,
        value,
      ];
    });
  };

  // ================================
  // FILTER + SEARCH + SORT
  // ================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // ==============================
    // SEARCH
    // ==============================

    const search = searchTerm
      .trim()
      .toLowerCase();

    if (search) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const brand =
          product.brand?.toLowerCase() || "";

        const category =
          product.category?.toLowerCase() || "";

        return (
          name.includes(search) ||
          brand.includes(search) ||
          category.includes(search)
        );
      });
    }

    // ==============================
    // GENDER
    // ==============================

    if (selectedGenders.length > 0) {
      result = result.filter((product) =>
        selectedGenders.includes(
          product.gender
        )
      );
    }

    // ==============================
    // SIZE
    // ==============================

    if (selectedSizes.length > 0) {
      result = result.filter((product) => {
        return selectedSizes.some(
          (size) => {
            const priceField =
              `price${size}ml`;

            return (
              Number(
                product[priceField]
              ) > 0
            );
          }
        );
      });
    }

    // ==============================
    // CATEGORY
    // ==============================

    if (
      selectedCategories.length > 0
    ) {
      result = result.filter(
        (product) =>
          selectedCategories.includes(
            product.category
          )
      );
    }

    // ==============================
    // SORT
    // ==============================

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => {
          return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
          );
        });

        break;

      case "price-low":
        result.sort((a, b) => {
          return (
            Number(a.price3ml || 0) -
            Number(b.price3ml || 0)
          );
        });

        break;

      case "price-high":
        result.sort((a, b) => {
          return (
            Number(b.price3ml || 0) -
            Number(a.price3ml || 0)
          );
        });

        break;

      case "popular":
      default:
        result.sort((a, b) => {
          return (
            Number(b.timesPurchased || 0) -
            Number(a.timesPurchased || 0)
          );
        });

        break;
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedGenders,
    selectedSizes,
    selectedCategories,
    sortBy,
  ]);

  // ================================
  // CLEAR FILTERS
  // ================================

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGenders([]);
    setSelectedSizes([]);
    setSelectedCategories([]);
    setSortBy("popular");

    // Премахваме ?search= от URL
    setSearchParams({});
  };

  // ================================
  // SEARCH INPUT
  // ================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);

    // Синхронизираме URL-а с търсенето
    if (value.trim()) {
      setSearchParams({
        search: value,
      });
    } else {
      setSearchParams({});
    }
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedGenders.length > 0 ||
    selectedSizes.length > 0 ||
    selectedCategories.length > 0 ||
    sortBy !== "popular";

  return (
    <>
      <Header />

      <div className="shop-page">

        {/* ================================
            SHOP CONTENT
        ================================= */}

        <main className="shop-content">

          <div className="section-container">

            {/* ================================
                TOOLBAR
            ================================= */}

            <div className="shop-toolbar">

              <div className="shop-search">

                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Търси парфюм или марка..."
                  aria-label="Търси парфюм или марка"
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

                <select
                  id="sort"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                >

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

            {/* ================================
                LAYOUT
            ================================= */}

            <div className="shop-layout">

              {/* ================================
                  FILTERS
              ================================= */}

              <aside className="shop-filters">

                {/* GENDER */}

                <div className="filter-group">

                  <h3>
                    Пол
                  </h3>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(
                        "male"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "male",
                          setSelectedGenders
                        )
                      }
                    />

                    <span>
                      Мъжки
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(
                        "female"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "female",
                          setSelectedGenders
                        )
                      }
                    />

                    <span>
                      Дамски
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(
                        "unisex"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "unisex",
                          setSelectedGenders
                        )
                      }
                    />

                    <span>
                      Унисекс
                    </span>
                  </label>

                </div>

                {/* SIZE */}

                <div className="filter-group">

                  <h3>
                    Размер
                  </h3>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(
                        "3"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "3",
                          setSelectedSizes
                        )
                      }
                    />

                    <span>
                      3 ml
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(
                        "5"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "5",
                          setSelectedSizes
                        )
                      }
                    />

                    <span>
                      5 ml
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(
                        "10"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "10",
                          setSelectedSizes
                        )
                      }
                    />

                    <span>
                      10 ml
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(
                        "20"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "20",
                          setSelectedSizes
                        )
                      }
                    />

                    <span>
                      20 ml
                    </span>
                  </label>

                </div>

                {/* CATEGORY */}

                <div className="filter-group">

                  <h3>
                    Категория
                  </h3>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(
                        "Дизайнерски"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "Дизайнерски",
                          setSelectedCategories
                        )
                      }
                    />

                    <span>
                      Дизайнерски
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(
                        "Нишови"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "Нишови",
                          setSelectedCategories
                        )
                      }
                    />

                    <span>
                      Нишови
                    </span>
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(
                        "Бестселъри"
                      )}
                      onChange={() =>
                        handleCheckboxChange(
                          "Бестселъри",
                          setSelectedCategories
                        )
                      }
                    />

                    <span>
                      Бестселъри
                    </span>
                  </label>

                </div>

                {/* CLEAR FILTERS */}

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="clear-filters-button"
                    onClick={clearFilters}
                  >
                    × Изчисти филтрите
                  </button>
                )}

              </aside>

              {/* ================================
                  PRODUCTS
              ================================= */}

              <section className="shop-products">

                <div className="shop-products-header">

                  <span>
                    {searchTerm.trim()
                      ? `Резултати за „${searchTerm.trim()}“`
                      : "Парфюми"}
                  </span>

                  <span>
                    {loading
                      ? "Зареждане..."
                      : `${filteredProducts.length} продукта`}
                  </span>

                </div>

                {/* LOADING */}

                {loading && (
                  <div className="shop-empty">
                    <p>
                      Зареждаме продуктите...
                    </p>
                  </div>
                )}

                {/* ERROR */}

                {error && (
                  <div className="shop-empty">
                    <p>
                      {error}
                    </p>
                  </div>
                )}

                {/* NO PRODUCTS */}

                {!loading &&
                  !error &&
                  products.length === 0 && (
                    <div className="shop-empty">
                      <p>
                        Все още няма налични продукти.
                      </p>
                    </div>
                  )}

                {/* NO FILTER RESULTS */}

                {!loading &&
                  !error &&
                  products.length > 0 &&
                  filteredProducts.length === 0 && (
                    <div className="shop-empty">

                      <p>
                        Няма продукти,
                        отговарящи на избраните
                        критерии.
                      </p>

                    </div>
                  )}

                {/* PRODUCTS */}

                {!loading &&
                  !error &&
                  filteredProducts.length > 0 && (
                    <div className="shop-product-grid">

                      {filteredProducts.map(
                        (product) => (
                          <ProductCard
                            key={product._id}
                            product={product}
                          />
                        )
                      )}

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