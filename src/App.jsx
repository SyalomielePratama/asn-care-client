// import Login from "./pages/login";

// function App() {
//   return <Login />;
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Apel from "./pages/Apel"; // Import Apel
import RiwayatApel from "./pages/RiwayatApel";
import CutiPNS from "./pages/CutiPNS";
import CutiPPT from "./pages/CutiPPT";
import CutiPPPK from "./pages/CutiPPPK";
import CutiESIII from "./pages/CutiESIII";
import UbahPassword from "./pages/UbahPassword";
import UploadPDF from "./pages/UploadPDF";
import TandaTanganDokumen from "./pages/TandaTanganDokumen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/apel" element={<Apel />} /> 
        <Route path="/riwayat-apel" element={<RiwayatApel />} />
        <Route path="/cuti-pns" element={<CutiPNS />} />
        <Route path="/cuti-ppt" element={<CutiPPT />} />
        <Route path="/cuti-pppk" element={<CutiPPPK />} />
        <Route path="/cuti-esiii" element={<CutiESIII />} />
        <Route path="/ubah-password" element={<UbahPassword />} />
        <Route path="/upload-fie-pdf" element={<UploadPDF />} />
        <Route path="/tanda-tangan-dokumen" element={<TandaTanganDokumen />} />
      </Routes>
    </Router>
  );
}

export default App;

