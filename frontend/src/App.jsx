import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ItemListPage } from "./pages/ItemListPage";
import { ItemFormPage } from "./pages/ItemFormPage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-root">
      {user && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={user ? <ItemListPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/items/new"
            element={user ? <ItemFormPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/items/:id/edit"
            element={user ? <ItemFormPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/items/:id"
            element={user ? <ItemDetailPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <RegisterPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/login"} replace />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
