import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

export const RegisterPage = () => {
  const [namaOrganisasi, setNamaOrganisasi] = useState("");
  const [akunOrganisasi, setAkunOrganisasi] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== konfirmasiPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }

    try {
      await api.post("/auth/register", {
        namaOrganisasi,
        akunOrganisasi,
        email,
        password
      });
      navigate("/login", { state: { fromRegister: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal registrasi");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-illustration" aria-hidden="true">
        <div className="bubble bubble-lg" />
        <div className="bubble bubble-md" />
        <div className="bubble bubble-sm" />
        <div className="auth-quote">
          <h2>Satu gudang barang, satu kampus.</h2>
          <p>
            Himpunan, UKM, dan komunitas bisa saling meminjam inventaris tanpa harus beli
            baru.
          </p>
        </div>
      </div>

      <div className="auth-container">
        <h1 className="auth-title">Daftar Akun Organisasi</h1>
        <p className="auth-subtitle">
          Pastikan email PIC menggunakan domain <strong>@student.its.ac.id</strong>.
        </p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Nama Organisasi
            <input
              type="text"
              value={namaOrganisasi}
              onChange={(e) => setNamaOrganisasi(e.target.value)}
              placeholder="contoh: CSSMoRA ITS"
              required
            />
          </label>
          <label>
            Akun Organisasi (username)
            <input
              type="text"
              value={akunOrganisasi}
              onChange={(e) => setAkunOrganisasi(e.target.value)}
              placeholder="contoh: cssmora_its"
              required
            />
          </label>
          <label>
            Email PIC (wajib @student.its.ac.id)
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh: nama@student.its.ac.id"
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
          <label>
            Konfirmasi Password
            <input
              type="password"
              value={konfirmasiPassword}
              onChange={(e) => setKonfirmasiPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn-primary full-width">
            Daftarkan Organisasi
          </button>
        </form>
        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
