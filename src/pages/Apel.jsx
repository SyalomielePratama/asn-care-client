import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Apel.css";
import axios from "axios";

const Apel = () => {
  const [tanggalApel, setTanggalApel] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [statusApel, setStatusApel] = useState("Pilih");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: "", message: "" });

    if (!tanggalApel || statusApel === "Pilih") {
      setAlert({
        show: true,
        type: "danger",
        message: "Tanggal dan Status Kehadiran harus diisi!",
      });
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAlert({
        show: true,
        type: "danger",
        message: "Sesi Anda telah berakhir, mohon login kembali.",
      });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/kehadiran/",
        {
          tanggal_apel: tanggalApel,
          status_apel: statusApel.toLowerCase(), // Sesuaikan dengan format backend (lowercase)
          keterangan: keterangan || null, // Kirim null jika kosong
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setAlert({
          show: true,
          type: "success",
          message: "Kehadiran berhasil ditambahkan!",
        });
        setTanggalApel("");
        setKeterangan("");
        setStatusApel("Pilih");
      } else {
        let errorMessage = "Gagal menambahkan kehadiran.";
        if (response.data && response.data.message) {
          errorMessage = response.data.message;
        } else if (response.data) {
          errorMessage = JSON.stringify(response.data);
        }
        setAlert({
          show: true,
          type: "danger",
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error("Error saat menambahkan kehadiran:", error);
      let errorMessage = "Terjadi kesalahan saat menghubungi server.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.data) {
        errorMessage = JSON.stringify(error.response.data);
      }
      setAlert({
        show: true,
        type: "danger",
        message: errorMessage,
      });
    }

    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 3000);
  };

  return (
    <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 text-white w-100">
          {/* ALERT NOTIFIKASI */}
          {alert.show && (
            <div
              className={`alert alert-${alert.type} d-flex align-items-center`}
              role="alert"
            >
              <i
                className={`bi ${
                  alert.type === "success" ? "bi-bell" : "bi-x-circle"
                } me-2`}
                style={{ fontSize: "1.2rem" }}
              ></i>
              <div>{alert.message}</div>
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="form-container px-3 rounded shadow"
            style={{
              maxWidth: "80rem",
              position: "relative",
              backgroundColor: "#27293D",
              padding: "2rem",
            }}
          >
            <h2 className="mb-4">Apel</h2>

            <div className="row mb-3">
              {/* Tanggal */}
              <div className="col-md-4">
                <label className="form-label">Tanggal Apel</label>
                <input
                  type="date"
                  className="form-control"
                  value={tanggalApel}
                  onChange={(e) => setTanggalApel(e.target.value)}
                  required
                  style={{
                    backgroundColor: "#1E1E2D",
                    color: "#FFFFFF",
                    border: "1px solid #2A324D",
                  }}
                />
              </div>

              {/* Keterangan */}
              <div className="col-md-8">
                <label className="form-label">Keterangan</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Tulis keterangan jika ada"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  style={{
                    backgroundColor: "#1E1E2D",
                    color: "#FFFFFF",
                    border: "1px solid #2A324D",
                  }}
                ></textarea>
              </div>
            </div>

            <div className="row mb-4">
              {/* Status Kehadiran */}
              <div className="col-md-4">
                <label className="form-label">Status Kehadiran</label>
                <select
                  className="form-select custom-select-white"
                  value={statusApel}
                  onChange={(e) => setStatusApel(e.target.value)}
                  required
                  style={{
                    backgroundColor: "#1E1E2D",
                    color: "#FFFFFF",
                    border: "1px solid #2A324D",
                  }}
                >
                  <option value="Pilih">Pilih</option>
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="row">
              <div className="col-md-12 d-flex justify-content-end mt-3">
                <button type="submit" className="btn btn-success">
                  Simpan Kehadiran
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Apel;