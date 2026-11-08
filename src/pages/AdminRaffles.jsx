
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useUser } from "../context/UserContext";
import { API_URL } from "../config";
import "./AdminRaffles.css";

const RAFFLES_API_URL = `${API_URL}/api/raffles`;

function AdminRaffles() {
  const { token } = useUser();

  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    targetPoints: "",
  });

  // НОВО: състояние за участниците
  const [selectedRaffle, setSelectedRaffle] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(RAFFLES_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при зареждане на томболите."
        );
      }

      setRaffles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch raffles error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRaffles();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateRaffle = async (event) => {
    event.preventDefault();

    const targetPoints = Number(form.targetPoints);

    if (!form.title.trim()) {
      setError("Въведи име на наградата.");
      return;
    }

    if (!Number.isInteger(targetPoints) || targetPoints < 1) {
      setError("Целевият брой участия трябва да е цяло число над 0.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(RAFFLES_API_URL, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description,
          image: form.image,
          targetPoints,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при създаване на томболата."
        );
      }

      setSuccessMessage("Томболата е създадена успешно.");

      setForm({
        title: "",
        description: "",
        image: "",
        targetPoints: "",
      });

      await fetchRaffles();
    } catch (error) {
      console.error("Create raffle error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (raffleId) => {
    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${RAFFLES_API_URL}/${raffleId}/activate`,
        {
          method: "PATCH",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при активиране."
        );
      }

      setSuccessMessage("Томболата е активирана успешно.");
      await fetchRaffles();
    } catch (error) {
      console.error("Activate raffle error:", error);
      setError(error.message);
    }
  };

  const handleCancel = async (raffleId) => {
    const confirmed = window.confirm(
      "Сигурен ли си, че искаш да отмениш тази томбола?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${RAFFLES_API_URL}/${raffleId}/cancel`,
        {
          method: "PATCH",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при отмяна."
        );
      }

      setSuccessMessage("Томболата е отменена.");
      await fetchRaffles();
    } catch (error) {
      console.error("Cancel raffle error:", error);
      setError(error.message);
    }
  };

  // НОВО: зареждане на участниците в избрана томбола
  const handleShowParticipants = async (raffle) => {
    if (selectedRaffle?._id === raffle._id) {
      setSelectedRaffle(null);
      setParticipants([]);
      setParticipantsError("");
      return;
    }

    try {
      setSelectedRaffle(raffle);
      setParticipants([]);
      setParticipantsLoading(true);
      setParticipantsError("");

      const response = await fetch(
        `${RAFFLES_API_URL}/${raffle._id}/entries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при зареждане на участниците."
        );
      }

      setParticipants(
        Array.isArray(data.participants) ? data.participants : []
      );
    } catch (error) {
      console.error("Fetch raffle participants error:", error);
      setParticipantsError(error.message);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("bg-BG");
  };

  const getStatusLabel = (status) => {
    const statuses = {
      draft: "Чернова",
      active: "Активна",
      completed: "Приключила",
      cancelled: "Отменена",
    };

    return statuses[status] || status;
  };

  const getProgress = (raffle) => {
    if (!raffle.targetPoints) return 0;

    return Math.min(
      100,
      (raffle.collectedPoints / raffle.targetPoints) * 100
    );
  };

  return (
    <>
      <Header />

      <main className="admin-raffles-page">
        <div className="admin-raffles-container">

          <header className="admin-raffles-header">
            <div>
              <p className="admin-raffles-eyebrow">
                ADMIN PANEL
              </p>

              <h1>Управление на томболи</h1>

              <p>
                Създавай награди, определяй броя участия и следи
                тегленето на победителите.
              </p>
            </div>

            <div className="admin-raffles-count">
              <strong>{raffles.length}</strong>
              <span>томболи</span>
            </div>
          </header>

          {error && (
            <div className="raffle-message raffle-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="raffle-message raffle-success">
              {successMessage}
            </div>
          )}

          <section className="raffle-create-section">
            <div className="raffle-section-heading">
              <span>НОВА НАГРАДА</span>
              <h2>Създай томбола</h2>
            </div>

            <form
              className="raffle-create-form"
              onSubmit={handleCreateRaffle}
            >
              <label>
                <span>Име на наградата</span>
                <input
                  type="text"
                  name="title"
                  placeholder="Например: Mancera Red Tobacco 20ml"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Описание</span>
                <textarea
                  name="description"
                  placeholder="Опиши наградата..."
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                />
              </label>

              <label>
                <span>Линк към снимка</span>
                <input
                  type="url"
                  name="image"
                  placeholder="https://..."
                  value={form.image}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Необходими участия</span>
                <input
                  type="number"
                  name="targetPoints"
                  min="1"
                  step="1"
                  placeholder="Например: 100"
                  value={form.targetPoints}
                  onChange={handleChange}
                  required
                />
                <small>
                  Всяко участие струва 1 бонус точка.
                </small>
              </label>

              <button
                type="submit"
                className="raffle-primary-button"
                disabled={saving}
              >
                {saving ? "Създаване..." : "Създай томбола"}
              </button>
            </form>
          </section>

          <section className="raffle-list-section">
            <div className="raffle-section-heading">
              <span>УПРАВЛЕНИЕ</span>
              <h2>Всички томболи</h2>
            </div>

            {loading ? (
              <div className="raffle-empty">
                Зареждаме томболите...
              </div>
            ) : raffles.length === 0 ? (
              <div className="raffle-empty">
                <h3>Все още няма създадени томболи.</h3>
                <p>
                  Създай първата награда от формата по-горе.
                </p>
              </div>
            ) : (
              <div className="raffle-admin-list">
                {raffles.map((raffle) => (
                  <article
                    className="raffle-admin-card"
                    key={raffle._id}
                  >
                    <div className="raffle-admin-main">
                      {raffle.image && (
                        <div className="raffle-admin-image">
                          <img
                            src={raffle.image}
                            alt={raffle.title}
                          />
                        </div>
                      )}

                      <div className="raffle-admin-info">
                        <span
                          className={`raffle-status ${raffle.status}`}
                        >
                          {getStatusLabel(raffle.status)}
                        </span>

                        <h3>{raffle.title}</h3>

                        {raffle.description && (
                          <p>{raffle.description}</p>
                        )}

                        <div className="raffle-admin-stats">
                          <div>
                            <span>Събрани участия</span>
                            <strong>
                              {raffle.collectedPoints || 0}
                            </strong>
                          </div>

                          <div>
                            <span>Цел</span>
                            <strong>
                              {raffle.targetPoints}
                            </strong>
                          </div>

                          <div>
                            <span>Създадена</span>
                            <strong>
                              {formatDate(raffle.createdAt)}
                            </strong>
                          </div>
                        </div>

                        <div className="raffle-progress">
                          <div className="raffle-progress-track">
                            <div
                              className="raffle-progress-fill"
                              style={{
                                width: `${getProgress(raffle)}%`,
                              }}
                            />
                          </div>

                          <span>
                            {getProgress(raffle).toFixed(0)}%
                          </span>
                        </div>

                        {raffle.winner && (
                          <div className="raffle-winner">
                            <span>ПОБЕДИТЕЛ</span>
                            <strong>
                              {raffle.winner.firstName}{" "}
                              {raffle.winner.lastName}
                            </strong>
                            <small>
                              {raffle.winner.email}
                            </small>
                          </div>
                        )}

                        {raffle.status === "draft" && (
                          <button
                            type="button"
                            className="raffle-primary-button"
                            onClick={() =>
                              handleActivate(raffle._id)
                            }
                          >
                            Активирай томболата
                          </button>
                        )}

                        {raffle.status === "active" && (
                          <button
                            type="button"
                            className="raffle-cancel-button"
                            onClick={() =>
                              handleCancel(raffle._id)
                            }
                          >
                            Отмени томболата
                          </button>
                        )}

                        {/* НОВО: бутон за участниците */}
                        <button
                          type="button"
                          className="raffle-primary-button"
                          onClick={() =>
                            handleShowParticipants(raffle)
                          }
                        >
                          {selectedRaffle?._id === raffle._id
                            ? "Скрий участниците"
                            : "Участници"}
                        </button>

                        {/* НОВО: панел с участниците */}
                        {selectedRaffle?._id === raffle._id && (
                          <div className="raffle-participants-panel">
                            <h4>Участници в томболата</h4>

                            {participantsLoading ? (
                              <p>Зареждаме участниците...</p>
                            ) : participantsError ? (
                              <p className="raffle-error-text">
                                {participantsError}
                              </p>
                            ) : participants.length === 0 ? (
                              <p>
                                Все още няма участници в тази томбола.
                              </p>
                            ) : (
                              <div className="raffle-participants-list">
                                {participants.map((participant) => (
                                  <div
                                    className={`raffle-participant ${
                                      participant.isWinner
                                        ? "raffle-participant-winner"
                                        : ""
                                    }`}
                                    key={participant.userId}
                                  >
                                    <div className="raffle-participant-info">
                                      <strong>
                                        {participant.firstName || ""}{" "}
                                        {participant.lastName || ""}
                                      </strong>

                                      <small>
                                        {participant.email || "Няма имейл"}
                                      </small>

                                      <span>
                                        {participant.entries} участия
                                      </span>

                                      <p>
                                        Билети:{" "}
                                        {participant.entryNumbers?.join(", ") ||
                                          "—"}
                                      </p>
                                    </div>

                                    {participant.isWinner && (
                                      <span className="raffle-participant-winner-label">
                                        ПОБЕДИТЕЛ
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </>
  );
}

export default AdminRaffles;
