import React, { useState, useEffect } from "react";
import { createEvent, getStudents, addStudentToEvent, uploadDocument } from "../services/api";

const EVENT_TYPES = [
  "Seminar",
  "Workshop",
  "NSS/NCC Activity",
  "Technical Competition",
  "Hackathon",
  "Industrial Visit",
  "Sports Event",
  "Guest Lecture",
  "Cultural Fest",
];

export default function CreateEventModal({ onClose, onEventCreated }) {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState(EVENT_TYPES[0]);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [deanApprovalRequired, setDeanApprovalRequired] = useState(false);

  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [searchStudent, setSearchStudent] = useState("");

  const [pdfFile, setPdfFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudents()
      .then((res) => setAllStudents(res.data || []))
      .catch(() => setAllStudents([]));
  }, []);

  const toggleStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const filtered = allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchStudent.toLowerCase())
    );
    const ids = filtered.map((s) => s.id);
    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const deselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventName.trim() || !venue.trim()) {
      setError("Event Name and Venue are required");
      return;
    }

    if (pdfFile && !pdfFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Uploaded letter must be in PDF format");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1. Create the Event
      const res = await createEvent({
        eventName: eventName.trim(),
        eventType,
        eventDate,
        venue: venue.trim(),
        description: description.trim(),
        deanApprovalRequired,
      });

      const newEvent = res.data;

      // 2. Add participating students
      for (const sId of selectedStudentIds) {
        await addStudentToEvent({
          eventId: newEvent.id,
          studentId: sId,
          participationStatus: "PARTICIPATED",
        }).catch(() => {});
      }

      // 3. Upload PDF letter if attached
      if (pdfFile && newEvent.id) {
        await uploadDocument(newEvent.id, pdfFile).catch((docErr) => {
          console.warn("Could not upload PDF immediately:", docErr);
        });
      }

      onEventCreated();
      onClose();
    } catch (err) {
      const msg = typeof err.response?.data === "string" ? err.response?.data : err.response?.data?.message || err.message;
      setError(msg || "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(searchStudent.toLowerCase()))
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 740 }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                Create New College Event Record
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                Class Incharge portal for official event submission
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#64748b" }}
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., National Seminar on Advanced AI Architectures"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Category / Type</label>
                <select className="form-control" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Venue / Location *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Seminar Hall 3 / Innovation Center / External City"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Description & Objectives</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Briefly state purpose, organizing body, and participation scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: "span 2", padding: "12px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600, color: "#1e293b", fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={deanApprovalRequired}
                    onChange={(e) => setDeanApprovalRequired(e.target.checked)}
                    style={{ width: 18, height: 18 }}
                  />
                  Require Dean Academics Approval for Attendance Consideration?
                </label>
                <small style={{ color: "#64748b", display: "block", marginTop: 4 }}>
                  {deanApprovalRequired
                    ? "✓ Full hierarchy: Incharge → HOD → Dean → VERIFIED"
                    : "✓ Standard hierarchy: Incharge → HOD → VERIFIED"}
                </small>
              </div>

              {/* Official Letter Upload */}
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <label className="form-label">Official Event Letter (PDF only)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="form-control"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
                <small style={{ color: "#64748b", marginTop: 4, display: "block" }}>
                  Attach signed invitation, sanction order, or registration proof (PDF, max 10MB).
                </small>
              </div>

              {/* Participating Students Selection */}
              <div className="form-group" style={{ gridColumn: "span 2" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Select Participating Students ({selectedStudentIds.length} selected)
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={selectAllFiltered}>
                      Select All Filtered
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={deselectAll}>
                      Clear
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  className="form-control"
                  style={{ marginBottom: 10 }}
                  placeholder="Filter students by name, roll number, or department..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />

                <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8, background: "#fff" }}>
                  {filteredStudents.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", padding: 16 }}>No students found matching search.</div>
                  ) : (
                    filteredStudents.map((s) => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleStudent(s.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "6px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                            background: isSelected ? "#eef2ff" : "transparent",
                            marginBottom: 4,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ cursor: "pointer" }}
                          />
                          <span style={{ fontWeight: 600, fontSize: 13, color: isSelected ? "#4f46e5" : "#0f172a" }}>
                            {s.studentId}
                          </span>
                          <span style={{ fontSize: 13, color: "#334155" }}>{s.name}</span>
                          <span style={{ fontSize: 12, color: "#64748b", marginLeft: "auto" }}>
                            {s.department} | Sec {s.section}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting Event..." : "Create & Submit Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
