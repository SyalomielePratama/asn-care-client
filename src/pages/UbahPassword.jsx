import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./UbahPassword.css";
import axios from "axios";

const UbahPassword = () => {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [notifikasi, setNotifikasi] = useState({
    pesan: "",
    jenis: "", // success atau danger
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotifikasi({ pesan: "", jenis: "" }); // Reset notifikasi

    if (form.old_password === "" || form.new_password === "" || form.confirm_password === "") {
      setNotifikasi({
        pesan: "Semua kolom password harus diisi!",
        jenis: "danger",
      });
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setNotifikasi({
        pesan: "Password baru dan konfirmasi tidak cocok!",
        jenis: "danger",
      });
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setNotifikasi({
        pesan: "Sesi Anda telah berakhir, mohon login kembali.",
        jenis: "danger",
      });
      navigate("/"); // Redirect ke login jika tidak ada token
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/user/change-password/",
        {
          old_password: form.old_password,
          new_password: form.new_password,
          confirm_password: form.confirm_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setNotifikasi({
          pesan: "Password berhasil diubah!",
          jenis: "success",
        });
        setForm({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        // Tangani error response dari backend
        let errorMessage = "Gagal mengubah password.";
        if (response.data && response.data.message) {
          errorMessage = response.data.message;
        } else if (response.data) {
          // Coba tampilkan error dari response data (mungkin dalam bentuk objek)
          errorMessage = JSON.stringify(response.data);
        }
        setNotifikasi({
          pesan: errorMessage,
          jenis: "danger",
        });
      }
    } catch (error) {
      console.error("Error saat mengubah password:", error);
      let errorMessage = "Terjadi kesalahan saat menghubungi server.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.data) {
        errorMessage = JSON.stringify(error.response.data);
      }
      setNotifikasi({
        pesan: errorMessage,
        jenis: "danger",
      });
    }
  };

  return (
    <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 text-white w-100">
          <h2 className="mb-4">Ubah Password</h2>

          {/* Notifikasi */}
          {notifikasi.pesan && (
            <div
              className={`alert alert-${notifikasi.jenis} alert-dismissible fade show`}
              role="alert"
            >
              {notifikasi.pesan}
              <button
                type="button"
                className="btn-close"
                onClick={() => setNotifikasi({ pesan: "", jenis: "" })}
              ></button>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="setting-form p-4 rounded shadow"
            style={{ backgroundColor: "#27293D", border: "1px solid #2A324D" }}
          >
            <div className="mb-3">
              <label className="form-label text-white">Password Lama</label>
              <input
                type="password"
                className="form-control"
                name="old_password"
                placeholder="Masukkan Password Lama"
                value={form.old_password}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Password Baru</label>
              <input
                type="password"
                className="form-control"
                name="new_password"
                placeholder="Masukkan Password Baru"
                value={form.new_password}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white">Konfirmasi Password</label>
              <input
                type="password"
                className="form-control"
                name="confirm_password"
                placeholder="Konfirmasi Password Baru"
                value={form.confirm_password}
                onChange={handleChange}
              />
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-success">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UbahPassword;