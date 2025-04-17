import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./login.css"; // CSS tambahan
import WhatsAppIcon from "../components/whatsapp";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tokenResponse = await axios.post("http://localhost:8000/api/token/", {
        username: email,
        password: password,
      });

      const accessToken = tokenResponse.data.access;
      localStorage.setItem("accessToken", accessToken); // Simpan access token

      try {
        const userResponse = await axios.get("http://localhost:8000/api/pegawai/profile/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Asumsikan ada cara untuk membedakan admin dan pegawai dari response profile
        // Misalnya, field 'is_superuser' atau 'role'
        if (userResponse.data?.is_superuser) {
          window.location.href = "http://localhost:8000/admin"; // Redirect langsung ke admin
        } else {
          navigate("/dashboard"); // Redirect langsung ke dashboard untuk pegawai
        }
      } catch (error) {
        if (error.response?.status === 401) {
          alert("Sesi login tidak valid, mohon login kembali.");
          localStorage.removeItem("accessToken");
          // Mungkin arahkan kembali ke halaman login jika perlu
        } else {
          alert("Gagal mendapatkan informasi profil pegawai.");
          localStorage.removeItem("accessToken");
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Username atau password salah!";
      alert(`Login gagal: ${errorMessage}`);
      console.error("Terjadi kesalahan saat login:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <div className="logo-container">
          <img src="/images/pemkab.png" alt="Logo 1" className="logo" />
          <img src="/images/komdigi.png" alt="Logo 2" className="logo logo-komdigi" />
        </div>
        <h3 className="text-left mb-3">Silahkan Masuk Untuk Akses Aplikasi</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              placeholder="Masukan Username"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Masukan Password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Masuk
          </button>
        </form>
      </div>

      <WhatsAppIcon />
    </div>
  );
};

export default Login;