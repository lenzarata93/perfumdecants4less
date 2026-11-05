
import { useEffect, useState } from "react";
import "./AdminFinance.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function AdminFinance() {
  const [finance, setFinance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/finance`
        );

        if (!response.ok) {
          throw new Error("Грешка при зареждане на финансите.");
        }

        const data = await response.json();
        setFinance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, []);

  const formatPrice = (value) => {
    return `${Number(value || 0).toFixed(2)} €`;
  };

  if (loading) {
    return (
      <div className="finance-page">
        <p className="finance-message">Зареждане на финансите...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="finance-page">
        <p className="finance-error">{error}</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Обща инвестиция",
      value: finance.totalInvestment,
      description: `${finance.bottleCount} закупени бутилки`,
      className: "investment",
    },
    {
      title: "Реализирана печалба",
      value: finance.totalProfit,
      description: "Печалба от завършени поръчки",
      className: "profit",
    },
    {
      title: "Общи продажби",
      value: finance.totalRevenue,
      description: "Без стойността на доставката",
      className: "revenue",
    },
    {
      title: "Себестойност",
      value: finance.totalCost,
      description: "Себестойност на продадените парфюми",
      className: "cost",
    },
  ];

  return (
    <div className="finance-page">
      <div className="finance-header">
        <div>
          <span className="finance-eyebrow">ADMINISTRATION</span>
          <h1>Финанси</h1>
          <p>Финансово състояние на PerfumDecants4Less</p>
        </div>

        <button
          className="finance-refresh"
          onClick={() => window.location.reload()}
        >
          Обнови данните
        </button>
      </div>

      <div className="finance-grid">
        {cards.map((card) => (
          <div
            className={`finance-card ${card.className}`}
            key={card.title}
          >
            <span className="finance-card-title">
              {card.title}
            </span>

            <strong className="finance-card-value">
              {formatPrice(card.value)}
            </strong>

            <span className="finance-card-description">
              {card.description}
            </span>
          </div>
        ))}
      </div>

      <div className="finance-bottom">
        <div className="finance-summary">
          <span className="finance-eyebrow">
            ОБОБЩЕНИЕ
          </span>

          <h2>Резултати от продажбите</h2>

          <div className="finance-summary-row">
            <span>Завършени поръчки</span>
            <strong>{finance.completedOrders}</strong>
          </div>

          <div className="finance-summary-row">
            <span>Обща инвестиция</span>
            <strong>
              {formatPrice(finance.totalInvestment)}
            </strong>
          </div>

          <div className="finance-summary-row">
            <span>Реализирана печалба</span>
            <strong className="positive">
              {formatPrice(finance.totalProfit)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFinance;
