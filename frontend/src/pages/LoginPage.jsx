import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const [akunOrganisasi, setAkunOrganisasi] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.fromRegister) {
      setInfo("Registrasi berhasil. Silakan login dengan akun organisasi Anda.");
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      const res = await api.post("/auth/login", { akunOrganisasi, password });
      login({ user: res.data.user, token: res.data.token });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal login");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration" aria-hidden="true">
        <div className="bubble bubble-lg" />
        <div className="bubble bubble-md" />
        <div className="bubble bubble-sm" />
        <div className="auth-quote">
          <h2>Barang lama, manfaat baru.</h2>
          <p>
            Saling berbagi perlengkapan antar organisasi ITS supaya acara lebih hemat dan
            berkelanjutan.
          </p>
        </div>
      </div>

      <div className="auth-container">
        <h1 className="auth-title">Masuk ke BagiBarang</h1>
        <p className="auth-subtitle">
          Gunakan akun organisasi untuk mengelola dan berbagi inventaris.
        </p>

        {info && <p className="info-text">{info}</p>}
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Akun Organisasi
            <input
              type="text"
              value={akunOrganisasi}
              onChange={(e) => setAkunOrganisasi(e.target.value)}
              placeholder="contoh: cssmora_its"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary full-width">
            Login
          </button>
        </form>
        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftarkan organisasi</Link>
        </p>
      </div>
    </div>
  );
};
