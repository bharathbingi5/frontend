import React, { useState, useEffect } from "react";
import { getEvents } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import ApprovalTimeline from "../components/ApprovalTimeline";
import ApprovalModal from "../components/ApprovalModal";
import DocumentModal from "../components/DocumentModal";

export default function HodView({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending"); // 'pending' or 'history'

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

  const pendingEvents = events.filter((e) => (e.approvalStatus || "").toUpperCase() === "INCHARGE_APPROVED");
  const processedEvents = events.filter((e) => ["HOD_APPROVED", "VERIFIED", "REJECTED"].includes((e.approvalStatus || "").toUpperCase()));

  return (
    <div>
      {/* Top Banner */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          HOD Approval & Verification Portal
        </h2>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
          Department Head review for events forwarded by Class Incharges. Approve or reject with official remarks.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#d97706" }}>⚡</div>
          <div>
            <div className="stat-number">{pendingEvents.length}</div>
            <div className="stat-label">Action Required (Awaiting HOD)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#ecfdf5", color: "#059669" }}>✅</div>
          <div>
            <div className="stat-number">{events.filter((e) => e.approvalStatus === "VERIFIED").length}</div>
            <div className="stat-label">Verified & Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#f0f9ff", color: "#0284c7" }}>🏛️</div>
          <div>
            <div className="stat-number">{events.filter((e) => e.approvalStatus === "HOD_APPROVED" && e.deanApprovalRequired).length}</div>
            <div className="stat-label">Forwarded to Dean</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          className={`btn ${tab === "pending" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("pending")}
        >
          Pending HOD Review ({pendingEvents.length})
        </button>
        <button
          className={`btn ${tab === "history" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("history")}
        >
          Department Approval History ({processedEvents.length})
        </button>
      </div>

      {/* Pending Table */}
      {tab === "pending" && (
        <div className="campx-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Events Ready for HOD Decision
            </h3>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Only events verified by Class Incharge appear here
            </span>
          </div>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading events...</p>
          ) : pendingEvents.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 8 }}>
              🎉 No events currently awaiting HOD approval. All caught up!
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
                    <th>Dean Approval Req?</th>
                    <th>Status</th>
                    <th>HOD Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.map((evt) => (
                    <tr key={evt.id}>
                      <td style={{ fontWeight: 600, color: "#4f46e5" }}>{evt.eventId}</td>
                      <td style={{ fontWeight: 600 }}>{evt.eventName}</td>
                      <td>{evt.eventType}</td>
                      <td>{evt.eventDate}</td>
                      <td>{evt.venue}</td>
                      <td>
                        {evt.deanApprovalRequired ? (
                          <span style={{ color: "#7c3aed", fontWeight: 700 }}>Yes (Requires Dean)</span>
                        ) : (
                          <span style={{ color: "#059669", fontWeight: 700 }}>No (Becomes Verified)</span>
                        )}
                      </td>
                      <td><StatusBadge status={evt.approvalStatus} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setApprovalModalEvent(evt)}
                          >
                            Decide
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDocModalEvent(evt)}
                          >
                            Inspect PDF
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
      )}

      {/* History Table */}
      {tab === "history" && (
        <div className="campx-card">
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Department Event History</h3>
          <div className="table-container">
            <table className="campx-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Dean Required</th>
                  <th>Final Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedEvents.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontWeight: 600 }}>{evt.eventId}</td>
                    <td>{evt.eventName}</td>
                    <td>{evt.eventDate}</td>
                    <td>{evt.venue}</td>
                    <td>{evt.deanApprovalRequired ? "Yes" : "No"}</td>
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
      )}

      {/* Approval Modal */}
      {approvalModalEvent && (
        <ApprovalModal
          event={approvalModalEvent}
          userRole="HOD"
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
