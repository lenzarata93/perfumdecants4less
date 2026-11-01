import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Header from "../components/Header";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useUser();

  const handleLogout = () => {
    logout();
    navigate("/");
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

            </section>

          </div>

        </div>

      </main>
    </>
  );
}

export default Profile;