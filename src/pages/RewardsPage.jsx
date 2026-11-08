
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useUser } from "../context/UserContext";
import { API_URL } from "../config";
import "./RewardsPage.css";

const RAFFLES_API_URL = `${API_URL}/api/raffles`;

function RewardsPage() {
  const { token, user, isLoggedIn, setUser } = useUser();

  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [quantities, setQuantities] = useState({});
  const [joiningId, setJoiningId] = useState(null);

  const bonusPoints = Number(user?.bonusPoints || 0);

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${RAFFLES_API_URL}/active`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при зареждане на томболите."
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

  useEffect(() => {
    fetchRaffles();
  }, []);

  const handleQuantityChange = (raffleId, value) => {
    const quantity = value === "" ? "" : Number(value);

    setQuantities((current) => ({
      ...current,
      [raffleId]: quantity,
    }));
  };

  const handleJoinRaffle = async (raffleId) => {
    if (!token) {
      setError("Влез в профила си, за да участваш в томболата.");
      return;
    }

    const raffle = raffles.find(
      (item) => item._id === raffleId
    );

    const quantity = Number(quantities[raffleId] || 1);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      setError("Избери между 1 и 100 участия.");
      return;
    }

    if (quantity > bonusPoints) {
      setError("Нямаш достатъчно бонус точки.");
      return;
    }

    const remainingPoints =
      raffle.targetPoints - raffle.collectedPoints;

    if (quantity > remainingPoints) {
      setError(
        `Остават само ${remainingPoints} свободни участия.`
      );
      return;
    }

    try {
      setJoiningId(raffleId);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${RAFFLES_API_URL}/${raffleId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entries: quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при участие в томболата."
        );
      }

      setSuccessMessage(
        data.winner
          ? "Участието е успешно! Томболата приключи и беше изтеглен победител."
          : `Успешно се включи с ${quantity} ${
              quantity === 1 ? "участие" : "участия"
            }!`
      );

      // Незабавно обновяване на бонус точките
      setUser((currentUser) => ({
        ...currentUser,
        bonusPoints: data.remainingPoints,
      }));

      setQuantities((current) => ({
        ...current,
        [raffleId]: 1,
      }));

      await fetchRaffles();

      window.dispatchEvent(
        new CustomEvent("raffle-points-updated")
      );

      window.dispatchEvent(
        new CustomEvent("user-points-updated", {
          detail: {
            remainingPoints: data.remainingPoints,
          },
        })
      );
    } catch (error) {
      console.error("Join raffle error:", error);
      setError(error.message);
    } finally {
      setJoiningId(null);
    }
  };

  const getProgress = (raffle) => {
    if (!raffle.targetPoints) return 0;

    return Math.min(
      100,
      (raffle.collectedPoints / raffle.targetPoints) * 100
    );
  };

  const getRemaining = (raffle) => {
    return Math.max(
      0,
      raffle.targetPoints - raffle.collectedPoints
    );
  };

  return (
    <>
      <Header />

      <main className="rewards-page">
        <div className="rewards-page-container">

          <header className="rewards-page-header">
            <p>PERFUMDECANTS4LESS REWARDS</p>

            <h1>
              Твоят шанс да <span>спечелиш.</span>
            </h1>

            <p>
              Използвай натрупаните бонус точки и участвай
              в специалните ни парфюмни награди.
            </p>
          </header>

          <section className="rewards-points-card">
            <div>
              <span>ТВОИТЕ БОНУС ТОЧКИ</span>

              <strong>
                {isLoggedIn ? bonusPoints : "—"}
              </strong>

              <small>
                {isLoggedIn
                  ? "Налични точки за участие"
                  : "Влез в профила си, за да видиш точките си"}
              </small>
            </div>

            <div className="rewards-points-icon">
              PT
            </div>
          </section>

          {error && (
            <div className="rewards-page-message rewards-page-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rewards-page-message rewards-page-success">
              {successMessage}
            </div>
          )}

          <section className="rewards-raffles-section">
            <div className="rewards-page-section-heading">
              <span>АКТИВНИ КАМПАНИИ</span>
              <h2>Избери своята награда</h2>
            </div>

            {loading ? (
              <div className="rewards-page-empty">
                Зареждаме активните томболи...
              </div>
            ) : raffles.length === 0 ? (
              <div className="rewards-page-empty">
                <h3>В момента няма активни томболи.</h3>

                <p>
                  Очаквай скоро следващите ни специални награди.
                </p>
              </div>
            ) : (
              <div className="rewards-raffles-grid">
                {raffles.map((raffle) => {
                  const progress = getProgress(raffle);
                  const remaining = getRemaining(raffle);
                  const quantity = quantities[raffle._id] ?? 1;

                  return (
                    <article
                      className="rewards-raffle-card"
                      key={raffle._id}
                    >
                      <div className="rewards-raffle-image">
                        {raffle.image ? (
                          <img
                            src={raffle.image}
                            alt={raffle.title}
                          />
                        ) : (
                          <div className="rewards-no-image">
                            REWARD
                          </div>
                        )}

                        <span className="rewards-active-label">
                          АКТИВНА
                        </span>
                      </div>

                      <div className="rewards-raffle-content">
                        <h3>{raffle.title}</h3>

                        {raffle.description && (
                          <p className="rewards-raffle-description">
                            {raffle.description}
                          </p>
                        )}

                        <div className="rewards-raffle-stats">
                          <div>
                            <span>УЧАСТИЯ</span>
                            <strong>
                              {raffle.collectedPoints || 0} /{" "}
                              {raffle.targetPoints}
                            </strong>
                          </div>

                          <div>
                            <span>ОСТАВАТ</span>
                            <strong>{remaining}</strong>
                          </div>
                        </div>

                        <div className="rewards-page-progress">
                          <div>
                            <span
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          <strong>
                            {progress.toFixed(0)}%
                          </strong>
                        </div>

                        <div className="rewards-entry-rule">
                          1 участие = 1 бонус точка
                        </div>

                        {isLoggedIn ? (
                          <>
                            <label className="rewards-quantity-label">
                              Брой участия

                              <input
                                type="number"
                                min="1"
                                max={Math.min(100, remaining)}
                                value={quantity}
                                onChange={(event) =>
                                  handleQuantityChange(
                                    raffle._id,
                                    event.target.value
                                  )
                                }
                              />
                            </label>

                            <div className="rewards-entry-total">
                              <span>Общо точки</span>

                              <strong>
                                {Number(quantity) || 0} PT
                              </strong>
                            </div>

                            <button
                              type="button"
                              className="rewards-join-button"
                              disabled={
                                joiningId === raffle._id ||
                                remaining === 0 ||
                                !Number.isInteger(Number(quantity)) ||
                                Number(quantity) < 1 ||
                                Number(quantity) > 100 ||
                                Number(quantity) > bonusPoints ||
                                Number(quantity) > remaining
                              }
                              onClick={() =>
                                handleJoinRaffle(raffle._id)
                              }
                            >
                              {joiningId === raffle._id
                                ? "Обработване..."
                                : "Участвай сега"}
                            </button>
                          </>
                        ) : (
                          <p className="rewards-login-note">
                            Влез в профила си, за да участваш.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  );
}

export default RewardsPage;
