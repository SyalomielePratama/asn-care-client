import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./CutiPNS.css";

const CutiPNS = () => {
  const [form, setForm] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    masaKerja: "",
    jenisCuti: "",
    alasan: "",
    tanggalMulai: "",
    tanggalAkhir: "",
    alamat: "",
    noTelp: "",
    pimpinan: "",
  });

  const [isFormComplete, setIsFormComplete] = useState(false); // To track if the form is complete
  const [notification, setNotification] = useState(""); // To store the notification message

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all fields are filled
    const allFieldsFilled = Object.values(form).every((field) => field !== "");

    if (allFieldsFilled) {
      setIsFormComplete(true);
      setNotification("Pengajuan cuti berhasil!");
    } else {
      setIsFormComplete(false);
      setNotification("Isi semua data terlebih dahulu!");
    }
  };

  return (
    <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 text-white w-100">
          <h2 className="mb-4">Formulir Pengajuan Cuti PPPK</h2>

          {/* Notification - Displayed Above the Form */}
          {notification && (
            <div
              className={`alert mt-4 ${isFormComplete ? "alert-success" : "alert-danger"}`}
              role="alert"
            >
              <i
                className={`bi ${isFormComplete ? "bi-bell-fill" : "bi-x-circle-fill"} me-2`}
              ></i>
              {notification}
            </div>
          )}

          <form onSubmit={handleSubmit} className="cuti-form p-4 rounded shadow">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Nama</label>
                <input
                  type="text"
                  className="form-control"
                  name="nama"
                  placeholder="Nama Lengkap"
                  value={form.nama}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">NIP</label>
                <input
                  type="text"
                  className="form-control"
                  name="nip"
                  placeholder="Nomor Induk Pegawai"
                  value={form.nip}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Jabatan</label>
                <input
                  type="text"
                  className="form-control"
                  name="jabatan"
                  placeholder="Jabatan"
                  value={form.jabatan}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Masa Kerja</label>
                <input
                  type="text"
                  className="form-control"
                  name="masaKerja"
                  placeholder="Masa Kerja (contoh: 5 tahun)"
                  value={form.masaKerja}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Jenis Cuti</label>
                <select
                  className="form-select"
                  name="jenisCuti"
                  value={form.jenisCuti}
                  onChange={handleChange}
                >
                  <option value="">Pilih Jenis Cuti</option>
                  <option value="Cuti Tahunan">Cuti Tahunan</option>
                  <option value="Cuti Sakit">Cuti Sakit</option>
                  <option value="Cuti Melahirkan">Cuti Melahirkan</option>
                  <option value="Cuti Besar">Cuti Besar</option>
                  <option value="Cuti Alasan Penting">Cuti Alasan Penting</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Alasan Cuti</label>
                <textarea
                  className="form-control"
                  name="alasan"
                  placeholder="Alasan mengajukan cuti"
                  rows={4}
                  value={form.alasan}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Lamanya Cuti</label>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <input
                    type="date"
                    className="form-control"
                    name="tanggalMulai"
                    placeholder="Tanggal Mulai Cuti"
                    value={form.tanggalMulai}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-2">
                  <input
                    type="date"
                    className="form-control"
                    name="tanggalAkhir"
                    placeholder="Tanggal Akhir Cuti"
                    value={form.tanggalAkhir}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Alamat Selama Cuti</label>
                <input
                  type="text"
                  className="form-control"
                  name="alamat"
                  placeholder="Alamat lengkap"
                  value={form.alamat}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">No. Telp</label>
                <input
                  type="text"
                  className="form-control"
                  name="noTelp"
                  placeholder="Nomor yang bisa dihubungi"
                  value={form.noTelp}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Pimpinan 1</label>
                    <select
                    className="form-select"
                    name="pimpinan"
                    value={form.pimpinan}
                    onChange={handleChange}
                    >
                    <option value="">Pilih Pimpinan</option>
                    <option value="Kepala Dinas">Kepala Dinas</option>
                    <option value="Sekretaris">Sekretaris</option>
                    <option value="Kabid Kepegawaian">Kabid Kepegawaian</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Pimpinan 2</label>
                    <select
                    className="form-select"
                    name="pimpinan"
                    value={form.pimpinan}
                    onChange={handleChange}
                    >
                    <option value="">Pilih Pimpinan</option>
                    <option value="Kepala Dinas">Kepala Dinas</option>
                    <option value="Sekretaris">Sekretaris</option>
                    <option value="Kabid Kepegawaian">Kabid Kepegawaian</option>
                    </select>
                </div>
            </div>
            <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Pimpinan 3</label>
                    <select
                    className="form-select"
                    name="pimpinan"
                    value={form.pimpinan}
                    onChange={handleChange}
                    >
                    <option value="">Pilih Pimpinan</option>
                    <option value="Kepala Dinas">Kepala Dinas</option>
                    <option value="Sekretaris">Sekretaris</option>
                    <option value="Kabid Kepegawaian">Kabid Kepegawaian</option>
                    </select>
                </div>
            </div>


            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-success">
                Ajukan Cuti
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CutiPNS;
