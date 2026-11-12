
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import "./Rewards.css";

function Rewards() {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActiveRaffles = async () => {
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

        setRaffles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch active raffles error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRaffles();
  }, []);

  const getProgress = (raffle) => {
    if (!raffle.targetPoints) return 0;

    return Math.min(
      100,
      (Number(raffle.collectedPoints || 0) /
        Number(raffle.targetPoints)) *
        100
    );
  };

  const getRemaining = (raffle) => {
    return Math.max(
      0,
      Number(raffle.targetPoints || 0) -
        Number(raffle.collectedPoints || 0)
    );
  };

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

            {loading ? (
              <div className="rewards-carousel-message">
                Зареждаме активните награди...
              </div>
            ) : error ? (
              <div className="rewards-carousel-message">
                Наградите временно не могат да бъдат заредени.
              </div>
            ) : raffles.length === 0 ? (
              <div className="reward-card">
                <div className="reward-card-top">
                  <span>REWARD DRAW</span>
                  <span>00</span>
                </div>

                <div className="reward-product">
                  <div className="reward-bottle">
                    <div className="reward-bottle-cap"></div>
                    <div className="reward-bottle-neck"></div>
                    <div className="reward-bottle-body">
                      <small>PERFUMDECANTS4LESS</small>
                      <strong>REWARD<br />DRAW</strong>
                    </div>
                  </div>
                </div>

                <div className="reward-card-info">
                  <div>
                    <span>НАГРАДА</span>
                    <strong>Очаквайте нова награда</strong>
                  </div>

                  <div className="reward-size">
                    REWARDS
                  </div>
                </div>

                <div className="reward-progress">
                  <p>В момента няма активни томболи.</p>
                </div>
              </div>
            ) : (
              <div className="rewards-carousel">
                {raffles.map((raffle, index) => {
                  const collectedPoints = Number(
                    raffle.collectedPoints || 0
                  );
                  const targetPoints = Number(
                    raffle.targetPoints || 0
                  );
                  const progress = getProgress(raffle);
                  const remainingPoints = getRemaining(raffle);

                  return (
                    <article
                      className="rewards-carousel-item"
                      key={raffle._id}
                    >
                      <div className="reward-card">
                        <div className="reward-card-top">
                          <span>REWARD DRAW</span>
                          <span>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="reward-product">
                          {raffle.image ? (
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
                            <strong>{raffle.title}</strong>
                          </div>

                          <div className="reward-size">
                            {targetPoints} PT
                          </div>
                        </div>

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
                      </div>

                      <div className="reward-floating-points">
                        <strong>{targetPoints}</strong>
                        <span>ENTRIES</span>
                      </div>

                      <div className="reward-floating-label">
                        <span>ONE WINNER</span>
                        <strong>GOOD LUCK.</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Rewards;
