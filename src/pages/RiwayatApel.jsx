import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./RiwayatApel.css";
import axios from "axios";

const RiwayatApel = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [riwayatApel, setRiwayatApel] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printStartDate, setPrintStartDate] = useState("");
  const [printEndDate, setPrintEndDate] = useState("");
  const [startDateModal, setStartDateModal] = useState("");
  const [endDateModal, setEndDateModal] = useState("");
  const [isCetakLoading, setIsCetakLoading] = useState(false);

  const fetchRiwayatApel = async (start = "", end = "") => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Sesi Anda telah berakhir, mohon login kembali.");
      setLoading(false);
      return;
    }

    try {
      const params = {};
      if (start) params.tanggal_mulai = start;
      if (end) params.tanggal_akhir = end;

      const response = await axios.get("http://localhost:8000/api/kehadiran/", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRiwayatApel(response.data);
    } catch (error) {
      console.error("Gagal mengambil riwayat apel:", error);
      setError("Gagal mengambil riwayat apel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayatApel();
  }, []);

  const handleCari = () => {
    fetchRiwayatApel(startDate, endDate);
  };

  const handleCetakPDF = async () => {
    setIsCetakLoading(true);
    if (!riwayatApel || riwayatApel.length === 0) {
      alert("Tidak ada data riwayat apel untuk dicetak.");
      setIsCetakLoading(false);
      return;
    }

    try {
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      doc.text("Laporan Riwayat Apel", 14, 10);

      const head = [["No", "Tanggal", "Status", "Keterangan"]];
      const body = riwayatApel.map((item, index) => [
        index + 1,
        item.tanggal_apel,
        item.status_apel,
        item.keterangan || "-",
      ]);

      autoTable(doc, { startY: 20, head, body });

      const filename = `Riwayat_Apel_${printStartDate || "all"}_to_${printEndDate || "all"}.pdf`;
      doc.save(filename);
      setShowModal(false);
    } catch (error) {
      console.error("Error saat membuat PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF.");
    } finally {
      setIsCetakLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-white">
        Loading riwayat apel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container text-danger">
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 text-white w-100">
          <h2>Riwayat Apel</h2>

          <div className="d-flex align-items-end gap-4 mb-3">
            <div className="form-group">
              <label htmlFor="startDate">Tanggal Awal</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">Tanggal Akhir</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="invisible">Cari</label>
              <button className="btn btn-success d-block" onClick={handleCari}>
                <i className="bi bi-search"></i> Cari
              </button>
            </div>
          </div>


          <div className="mb-3">
            <button className="btn btn-success" onClick={() => setShowModal(true)}>
              <i className="bi bi-printer"></i> Cetak
            </button>
          </div>

          <div className="form-background p-4">
            <div className="table-responsive">
              <table className="table table-dark table-bordered">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayatApel.map((item, index) => (
                    <tr key={item.id_kehadiran}>
                      <td>{index + 1}</td>
                      <td>{item.tanggal_apel}</td>
                      <td>{item.status_apel}</td>
                      <td>{item.keterangan || "-"}</td>
                    </tr>
                  ))}
                  {riwayatApel.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">
                        Tidak ada data riwayat apel.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <>
              <div className="custom-modal-overlay"></div>
              <div className="modal d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content bg-dark text-white modal-fade-in">
                    <div className="modal-header">
                      <h5 className="modal-title">Cetak Riwayat Apel</h5>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="row mb-3">
                        <div className="col">
                          <label htmlFor="startDateModal">Tanggal Awal</label>
                          <input
                            type="date"
                            id="startDateModal"
                            className="form-control custom-date"
                            value={startDateModal}
                            onChange={(e) => setStartDateModal(e.target.value)}
                          />
                        </div>
                        <div className="col">
                          <label htmlFor="endDateModal">Tanggal Akhir</label>
                          <input
                            type="date"
                            id="endDateModal"
                            className="form-control custom-date"
                            value={endDateModal}
                            onChange={(e) => setEndDateModal(e.target.value)}
                          />
                        </div>
                      </div>
                      <button className="btn btn-success" onClick={handleCetakPDF} disabled={isCetakLoading}>
                        <i className="bi bi-printer"></i> Cetak PDF
                        {isCetakLoading && (
                          <span className="ms-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        )}
                      </button>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-danger" onClick={() => setShowModal(false)}>
                        <i className="bi bi-x-circle"></i> Tutup
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiwayatApel;
