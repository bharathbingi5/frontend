import React, { useState, useEffect } from "react";
import { getEvents, getAllAttendance, getStudents } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import MarkAttendanceModal from "../components/MarkAttendanceModal";
import ApprovalTimeline from "../components/ApprovalTimeline";
import DocumentModal from "../components/DocumentModal";

export default function FacultyView({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("events"); // 'events' or 'records'

  const [attendanceModalEvent, setAttendanceModalEvent] = useState(null);
  const [timelineEvent, setTimelineEvent] = useState(null);
  const [docModalEvent, setDocModalEvent] = useState(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([getEvents(), getAllAttendance(), getStudents()])
      .then(([evRes, attRes, stRes]) => {
        setEvents(evRes.data || []);
        setAttendanceRecords(attRes.data || []);
        setStudents(stRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const verifiedEvents = events.filter((e) => (e.approvalStatus || "").toUpperCase() === "VERIFIED");
  const unverifiedEvents = events.filter((e) => (e.approvalStatus || "").toUpperCase() !== "VERIFIED");

  const studentMap = {};
  students.forEach((s) => {
    studentMap[s.id] = s;
  });

  const eventMap = {};
  events.forEach((e) => {
    eventMap[e.id] = e;
  });

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Subject Faculty &bull; Event Attendance Consideration
        </h2>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
          Only events with full institutional verification (Status: VERIFIED) are unlocked for attendance processing.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#ecfdf5", color: "#059669" }}>✅</div>
          <div>
            <div className="stat-number">{verifiedEvents.length}</div>
            <div className="stat-label">Verified Events Eligible</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#eff6ff", color: "#2563eb" }}>📝</div>
          <div>
            <div className="stat-number">{attendanceRecords.length}</div>
            <div className="stat-label">Total Attendance Marked</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#d97706" }}>🔒</div>
          <div>
            <div className="stat-number">{unverifiedEvents.length}</div>
            <div className="stat-label">Unverified (Locked)</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          className={`btn ${tab === "events" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("events")}
        >
          Verified Events for Marking ({verifiedEvents.length})
        </button>
        <button
          className={`btn ${tab === "records" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("records")}
        >
          Attendance Records Audit ({attendanceRecords.length})
        </button>
      </div>

      {/* TAB 1: VERIFIED EVENTS */}
      {tab === "events" && (
        <div className="campx-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Verified Events (Ready for Attendance Recording)
            </h3>
            <span style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>
              ✓ Attendance marking permitted
            </span>
          </div>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading verified events...</p>
          ) : verifiedEvents.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 8 }}>
              No verified events available currently. Attendance can only be recorded once an event is fully verified by HOD/Dean.
            </div>
          ) : (
            <div className="table-container">
              <table className="campx-table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Status</th>
                    <th>Faculty Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedEvents.map((evt) => (
                    <tr key={evt.id}>
                      <td style={{ fontWeight: 600, color: "#4f46e5" }}>{evt.eventId}</td>
                      <td style={{ fontWeight: 600 }}>{evt.eventName}</td>
                      <td>{evt.eventType}</td>
                      <td>{evt.eventDate}</td>
                      <td>{evt.venue}</td>
                      <td><StatusBadge status={evt.approvalStatus} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setAttendanceModalEvent(evt)}
                          >
                            Mark Attendance
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDocModalEvent(evt)}
                          >
                            Review Letter
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setTimelineEvent(evt)}
                          >
                            Approval Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ATTENDANCE RECORDS */}
      {tab === "records" && (
        <div className="campx-card">
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
            Official Attendance Audit Trail
          </h3>
          {attendanceRecords.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
              No attendance records logged yet.
            </div>
          ) : (
            <div className="table-container">
              <table className="campx-table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Student Roll No</th>
                    <th>Student Name</th>
                    <th>Event Name</th>
                    <th>Attendance Status</th>
                    <th>Marked By Faculty</th>
                    <th>Recorded Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((att) => {
                    const st = studentMap[att.studentId] || { studentId: "ID#" + att.studentId, name: "Student " + att.studentId };
                    const ev = eventMap[att.eventId] || { eventName: "Event #" + att.eventId };
                    return (
                      <tr key={att.id}>
                        <td style={{ fontWeight: 600 }}>#{att.id}</td>
                        <td style={{ fontWeight: 700, color: "#4f46e5" }}>{st.studentId}</td>
                        <td>{st.name}</td>
                        <td>{ev.eventName}</td>
                        <td>
                          <span className={`badge ${att.attendanceStatus === "PRESENT" ? "badge-verified" : "badge-rejected"}`}>
                            {att.attendanceStatus}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{att.markedBy}</td>
                        <td style={{ color: "#64748b", fontSize: 13 }}>
                          {att.markedAt ? new Date(att.markedAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mark Attendance Modal */}
      {attendanceModalEvent && (
        <MarkAttendanceModal
          event={attendanceModalEvent}
          currentUser={currentUser}
          onClose={() => setAttendanceModalEvent(null)}
          onAttendanceRecorded={loadData}
        />
      )}

      {/* Document Modal */}
      {docModalEvent && (
        <DocumentModal
          event={docModalEvent}
          canUpload={false}
          onClose={() => setDocModalEvent(null)}
        />
      )}

      {/* Timeline Modal */}
      {timelineEvent && (
        <div className="modal-overlay" onClick={() => setTimelineEvent(null)}>
          <div className="modal-content" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {timelineEvent.eventName} &bull; Approval Details
              </h3>
              <button onClick={() => setTimelineEvent(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>&times;</button>
            </div>
            <div className="modal-body">
              <ApprovalTimeline event={timelineEvent} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setTimelineEvent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
