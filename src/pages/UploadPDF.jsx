import React, { useState, useRef } from "react";
import { Designer } from "@pdfme/ui";
import { generate } from "@pdfme/generator";
import QRCode from "qrcode";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { text, image } from '@pdfme/schemas';

const TandaTanganDokumen = () => {
    const designerRef = useRef(null);
    const [qrImageUrl, setQrImageUrl] = useState("");
    const [form, setForm] = useState({
        noSurat: "",
        tanggalSurat: "",
        penandatangan: "",
        perihal: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const generateQR = async () => {
        const { noSurat, tanggalSurat, penandatangan, perihal } = form;
        if (!tanggalSurat || !penandatangan || !perihal)
            return alert("Lengkapi semua data!");

        const qrText = `No Surat: ${noSurat}\nTanggal: ${tanggalSurat}\nPenandatangan: ${penandatangan}\nPerihal: ${perihal}`;
        const qrDataUrl = await QRCode.toDataURL(qrText);
        setQrImageUrl(qrDataUrl);
    };

    const downloadQR = () => {
        if (!qrImageUrl) return alert("QR belum dibuat!");

        const link = document.createElement("a");
        link.href = qrImageUrl;
        link.download = "qr_code.png";
        link.click();
    };

    const createDesigner = async () => {
        const fileInput = document.getElementById("pdfInput");
        const file = fileInput.files[0];
    
        if (!file || file.type !== "application/pdf") {
            alert("Upload file PDF yang valid!");
            return;
        }
    
        const reader = new FileReader();
        reader.onload = async function (e) {
            const basePdfArrayBuffer = e.target.result;
    
            const template = {
                basePdf: basePdfArrayBuffer,
                schemas: [{}], // Kosongin biar user desain sendiri
            };
    
            const designer = new Designer({
                domContainer: designerRef.current,
                template,
                plugins: {
                    text,
                    image,
                },
            });
    
            designerRef.current.__designer__ = designer;
        };
    
        reader.readAsArrayBuffer(file);
    };
    

    const downloadFinalPdf = async () => {
        const designerInstance = designerRef.current?.__designer__;
        if (!designerInstance) return alert("Designer belum siap");
    
        const updatedTemplate = designerInstance.getTemplate();
    
        // Cari field yang tipe-nya image (QR Code)
        const imageField = updatedTemplate.schemas.flat().find(schema => schema.type === "image");
        if (!imageField) return alert("Tidak ada field gambar pada template");
    
        const input = {
            [imageField.name]: qrImageUrl, // Mengisi dengan URL gambar QR
        };
    
        const pdf = await generate({
            template: updatedTemplate,
            inputs: [input], // Menyertakan input QR
            plugins: {
                text,
                image,
            },
        });
    
        const blob = new Blob([pdf.buffer], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "dokumen_ttd_qr.pdf";
        link.click();
    };
         

    return (
        <div style={{ backgroundColor: "#27293D", minHeight: "100vh" }}>
            <Navbar />
            <div className="d-flex">
                <Sidebar />
                <div className="p-4 w-100 text-white">
                    <h2 className="mb-4">Tanda Tangan Dokumen (Manual Upload QR ke PDF)</h2>

                    <div className="mb-3">
                        <label>Upload PDF</label>
                        <input type="file" id="pdfInput" accept="application/pdf" className="form-control" />
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <input
                                type="text"
                                className="form-control mb-2"
                                name="noSurat"
                                value={form.noSurat}
                                onChange={handleChange}
                                placeholder="No. Surat (Optional Bila Ada)"
                            />
                            <input
                                type="date"
                                className="form-control mb-2"
                                name="tanggalSurat"
                                value={form.tanggalSurat}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                className="form-control mb-2"
                                name="penandatangan"
                                value={form.penandatangan}
                                onChange={handleChange}
                                placeholder="Penandatangan"
                            />
                            <input
                                type="text"
                                className="form-control mb-2"
                                name="perihal"
                                value={form.perihal}
                                onChange={handleChange}
                                placeholder="Perihal"
                            />

                            <button onClick={generateQR} className="btn btn-warning me-2">Buat QR</button>
                            <button onClick={downloadQR} className="btn btn-secondary me-2">Download QR</button>
                            <button onClick={createDesigner} className="btn btn-info">Edit PDF (Manual Upload QR)</button>
                        </div>
                        <div className="col-md-6">
                            {qrImageUrl && (
                                <div>
                                    <img src={qrImageUrl} alt="QR Code" style={{ width: "150px", background: "#fff", padding: "10px" }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <p className="text-white mt-3">
                        <strong>Petunjuk:</strong> Setelah membuka editor PDF, klik tombol <strong>"Gambar"</strong> di samping kiri editor lalu klik 2 kali untuk mengganti gambar QR yang telah anda unduh. upload file QR Code yang sudah di-download. Scroll ke halaman yang ingin anda tanda tangani. Setelah itu, drag QR ke posisi yang diinginkan pada dokumen. setelah pas anda bisa klik download pdf di bawah
                    </p>

                    <div ref={designerRef} style={{ height: "600px", background: "#fff", borderRadius: "8px" }} />

                    <button onClick={downloadFinalPdf} className="btn btn-success mt-3">
                        Download PDF Final
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TandaTanganDokumen;
