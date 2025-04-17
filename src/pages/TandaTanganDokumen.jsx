import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "bootstrap-icons/font/bootstrap-icons.css";

const TandaTanganDokumen = () => {
  const [form, setForm] = useState({
    noSurat: "",
    tanggalSurat: "",
    penandatangan: "",
    perihal: "",
  });

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQRGenerate = () => {
    if (form.noSurat && form.tanggalSurat && form.penandatangan && form.perihal) {
      setNotification({
        message: "QR Code berhasil dibuat!",
        type: "success",
        show: true,
      });
    } else {
      setNotification({
        message: "Harap lengkapi semua data sebelum membuat QR Code!",
        type: "error",
        show: true,
      });
    }
  };

  const handleDownload = () => {
    if (form.noSurat && form.tanggalSurat && form.penandatangan && form.perihal) {
      setNotification({
        message: "File berhasil diunduh!",
        type: "success",
        show: true,
      });
    } else {
      setNotification({
        message: "Harap lengkapi semua data sebelum mengunduh file!",
        type: "error",
        show: true,
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div style={{ backgroundColor: "#27293D", minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 w-100 text-white">
          <h2 className="mb-4">Tanda Tangan Dokumen</h2>
          
          {/* Notification */}
          {notification.show && (
            <div
              className={`alert alert-${notification.type === "success" ? "success" : "danger"} d-flex align-items-center mb-4`}
              role="alert"
            >
              <i
                className={`bi bi-${notification.type === "success" ? "check-circle" : "exclamation-circle"} me-2`}
              ></i>
              <span>{notification.message}</span>
              <button
                type="button"
                className="btn-close ms-2"
                onClick={handleCloseNotification}
              ></button>
            </div>
          )}

          <div className="row">
            {/* Preview Dokumen */}
            <div className="col-md-6 mb-4">
              <div
                style={{
                  height: "500px",
                  backgroundColor: "#2A2B3D",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa",
                  border: "2px dashed #aaa", // <- border putus-putus
                }}
              >
                Preview Dokumen
              </div>
            </div>

            {/* Form Buat QR Code */}
            <div className="col-md-6">
              <div
                className="p-4 rounded shadow"
                style={{
                  backgroundColor: "#1E1E2D", // Form background color changed to #1E1E2D
                  border: "1px solid #2A324D",
                }}
              >
                <h4 className="mb-4">Form Buat QR Code</h4>

                <div className="mb-3">
                  <label className="form-label">No. Surat</label>
                  <input
                    type="text"
                    className="form-control"
                    name="noSurat"
                    placeholder="Masukkan No. Surat"
                    value={form.noSurat}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tanggal Surat</label>
                  <input
                    type="date"
                    className="form-control"
                    name="tanggalSurat"
                    value={form.tanggalSurat}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Penandatanganan</label>
                  <input
                    type="text"
                    className="form-control"
                    name="penandatangan"
                    placeholder="Nama Penandatangan"
                    value={form.penandatangan}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Perihal</label>
                  <input
                    type="text"
                    className="form-control"
                    name="perihal"
                    placeholder="Perihal Surat"
                    value={form.perihal}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    onClick={handleQRGenerate}
                    className="btn"
                    style={{ backgroundColor: "#FF9F89", color: "#1E1E2D" }}
                  >
                    <i className="bi bi-qr-code me-2"></i>Buat QR Code
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn"
                    style={{ backgroundColor: "#FD77A4", color: "#1E1E2D" }}
                  >
                    <i className="bi bi-download me-2"></i>Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default TandaTanganDokumen;
