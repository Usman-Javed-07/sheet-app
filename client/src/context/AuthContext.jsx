// /mnt/data/AuthContext.jsx
import React, { createContext, useState, useCallback } from "react";
import { api } from "../services/api";

export const AuthContext = createContext();

function normalizeUser(rawUser) {
  if (!rawUser) return null;

  const roleName =
    typeof rawUser.role === "string"
      ? rawUser.role
      : rawUser.role?.name || null;

  return {
    ...rawUser,
    roleName, // convenient string
    // keep a consistent object shape for components that expect role.name
    role:
      typeof rawUser.role === "string"
        ? { name: rawUser.role }
        : rawUser.role || (roleName ? { name: roleName } : undefined),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on first load
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await api.authAPI.getCurrentUser();
          const normalized = normalizeUser(response.data.user);
          setUser(normalized);
        }
      } catch (err) {
        // Only clear token if actually unauthorized
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await api.authAPI.login(email, password);
      const { token, user: rawUser } = response.data;
      localStorage.setItem("token", token);
      const normalized = normalizeUser(rawUser);
      setUser(normalized);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
