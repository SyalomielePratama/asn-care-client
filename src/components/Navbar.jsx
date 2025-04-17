import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // Hapus token dari localStorage
    navigate("/"); // Arahkan kembali ke halaman login
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <Link to="/dashboard" className="navbar-brand fs-4 fw-bold">
        ASN CARE
      </Link>

      {/* Dropdown User */}
      <div className="dropdown">
        <button
          className="fs-4 btn btn-dark dropdown-toggle d-flex align-items-center bi-person-circle"
          onClick={() => setIsOpen(!isOpen)}
          alt="User"
          width="35"
          height="35"
        >
        </button>

        {isOpen && (
          <ul className="dropdown-menu dropdown-menu-end show">
            <li>
              <Link className="dropdown-item" to="/ubah-password">
                <i className="bi bi-gear"></i> Settings
              </Link>
            </li>
            <li>
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Log Out
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;