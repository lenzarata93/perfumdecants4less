
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useUser } from "../context/UserContext";
import { API_URL } from "../config";
import "./AdminPromos.css";

const PROMOS_API_URL = `${API_URL}/api/promos`;

const initialForm = {
  code: "",
  description: "",
  type: "discount",
  partnerId: "",
  discountType: "percent",
  discountValue: "",
  commissionRate: "10",
  minimumOrderAmount: "0",
  usageLimit: "",
  startDate: "",
  endDate: "",
};

function AdminPromos() {
  const { token } = useUser();

  const [promoCodes, setPromoCodes] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activatingPartner, setActivatingPartner] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [partnerEmail, setPartnerEmail] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [promosResponse, partnersResponse] = await Promise.all([
        fetch(PROMOS_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${PROMOS_API_URL}/partners`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [promosData, partnersData] = await Promise.all([
        promosResponse.json(),
        partnersResponse.json(),
      ]);

      if (!promosResponse.ok) {
        throw new Error(
          promosData.message || "Грешка при зареждане на промокодовете."
        );
      }

      if (!partnersResponse.ok) {
        throw new Error(
          partnersData.message || "Грешка при зареждане на партньорите."
        );
      }

      setPromoCodes(
        Array.isArray(promosData.promoCodes)
          ? promosData.promoCodes
          : []
      );

      setPartners(
        Array.isArray(partnersData.partners)
          ? partnersData.partners
          : []
      );
    } catch (error) {
      console.error("Fetch promo data error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
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

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const discountValue = Number(form.discountValue);
    const commissionRate = Number(form.commissionRate);
    const minimumOrderAmount = Number(form.minimumOrderAmount);

    if (!form.code.trim()) {
      setError("Въведи промокод.");
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue < 0) {
      setError("Въведи валидна отстъпка.");
      return;
    }

    if (
      form.discountType === "percent" &&
      discountValue > 100
    ) {
      setError("Процентната отстъпка не може да бъде над 100%.");
      return;
    }

    if (
      form.type === "partner" &&
      !editingId &&
      !form.partnerId
    ) {
      setError("Избери партньор за този промокод.");
      return;
    }

    if (
      form.type === "partner" &&
      (!Number.isFinite(commissionRate) ||
        commissionRate < 0 ||
        commissionRate > 100)
    ) {
      setError("Комисионната трябва да бъде между 0 и 100%.");
      return;
    }

    if (
      !Number.isFinite(minimumOrderAmount) ||
      minimumOrderAmount < 0
    ) {
      setError("Минималната стойност на поръчката е невалидна.");
      return;
    }

    if (
      form.usageLimit &&
      (!Number.isInteger(Number(form.usageLimit)) ||
        Number(form.usageLimit) < 1)
    ) {
      setError("Лимитът трябва да бъде цяло число над 0.");
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description,
      discountType: form.discountType,
      discountValue,
      minimumOrderAmount,
      usageLimit: form.usageLimit
        ? Number(form.usageLimit)
        : null,
      startDate: form.startDate || new Date().toISOString(),
      endDate: form.endDate || null,
    };

    if (!editingId) {
      payload.type = form.type;

      if (form.type === "partner") {
        payload.partnerId = form.partnerId;
        payload.commissionRate = commissionRate;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(
        editingId
          ? `${PROMOS_API_URL}/${editingId}`
          : PROMOS_API_URL,
        {
          method: editingId ? "PUT" : "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при запис на промокода."
        );
      }

      setSuccessMessage(
        editingId
          ? "Промокодът е редактиран успешно."
          : "Промокодът е създаден успешно."
      );

      resetForm();
      await fetchData();
    } catch (error) {
      console.error("Save promo error:", error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (promo) => {
    setEditingId(promo._id);

    setForm({
      code: promo.code || "",
      description: promo.description || "",
      type: promo.type || "discount",
      partnerId: promo.partnerId?._id || "",
      discountType: promo.discountType || "percent",
      discountValue: String(promo.discountValue ?? ""),
      commissionRate: String(promo.commissionRate ?? 10),
      minimumOrderAmount: String(promo.minimumOrderAmount ?? 0),
      usageLimit:
        promo.usageLimit === null ||
        promo.usageLimit === undefined
          ? ""
          : String(promo.usageLimit),
      startDate: promo.startDate
        ? new Date(promo.startDate).toISOString().slice(0, 16)
        : "",
      endDate: promo.endDate
        ? new Date(promo.endDate).toISOString().slice(0, 16)
        : "",
    });

    setError("");
    setSuccessMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleToggle = async (promoId) => {
    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${PROMOS_API_URL}/${promoId}/toggle`,
        {
          method: "PATCH",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при промяна на статуса."
        );
      }

      setSuccessMessage(data.message);
      await fetchData();
    } catch (error) {
      console.error("Toggle promo error:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (promo) => {
    const confirmed = window.confirm(
      `Сигурен ли си, че искаш да изтриеш промокод ${promo.code}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${PROMOS_API_URL}/${promo._id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при изтриване."
        );
      }

      setSuccessMessage(data.message);
      await fetchData();
    } catch (error) {
      console.error("Delete promo error:", error);
      setError(error.message);
    }
  };

  const handleActivatePartner = async (event) => {
    event.preventDefault();

    if (!partnerEmail.trim()) {
      setError("Въведи имейл на регистриран клиент.");
      return;
    }

    try {
      setActivatingPartner(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${PROMOS_API_URL}/partners/activate`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            email: partnerEmail.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при активиране на партньора."
        );
      }

      setPartnerEmail("");
      setSuccessMessage(data.message);

      await fetchData();
    } catch (error) {
      console.error("Activate partner error:", error);
      setError(error.message);
    } finally {
      setActivatingPartner(false);
    }
  };

  const handleDeactivatePartner = async (partner) => {
    const confirmed = window.confirm(
      `Сигурен ли си, че искаш да деактивираш партньор ${partner.firstName} ${partner.lastName}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${PROMOS_API_URL}/partners/${partner._id}/deactivate`,
        {
          method: "PATCH",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Грешка при деактивиране на партньора."
        );
      }

      setSuccessMessage(data.message);
      await fetchData();
    } catch (error) {
      console.error("Deactivate partner error:", error);
      setError(error.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Без срок";

    return new Date(date).toLocaleDateString("bg-BG");
  };

  const formatDiscount = (promo) => {
    return promo.discountType === "percent"
      ? `${promo.discountValue}%`
      : `${Number(promo.discountValue).toFixed(2)} €`;
  };

  const getPartnerName = (promo) => {
    if (!promo.partnerId) return "—";

    return `${promo.partnerId.firstName || ""} ${
      promo.partnerId.lastName || ""
    }`.trim();
  };

  const activePromos = promoCodes.filter((promo) => promo.active).length;

  return (
    <>
      <Header />

      <main className="admin-promos-page">
        <div className="admin-promos-container">
          <header className="admin-promos-header">
            <div>
              <p className="admin-promos-eyebrow">ADMIN PANEL</p>
              <h1>Промокодове и партньори</h1>
              <p>
                Управлявай отстъпките, партньорските кодове и
                активните партньори.
              </p>
            </div>

            <div className="admin-promos-count">
              <strong>{promoCodes.length}</strong>
              <span>промокода</span>
              <small>{activePromos} активни</small>
            </div>
          </header>

          {error && (
            <div className="promo-message promo-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="promo-message promo-success">
              {successMessage}
            </div>
          )}

          <section className="promo-create-section">
            <div className="promo-section-heading">
              <span>{editingId ? "РЕДАКТИРАНЕ" : "НОВ ПРОМОКОД"}</span>
              <h2>
                {editingId ? "Редактирай промокод" : "Създай промокод"}
              </h2>
            </div>

            <form className="promo-form" onSubmit={handleSubmit}>
              <label>
                <span>Код</span>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Например: WELCOME10"
                  required
                />
              </label>

              {!editingId && (
                <label>
                  <span>Тип промокод</span>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="discount">Обикновен промокод</option>
                    <option value="partner">Партньорски промокод</option>
                  </select>
                </label>
              )}

              {!editingId && form.type === "partner" && (
                <label>
                  <span>Партньор</span>
                  <select
                    name="partnerId"
                    value={form.partnerId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Избери партньор</option>
                    {partners.map((partner) => (
                      <option key={partner._id} value={partner._id}>
                        {partner.firstName} {partner.lastName} – {partner.email}
                      </option>
                    ))}
                  </select>
                  {partners.length === 0 && (
                    <small>Първо активирай поне един партньор.</small>
                  )}
                </label>
              )}

              <label>
                <span>Вид отстъпка</span>
                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                >
                  <option value="percent">Процент (%)</option>
                  <option value="fixed">Фиксирана сума (€)</option>
                </select>
              </label>

              <label>
                <span>Размер на отстъпката</span>
                <input
                  type="number"
                  name="discountValue"
                  min="0"
                  max={form.discountType === "percent" ? "100" : undefined}
                  step="0.01"
                  value={form.discountValue}
                  onChange={handleChange}
                  placeholder="Например: 10"
                  required
                />
              </label>

              {!editingId && form.type === "partner" && (
                <label>
                  <span>Комисионна за партньора (%)</span>
                  <input
                    type="number"
                    name="commissionRate"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.commissionRate}
                    onChange={handleChange}
                    required
                  />
                  <small>
                    Изчислява се върху стойността на продуктите след
                    отстъпката, без доставката.
                  </small>
                </label>
              )}

              <label>
                <span>Минимална стойност на продуктите (€)</span>
                <input
                  type="number"
                  name="minimumOrderAmount"
                  min="0"
                  step="0.01"
                  value={form.minimumOrderAmount}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Лимит на използване</span>
                <input
                  type="number"
                  name="usageLimit"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={handleChange}
                  placeholder="Празно = без ограничение"
                />
              </label>

              <label>
                <span>Начална дата</span>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Крайна дата</span>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
                <small>Остави празно за неограничен срок.</small>
              </label>

              <label className="promo-description-field">
                <span>Описание</span>
                <textarea
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Допълнителна информация..."
                />
              </label>

              <div className="promo-form-actions">
                <button
                  type="submit"
                  className="promo-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Запазване..."
                    : editingId
                    ? "Запази промените"
                    : "Създай промокод"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="promo-secondary-button"
                    onClick={resetForm}
                  >
                    Откажи редакцията
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="promo-list-section">
            <div className="promo-section-heading">
              <span>УПРАВЛЕНИЕ</span>
              <h2>Всички промокодове</h2>
            </div>

            {loading ? (
              <div className="promo-empty">Зареждаме данните...</div>
            ) : promoCodes.length === 0 ? (
              <div className="promo-empty">
                <h3>Все още няма промокодове.</h3>
                <p>Създай първия промокод от формата по-горе.</p>
              </div>
            ) : (
              <div className="promo-admin-list">
                {promoCodes.map((promo) => (
                  <article className="promo-admin-card" key={promo._id}>
                    <div className="promo-card-top">
                      <div>
                        <span
                          className={`promo-status ${
                            promo.active ? "active" : "inactive"
                          }`}
                        >
                          {promo.active ? "АКТИВЕН" : "НЕАКТИВЕН"}
                        </span>

                        <h3>{promo.code}</h3>

                        <p>
                          {promo.type === "partner"
                            ? "Партньорски промокод"
                            : "Обикновен промокод"}
                        </p>
                      </div>

                      <strong className="promo-card-discount">
                        {formatDiscount(promo)}
                      </strong>
                    </div>

                    <div className="promo-card-stats">
                      <div>
                        <span>Използвания</span>
                        <strong>
                          {promo.usageCount || 0}
                          {promo.usageLimit
                            ? ` / ${promo.usageLimit}`
                            : " / ∞"}
                        </strong>
                      </div>

                      <div>
                        <span>Минимална поръчка</span>
                        <strong>
                          {Number(promo.minimumOrderAmount || 0).toFixed(2)} €
                        </strong>
                      </div>

                      <div>
                        <span>Валиден до</span>
                        <strong>{formatDate(promo.endDate)}</strong>
                      </div>
                    </div>

                    {promo.type === "partner" && (
                      <div className="promo-partner-info">
                        <span>Партньор</span>
                        <strong>{getPartnerName(promo)}</strong>
                        <small>{promo.partnerId?.email || ""}</small>
                        <span>
                          Комисионна: {promo.commissionRate ?? 10}%
                        </span>
                      </div>
                    )}

                    {promo.description && (
                      <p className="promo-card-description">
                        {promo.description}
                      </p>
                    )}

                    <div className="promo-card-actions">
                      <button
                        type="button"
                        className="promo-edit-button"
                        onClick={() => handleEdit(promo)}
                      >
                        Редактирай
                      </button>

                      <button
                        type="button"
                        className="promo-toggle-button"
                        onClick={() => handleToggle(promo._id)}
                      >
                        {promo.active ? "Деактивирай" : "Активирай"}
                      </button>

                      <button
                        type="button"
                        className="promo-delete-button"
                        onClick={() => handleDelete(promo)}
                      >
                        Изтрий
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="partner-management-section">
            <div className="promo-section-heading">
              <span>ПАРТНЬОРСКА ПРОГРАМА</span>
              <h2>Управление на партньори</h2>
            </div>

            <div className="partner-activate-box">
              <h3>Добави съществуващ клиент като партньор</h3>
              <p>
                Въведи имейла, с който клиентът вече има регистриран акаунт.
              </p>

              <form onSubmit={handleActivatePartner}>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(event) => setPartnerEmail(event.target.value)}
                  placeholder="client@email.com"
                  required
                />

                <button
                  type="submit"
                  className="promo-primary-button"
                  disabled={activatingPartner}
                >
                  {activatingPartner
                    ? "Активиране..."
                    : "Активирай партньор"}
                </button>
              </form>
            </div>

            <div className="partner-list-heading">
              <h3>Активни партньори</h3>
              <span>{partners.length} партньори</span>
            </div>

            {partners.length === 0 ? (
              <div className="promo-empty">
                Все още няма активни партньори.
              </div>
            ) : (
              <div className="partner-admin-list">
                {partners.map((partner) => (
                  <article className="partner-admin-card" key={partner._id}>
                    <div>
                      <strong>
                        {partner.firstName} {partner.lastName}
                      </strong>
                      <span>{partner.email}</span>
                      <small>{partner.phone || "Няма телефон"}</small>
                    </div>

                    <button
                      type="button"
                      className="promo-delete-button"
                      onClick={() => handleDeactivatePartner(partner)}
                    >
                      Деактивирай
                    </button>
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

export default AdminPromos;
