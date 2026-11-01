import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useUser();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Паролите не съвпадат.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Паролата трябва да бъде поне 6 символа.");
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-card">

        <div className="register-header">
          <span className="register-eyebrow">
            PERFUM DECANTS4LESS
          </span>

          <h1>Създай акаунт</h1>

          <p>
            Създай своя профил и получавай бонус точки
            от всяка покупка.
          </p>
        </div>

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >
          <div className="register-row">

            <div className="form-group">
              <label htmlFor="firstName">
                Име
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Име"
                autoComplete="given-name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Фамилия
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Фамилия"
                autoComplete="family-name"
                required
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Телефон
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+359 ..."
              autoComplete="tel"
            />
          </div>

          <div className="register-row">

            <div className="form-group">
              <label htmlFor="password">
                Парола
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Минимум 6 символа"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Потвърди паролата
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повтори паролата"
                autoComplete="new-password"
                required
              />
            </div>

          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Създаване на акаунт..."
              : "Създай акаунт"}
          </button>
        </form>

        <div className="register-footer">
          <span>Вече имате акаунт?</span>

          <Link to="/login">
            Вход
          </Link>
        </div>

      </div>
    </main>
  );
}

export default Register;