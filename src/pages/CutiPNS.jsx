import axios from 'axios';
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./CutiPNS.css";

const CutiPNS = () => {
  const [form, setForm] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    masaKerjaTahun: "",
    masaKerjaBulan: "",
    jenisCuti: "",
    alasan: "",
    tanggalMulai: "",
    tanggalAkhir: "",
    alamat: "",
    noTelp: "",
    pimpinan_1: null,
    pimpinan_2: null,
    pimpinan_3: null,
  });

  const [isFormComplete, setIsFormComplete] = useState(false);
  const [notification, setNotification] = useState("");
  const [pegawaiData, setPegawaiData] = useState(null);
  const [daftarPimpinan, setDaftarPimpinan] = useState([]);

  const fetchSisaCuti = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const response = await axios.get("http://localhost:8000/api/cuti/sisa/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotification(`Jatah cuti tahunan Anda hanya 12 hari. Anda telah menggunakan ${response.data.total_cuti_diambil} hari.`);
    } catch (error) {
      console.error("Gagal mengambil informasi sisa cuti:", error);
      if (error.response && error.response.status === 401) {
        setNotification("Sesi Anda berakhir. Silakan login kembali.");
        // Redirect ke halaman login
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Token tidak ditemukan. Pengguna belum login?");
        return;
      }
      try {
        const response = await axios.get("http://localhost:8000/api/pegawai/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPegawaiData(response.data);
        setForm((prevForm) => ({
          ...prevForm,
          nama: response.data.namaPegawai || "",
          nip: response.data.nipBaru || "",
          // jabatan tidak diisi dari API lagi
        }));
      } catch (error) {
        console.error("Gagal mengambil data profil pegawai:", error);
        if (error.response && error.response.status === 401) {
          setNotification("Sesi Anda berakhir. Silakan login kembali.");
          // Redirect ke halaman login
        }
      }
    };

    const fetchDaftarPimpinan = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Token tidak ditemukan. Pengguna belum login?");
        return;
      }
      try {
        const response = await axios.get("http://localhost:8000/api/pegawai/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDaftarPimpinan([...response.data]);
      } catch (error) {
        console.error("Gagal mengambil daftar pegawai:", error);
      }
    };

    fetchProfile();
    fetchDaftarPimpinan();
    // fetchSisaCuti(); // Tidak dipanggil di sini agar notifikasi sisa cuti hanya muncul saat error
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(""); // Reset notifikasi setiap kali submit

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setNotification("Anda perlu login terlebih dahulu.");
      return;
    }

    const { nama, nip, jabatan, masaKerjaTahun, masaKerjaBulan, jenisCuti, alasan, tanggalMulai, tanggalAkhir, alamat, noTelp, pimpinan_1, pimpinan_2, pimpinan_3 } = form;
    const isRequiredFieldsFilled = nama && nip && jabatan && jenisCuti && alasan && tanggalMulai && tanggalAkhir && alamat && noTelp && pimpinan_1;

    if (isRequiredFieldsFilled) {
      try {
        const response = await axios.post("http://localhost:8000/api/cuti/pns/", {
          nama_pegawai: nama,
          nip_baru: nip,
          nama_jabatan: jabatan,
          masa_jabatan_tahun: parseInt(masaKerjaTahun) || 0,
          masa_jabatan_bulan: parseInt(masaKerjaBulan) || 0,
          jenis_cuti: jenisCuti,
          alasan_cuti: alasan,
          tanggal_mulai: tanggalMulai,
          tanggal_selesai: tanggalAkhir,
          alamat_cuti: alamat,
          telepon: noTelp,
          pimpinan_1: pimpinan_1,
          pimpinan_2: pimpinan_2 || null,
          pimpinan_3: pimpinan_3 || null,
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 201) {
          setIsFormComplete(true);
          setNotification("Pengajuan cuti berhasil!");
          setForm({ ...form, alasan: "", tanggalMulai: "", tanggalAkhir: "", alamat: "", noTelp: "", pimpinan_1: null, pimpinan_2: null, pimpinan_3: null });
          // Tidak perlu fetchSisaCuti di sini jika notifikasi hanya saat error
        } else {
          setIsFormComplete(false);
          setNotification(`Pengajuan cuti gagal: ${response.data.detail || "Terjadi kesalahan"}`);
          console.error("Gagal mengajukan cuti:", response.data);
        }
      } catch (error) {
        setIsFormComplete(false);
        console.error("Terjadi kesalahan:", error);
        if (error.response && error.response.status === 400 && error.response.data) {
          // Periksa apakah pesan error dari server mengandung informasi jatah cuti
          if (error.response.data.error && error.response.data.error.includes("Jatah cuti")) {
            setNotification(`Pengajuan cuti gagal: ${error.response.data.error}`);
          } else if (error.response.data.detail) {
            setNotification(`Pengajuan cuti gagal: ${error.response.data.detail}`);
          }
          else if (error.response.data.error) {
            setNotification(`Pengajuan cuti gagal: ${error.response.data.error}`);
          }
          else {
            setNotification("Terjadi kesalahan validasi.");
          }
        } else {
          setNotification("Terjadi kesalahan jaringan atau server.");
        }
      }
    } else {
      setIsFormComplete(false);
      setNotification("Isi semua data yang diperlukan terlebih dahulu!");
    }

    // Tampilkan notifikasi khusus untuk cuti melahirkan setelah mencoba submit
    if (form.jenisCuti === 'melahirkan' && form.tanggalMulai && form.tanggalAkhir) {
      const mulai = new Date(form.tanggalMulai);
      const selesai = new Date(form.tanggalAkhir);
      const diffTime = Math.abs(selesai - mulai);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = diffDays / 30; // Perkiraan bulan

      if (diffMonths > 3) {
        setNotification("Cuti melahirkan tidak boleh lebih dari 3 bulan.");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 text-white w-100">
          <h2 className="mb-4">Formulir Pengajuan Cuti PNS</h2>

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
                  placeholder={pegawaiData?.namaPegawai || "Nama Lengkap"}
                  value={form.nama}
                  onChange={handleChange}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">NIP</label>
                <input
                  type="text"
                  className="form-control"
                  name="nip"
                  placeholder={pegawaiData?.nipBaru || "Nomor Induk Pegawai"}
                  value={form.nip}
                  onChange={handleChange}
                  disabled
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
              <div className="col-md-3">
                <label className="form-label">Masa Kerja Tahun</label>
                <input
                  type="number"
                  className="form-control"
                  name="masaKerjaTahun"
                  placeholder="Tahun"
                  value={form.masaKerjaTahun || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Masa Kerja Bulan</label>
                <input
                  type="number"
                  className="form-control"
                  name="masaKerjaBulan"
                  placeholder="Bulan"
                  value={form.masaKerjaBulan || ""}
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
                  <option value="tahunan">Cuti Tahunan</option>
                  <option value="sakit">Cuti Sakit</option>
                  <option value="melahirkan">Cuti Melahirkan</option>
                  <option value="besar">Cuti Besar</option>
                  <option value="penting">Cuti Alasan Penting</option>
                  <option value="diluar">Cuti Diluar Tanggungan Negara</option>
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
                <label className="form-label">Pimpinan 1 <span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  name="pimpinan_1"
                  value={form.pimpinan_1 || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Pimpinan 1</option>
                  {daftarPimpinan.map((pimpinan) => (
                    <option key={pimpinan.id_pegawai} value={pimpinan.id_pegawai}>
                      {pimpinan.namaPegawai}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Pimpinan 2</label>
                <select
                  className="form-select"
                  name="pimpinan_2"
                  value={form.pimpinan_2 || ""}
                  onChange={handleChange}
                >
                  <option value="">Pilih Pimpinan 2</option>
                  {daftarPimpinan.map((pimpinan) => (
                    <option key={pimpinan.id_pegawai} value={pimpinan.id_pegawai}>
                      {pimpinan.namaPegawai}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mt-3">
                <label className="form-label">Pimpinan 3</label>
                <select
                  className="form-select"
                  name="pimpinan_3"
                  value={form.pimpinan_3 || ""}
                  onChange={handleChange}
                >
                  <option value="">Pilih Pimpinan 3</option>
                  {daftarPimpinan.map((pimpinan) => (
                    <option key={pimpinan.id_pegawai} value={pimpinan.id_pegawai}>
                      {pimpinan.namaPegawai}
                    </option>
                  ))}
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