import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("bagibarang_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("bagibarang_token") || "");

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = ({ user, token }) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("bagibarang_user", JSON.stringify(user));
    localStorage.setItem("bagibarang_token", token);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("bagibarang_user");
    localStorage.removeItem("bagibarang_token");
  };

  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
