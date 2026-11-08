
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import "./Rewards.css";

function Rewards() {
  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActiveRaffle = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/raffles/active`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Грешка при зареждане на наградите."
          );
        }

        setRaffle(Array.isArray(data) && data.length > 0 ? data[0] : null);
      } catch (error) {
        console.error("Fetch active raffle error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRaffle();
  }, []);

  const collectedPoints = raffle?.collectedPoints || 0;
  const targetPoints = raffle?.targetPoints || 0;

  const progress = targetPoints > 0
    ? Math.min(100, (collectedPoints / targetPoints) * 100)
    : 0;

  const remainingPoints = Math.max(
    0,
    targetPoints - collectedPoints
  );

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

              <Link
                to="/rewards"
                className="rewards-button"
              >
                Виж всички награди
                <span>→</span>
              </Link>

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

                {loading ? (
                  <div className="reward-bottle-body">
                    <strong>ЗАРЕЖДАНЕ...</strong>
                  </div>
                ) : raffle?.image ? (
                  <img
                    src={raffle.image}
                    alt={raffle.title}
                    className="reward-dynamic-image"
                  />
                ) : (
                  <div className="reward-bottle">
                    <div className="reward-bottle-cap"></div>
                    <div className="reward-bottle-neck"></div>
                    <div className="reward-bottle-body">
                      <small>PERFUMDECANTS4LESS</small>
                      <strong>REWARD<br />DRAW</strong>
                    </div>
                  </div>
                )}

              </div>

              <div className="reward-card-info">

                <div>
                  <span>НАГРАДА</span>
                  <strong>
                    {loading
                      ? "Зареждане..."
                      : raffle
                        ? raffle.title
                        : "Очаквайте нова награда"}
                  </strong>
                </div>

                <div className="reward-size">
                  {raffle ? `${targetPoints} PT` : "REWARDS"}
                </div>

              </div>

              {raffle && (
                <div className="reward-progress">

                  <div className="reward-progress-header">
                    <span>УЧАСТИЯ</span>
                    <strong>
                      {collectedPoints} / {targetPoints}
                    </strong>
                  </div>

                  <div className="reward-progress-bar">
                    <span
                      style={{
                        width: `${progress}%`,
                      }}
                    ></span>
                  </div>

                  <p>
                    {remainingPoints > 0
                      ? `Остават ${remainingPoints} свободни участия`
                      : "Кампанията е запълнена"}
                  </p>

                </div>
              )}

              {!loading && !raffle && (
                <div className="reward-progress">
                  <p>
                    {error
                      ? "Наградата временно не може да бъде заредена."
                      : "В момента няма активни томболи."}
                  </p>
                </div>
              )}

            </div>

            <div className="reward-floating-points">
              <strong>{raffle ? targetPoints : "?"}</strong>
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
