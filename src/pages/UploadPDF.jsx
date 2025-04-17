import React, { useState, useRef, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "bootstrap-icons/font/bootstrap-icons.css";
import QRCode from "qrcode";

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

    const [pdfFile, setPdfFile] = useState(null);
    const [qrImageUrl, setQrImageUrl] = useState(null);
    const [showQr, setShowQr] = useState(false);
    const previewContainerRef = useRef(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, show: false });
    };

    const loadPdfPreviewImages = useCallback(async (file) => {
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            const pdfData = e.target.result;
            const pdfBlob = new Blob([pdfData], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPreviewImages([pdfUrl]); // Assuming only one page for preview
            setCurrentPage(0);
        };
        fileReader.readAsArrayBuffer(file);
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            loadPdfPreviewImages(file);
            setShowQr(false);
            setQrImageUrl(null);
        } else {
            setNotification({ message: "Harap upload file PDF yang valid!", type: "error", show: true });
            setPdfFile(null);
            setPreviewImages([]);
            setCurrentPage(0);
        }
    };

    const handleQRGenerate = async () => {
        if (form.noSurat && form.tanggalSurat && form.penandatangan && form.perihal) {
            const qrText = `No Surat: ${form.noSurat}\nTanggal: ${form.tanggalSurat}\nPenandatangan: ${form.penandatangan}\nPerihal: ${form.perihal}`.trim();
            const qrDataUrl = await QRCode.toDataURL(qrText);
            setQrImageUrl(qrDataUrl);
            setShowQr(true);
            setNotification({ message: "QR Code berhasil dibuat!", type: "success", show: true });
        } else {
            setNotification({ message: "Harap lengkapi semua data sebelum membuat QR Code!", type: "error", show: true });
        }
    };

    const handleDownload = () => {
        if (!qrImageUrl) {
            setNotification({ message: "QR Code belum dibuat!", type: "error", show: true });
            return;
        }

        const link = document.createElement("a");
        link.href = qrImageUrl;
        link.download = "qr_code.png"; // Set the name for the downloaded QR code image
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setNotification({ message: "QR Code berhasil diunduh!", type: "success", show: true });
    };

    return (
        <div style={{ backgroundColor: "#27293D", minHeight: "100vh" }}>
            <Navbar />
            <div className="d-flex">
                <Sidebar />
                <div className="p-4 w-100 text-white">
                    <h2 className="mb-4">Tanda Tangan Dokumen</h2>

                    {notification.show && (
                        <div
                            className={`alert alert-${notification.type === "success" ? "success" : "danger"} d-flex align-items-center mb-4`}
                            role="alert"
                        >
                            <i className={`bi bi-${notification.type === "success" ? "check-circle" : "exclamation-circle"} me-2`}></i>
                            <span>{notification.message}</span>
                            <button type="button " className="btn-close ms-auto" onClick={handleCloseNotification}></button>
                        </div>
                    )}

                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="mb-3">
                                <label className="form-label">Upload Dokumen PDF</label>
                                <input type="file" accept="application/pdf" className="form-control" onChange={handleFileUpload} />
                            </div>
                            <div ref={previewContainerRef}>
                                {previewImages.length > 0 ? (
                                    <iframe
                                        src={previewImages[currentPage]}
                                        title="PDF Preview"
                                        style={{ width: "100%", height: "500px" }}
                                    />
                                ) : (
                                    <div className="d-flex h-100 justify-content-center align-items-center text-muted">
                                        Tidak ada file yang diupload.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="p-4 rounded shadow" style={{ backgroundColor: "#1E1E2D", border: "1px solid #2A324D" }}>
                                <h4 className="mb-4">Form Buat QR Code</h4>
                                <div className="mb-3">
                                    <label className="form-label">No. Surat</label>
                                    <input type="text" className="form-control" name="noSurat" value={form.noSurat} onChange={handleChange} placeholder="Masukkan No. Surat" />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Tanggal Surat</label>
                                    <input type="date" className="form-control" name="tanggalSurat" value={form.tanggalSurat} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Penandatanganan</label>
                                    <input type="text" className="form-control" name="penandatangan" value={form.penandatangan} onChange={handleChange} placeholder="Nama Penandatangan" />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label">Perihal</label>
                                    <input type="text" className="form-control" name="perihal" value={form.perihal} onChange={handleChange} placeholder="Perihal Surat" />
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
                                        <i className="bi bi-download me-2"></i>Download QR Code
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