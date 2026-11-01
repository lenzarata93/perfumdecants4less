
import "./Header.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const { cartCount } = useCart();
  const { user, isLoggedIn, isAdmin } = useUser();

  const closeMenu = () => {
    setMenuOpen(false);
    setAdminOpen(false);
  };

  const toggleAdminMenu = () => {
    setAdminOpen((current) => !current);
  };

  return (
    <header className="site-header">
      <div className="header-container">

        {/* LOGO */}
        <Link
          to="/"
          className="logo"
          onClick={closeMenu}
        >
          <span>PERFUM</span>
          <strong>DECANTS4LESS</strong>
        </Link>

        {/* MAIN NAVIGATION */}
        <nav
          className={`main-nav ${
            menuOpen ? "open" : ""
          }`}
        >
          <Link to="/" onClick={closeMenu}>
            Начало
          </Link>

          <Link to="/shop" onClick={closeMenu}>
            Парфюми
          </Link>

          <Link to="/categories" onClick={closeMenu}>
            Категории
          </Link>

          <Link to="/about" onClick={closeMenu}>
            За нас
          </Link>

          {/* MOBILE ADMIN MENU */}
          {isLoggedIn && isAdmin && (
            <div className="mobile-admin-menu">
              <div className="mobile-admin-title">
                ADMIN
              </div>

              <Link
                to="/admin/products"
                onClick={closeMenu}
              >
                📦 Продукти
              </Link>

              <Link
                to="/admin/products/new"
                onClick={closeMenu}
              >
                ➕ Добави парфюм
              </Link>

              <Link
                to="/admin/orders"
                onClick={closeMenu}
              >
                🧾 Поръчки
              </Link>
            </div>
          )}

          {/* MOBILE AUTH */}
          <div className="mobile-auth">

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="mobile-auth-login"
                  onClick={closeMenu}
                >
                  Вход
                </Link>

                <Link
                  to="/register"
                  className="mobile-auth-register"
                  onClick={closeMenu}
                >
                  Регистрация
                </Link>
              </>
            ) : (
              <Link
                to="/profile"
                className="mobile-auth-profile"
                onClick={closeMenu}
              >
                Моят профил
              </Link>
            )}

          </div>
        </nav>

        {/* HEADER ACTIONS */}
        <div className="header-actions">

          {/* SEARCH */}
          <button
            type="button"
            className="header-icon"
            aria-label="Търсене"
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

          {/* DESKTOP AUTH */}
          {!isLoggedIn ? (
            <div className="desktop-auth">

              <Link
                to="/login"
                className="header-login"
                onClick={closeMenu}
              >
                Вход
              </Link>

              <Link
                to="/register"
                className="header-register"
                onClick={closeMenu}
              >
                Регистрация
              </Link>

            </div>
          ) : (
            <>
              {/* DESKTOP ADMIN */}
              {isAdmin && (
                <div className="admin-header-menu">
                  <button
                    type="button"
                    className="admin-header-button"
                    onClick={toggleAdminMenu}
                    aria-expanded={adminOpen}
                  >
                    ADMIN

                    <span
                      className={
                        adminOpen
                          ? "admin-arrow open"
                          : "admin-arrow"
                      }
                    >
                      ▾
                    </span>
                  </button>

                  {adminOpen && (
                    <div className="admin-dropdown">

                      <Link
                        to="/admin/products"
                        onClick={closeMenu}
                      >
                        <span>📦</span>
                        Продукти
                      </Link>

                      <Link
                        to="/admin/products/new"
                        onClick={closeMenu}
                      >
                        <span>➕</span>
                        Добави парфюм
                      </Link>

                      <Link
                        to="/admin/orders"
                        onClick={closeMenu}
                      >
                        <span>🧾</span>
                        Поръчки
                      </Link>

                    </div>
                  )}
                </div>
              )}

              {/* PROFILE */}
              <Link
                to="/profile"
                className="header-profile"
                aria-label={`Профил на ${user.firstName}`}
                onClick={closeMenu}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                  />

                  <path d="M5 20c.8-3.5 3.3-5.5 7-5.5s6.2 2 7 5.5" />
                </svg>

                <span className="header-user-name">
                  {user.firstName}
                </span>
              </Link>
            </>
          )}

          {/* CART */}
          <Link
            to="/cart"
            className="header-cart"
            aria-label={`Количка: ${cartCount} артикула`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M3.5 5h2l1.8 10.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 1.9-1.4L21 8H6.2" />

              <circle
                cx="9"
                cy="20"
                r="1"
              />

              <circle
                cx="18"
                cy="20"
                r="1"
              />
            </svg>

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </Link>

          {/* MOBILE MENU */}
          <button
            type="button"
            className="menu-button"
            aria-label={
              menuOpen
                ? "Затвори меню"
                : "Отвори меню"
            }
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
          >
            <span></span>
            <span></span>
          </button>

        </div>
      </div>
    </header>
  );
}

export default Header;
