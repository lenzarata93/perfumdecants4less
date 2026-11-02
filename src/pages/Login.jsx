import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Header from "../components/Header";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setLoading(true);

    try {
      await login(formData.email, formData.password);

      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="login-page">
        <div className="login-card">
          <div className="login-header">
            <span className="login-eyebrow">
              PERFUM DECANTS4LESS
            </span>

            <h1>Добре дошли отново</h1>

            <p>
              Влезте в своя профил, за да управлявате
              поръчките си и своите бонус точки.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="login-form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Въведете email"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">
                Парола
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Въведете парола"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Влизане..." : "Вход"}
            </button>
          </form>

          <div className="login-footer">
            <span>Нямате акаунт?</span>

            <Link to="/register">
              Създайте профил
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;