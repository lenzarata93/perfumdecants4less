import "./Rewards.css";

function Rewards() {
  return (
    <section className="rewards-section">
      <div className="section-container">

        <div className="rewards-wrapper">

          <div className="rewards-content">

            <p className="section-eyebrow">
              PERFUMDECANTS4LESS REWARDS
            </p>

            <h2>
              Купуваш.
              <br />
              <span>Събираш точки.</span>
              <br />
              Печелиш.
            </h2>

            <p className="rewards-description">
              С всяка покупка трупаш участия за специални награди.
              Колкото повече пазаруваш, толкова повече шансове
              имаш да спечелиш.
            </p>

            <div className="rewards-rule">

              <div className="rewards-rule-number">
                <strong>1</strong>
                <span>PT</span>
              </div>

              <div className="rewards-rule-text">
                <strong>1 точка за всеки 10 € оборот</strong>

                <span>
                  Точките се натрупват и участват в бъдещи тегления.
                </span>
              </div>

            </div>

            <div className="rewards-actions">

              <a
                href="/rewards"
                className="rewards-button"
              >
                Виж всички награди
                <span>→</span>
              </a>

              <span className="rewards-note">
                Без допълнително заплащане
              </span>

            </div>

          </div>

          <div className="rewards-visual">

            <div className="rewards-glow"></div>

            <div className="reward-card">

              <div className="reward-card-top">
                <span>REWARD DRAW</span>
                <span>01</span>
              </div>

              <div className="reward-product">

                <div className="reward-product-glow"></div>

                <div className="reward-bottle">

                  <div className="reward-bottle-cap"></div>

                  <div className="reward-bottle-neck"></div>

                  <div className="reward-bottle-body">
                    <small>MANCERA</small>
                    <strong>RED<br />TOBACCO</strong>
                    <span>5 ML</span>
                  </div>

                </div>

              </div>

              <div className="reward-card-info">

                <div>
                  <span>НАГРАДА</span>
                  <strong>Mancera Red Tobacco</strong>
                </div>

                <div className="reward-size">
                  5 ML
                </div>

              </div>

              <div className="reward-progress">

                <div className="reward-progress-header">
                  <span>УЧАСТИЯ</span>
                  <strong>15 / 15</strong>
                </div>

                <div className="reward-progress-bar">
                  <span></span>
                </div>

                <p>
                  Кампанията е запълнена
                </p>

              </div>

            </div>

            <div className="reward-floating-points">
              <strong>15</strong>
              <span>ENTRIES</span>
            </div>

            <div className="reward-floating-label">
              <span>ONE WINNER</span>
              <strong>GOOD LUCK.</strong>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Rewards;