import { Link } from "react-router-dom";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/Sidebar.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className={`sidebar-container ${isCollapsed ? "collapsed" : ""} rounded`}>
      {/* Jika sidebar ditutup, hanya tampil tombol buka */}
      {isCollapsed ? (
        <div className="sidebar-toggle-only mt-3">
          <button className="btn toggle-btn" onClick={() => setIsCollapsed(false)}>
            <i className="bi bi-list"></i>
          </button>
        </div>
      ) : (
        <>
          {/* Header Sidebar */}
          <div className="sidebar-header d-flex align-items-center justify-content-between">
            <Link to="/dashboard" className="nav-link text-white d-flex align-items-center">
              <i className="fs-3 bi bi-speedometer2 me-2"></i>
              <span className="fs-4 fw-semibold">Dashboard</span>
            </Link>
            <button className="btn toggle-btn" onClick={() => setIsCollapsed(true)}>
              <i className="bi bi-list"></i>
            </button>
          </div>

          {/* Menu Sidebar */}
          <ul className="nav flex-column mt-3">

            {/* Menu Kehadiran */}
            <li className="nav-item">
              <button className="btn btn-toggle text-white w-100 text-start" onClick={() => toggleMenu("kehadiran")}>
                <i className="bi bi-calendar-check me-2"></i>
                Kehadiran
              </button>
              <ul className={`nav flex-column ps-4 dropdown-menu-sidebar ${openMenu === "kehadiran" ? "open" : ""}`}>
                <li><Link to="/apel" className="nav-link text-white">Apel</Link></li>
                <li><Link to="/riwayat-apel" className="nav-link text-white">Riwayat Apel</Link></li>
              </ul>
            </li>

            {/* Menu Pengajuan Cuti */}
            <li className="nav-item">
              <button className="btn btn-toggle text-white w-100 text-start" onClick={() => toggleMenu("cuti")}>
                <i className="bi bi-journal-check me-2"></i>
                Pengajuan Cuti
              </button>
              <ul className={`nav flex-column ps-4 dropdown-menu-sidebar ${openMenu === "cuti" ? "open" : ""}`}>
                <li><Link to="/cuti-pns" className="nav-link text-white">Cuti PNS</Link></li>
                <li><Link to="/cuti-ppt" className="nav-link text-white">Cuti PPT</Link></li>
                <li><Link to="/cuti-pppk" className="nav-link text-white">Cuti PPPK</Link></li>
                <li><Link to="/cuti-esiii" className="nav-link text-white">Cuti ESIII</Link></li>
              </ul>
            </li>

            {/* Menu Dokumen */}
            <li className="nav-item">
              <button className="btn btn-toggle text-white w-100 text-start" onClick={() => toggleMenu("dokumen")}>
                <i className="bi bi-file-earmark-text me-2"></i>
                Dokumen
              </button>
              <ul className={`nav flex-column ps-4 dropdown-menu-sidebar ${openMenu === "dokumen" ? "open" : ""}`}>
                <li><Link to="/upload-fie-pdf" className="nav-link text-white">Tanda Tangan Dokumen</Link></li>
              </ul>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
