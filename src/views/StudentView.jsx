import React, { useState, useEffect } from "react";
import { getStudents, getEvents, getEventsByStudent, getStudentAttendance } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import ApprovalTimeline from "../components/ApprovalTimeline";
import DocumentModal from "../components/DocumentModal";

export default function StudentView({ currentUser }) {
  const [studentProfile, setStudentProfile] = useState(null);
  const [enrolledEvents, setEnrolledEvents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [timelineEvent, setTimelineEvent] = useState(null);
  const [docModalEvent, setDocModalEvent] = useState(null);

  useEffect(() => {
    setLoading(true);
    getStudents().then((res) => {
      const allStudents = res.data || [];
      // Match by studentId e.g. 21AIML001 or fallback to first student
      let matched = allStudents.find((s) => s.studentId === currentUser?.studentId);
      if (!matched && allStudents.length > 0) {
        matched = allStudents[0];
      }
      setStudentProfile(matched);

      if (matched?.id) {
        Promise.all([
          getEventsByStudent(matched.id),
          getEvents(),
          getStudentAttendance(matched.id),
        ])
          .then(([esRes, evRes, attRes]) => {
            const eventLookup = {};
            (evRes.data || []).forEach((e) => {
              eventLookup[e.id] = e;
            });

            // Map enrolled event records
            const myEvents = (esRes.data || [])
              .map((es) => eventLookup[es.eventId])
              .filter(Boolean);

            setEnrolledEvents(myEvents);
            setAttendanceRecords(attRes.data || []);
          })
          .catch(() => {});
      }
    }).finally(() => setLoading(false));
  }, [currentUser]);

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Student Academic Portal &bull; Event Consideration
        </h2>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
          Track your official co-curricular participation, institutional approval stages, and verified attendance credits.
        </p>
      </div>

      {/* Security Warning Notice */}
      <div style={{
        padding: "14px 20px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 12,
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 12
      }}>
        <span style={{ fontSize: 24 }}>🛡️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1e40af" }}>
            Student Read-Only Access
          </div>
          <div style={{ fontSize: 13, color: "#1e3a8a" }}>
            Students cannot self-approve events or mark proxy attendance. All verification requires multi-stage staff endorsement.
          </div>
        </div>
      </div>

      {/* Student Profile Card */}
      {studentProfile && (
        <div className="campx-card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "#fff",
              fontWeight: 800
            }}>
              {studentProfile.name?.charAt(0) || "S"}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                {studentProfile.name}
              </h3>
              <div style={{ display: "flex", gap: 16, marginTop: 4, fontSize: 13, color: "#64748b", flexWrap: "wrap" }}>
                <span>Roll No: <strong style={{ color: "#0f172a" }}>{studentProfile.studentId}</strong></span>
                <span>Department: <strong style={{ color: "#0f172a" }}>{studentProfile.department}</strong></span>
                <span>Year: <strong style={{ color: "#0f172a" }}>{studentProfile.year}</strong></span>
                <span>Section: <strong style={{ color: "#0f172a" }}>{studentProfile.section}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrolled Events Table */}
      <div className="campx-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
          My Enrolled College Events ({enrolledEvents.length})
        </h3>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading your events...</p>
        ) : enrolledEvents.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 8 }}>
            You are currently not enrolled in any upcoming or past college events.
          </div>
        ) : (
          <div className="table-container">
            <table className="campx-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Name</th>
                  <th>Category</th>
                  <th>Event Date</th>
                  <th>Venue</th>
                  <th>Approval Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrolledEvents.map((evt) => (
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
                          className="btn btn-secondary btn-sm"
                          onClick={() => setTimelineEvent(evt)}
                        >
                          View Approval Progress
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDocModalEvent(evt)}
                        >
                          View Letter
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

      {/* Attendance History Table */}
      <div className="campx-card">
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
          Official Attendance Consideration Records ({attendanceRecords.length})
        </h3>

        {attendanceRecords.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
            No verified attendance has been marked for your events yet. Attendance is credited after event completion and verification.
          </div>
        ) : (
          <div className="table-container">
            <table className="campx-table">
              <thead>
                <tr>
                  <th>Record #</th>
                  <th>Event ID</th>
                  <th>Attendance Credit</th>
                  <th>Marked By Faculty</th>
                  <th>Recorded At</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((att) => (
                  <tr key={att.id}>
                    <td style={{ fontWeight: 600 }}>#{att.id}</td>
                    <td style={{ fontWeight: 600, color: "#4f46e5" }}>EVT-#{att.eventId}</td>
                    <td>
                      <span className={`badge ${att.attendanceStatus === "PRESENT" ? "badge-verified" : "badge-rejected"}`}>
                        {att.attendanceStatus}
                      </span>
                    </td>
                    <td>{att.markedBy}</td>
                    <td style={{ color: "#64748b", fontSize: 13 }}>
                      {att.markedAt ? new Date(att.markedAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Timeline Modal */}
      {timelineEvent && (
        <div className="modal-overlay" onClick={() => setTimelineEvent(null)}>
          <div className="modal-content" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                {timelineEvent.eventName} &bull; Approval Timeline
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

      {/* Document Modal */}
      {docModalEvent && (
        <DocumentModal
          event={docModalEvent}
          canUpload={false}
          onClose={() => setDocModalEvent(null)}
        />
      )}
    </div>
  );
}
