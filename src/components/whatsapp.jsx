import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./whatsapp.css"; // CSS khusus untuk komponen ini

const WhatsAppIcon = () => {
    return (
      <a
        href="https://wa.me/62881027207468"
        target="_blank"
        className="whatsapp-icon"
        rel="noopener noreferrer"
      >
        <i className="bi bi-whatsapp"></i>
      </a>
    );
  };

export default WhatsAppIcon;
