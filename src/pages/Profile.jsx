
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { API_URL } from "../config";
import Header from "../components/Header";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const {
    user,
    token,
    logout,
  } = useUser();

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user || !token) {
        setOrdersLoading(false);
        return;
      }

      try {
        setOrdersLoading(true);
        setOrdersError("");

        const response = await fetch(
          `${API_URL}/api/orders/my-orders`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Грешка при зареждане на поръчките."
          );
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch my orders error:", error);
        setOrdersError(error.message);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getOrderStatus = (status) => {
    const statuses = {
      pending: "Очаква потвърждение",
      confirmed: "Потвърдена",
      processing: "Обработва се",
      shipped: "Изпратена",
      completed: "Завършена",
      cancelled: "Отказана",
    };

    return statuses[status] || status || "Неизвестен статус";
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: "pending",
      confirmed: "confirmed",
      processing: "processing",
      shipped: "shipped",
      completed: "completed",
      cancelled: "cancelled",
    };

    return classes[status] || "pending";
  };

  const formatDate = (date) => {
    if (!date) return "Няма дата";

    return new Date(date).toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <>
        <Header />

        <main className="profile-page">
          <div className="profile-login-card">
            <h1>Моят профил</h1>

            <p>
              Моля, влезте в акаунта си, за да видите
              своя профил.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Вход
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="profile-page">
        <div className="profile-container">

          <div className="profile-heading">
            <div>
              <span className="profile-eyebrow">
                MY ACCOUNT
              </span>

              <h1>
                Здравей, {user.firstName}
              </h1>

              <p>
                Добре дошъл в своя профил.
              </p>
            </div>

            <button
              type="button"
              className="profile-logout"
              onClick={handleLogout}
            >
              Изход
            </button>
          </div>

          <div className="profile-stats">

            <div className="profile-stat-card">
              <span className="stat-label">
                БОНУС ТОЧКИ
              </span>

              <strong>
                {user.bonusPoints || 0}
              </strong>

              <span className="stat-description">
                Натрупани точки
              </span>
            </div>

            <div className="profile-stat-card">
              <span className="stat-label">
                ОБЩО ПОХАРЧЕНО
              </span>

              <strong>
                {Number(user.totalSpent || 0).toFixed(2)} €
              </strong>

              <span className="stat-description">
                Обща стойност на покупките
              </span>
            </div>

            <div className="profile-stat-card">
              <span className="stat-label">
                ЛОЯЛНОСТ
              </span>

              <strong>
                MEMBER
              </strong>

              <span className="stat-description">
                Стандартен клиент
              </span>
            </div>

          </div>

          <div className="profile-content">

            <section className="profile-card">

              <div className="profile-card-header">
                <div>
                  <span>ACCOUNT</span>
                  <h2>Лични данни</h2>
                </div>
              </div>

              <div className="profile-info-grid">

                <div className="profile-info">
                  <span>Име</span>

                  <strong>
                    {user.firstName} {user.lastName}
                  </strong>
                </div>

                <div className="profile-info">
                  <span>Email</span>

                  <strong>
                    {user.email}
                  </strong>
                </div>

                <div className="profile-info">
                  <span>Телефон</span>

                  <strong>
                    {user.phone || "Не е добавен"}
                  </strong>
                </div>

              </div>

            </section>

            <section className="profile-card orders-card">

              <div className="profile-card-header">
                <div>
                  <span>ORDERS</span>
                  <h2>Моите поръчки</h2>
                </div>
              </div>

              {ordersLoading ? (
                <div className="empty-orders">
                  <p>Зареждане на поръчките...</p>
                </div>
              ) : ordersError ? (
                <div className="empty-orders">
                  <h3>Неуспешно зареждане</h3>

                  <p>{ordersError}</p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                  >
                    Опитай отново
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-orders">

                  <div className="empty-orders-icon">
                    ◇
                  </div>

                  <h3>
                    Все още нямате поръчки
                  </h3>

                  <p>
                    След първата ви покупка историята на
                    поръчките ще се появи тук.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/shop")}
                  >
                    Разгледай парфюмите
                  </button>

                </div>
              ) : (
                <div className="my-orders-list">

                  {orders.map((order) => (
                    <article
                      className="my-order-item"
                      key={order._id}
                    >

                      <div className="my-order-header">

                        <div>
                          <span className="my-order-label">
                            ПОРЪЧКА
                          </span>

                          <h3>
                            {order.orderNumber || order._id}
                          </h3>

                          <span className="my-order-date">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        <span
                          className={`my-order-status ${getStatusClass(order.status)}`}
                        >
                          {getOrderStatus(order.status)}
                        </span>

                      </div>

                      <div className="my-order-products">

                        {(order.items || []).map((item, index) => (
                          <div
                            className="my-order-product"
                            key={`${item.productId || item.name}-${index}`}
                          >

                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="my-order-product-image"
                              />
                            )}

                            <div className="my-order-product-info">

                              <strong>
                                {item.name}
                              </strong>

                              <span>
                                {item.brand || ""}
                                {item.brand ? " · " : ""}
                                {item.size} мл × {item.quantity}
                              </span>

                            </div>

                            <strong className="my-order-product-price">
                              {Number(item.total || 0).toFixed(2)} €
                            </strong>

                          </div>
                        ))}

                      </div>

                      <div className="my-order-footer">

                        <div>
                          <span>Артикули</span>

                          <strong>
                            {Number(order.subtotal || 0).toFixed(2)} €
                          </strong>
                        </div>

                        <div className="my-order-grand-total">
                          <span>Обща цена</span>

                          <strong>
                            {Number(order.total || 0).toFixed(2)} €
                          </strong>
                        </div>

                        {Number(order.pointsEarned || 0) > 0 && (
                          <div className="my-order-points">
                            <span>Спечелени точки</span>

                            <strong>
                              +{Number(order.pointsEarned).toFixed(2)}
                            </strong>
                          </div>
                        )}

                      </div>

                    </article>
                  ))}

                </div>
              )}

            </section>

          </div>

        </div>
      </main>
    </>
  );
}

export default Profile;
