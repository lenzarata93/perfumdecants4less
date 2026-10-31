import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-background"></div>

      <div className="hero-content">

        <div className="hero-label">
          <span></span>
          PREMIUM FRAGRANCE DECANTS
        </div>

        <h1>
          Големи аромати.
          <br />
          <span>Малки размери.</span>
        </h1>

        <p className="hero-description">
          Открий дизайнерски и нишови парфюми в 5, 10 или 20 ml.
          Избери любимия си аромат без да купуваш цяла бутилка.
        </p>

        <div className="hero-actions">

          <a href="/shop" className="hero-button-primary">
            Разгледай парфюмите
            <span>→</span>
          </a>

          <a href="/categories" className="hero-button-link">
            Как работи?
            <span>↓</span>
          </a>

        </div>

        <div className="hero-info">

          <div>
            <strong>5 / 10 / 20</strong>
            <span>ML РАЗМЕРИ</span>
          </div>

          <div className="hero-info-divider"></div>

          <div>
            <strong>100%</strong>
            <span>ОРИГИНАЛНИ АРОМАТИ</span>
          </div>

        </div>

      </div>

      <div className="hero-product">

        <div className="hero-product-glow"></div>

        <div className="hero-product-ring"></div>

        <div className="hero-bottle-shadow"></div>

        <div className="hero-bottle">

          <div className="hero-bottle-cap"></div>

          <div className="hero-bottle-neck"></div>

          <div className="hero-bottle-label">
            <small>PERFUM</small>
            <strong>DECANTS</strong>
            <span>4 LESS</span>
          </div>

        </div>

        <div className="hero-floating-card">
          <span>CHOOSE YOUR SIZE</span>

          <div>
            <strong>5</strong>
            <strong>10</strong>
            <strong>20</strong>
            <small>ML</small>
          </div>
        </div>

        <div className="hero-product-caption">
          <span>DISCOVER</span>
          <strong>YOUR NEXT<br />SIGNATURE</strong>
        </div>

      </div>

    </section>
  );
}

export default Hero;