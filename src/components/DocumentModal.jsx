import React, { useState, useEffect } from "react";
import { getDocumentsByEvent, uploadDocument, getDocumentViewUrl, getDocumentDownloadUrl } from "../services/api";

export default function DocumentModal({ event, onClose, canUpload = false, onDocumentUploaded }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDocs = () => {
    if (!event?.id) return;
    setLoading(true);
    getDocumentsByEvent(event.id)
      .then((res) => setDocuments(res.data || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, [event?.id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF file");
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await uploadDocument(event.id, selectedFile);
      setSuccess("Document uploaded successfully!");
      setSelectedFile(null);
      loadDocs();
      if (onDocumentUploaded) onDocumentUploaded();
    } catch (err) {
      setError(err.response?.data || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 850 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              Official Event Letter & Documents
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              Event: {event.eventName} ({event.eventId})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ padding: 12, background: "#fef2f2", color: "#b91c1c", borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #fecaca" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: 12, background: "#ecfdf5", color: "#047857", borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #a7f3d0" }}>
              {success}
            </div>
          )}

          {canUpload && (
            <form onSubmit={handleUpload} style={{ padding: 16, background: "#f8fafc", borderRadius: 10, border: "1px dashed #cbd5e1", marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: "#1e293b" }}>Upload Official Event Permission Letter (PDF only)</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ fontSize: 13 }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={uploading || !selectedFile}>
                  {uploading ? "Uploading..." : "Upload PDF Letter"}
                </button>
              </div>
              <small style={{ color: "#64748b", display: "block", marginTop: 6 }}>Max file size: 10MB. Must be official signed letter in PDF format.</small>
            </form>
          )}

          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#1e293b" }}>Uploaded Documents ({documents.length})</h4>

          {loading ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>Loading documents...</p>
          ) : documents.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", background: "#f8fafc", borderRadius: 8, color: "#64748b" }}>
              No official documents uploaded yet for this event.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {documents.map((doc) => (
                <div key={doc.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", background: "#f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>📄</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{doc.fileName}</div>
                        <small style={{ color: "#64748b" }}>Format: {doc.fileType}</small>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a
                        href={getDocumentDownloadUrl(doc.id)}
                        className="btn btn-secondary btn-sm"
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        Download
                      </a>
                      <a
                        href={getDocumentViewUrl(doc.id)}
                        className="btn btn-primary btn-sm"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in New Tab
                      </a>
                    </div>
                  </div>
                  {/* Embedded PDF iframe viewer */}
                  <div style={{ height: 380, width: "100%", background: "#334155" }}>
                    <iframe
                      src={getDocumentViewUrl(doc.id)}
                      title={doc.fileName}
                      width="100%"
                      height="100%"
                      style={{ border: "none" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
