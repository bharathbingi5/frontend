import React, { useState, useEffect } from "react";
import { getEvents } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import ApprovalTimeline from "../components/ApprovalTimeline";
import ApprovalModal from "../components/ApprovalModal";
import DocumentModal from "../components/DocumentModal";

export default function DeanView({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [approvalModalEvent, setApprovalModalEvent] = useState(null);
  const [timelineEvent, setTimelineEvent] = useState(null);
  const [docModalEvent, setDocModalEvent] = useState(null);

  const loadEvents = () => {
    setLoading(true);
    getEvents()
      .then((res) => setEvents(res.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Events requiring Dean action: HOD_APPROVED and deanApprovalRequired == true
  const pendingDean = events.filter(
    (e) => (e.approvalStatus || "").toUpperCase() === "HOD_APPROVED" && e.deanApprovalRequired
  );

  const allVerifiedByDean = events.filter(
    (e) => (e.approvalStatus || "").toUpperCase() === "VERIFIED" && e.deanApprovalRequired
  );

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Dean Academics Approval Portal
        </h2>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
          Executive academic authorization for major institutional events, inter-college activities, and sanctioned tours.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#d97706" }}>🏛️</div>
          <div>
            <div className="stat-number">{pendingDean.length}</div>
            <div className="stat-label">Awaiting Dean Approval</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#ecfdf5", color: "#059669" }}>🎓</div>
          <div>
            <div className="stat-number">{allVerifiedByDean.length}</div>
            <div className="stat-label">Dean Verified Events</div>
          </div>
        </div>
      </div>

      {/* Awaiting Dean Table */}
      <div className="campx-card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            Events Awaiting Dean Approval ({pendingDean.length})
          </h3>
          <span style={{ fontSize: 13, color: "#64748b" }}>
            Both Incharge and HOD have approved these events
          </span>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading events...</p>
        ) : pendingDean.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 8 }}>
            No events currently pending Dean approval.
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
                  <th>Dean Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingDean.map((evt) => (
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
                          onClick={() => setApprovalModalEvent(evt)}
                        >
                          Review & Approve
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDocModalEvent(evt)}
                        >
                          Official Letter
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setTimelineEvent(evt)}
                        >
                          Timeline
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

      {/* Previously Verified by Dean */}
      <div className="campx-card">
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
          Events Sanctioned & Verified by Dean ({allVerifiedByDean.length})
        </h3>
        <div className="table-container">
          <table className="campx-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Event Name</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allVerifiedByDean.map((evt) => (
                <tr key={evt.id}>
                  <td style={{ fontWeight: 600 }}>{evt.eventId}</td>
                  <td>{evt.eventName}</td>
                  <td>{evt.eventDate}</td>
                  <td>{evt.venue}</td>
                  <td><StatusBadge status={evt.approvalStatus} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setDocModalEvent(evt)}>
                        Letter
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setTimelineEvent(evt)}>
                        Timeline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModalEvent && (
        <ApprovalModal
          event={approvalModalEvent}
          userRole="DEAN"
          currentUser={currentUser}
          onClose={() => setApprovalModalEvent(null)}
          onActionSuccess={loadEvents}
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
    </div>
  );
}
