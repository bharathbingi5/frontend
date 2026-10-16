import React, { useState, useEffect } from "react";
import { getStudentsByEvent, getStudents, getEventAttendance, bulkMarkAttendance } from "../services/api";

export default function MarkAttendanceModal({ event, currentUser, onClose, onAttendanceRecorded }) {
  const [participants, setParticipants] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [existingAttendance, setExistingAttendance] = useState({});
  const [statusSelection, setStatusSelection] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!event?.id) return;
    setLoading(true);

    Promise.all([
      getStudentsByEvent(event.id),
      getStudents(),
      getEventAttendance(event.id),
    ])
      .then(([esRes, sRes, attRes]) => {
        const studentLookup = {};
        (sRes.data || []).forEach((s) => {
          studentLookup[s.id] = s;
        });
        setStudentsMap(studentLookup);

        const eventStudents = esRes.data || [];
        setParticipants(eventStudents);

        const attMap = {};
        const selMap = {};
        (attRes.data || []).forEach((a) => {
          attMap[a.studentId] = a;
          selMap[a.studentId] = a.attendanceStatus || "PRESENT";
        });
        setExistingAttendance(attMap);

        // Default unset participants to PRESENT
        eventStudents.forEach((es) => {
          if (!selMap[es.studentId]) {
            selMap[es.studentId] = "PRESENT";
          }
        });
        setStatusSelection(selMap);
      })
      .catch((err) => {
        setError("Error loading participants: " + (err.message || "Failed"));
      })
      .finally(() => setLoading(false));
  }, [event?.id]);

  const handleStatusChange = (studentId, status) => {
    setStatusSelection((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    participants.forEach((p) => {
      updated[p.studentId] = status;
    });
    setStatusSelection(updated);
  };

  const handleSave = async () => {
    if ((event.approvalStatus || "").toUpperCase() !== "VERIFIED") {
      setError("Cannot mark attendance: Event is not yet VERIFIED.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const recordsToSave = [];
      const markedBy = currentUser?.username || "FACULTY";

      participants.forEach((p) => {
        const sId = p.studentId;
        // If already marked, skip duplicate
        if (!existingAttendance[sId]) {
          recordsToSave.push({
            eventId: event.id,
            studentId: sId,
            attendanceStatus: statusSelection[sId] || "PRESENT",
            markedBy: markedBy,
          });
        }
      });

      if (recordsToSave.length === 0) {
        setSuccess("All eligible students for this event already have attendance recorded.");
        setSaving(false);
        return;
      }

      await bulkMarkAttendance(recordsToSave);
      setSuccess(`Successfully recorded attendance for ${recordsToSave.length} students.`);
      if (onAttendanceRecorded) onAttendanceRecorded();

      // Refresh existing
      const updatedAtt = await getEventAttendance(event.id);
      const attMap = {};
      (updatedAtt.data || []).forEach((a) => {
        attMap[a.studentId] = a;
      });
      setExistingAttendance(attMap);
    } catch (err) {
      const msg = typeof err.response?.data === "string" ? err.response?.data : err.response?.data?.message || err.message;
      setError(msg || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              Faculty Attendance Portal
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              Event: {event.eventName} ({event.eventId}) &bull; Date: {event.eventDate}
            </p>
          </div>
          <button
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
          {success && (
            <div style={{ padding: 12, background: "#ecfdf5", color: "#047857", borderRadius: 8, marginBottom: 16, fontSize: 13, border: "1px solid #a7f3d0" }}>
              {success}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
            <div>
              <span style={{ fontSize: 13, color: "#64748b" }}>Eligible Students: </span>
              <strong>{participants.length}</strong>
              <span style={{ fontSize: 13, color: "#64748b", marginLeft: 16 }}>Recorded: </span>
              <strong>{Object.keys(existingAttendance).length}</strong>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => markAll("PRESENT")}>
                Mark All Present
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => markAll("ABSENT")}>
                Mark All Absent
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>Loading eligible participant records...</p>
          ) : participants.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 8 }}>
              No students were attached to this event.
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: 320, overflowY: "auto" }}>
              <table className="campx-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Dept & Sec</th>
                    <th>Current Status</th>
                    <th>Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => {
                    const student = studentsMap[p.studentId] || { studentId: "ID#" + p.studentId, name: "Student " + p.studentId, department: "-", section: "-" };
                    const existing = existingAttendance[p.studentId];
                    const selected = statusSelection[p.studentId] || "PRESENT";

                    return (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{student.studentId}</td>
                        <td>{student.name}</td>
                        <td style={{ color: "#64748b" }}>{student.department} / {student.section}</td>
                        <td>
                          {existing ? (
                            <span className={`badge ${existing.attendanceStatus === "PRESENT" ? "badge-verified" : "badge-rejected"}`}>
                              {existing.attendanceStatus}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>Not marked</span>
                          )}
                        </td>
                        <td>
                          {existing ? (
                            <small style={{ color: "#64748b" }}>
                              By: {existing.markedBy}
                            </small>
                          ) : (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                className={`btn btn-sm ${selected === "PRESENT" ? "btn-success" : "btn-secondary"}`}
                                onClick={() => handleStatusChange(p.studentId, "PRESENT")}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm ${selected === "ABSENT" ? "btn-danger" : "btn-secondary"}`}
                                onClick={() => handleStatusChange(p.studentId, "ABSENT")}
                              >
                                Absent
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 12, color: "#64748b" }}>
            Faculty Identity: <strong>{currentUser?.fullName || currentUser?.username || "FACULTY"}</strong> (Logged in user will be audited in database).
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || loading || participants.length === 0}
          >
            {saving ? "Saving Records..." : "Save Verified Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}
