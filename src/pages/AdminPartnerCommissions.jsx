
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { API_URL } from "../config";
import "./AdminPartnerCommissions.css";

const COMMISSIONS_API_URL = `${API_URL}/api/promos/admin/commissions`;

function AdminPartnerCommissions() {
  const { token } = useUser();

  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    paidAmount: 0,
    referredRevenue: 0,
    ordersCount: 0,
    pendingCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");

  const fetchCommissions = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(COMMISSIONS_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при зареждане на комисионните."
        );
      }

      setCommissions(
        Array.isArray(data.commissions) ? data.commissions : []
      );

      setStats({
        totalEarned: Number(data.stats?.totalEarned || 0),
        pendingAmount: Number(data.stats?.pendingAmount || 0),
        paidAmount: Number(data.stats?.paidAmount || 0),
        referredRevenue: Number(data.stats?.referredRevenue || 0),
        ordersCount: Number(data.stats?.ordersCount || 0),
        pendingCount: Number(data.stats?.pendingCount || 0),
      });
    } catch (error) {
      console.error("Fetch admin commissions error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const handleMarkAsPaid = async (commission) => {
    const partnerName = commission.partner
      ? `${commission.partner.firstName || ""} ${
          commission.partner.lastName || ""
        }`.trim()
      : "партньора";

    const confirmed = window.confirm(
      `Потвърждаваш ли изплащане на ${Number(
        commission.amount
      ).toFixed(2)} € към ${partnerName}?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(commission.id);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${COMMISSIONS_API_URL}/${commission.id}/paid`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при изплащане на комисионната."
        );
      }

      setSuccessMessage(data.message);
      await fetchCommissions();
    } catch (error) {
      console.error("Mark commission as paid error:", error);
      setError(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const formatMoney = (value) =>
    `${Number(value || 0).toFixed(2)} €`;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPartnerName = (partner) => {
    if (!partner) return "Изтрит потребител";

    return `${partner.firstName || ""} ${
      partner.lastName || ""
    }`.trim() || partner.email || "Неизвестен партньор";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "За изплащане";
      case "paid":
        return "Изплатена";
      case "cancelled":
        return "Отменена";
      default:
        return status || "Неизвестен";
    }
  };

  const uniquePartners = [
    ...new Map(
      commissions
        .filter((commission) => commission.partner)
        .map((commission) => [
          String(commission.partner.id),
          commission.partner,
        ])
    ).values(),
  ];

  const filteredCommissions = commissions.filter((commission) => {
    const matchesStatus =
      statusFilter === "all" || commission.status === statusFilter;

    const matchesPartner =
      partnerFilter === "all" ||
      String(commission.partner?.id) === partnerFilter;

    return matchesStatus && matchesPartner;
  });

  return (
    <section className="admin-commissions-section">
      <div className="admin-commissions-heading">
        <div>
          <span>ФИНАНСОВА СПРАВКА</span>
          <h2>Партньорски комисионни</h2>
          <p>
            Следи оборота, начислените комисионни и извършените
            плащания към партньорите.
          </p>
        </div>

        <button
          type="button"
          className="commissions-refresh-button"
          onClick={fetchCommissions}
          disabled={loading}
        >
          {loading ? "Зареждане..." : "Обнови"}
        </button>
      </div>

      {error && (
        <div className="commissions-message commissions-error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="commissions-message commissions-success">
          {successMessage}
        </div>
      )}

      <div className="commissions-stats-grid">
        <article className="commissions-stat">
          <span>Оборот от партньори</span>
          <strong>{formatMoney(stats.referredRevenue)}</strong>
          <small>{stats.ordersCount} успешни поръчки</small>
        </article>

        <article className="commissions-stat">
          <span>Общо начислени</span>
          <strong>{formatMoney(stats.totalEarned)}</strong>
          <small>Без отменени комисионни</small>
        </article>

        <article className="commissions-stat pending">
          <span>За изплащане</span>
          <strong>{formatMoney(stats.pendingAmount)}</strong>
          <small>{stats.pendingCount} неплатени комисионни</small>
        </article>

        <article className="commissions-stat paid">
          <span>Вече изплатени</span>
          <strong>{formatMoney(stats.paidAmount)}</strong>
          <small>Потвърдени плащания</small>
        </article>
      </div>

      <div className="commissions-table-heading">
        <div>
          <h3>История на комисионните</h3>
          <span>{filteredCommissions.length} записа</span>
        </div>

        <div className="commissions-filters">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Филтър по статус"
          >
            <option value="all">Всички статуси</option>
            <option value="pending">За изплащане</option>
            <option value="paid">Изплатени</option>
            <option value="cancelled">Отменени</option>
          </select>

          <select
            value={partnerFilter}
            onChange={(event) => setPartnerFilter(event.target.value)}
            aria-label="Филтър по партньор"
          >
            <option value="all">Всички партньори</option>
            {uniquePartners.map((partner) => (
              <option key={partner.id} value={String(partner.id)}>
                {getPartnerName(partner)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="commissions-empty">
          Зареждаме финансовата справка...
        </div>
      ) : filteredCommissions.length === 0 ? (
        <div className="commissions-empty">
          <h3>Няма намерени комисионни.</h3>
          <p>
            Когато партньор направи успешни поръчки с промокода си,
            записите ще се появят тук.
          </p>
        </div>
      ) : (
        <div className="commissions-table-wrapper">
          <table className="commissions-table">
            <thead>
              <tr>
                <th>Партньор</th>
                <th>Промокод</th>
                <th>Поръчка</th>
                <th>Дата</th>
                <th>Оборот</th>
                <th>Комисионна</th>
                <th>Статус</th>
                <th>Действие</th>
              </tr>
            </thead>

            <tbody>
              {filteredCommissions.map((commission) => (
                <tr key={commission.id}>
                  <td>
                    <strong>
                      {getPartnerName(commission.partner)}
                    </strong>
                    <small>{commission.partner?.email || ""}</small>
                  </td>

                  <td>
                    <span className="commission-code">
                      {commission.promoCode}
                    </span>
                  </td>

                  <td>
                    <span className="commission-order-id">
                      {commission.orderId
                        ? commission.orderId.slice(-8).toUpperCase()
                        : "—"}
                    </span>
                  </td>

                  <td>{formatDate(commission.earnedAt)}</td>

                  <td>{formatMoney(commission.orderAmount)}</td>

                  <td>
                    <strong className="commission-amount">
                      {formatMoney(commission.amount)}
                    </strong>
                    <small>{commission.commissionRate}%</small>
                  </td>

                  <td>
                    <span
                      className={`commission-status ${commission.status}`}
                    >
                      {getStatusLabel(commission.status)}
                    </span>

                    {commission.paidAt && (
                      <small className="commission-paid-date">
                        {formatDate(commission.paidAt)}
                      </small>
                    )}
                  </td>

                  <td>
                    {commission.status === "pending" ? (
                      <button
                        type="button"
                        className="commission-pay-button"
                        onClick={() => handleMarkAsPaid(commission)}
                        disabled={processingId === commission.id}
                      >
                        {processingId === commission.id
                          ? "Записване..."
                          : "Маркирай изплатена"}
                      </button>
                    ) : commission.status === "paid" ? (
                      <span className="commission-action-done">
                        <span aria-hidden="true">✓</span> Готово
                      </span>
                    ) : (
                      <span className="commission-action-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="commissions-mobile-list">
            {filteredCommissions.map((commission) => (
              <article
                className="commission-mobile-card"
                key={commission.id}
              >
                <div className="commission-mobile-top">
                  <div>
                    <strong>
                      {getPartnerName(commission.partner)}
                    </strong>
                    <small>{commission.partner?.email || ""}</small>
                  </div>

                  <span
                    className={`commission-status ${commission.status}`}
                  >
                    {getStatusLabel(commission.status)}
                  </span>
                </div>

                <div className="commission-mobile-code">
                  Код: <strong>{commission.promoCode}</strong>
                </div>

                <div className="commission-mobile-details">
                  <div>
                    <span>Поръчка</span>
                    <strong>
                      {commission.orderId
                        ? commission.orderId.slice(-8).toUpperCase()
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Дата</span>
                    <strong>{formatDate(commission.earnedAt)}</strong>
                  </div>

                  <div>
                    <span>Оборот</span>
                    <strong>{formatMoney(commission.orderAmount)}</strong>
                  </div>

                  <div>
                    <span>Комисионна ({commission.commissionRate}%)</span>
                    <strong className="commission-amount">
                      {formatMoney(commission.amount)}
                    </strong>
                  </div>
                </div>

                {commission.paidAt && (
                  <p className="commission-mobile-paid-date">
                    Изплатена на: {formatDate(commission.paidAt)}
                  </p>
                )}

                {commission.status === "pending" && (
                  <button
                    type="button"
                    className="commission-pay-button"
                    onClick={() => handleMarkAsPaid(commission)}
                    disabled={processingId === commission.id}
                  >
                    {processingId === commission.id
                      ? "Записване..."
                      : "Маркирай като изплатена"}
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminPartnerCommissions;
