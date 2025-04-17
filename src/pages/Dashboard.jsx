import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./dashboard.css";
import WhatsAppIcon from "../components/whatsapp";
import axios from "axios";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [cutiInfo, setCutiInfo] = useState(null);
  const [retirementMessage, setRetirementMessage] = useState("");
  const [pangkatMessage, setPangkatMessage] = useState("");
  const [gajiMessage, setGajiMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Token tidak ditemukan, mohon login kembali.");
        setLoading(false);
        return;
      }

      try {
        const profileResponse = await axios.get(
          "http://localhost:8000/api/pegawai/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(profileResponse.data);

        // Asumsi endpoint untuk informasi cuti (perlu disesuaikan dengan API Anda)
        const cutiResponse = await axios.get(
          "http://localhost:8000/api/cuti/sisa/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCutiInfo(cutiResponse.data);

        setLoading(false);
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        setError("Gagal mengambil data dashboard.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (profile) {
      // Informasi Pensiun
      if (profile.umur >= 60) {
        setRetirementMessage("Anda sudah mencapai atau melewati usia pensiun.");
      } else if (profile.umur) {
        const yearsLeft = 60 - profile.umur;
        setRetirementMessage(`Anda memiliki ${yearsLeft} tahun lagi sebelum pensiun.`);
      } else {
        setRetirementMessage("Informasi usia pensiun tidak tersedia.");
      }

      // Informasi Kenaikan Pangkat
      if (profile.waktu_kenaikan_pangkat) {
        setPangkatMessage(`Waktu kenaikan pangkat: ${profile.waktu_kenaikan_pangkat}`);
      } else {
        setPangkatMessage("Informasi kenaikan pangkat tidak tersedia.");
      }

      // Informasi Kenaikan Gaji
      if (profile.waktu_kenaikan_gaji) {
        setGajiMessage(`Waktu kenaikan gaji: ${profile.waktu_kenaikan_gaji}`);
      } else {
        setGajiMessage("Informasi kenaikan gaji tidak tersedia.");
      }
    }
  }, [profile]);

  if (loading) {
    return (
      <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
        Loading data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", color: "red", padding: "20px", textAlign: "center" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#1E1E2D", minHeight: "100vh" }}>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="px-3 text-white w-100">
          {profile && (
            <div className="mt-3 mb-4">
              <h2>Selamat datang, {profile.namaPegawai}!</h2>
            </div>
          )}
          {/* Card Grid */}
          <div className="row">
            {/* Card 1: Kenaikan Gaji */}
            <div className="col-md-6 mb-4">
              <div className="card dashboard-card">
                <div className="card-body">
                  <h5 className="card-title">Kenaikan Gaji</h5>
                  <div className="card sub-card bg-secondary text-white mt-3">
                    <div className="card-body py-2 px-3">{gajiMessage}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Kenaikan Pangkat */}
            <div className="col-md-6 mb-4">
              <div className="card dashboard-card">
                <div className="card-body">
                  <h5 className="card-title">Kenaikan Pangkat</h5>
                  <div className="card sub-card bg-danger text-white mt-3">
                    <div className="card-body py-2 px-3">{pangkatMessage}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Cuti */}
            <div className="col-md-6 mb-4">
              <div className="card dashboard-card">
                <div className="card-body">
                  <h5 className="card-title">Cuti</h5>
                  <div className="card sub-card bg-primary text-white mt-3">
                    <div className="card-body py-2 px-3">
                      {cutiInfo && typeof cutiInfo === 'object' && cutiInfo !== null ? (
                        <>
                          <p>Cuti yang sudah diambil: {cutiInfo.total_cuti_diambil ? cutiInfo.total_cuti_diambil : 0} hari. Cuti Anda Tersisa: {cutiInfo.sisa_cuti ? cutiInfo.sisa_cuti : 0} hari</p>
                        </>
                      ) : (
                        <p>Informasi cuti tidak tersedia.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Pensiun */}
            <div className="col-md-6 mb-4">
              <div className="card dashboard-card">
                <div className="card-body">
                  <h5 className="card-title">Pensiun</h5>
                  <div className="card sub-card bg-success text-white mt-3">
                    <div className="card-body py-2 px-3">{retirementMessage}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <WhatsAppIcon />
      </div>
    </div>
  );
};

export default Dashboard;