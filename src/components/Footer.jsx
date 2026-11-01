import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        <div className="footer-main">

          <div className="footer-brand">
            <a href="/" className="footer-logo">
              <span>PERFUM</span>
              <span>DECANTS</span>
            </a>

            <p>
              Открий любимите си аромати
              в размера, който е създаден за теб.
            </p>

            <div className="footer-socials">
              <a href="#" aria-label="TikTok">
                TikTok
              </a>

              <a href="#" aria-label="Instagram">
                Instagram
              </a>

              <a href="#" aria-label="Facebook">
                Facebook
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Магазин</h3>

            <a href="/shop">
              Всички парфюми
            </a>

            <a href="/categories">
              Категории
            </a>

            <a href="/shop?size=3">
              3 ml
            </a>

            <a href="/shop?size=5">
              5 ml
            </a>

            <a href="/shop?size=10">
              10 ml
            </a>

            <a href="/shop?size=20">
              20 ml
            </a>
          </div>

          <div className="footer-column">
            <h3>PerfumDecants4Less</h3>

            <a href="/about">
              За нас
            </a>

            <a href="/rewards">
              Rewards
            </a>

            <a href="/contact">
              Контакти
            </a>

            <a href="/faq">
              Често задавани въпроси
            </a>
          </div>

          <div className="footer-column">
            <h3>Помощ</h3>

            <a href="/delivery">
              Доставка
            </a>

            <a href="/returns">
              Връщане и замяна
            </a>

            <a href="/terms">
              Общи условия
            </a>

            <a href="/privacy">
              Политика за поверителност
            </a>
          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} PerfumDecants4Less.
            Всички права запазени.
          </p>

          <p>
            Made for fragrance lovers.
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;