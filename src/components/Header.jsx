import "./Header.css";
import { useState } from "react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-container">

        <a href="/" className="logo">
          <span>PERFUM</span>
          <strong>DECANTS4LESS</strong>
        </a>

        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>
          <a href="/">Начало</a>
          <a href="/shop">Парфюми</a>
          <a href="/categories">Категории</a>
          <a href="/about">За нас</a>
        </nav>

        <div className="header-actions">

          <button
            className="header-icon"
            aria-label="Търсене"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16L21 21" />
            </svg>
          </button>

          <button
            className="header-icon"
            aria-label="Профил"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c.8-3.5 3.3-5.5 7-5.5s6.2 2 7 5.5" />
            </svg>
          </button>

          <button
            className="header-cart"
            aria-label="Количка"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 5h2l1.8 10.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 1.9-1.4L21 8H6.2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>

            <span className="cart-count">0</span>
          </button>

          <button
            className="menu-button"
            aria-label="Отвори меню"
            onClick={() => setMenuOpen(!menuOpen)}
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