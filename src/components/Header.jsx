
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { API_URL } from "../config";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems } = useCart();
  const { user } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const cartCount =
    cartItems?.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ) || 0;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error("Неуспешно зареждане на продуктите.");
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Search products error:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Navigation to homepage sections
  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) {
      return;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [location.pathname, location.hash]);

  const closeMenu = () => {
    setMenuOpen(false);
    setAdminOpen(false);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setMenuOpen(false);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) return;

    setSearchOpen(false);
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handleSearchResultClick = (productId) => {
    setSearchOpen(false);
    setSearchTerm("");
    navigate(`/product/${productId}`);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const searchResults = normalizedSearch
    ? products
        .filter((product) => {
          const name = product.name?.toLowerCase() || "";
          const brand = product.brand?.toLowerCase() || "";

          return (
            name.includes(normalizedSearch) ||
            brand.includes(normalizedSearch)
          );
        })
        .slice(0, 5)
    : [];

  const getStartingPrice = (product) => {
    const prices = [
      Number(product.price3ml),
      Number(product.price5ml),
      Number(product.price10ml),
      Number(product.price20ml),
    ].filter((price) => price > 0);

    if (!prices.length) return null;

    return Math.min(...prices);
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* LOGO */}
        <Link
          to="/"
          className="logo"
          onClick={closeMenu}
        >
          <img
            src="/logo.png"
            alt="PerfumDecants4Less"
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className={`main-nav ${menuOpen ? "mobile-open" : ""}`}>
          <Link to="/" onClick={closeMenu}>
            Начало
          </Link>

          <Link to="/shop" onClick={closeMenu}>
            Парфюми
          </Link>

          <Link to="/#categories" onClick={closeMenu}>
            Категории
          </Link>

          <Link to="/#about" onClick={closeMenu}>
            За нас
          </Link>

          {menuOpen && (
            <div className="mobile-extra-links">
              {user?.isAdmin && (
                <div className="mobile-admin-links">
                  <button
                    type="button"
                    onClick={() => setAdminOpen((prev) => !prev)}
                  >
                    Администрация
                    <span>{adminOpen ? "−" : "+"}</span>
                  </button>

                  {adminOpen && (
                    <div className="mobile-admin-dropdown">
                      <Link
                        to="/admin/products"
                        onClick={closeMenu}
                      >
                        Продукти
                      </Link>

                      <Link
                        to="/admin/products/new"
                        onClick={closeMenu}
                      >
                        Добави продукт
                      </Link>

                      <Link
                        to="/admin/orders"
                        onClick={closeMenu}
                      >
                        Поръчки
                      </Link>

                      <Link
                        to="/admin/finance"
                        onClick={closeMenu}
                      >
                        Финанси
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {user ? (
                <Link to="/profile" onClick={closeMenu}>
                  Профил
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    Вход
                  </Link>

                  <Link to="/register" onClick={closeMenu}>
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>

        {/* RIGHT SIDE */}
        <div className="header-actions">

          {/* SEARCH */}
          <div
            className={`header-search ${
              searchOpen ? "search-active" : ""
            }`}
            ref={searchRef}
          >
            {!searchOpen ? (
              <button
                type="button"
                className="header-icon"
                aria-label="Търсене"
                onClick={openSearch}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="M16 16L21 21" />
                </svg>
              </button>
            ) : (
              <>
                <form
                  className="search-form"
                  onSubmit={handleSearchSubmit}
                >
                  <svg
                    className="search-form-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16L21 21" />
                  </svg>

                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Търси парфюм..."
                    autoComplete="off"
                  />

                  <button
                    type="button"
                    className="search-close"
                    onClick={closeSearch}
                    aria-label="Затвори търсенето"
                  >
                    ×
                  </button>
                </form>

                {normalizedSearch && (
                  <div className="search-dropdown">

                    {searchResults.length > 0 ? (
                      <>
                        <div className="search-results-title">
                          Резултати
                        </div>

                        {searchResults.map((product) => {
                          const startingPrice =
                            getStartingPrice(product);

                          return (
                            <button
                              type="button"
                              className="search-result"
                              key={product._id}
                              onClick={() =>
                                handleSearchResultClick(product._id)
                              }
                            >
                              <div className="search-result-image">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                  />
                                ) : (
                                  <span>P</span>
                                )}
                              </div>

                              <div className="search-result-info">
                                <strong>
                                  {product.name}
                                </strong>

                                <span>
                                  {product.brand}
                                </span>
                              </div>

                              {startingPrice !== null && (
                                <div className="search-result-price">
                                  <small>от</small>
                                  <strong>
                                    €{startingPrice.toFixed(2)}
                                  </strong>
                                </div>
                              )}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          className="search-all-results"
                          onClick={handleSearchSubmit}
                        >
                          Виж всички резултати
                          <span>→</span>
                        </button>
                      </>
                    ) : (
                      <div className="search-no-results">
                        <span className="search-no-results-icon">
                          ×
                        </span>

                        <strong>
                          Няма намерени парфюми
                        </strong>

                        <p>
                          Опитай с друго име или марка.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* CART */}
          <Link
            to="/cart"
            className="header-icon cart-icon"
            aria-label="Количка"
            onClick={closeMenu}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6" />
              <circle cx="10" cy="20" r="1.3" />
              <circle cx="18" cy="20" r="1.3" />
            </svg>

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </Link>

          {/* DESKTOP USER / ADMIN */}
          <div className="desktop-account">
            {user?.isAdmin && (
              <div className="admin-menu">
                <button
                  type="button"
                  className="admin-button"
                  onClick={() =>
                    setAdminOpen((prev) => !prev)
                  }
                >
                  Админ
                  <span>
                    {adminOpen ? "▲" : "▼"}
                  </span>
                </button>

                {adminOpen && (
                  <div className="admin-dropdown">
                    <Link
                      to="/admin/products"
                      onClick={() => setAdminOpen(false)}
                    >
                      Продукти
                    </Link>

                    <Link
                      to="/admin/products/new"
                      onClick={() => setAdminOpen(false)}
                    >
                      Добави продукт
                    </Link>

                    <Link
                      to="/admin/orders"
                      onClick={() => setAdminOpen(false)}
                    >
                      Поръчки
                    </Link>

                    <Link
                      to="/admin/finance"
                      onClick={() => setAdminOpen(false)}
                    >
                      Финанси
                    </Link>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <Link
                to="/profile"
                className="account-link"
                onClick={closeMenu}
              >
                Профил
              </Link>
            ) : (
              <Link
                to="/login"
                className="account-link"
                onClick={closeMenu}
              >
                Вход
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className={`menu-toggle ${
              menuOpen ? "open" : ""
            }`}
            onClick={() => {
              setMenuOpen((prev) => !prev);
              setAdminOpen(false);
            }}
            aria-label="Меню"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
