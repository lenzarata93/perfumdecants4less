import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

const API_URL = "http://localhost:5000/api";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });
  const [loading, setLoading] = useState(true);

  const saveAuth = (authToken, authUser) => {
    localStorage.setItem("token", authToken);

    setToken(authToken);
    setUser(authUser);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  const register = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Грешка при регистрация.");
    }

    saveAuth(data.token, data.user);

    return data;
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Грешка при вход.");
    }

    saveAuth(data.token, data.user);

    return data;
  };

  const logout = () => {
    clearAuth();
  };

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setToken(savedToken);
      setUser(data.user);
    } catch (error) {
      console.error("Fetch current user error:", error);

      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const value = {
    user,
    token,
    loading,
    isLoggedIn: !!user,
    isAdmin: user?.isAdmin === true,

    register,
    login,
    logout,

    setUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser трябва да бъде използван вътре в UserProvider."
    );
  }

  return context;
};

export default UserContext;