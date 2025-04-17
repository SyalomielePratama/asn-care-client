import axios from 'axios';
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./CutiPNS.css";
import QRCode from "qrcode";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  const [isPNS, setIsPNS] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [sisaCuti, setSisaCuti] = useState(12); // Default sisa cuti

  const fetchSisaCuti = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const response = await axios.get("http://localhost:8000/api/cuti/sisa/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSisaCuti(response.data.sisa_cuti);
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
        setLoadingProfile(false);
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
          jabatan: response.data.namaJabatan || "", // Ambil jabatan dari profil
        }));
        if (response.data.jenisPegawai === 'PNS') {
          setIsPNS(true);
        } else {
          setNotification("Anda bukan pegawai jenis PNS dan tidak boleh mengakses halaman ini.");
        }
      } catch (error) {
        console.error("Gagal mengambil data profil pegawai:", error);
        if (error.response && error.response.status === 401) {
          setNotification("Sesi Anda berakhir. Silakan login kembali.");
          // Redirect ke halaman login
        } else {
          setNotification("Gagal memuat informasi profil.");
        }
      } finally {
        setLoadingProfile(false);
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
    // fetchSisaCuti();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generatePDF = async (formData, daftarPimpinan, sisaCuti, logo1, logo2) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const logoSize = 15;
    const smallFontSize = 11;
    const defaultFontSize = 11;
    const labelX = 20;
    const colonX = 70;
    const valueX = 75;
    const lineHeight = 6;
    let y = 10;

    const toBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const addFormRow = (label, value) => {
        const wrappedText = doc.splitTextToSize(value || '-', pageWidth - valueX - margin);
        doc.setFontSize(smallFontSize);
        doc.text(label, labelX, y);
        doc.text(':', colonX, y);
        doc.text(wrappedText, valueX, y);
        y += wrappedText.length * lineHeight;
    };

    const today = new Date();
    const formattedDate = `${today.getDate()} ${new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(today)} ${today.getFullYear()}`;
    const cutiDuration = formData.tanggalMulai && formData.tanggalAkhir
        ? Math.ceil((new Date(formData.tanggalAkhir) - new Date(formData.tanggalMulai)) / (1000 * 60 * 60 * 24)) + 1
        : 0;
    const lamaCuti = cutiDuration
        ? `selama ${cutiDuration} hari, terhitung dari tanggal ${formData.tanggalMulai} - ${formData.tanggalAkhir}`
        : "-";
    const sisaSetelah = sisaCuti - cutiDuration;

    const logo1Img = await toBase64(logo1);
    const logo2Img = await toBase64(logo2);
    doc.addImage(logo1Img, 'PNG', margin, y, logoSize, logoSize);
    doc.addImage(logo2Img, 'PNG', pageWidth - margin - logoSize, y, logoSize, logoSize);

    const centerX = pageWidth / 2;
    y += 2;
    doc.setFontSize(defaultFontSize);
    doc.setFont(undefined, "bold");
    doc.text("PEMERINTAH KABUPATEN MALANG", centerX, y, { align: "center" });

    y += 6;
    doc.setFontSize(smallFontSize);
    doc.setFont(undefined, "normal");
    doc.text("DINAS KOMUNIKASI DAN INFORMATIKA", centerX, y, { align: "center" });
    y += 6;
    doc.text("Jalan K.H. Agus Salim No. 7 Gedung J lt. 3 Telp. (0341) 408788", centerX, y, { align: "center" });
    y += 5;
    doc.text("Website: www.malangkab.go.id", centerX, y, { align: "center" });
    y += 5;
    doc.text("MALANG 65119", centerX, y, { align: "center" });

    y += 8;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 2;
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(defaultFontSize);
    doc.text(`Malang, ${formattedDate}`, pageWidth - margin, y, { align: "right" });
    y += 8;
    doc.text("Kepada", labelX, y); y += 5;
    doc.text("Yth. Plt. Kepala Dinas Kominfo", labelX, y); y += 5;
    doc.text("Kabupaten Malang", labelX, y); y += 8;

    doc.setFont(undefined, "bold");
    doc.text("FORMULIR PERMINTAAN DAN PEMBERIAN CUTI", centerX, y, { align: "center" });
    doc.setFont(undefined, "normal");
    y += 8;

    // Data Pegawai
    addFormRow("Nama", formData.nama);
    addFormRow("Jabatan", formData.jabatan);
    addFormRow("NIP", formData.nip);
    addFormRow("Masa Kerja", `${formData.masaKerjaTahun} tahun ${formData.masaKerjaBulan} bulan`);
    addFormRow("Jenis Cuti Yang Diambil", formData.jenisCuti);
    addFormRow("Alasan Cuti", formData.alasan);
    addFormRow("Lamanya Cuti", lamaCuti);
    addFormRow("Sisa Cuti setelah Pengajuan", `${sisaSetelah} hari`);
    addFormRow("Alamat Selama Cuti", formData.alamat);
    addFormRow("Nomor Telp", formData.noTelp);

    y += 8;
    doc.setFontSize(defaultFontSize);
    doc.text("Hormat Saya,", labelX, y);
    y += 18;

    try {
        const qrData = JSON.stringify({
            nama: formData.nama,
            nip: formData.nip,
            jabatan: formData.jabatan,
            jenisCuti: formData.jenisCuti,
            tanggalMulai: formData.tanggalMulai,
            tanggalAkhir: formData.tanggalAkhir,
        });
        const qrImage = await QRCode.toDataURL(qrData);
        doc.addImage(qrImage, 'PNG', labelX, y - 15, 20, 20);
    } catch (err) {
        console.error("QR Error", err);
    }

    y += 3;
    doc.setFontSize(smallFontSize);
    doc.text(formData.nama, labelX, y + 6);
    doc.text(`NIP. ${formData.nip}`, labelX, y + 12);

    // ========== Menyetujui ==========
    y += 25;
    doc.setFontSize(defaultFontSize);
    doc.text("Menyetujui :", centerX, y, { align: "center" });
    y += 6;

    const posX = [labelX, labelX + 60, labelX + 120];
    const maxNamaWidth = 50;
    const tandaTanganHeight = 25;

    [formData.pimpinan_1, formData.pimpinan_2, formData.pimpinan_3].forEach((id, i) => {
        const pimp = daftarPimpinan.find(p => p.id_pegawai === parseInt(id));
        if (pimp) {
            const baseY = y;
            const jabatanLines = doc.splitTextToSize(pimp.namaJabatan, maxNamaWidth);
            doc.setFontSize(smallFontSize);
            doc.text(jabatanLines, posX[i], baseY);
            doc.text(pimp.namaPegawai, posX[i], baseY + jabatanLines.length * lineHeight + tandaTanganHeight);
            doc.text(`NIP. ${pimp.nipBaru}`, posX[i], baseY + jabatanLines.length * lineHeight + tandaTanganHeight + 6);
        }
    });

    y += 35;

    // ========== Mengesahkan ==========
    y+=15;
    doc.setFontSize(defaultFontSize);
    doc.text("Mengesahkan:", centerX, y, { align: "center" }); y += 6;
    doc.text("Plt. KEPALA DINAS KOMUNIKASI DAN", centerX, y, { align: "center" }); y += 4;
    doc.text("INFORMATIKA KABUPATEN MALANG", centerX, y, { align: "center" });
    y += 18;

    doc.setFontSize(smallFontSize);
    doc.text("Dr. WAHYU KURNIATI, S.S., M.Si", centerX, y, { align: "center" }); y += 5;
    doc.text("NIP. 196608031986032009", centerX, y, { align: "center" });

    // Simpan PDF
    const fileName = `Formulir_Cuti_${formData.nama.replace(/\s+/g, '_')}_${formattedDate.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
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

    if (isRequiredFieldsFilled && isPNS) {
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
          setNotification("Pengajuan cuti berhasil! File PDF formulir cuti akan diunduh.");
          // generatePDF(formData, daftarPimpinan, sisaCuti, logoFile1, logoFile2);

          // Load logo images
          const logo1Blob = await fetch("/images/komdigi.png").then(res => res.blob());
          const logo2Blob = await fetch("/images/pemkab.png").then(res => res.blob());

          await generatePDF(form, daftarPimpinan, sisaCuti, logo1Blob, logo2Blob)

          setForm({ ...form, alasan: "", tanggalMulai: "", tanggalAkhir: "", alamat: "", noTelp: "", pimpinan_1: null, pimpinan_2: null, pimpinan_3: null });
          // fetchSisaCuti();
        } else {
          setIsFormComplete(false);
          setNotification(`Pengajuan cuti gagal: ${response.data.detail || "Terjadi kesalahan"}`);
          console.error("Gagal mengajukan cuti:", response.data);
        }
      } catch (error) {
        setIsFormComplete(false);
        console.error("Terjadi kesalahan:", error);
        if (error.response && error.response.status === 400 && error.response.data) {
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
    } else if (!isPNS) {
      setNotification("Anda bukan pegawai jenis PNS dan tidak dapat mengajukan cuti di halaman ini.");
    } else {
      setIsFormComplete(false);
      setNotification("Isi semua data yang diperlukan terlebih dahulu!");
    }

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

  if (loadingProfile) {
    return (
      <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
        Memuat informasi profil...
      </div>
    );
  }

  if (!isPNS) {
    return (
      <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh" }}>
        <Navbar />
        <div className="d-flex">
          <Sidebar />
          <div className="p-4 text-white w-100">
            <h2 className="mb-4">Formulir Pengajuan Cuti PNS</h2>
            {notification && (
              <div className={`alert mt-4 alert-danger`} role="alert">
                <i className={`bi bi-x-circle-fill me-2`}></i>
                {notification}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 text-white w-100">
          <h2 className="mb-4">Formulir Pengajuan Cuti PNS</h2>{notification && (
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                    disabled={!isPNS}
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
                    disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
                  disabled={!isPNS}
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
              <button type="submit" className="btn btn-success" disabled={!isPNS}>
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