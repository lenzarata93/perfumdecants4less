import { useEffect, useState } from "react";
import Header from "../components/Header";
import "./AdminOrders.css";

const API_URL = "http://localhost:5000/api/orders";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Грешка при зареждане на поръчките.");
      }

      const data = await response.json();

      setOrders(data);
    } catch (error) {
      console.error("Admin orders fetch error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEuro = (value) => {
    return `€${Number(value || 0).toFixed(2)}`;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Чакаща",
      confirmed: "Потвърдена",
      processing: "Обработва се",
      shipped: "Изпратена",
      completed: "Завършена",
      cancelled: "Отказана",
    };

    return labels[status] || status;
  };

  const getDeliveryLabel = (method) => {
    if (method === "econt") {
      return "Еконт";
    }

    if (method === "speedy") {
      return "Спиди";
    }

    return method;
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((currentId) =>
      currentId === orderId ? null : orderId
    );

    setStatusMessage("");
    setError("");
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");
      setStatusMessage("");

      const response = await fetch(
        `${API_URL}/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Грешка при промяна на статуса."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
        )
      );

      setStatusMessage(
        `Статусът на ${data.order.orderNumber} е променен на „${getStatusLabel(
          data.order.status
        )}“.`
      );
    } catch (error) {
      console.error(
        "Update order status error:",
        error
      );

      setError(error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <>
        <Header />

        <main className="admin-orders-page">
          <div className="admin-orders-container">
            <div className="admin-orders-loading">
              Зареждаме поръчките...
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="admin-orders-page">
        <div className="admin-orders-container">
          <header className="admin-orders-header">
            <div>
              <p className="admin-eyebrow">
                ADMIN PANEL
              </p>

              <h1>Поръчки</h1>

              <p>
                Управлявай поръчките и следи продажбите.
              </p>
            </div>

            <div className="admin-orders-count">
              <span>{orders.length}</span>
              <small>поръчки</small>
            </div>
          </header>

          {error && (
            <div className="admin-message admin-message-error">
              {error}
            </div>
          )}

          {statusMessage && (
            <div className="admin-message admin-message-success">
              {statusMessage}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="admin-orders-empty">
              <h2>Няма поръчки</h2>

              <p>
                Все още няма създадени поръчки.
              </p>
            </div>
          ) : (
            <section className="admin-orders-list">
              {orders.map((order) => {
                const isExpanded =
                  expandedOrderId === order._id;

                const isUpdating =
                  updatingOrderId === order._id;

                const isFinalStatus =
                  order.status === "completed" ||
                  order.status === "cancelled";

                return (
                  <article
                    key={order._id}
                    className={`admin-order ${
                      isExpanded
                        ? "admin-order-expanded"
                        : ""
                    }`}
                  >
                    <div className="admin-order-main">
                      <div className="admin-order-number">
                        <span>ПОРЪЧКА</span>

                        <strong>
                          {order.orderNumber}
                        </strong>

                        <small>
                          {formatDate(order.createdAt)}
                        </small>
                      </div>

                      <div className="admin-order-customer">
                        <span>КЛИЕНТ</span>

                        <strong>
                          {order.customer.firstName}{" "}
                          {order.customer.lastName}
                        </strong>

                        <small>
                          {order.customer.phone}
                        </small>
                      </div>

                      <div className="admin-order-summary">
                        <span>СУМА</span>

                        <strong>
                          {formatEuro(order.total)}
                        </strong>

                        <small>
                          {order.items.length}{" "}
                          {order.items.length === 1
                            ? "позиция"
                            : "позиции"}
                        </small>
                      </div>

                      <div className="admin-order-status">
                        <span>СТАТУС</span>

                        <select
                          value={order.status}
                          disabled={
                            isUpdating ||
                            isFinalStatus
                          }
                          className={`status-select status-${order.status}`}
                          onChange={(event) =>
                            handleStatusChange(
                              order._id,
                              event.target.value
                            )
                          }
                        >
                          <option value="pending">
                            Чакаща
                          </option>

                          <option value="confirmed">
                            Потвърдена
                          </option>

                          <option value="processing">
                            Обработва се
                          </option>

                          <option value="shipped">
                            Изпратена
                          </option>

                          <option value="completed">
                            Завършена
                          </option>

                          <option value="cancelled">
                            Отказана
                          </option>
                        </select>

                        {isUpdating && (
                          <small className="status-saving">
                            Записване...
                          </small>
                        )}

                        {isFinalStatus && (
                          <small className="status-saving">
                            🔒 Финален статус
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="admin-order-footer">
                      <div>
                        <span>Доставка</span>

                        <strong>
                          {getDeliveryLabel(
                            order.delivery.method
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Продукти</span>

                        <strong>
                          {order.items
                            .map(
                              (item) =>
                                `${item.name} ${item.size}ml × ${item.quantity}`
                            )
                            .join(", ")}
                        </strong>
                      </div>

                      <div className="admin-order-profit">
                        <span>Брутна печалба</span>

                        <strong>
                          {formatEuro(
                            order.grossProfit
                          )}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="admin-order-details-button"
                        onClick={() =>
                          toggleOrderDetails(
                            order._id
                          )
                        }
                      >
                        {isExpanded
                          ? "Затвори детайлите ↑"
                          : "Виж детайли ↓"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="admin-order-details">
                        <div className="order-details-header">
                          <div>
                            <span>
                              ДЕТАЙЛИ НА ПОРЪЧКАТА
                            </span>

                            <h2>
                              {order.orderNumber}
                            </h2>
                          </div>

                          <div className="order-detail-date">
                            {formatDate(
                              order.createdAt
                            )}
                          </div>
                        </div>

                        <div className="order-details-grid">
                          <div className="order-detail-card">
                            <span>КЛИЕНТ</span>

                            <strong>
                              {order.customer.firstName}{" "}
                              {order.customer.lastName}
                            </strong>

                            <p>
                              {order.customer.phone}
                            </p>

                            <p>
                              {order.customer.email}
                            </p>
                          </div>

                          <div className="order-detail-card">
                            <span>ДОСТАВКА</span>

                            <strong>
                              {getDeliveryLabel(
                                order.delivery.method
                              )}
                            </strong>

                            <p>
                              {order.delivery.city},{" "}
                              {order.delivery.postalCode}
                            </p>

                            <p>
                              {order.delivery.address}
                            </p>
                          </div>

                          <div className="order-detail-card">
                            <span>ПЛАЩАНЕ</span>

                            <strong>
                              Наложен платеж
                            </strong>

                            <p>
                              Статус:{" "}
                              {order.payment?.status ||
                                "pending"}
                            </p>
                          </div>
                        </div>

                        <div className="order-items-section">
                          <div className="order-section-heading">
                            <span>ПРОДУКТИ</span>

                            <h3>
                              Съдържание на поръчката
                            </h3>
                          </div>

                          <div className="order-items-list">
                            {order.items.map(
                              (item, index) => (
                                <div
                                  key={`${order._id}-${index}`}
                                  className="order-item"
                                >
                                  <div className="order-item-main">
                                    <div className="order-item-number">
                                      {index + 1}
                                    </div>

                                    <div>
                                      <span className="order-item-brand">
                                        {item.brand}
                                      </span>

                                      <strong>
                                        {item.name}
                                      </strong>

                                      <p>
                                        {item.size} ml ×{" "}
                                        {item.quantity}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="order-item-financial">
                                    <div>
                                      <span>
                                        ЦЕНА / БР.
                                      </span>

                                      <strong>
                                        {formatEuro(
                                          item.price
                                        )}
                                      </strong>
                                    </div>

                                    <div>
                                      <span>
                                        ОБЩО
                                      </span>

                                      <strong>
                                        {formatEuro(
                                          item.total
                                        )}
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="order-item-pricing">
                                    <span>
                                      ЦЕНОВА БУТИЛКА
                                    </span>

                                    <strong>
                                      {Number(
                                        item.pricingPurchasePricePerMl ||
                                          0
                                      ).toFixed(3)}{" "}
                                      €/ml
                                    </strong>

                                    <small>
                                      ID:{" "}
                                      {
                                        item.pricingBottleId
                                      }
                                    </small>
                                  </div>

                                  <div className="order-item-cost">
                                    <span>
                                      СЕБЕСТОЙНОСТ
                                    </span>

                                    <strong>
                                      {formatEuro(
                                        item.costTotal
                                      )}
                                    </strong>
                                  </div>

                                  <div className="order-item-inventory">
                                    <span>
                                      ИЗПОЛЗВАНА НАЛИЧНОСТ
                                    </span>

                                    {item.inventoryUsage
                                      ?.length > 0 ? (
                                      <div className="inventory-usage-list">
                                        {item.inventoryUsage.map(
                                          (
                                            usage,
                                            usageIndex
                                          ) => (
                                            <div
                                              key={`${item.productId}-${usageIndex}`}
                                              className="inventory-usage-row"
                                            >
                                              <span>
                                                {usage.ml} ml
                                              </span>

                                              <span>
                                                {Number(
                                                  usage.purchasePricePerMl
                                                ).toFixed(
                                                  3
                                                )}{" "}
                                                €/ml
                                              </span>

                                              <strong>
                                                {formatEuro(
                                                  usage.cost
                                                )}
                                              </strong>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      <small>
                                        Няма записана
                                        употреба.
                                      </small>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div className="order-financial-summary">
                          <div>
                            <span>ПРОДУКТИ</span>

                            <strong>
                              {formatEuro(
                                order.subtotal
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>ДОСТАВКА</span>

                            <strong>
                              {formatEuro(
                                order.deliveryPrice
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>ОБЩО</span>

                            <strong>
                              {formatEuro(
                                order.total
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>СЕБЕСТОЙНОСТ</span>

                            <strong>
                              {formatEuro(
                                order.totalCost
                              )}
                            </strong>
                          </div>

                          <div className="financial-profit">
                            <span>
                              БРУТНА ПЕЧАЛБА
                            </span>

                            <strong>
                              {formatEuro(
                                order.grossProfit
                              )}
                            </strong>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="order-notes">
                            <span>БЕЛЕЖКА</span>

                            <p>{order.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

export default AdminOrders;