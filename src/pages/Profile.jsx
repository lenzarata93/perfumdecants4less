
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

  // =====================================
  // RAFFLE PARTICIPATIONS
  // =====================================

  const [myRaffles, setMyRaffles] = useState([]);
  const [rafflesLoading, setRafflesLoading] = useState(true);
  const [rafflesError, setRafflesError] = useState("");

  // =====================================
  // FETCH MY ORDERS
  // =====================================

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

  // =====================================
  // FETCH MY RAFFLE PARTICIPATIONS
  // =====================================

  useEffect(() => {
    const fetchMyRaffles = async () => {
      if (!user || !token) {
        setRafflesLoading(false);
        return;
      }

      try {
        setRafflesLoading(true);
        setRafflesError("");

        const response = await fetch(
          `${API_URL}/api/raffles/my-entries`,
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
            data.message || "Грешка при зареждане на участията."
          );
        }

        setMyRaffles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch my raffles error:", error);
        setRafflesError(error.message);
      } finally {
        setRafflesLoading(false);
      }
    };

    fetchMyRaffles();
  }, [user, token]);

  // =====================================
  // TOTAL SPENT
  // Само завършени поръчки
  // Без доставка
  // =====================================

  const totalSpent = orders
    .filter((order) => order.status === "completed")
    .reduce(
      (total, order) =>
        total + Number(order.subtotal || 0),
      0
    );

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // =====================================
  // ORDER STATUS
  // =====================================

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

  // =====================================
  // RAFFLE STATUS
  // =====================================

  const getRaffleStatus = (raffle) => {
    if (raffle.isWinner) {
      return "Печеливш";
    }

    const statuses = {
      active: "Активна",
      completed: "Приключила",
      cancelled: "Отменена",
      draft: "Предстояща",
    };

    return statuses[raffle.status] || raffle.status;
  };

  const getRaffleStatusClass = (raffle) => {
    if (raffle.isWinner) {
      return "raffle-winner";
    }

    const classes = {
      active: "raffle-active",
      completed: "raffle-completed",
      cancelled: "raffle-cancelled",
      draft: "raffle-draft",
    };

    return classes[raffle.status] || "raffle-draft";
  };

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) return "Няма дата";

    return new Date(date).toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // =====================================
  // LOGIN CHECK
  // =====================================

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

  // =====================================
  // PROFILE
  // =====================================

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
                {totalSpent.toFixed(2)} €
              </strong>

              <span className="stat-description">
                Стойност на завършените покупки
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

            {/* =====================================
                MY RAFFLES
            ===================================== */}

            <section className="profile-card my-raffles-card">

              <div className="profile-card-header">
                <div>
                  <span>MY REWARDS</span>
                  <h2>Моите игри</h2>
                </div>
              </div>

              {rafflesLoading ? (
                <div className="empty-orders">
                  <p>Зареждане на участията...</p>
                </div>
              ) : rafflesError ? (
                <div className="empty-orders">
                  <h3>Неуспешно зареждане</h3>

                  <p>{rafflesError}</p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                  >
                    Опитай отново
                  </button>
                </div>
              ) : myRaffles.length === 0 ? (
                <div className="empty-orders">

                  <div className="empty-orders-icon">
                    ◇
                  </div>

                  <h3>
                    Все още не участваш в томбола
                  </h3>

                  <p>
                    Използвай натрупаните си бонус точки,
                    за да се включиш в игрите и да спечелиш награди.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/rewards")}
                  >
                    Разгледай наградите
                  </button>

                </div>
              ) : (
                <div className="my-raffles-list">

                  {myRaffles.map((raffle) => (
                    <article
                      className="my-raffle-item"
                      key={raffle.raffleId}
                    >

                      <div className="my-raffle-main">

                        {raffle.image ? (
                          <img
                            src={raffle.image}
                            alt={raffle.title}
                            className="my-raffle-image"
                          />
                        ) : (
                          <div className="my-raffle-image-placeholder">
                            REWARD
                          </div>
                        )}

                        <div className="my-raffle-info">

                          <span className="my-raffle-label">
                            НАГРАДА
                          </span>

                          <h3>
                            {raffle.title}
                          </h3>

                          {raffle.description && (
                            <p>
                              {raffle.description}
                            </p>
                          )}

                          <span
                            className={`my-raffle-status ${getRaffleStatusClass(raffle)}`}
                          >
                            {getRaffleStatus(raffle)}
                          </span>

                        </div>

                      </div>

                      <div className="my-raffle-details">

                        <div className="my-raffle-detail">
                          <span>ТВОИ УЧАСТИЯ</span>

                          <strong>
                            {raffle.entries}
                          </strong>
                        </div>

                        <div className="my-raffle-detail">
                          <span>ОБЩО УЧАСТИЯ</span>

                          <strong>
                            {raffle.collectedPoints}
                          </strong>
                        </div>

                        <div className="my-raffle-detail">
                          <span>ПОХАРЧЕНИ ТОЧКИ</span>

                          <strong>
                            {Number(raffle.pointsSpent || 0).toFixed(0)}
                          </strong>
                        </div>

                        <div className="my-raffle-detail my-raffle-chance">
                          <span>ШАНС ЗА ПЕЧАЛБА</span>

                          <strong>
                            {Number(raffle.chance || 0).toFixed(2)}%
                          </strong>
                        </div>

                      </div>

                      <div className="my-raffle-tickets">

                        <span>
                          ТВОИТЕ НОМЕРА:
                        </span>

                        <div className="my-raffle-ticket-list">
                          {raffle.entryNumbers.map((number) => (
                            <span
                              className={`my-raffle-ticket ${
                                raffle.isWinner &&
                                raffle.status === "completed" &&
                                number === raffle.entryNumbers.find(
                                  (_, index) =>
                                    raffle.isWinner &&
                                    raffle.status === "completed" &&
                                    raffle.entryNumbers[index] === number
                                )
                                  ? "my-raffle-ticket-winner"
                                  : ""
                              }`}
                              key={number}
                            >
                              #{number}
                            </span>
                          ))}
                        </div>

                      </div>

                      {raffle.status === "completed" && (
                        <div className="my-raffle-result">
                          {raffle.isWinner ? (
                            <strong>
                              Поздравления! Ти спечели тази награда!
                            </strong>
                          ) : (
                            <span>
                              Томболата приключи. Благодарим ти за участието!
                            </span>
                          )}
                        </div>
                      )}

                      {raffle.status === "cancelled" && (
                        <div className="my-raffle-result">
                          <span>
                            Тази томбола е отменена.
                          </span>
                        </div>
                      )}

                    </article>
                  ))}

                </div>
              )}

            </section>

            {/* =====================================
                MY ORDERS
            ===================================== */}

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
