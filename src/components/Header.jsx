import "./Header.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { cartCount } = useCart();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-container">

        <Link
          to="/"
          className="logo"
          onClick={closeMenu}
        >
          <span>PERFUM</span>
          <strong>DECANTS4LESS</strong>
        </Link>

        <nav
          className={`main-nav ${
            menuOpen ? "open" : ""
          }`}
        >
          <Link
            to="/"
            onClick={closeMenu}
          >
            Начало
          </Link>

          <Link
            to="/shop"
            onClick={closeMenu}
          >
            Парфюми
          </Link>

          <Link
            to="/categories"
            onClick={closeMenu}
          >
            Категории
          </Link>

          <Link
            to="/about"
            onClick={closeMenu}
          >
            За нас
          </Link>
        </nav>

        <div className="header-actions">

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

          <button
            type="button"
            className="header-icon"
            aria-label="Профил"
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
          </button>

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