
import { useEffect, useState } from "react";
import "./AdminFinance.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function AdminFinance() {
  const [finance, setFinance] = useState(null);
  const [fund, setFund] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fundError, setFundError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    date: getTodayDate(),
  });

  const [savingExpense, setSavingExpense] = useState(false);

  const fetchFinance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/finance`
      );

      if (!response.ok) {
        throw new Error(
          "Грешка при зареждане на финансите."
        );
      }

      const data = await response.json();

      setFinance(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFund = async () => {
    try {
      setFundError("");

      const response = await fetch(
        `${API_URL}/api/finance/fund`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Грешка при зареждане на фонда."
        );
      }

      setFund(data);
    } catch (err) {
      setFundError(err.message);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchFinance(),
      fetchFund(),
    ]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const formatPrice = (value) => {
    return `${Number(value || 0).toFixed(2)} €`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString(
      "bg-BG",
      {
        timeZone: "Europe/Sofia",
      }
    );
  };

  const handleExpenseChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setExpenseForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAddExpense = async (event) => {
    event.preventDefault();

    setFundError("");
    setSuccessMessage("");

    const amount = Number(
      expenseForm.amount
    );

    if (
      !expenseForm.description.trim()
    ) {
      setFundError(
        "Въведи описание на разхода."
      );

      return;
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setFundError(
        "Въведи валидна сума."
      );

      return;
    }

    try {
      setSavingExpense(true);

      const response = await fetch(
        `${API_URL}/api/finance/fund/expenses`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            description:
              expenseForm.description,

            amount,

            date:
              expenseForm.date,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Грешка при добавяне на разхода."
        );
      }

      setSuccessMessage(
        "Разходът е добавен успешно."
      );

      setExpenseForm({
        description: "",
        amount: "",
        date: getTodayDate(),
      });

      await fetchFund();
    } catch (err) {
      setFundError(err.message);
    } finally {
      setSavingExpense(false);
    }
  };

  if (loading) {
    return (
      <div className="finance-page">
        <p className="finance-message">
          Зареждане на финансите...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="finance-page">
        <p className="finance-error">
          {error}
        </p>
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
          <span className="finance-eyebrow">
            ADMINISTRATION
          </span>

          <h1>Финанси</h1>

          <p>
            Финансово състояние на PerfumDecants4Less
          </p>
        </div>

        <button
          className="finance-refresh"
          onClick={refreshAll}
        >
          Обнови данните
        </button>
      </div>

      {/* СЪЩЕСТВУВАЩИ ФИНАНСОВИ КАРТИ */}

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

      {/* СЪЩЕСТВУВАЩО ОБОБЩЕНИЕ */}

      <div className="finance-bottom">
        <div className="finance-summary">
          <span className="finance-eyebrow">
            ОБОБЩЕНИЕ
          </span>

          <h2>Резултати от продажбите</h2>

          <div className="finance-summary-row">
            <span>Завършени поръчки</span>

            <strong>
              {finance.completedOrders}
            </strong>
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

      {/* ФОНД ЗА ЗАРЕЖДАНЕ */}

      <section className="fund-section">
        <div className="fund-header">
          <div>
            <span className="finance-eyebrow">
              PER FUMO • REINVESTMENT
            </span>

            <h2>Фонд за зареждане</h2>

            <p>
              От 10.11.2026 г. · Печалба и средства за нови покупки
            </p>
          </div>
        </div>

        {fundError && (
          <div className="fund-message fund-error">
            {fundError}
          </div>
        )}

        {successMessage && (
          <div className="fund-message fund-success">
            {successMessage}
          </div>
        )}

        {!fund && !fundError && (
          <div className="fund-empty">
            Зареждане на фонда...
          </div>
        )}

        {fund && (
          <>
            {/* БАЛАНС И ОБОБЩЕНИЕ */}

            <div className="fund-cards">
              <div className="fund-card fund-balance">
                <span>
                  НАЛИЧНОСТ ВЪВ ФОНДА
                </span>

                <strong>
                  {formatPrice(fund.balance)}
                </strong>

                <small>
                  Текущ свободен баланс
                </small>
              </div>

              <div className="fund-card">
                <span>
                  НАТРУПАНА ПЕЧАЛБА
                </span>

                <strong className="fund-positive">
                  {formatPrice(fund.totalIncome)}
                </strong>

                <small>
                  От завършени поръчки
                </small>
              </div>

              <div className="fund-card">
                <span>
                  ОБЩИ РАЗХОДИ
                </span>

                <strong className="fund-negative">
                  {formatPrice(fund.totalExpenses)}
                </strong>

                <small>
                  Парфюми и консумативи
                </small>
              </div>
            </div>

            {/* ДОБАВЯНЕ НА КОНСУМАТИВИ */}

            <div className="fund-expense-panel">
              <div>
                <span className="finance-eyebrow">
                  НОВА ОПЕРАЦИЯ
                </span>

                <h3>
                  Добави разход за консумативи
                </h3>

                <p>
                  Например флакони, пулверизатори,
                  етикети и опаковки.
                </p>
              </div>

              <form onSubmit={handleAddExpense}>
                <label>
                  Описание

                  <input
                    type="text"
                    name="description"
                    placeholder="Например: 100 броя флакони"
                    value={expenseForm.description}
                    onChange={handleExpenseChange}
                    required
                  />
                </label>

                <div className="fund-form-row">
                  <label>
                    Сума (€)

                    <input
                      type="number"
                      name="amount"
                      min="0.01"
                      step="0.01"
                      placeholder="25.00"
                      value={expenseForm.amount}
                      onChange={handleExpenseChange}
                      required
                    />
                  </label>

                  <label>
                    Дата

                    <input
                      type="date"
                      name="date"
                      min="2026-11-10"
                      value={expenseForm.date}
                      onChange={handleExpenseChange}
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingExpense}
                >
                  {savingExpense
                    ? "Запазване..."
                    : "Добави разход"}
                </button>
              </form>
            </div>

            {/* ИСТОРИЯ НА ФОНДА */}

            <div className="fund-history">
              <div className="fund-history-header">
                <div>
                  <span className="finance-eyebrow">
                    TRANSACTION HISTORY
                  </span>

                  <h3>
                    История на фонда
                  </h3>
                </div>

                <span>
                  {fund.transactionCount} операции
                </span>
              </div>

              {fund.transactions.length === 0 ? (
                <div className="fund-empty">
                  Все още няма движения във фонда.
                </div>
              ) : (
                <div className="fund-table-wrapper">
                  <table className="fund-table">
                    <thead>
                      <tr>
                        <th>Дата</th>
                        <th>Описание</th>
                        <th>Тип</th>
                        <th>Сума</th>
                      </tr>
                    </thead>

                    <tbody>
                      {fund.transactions.map(
                        (transaction) => (
                          <tr key={transaction._id}>
                            <td>
                              {formatDate(transaction.date)}
                            </td>

                            <td>
                              {transaction.description}
                            </td>

                            <td>
                              {transaction.type === "order_profit"
                                ? "Печалба"
                                : transaction.type === "bottle_purchase"
                                ? "Парфюм"
                                : "Консумативи"}
                            </td>

                            <td
                              className={
                                transaction.direction === "income"
                                  ? "fund-positive"
                                  : "fund-negative"
                              }
                            >
                              {transaction.direction === "income"
                                ? "+"
                                : "−"}

                              {formatPrice(transaction.amount)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default AdminFinance;
