import React, { useState, useEffect } from "react";
import { getEvents } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import ApprovalTimeline from "../components/ApprovalTimeline";
import CreateEventModal from "../components/CreateEventModal";
import ApprovalModal from "../components/ApprovalModal";
import DocumentModal from "../components/DocumentModal";

export default function InchargeView({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const filtered = events.filter((e) => {
    const matchesStatus = filterStatus === "ALL" || (e.approvalStatus || "").toUpperCase() === filterStatus;
    const matchesSearch =
      (e.eventName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.eventId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.venue || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Class Incharge Event Management Portal
          </h2>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
            Create student events, attach official PDF letters, and submit through the institutional approval hierarchy.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ padding: "12px 20px" }}
        >
          + Create New Event Record
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#fef3c7", color: "#d97706" }}>⏳</div>
          <div>
            <div className="stat-number">{events.filter((e) => e.approvalStatus === "PENDING").length}</div>
            <div className="stat-label">Pending Incharge Action</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#f5f3ff", color: "#7c3aed" }}>📋</div>
          <div>
            <div className="stat-number">{events.filter((e) => e.approvalStatus === "INCHARGE_APPROVED").length}</div>
            <div className="stat-label">Forwarded to HOD</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: "#ecfdf5", color: "#059669" }}>✅</div>
          <div>
            <div className="stat-number">{events.filter((e) => e.approvalStatus === "VERIFIED").length}</div>
            <div className="stat-label">Verified & Completed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="campx-card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by event name, ID, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["ALL", "PENDING", "INCHARGE_APPROVED", "HOD_APPROVED", "VERIFIED", "REJECTED"].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${filterStatus === st ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFilterStatus(st)}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="campx-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Registered Events ({filtered.length})</h3>
        </div>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading events...</p>
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
                  <th>Dean Required?</th>
                  <th>Status</th>
                  <th>Incharge Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: 32 }}>
                      No events found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((evt) => {
                    const isPending = (evt.approvalStatus || "").toUpperCase() === "PENDING";
                    return (
                      <tr key={evt.id}>
                        <td style={{ fontWeight: 600, color: "#4f46e5" }}>{evt.eventId}</td>
                        <td style={{ fontWeight: 600 }}>{evt.eventName}</td>
                        <td>{evt.eventType}</td>
                        <td>{evt.eventDate}</td>
                        <td>{evt.venue}</td>
                        <td>
                          {evt.deanApprovalRequired ? (
                            <span style={{ color: "#4338ca", fontWeight: 600 }}>Yes</span>
                          ) : (
                            <span style={{ color: "#64748b" }}>No</span>
                          )}
                        </td>
                        <td><StatusBadge status={evt.approvalStatus} /></td>
                        <td>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {isPending && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setApprovalModalEvent(evt)}
                              >
                                Review / Approve
                              </button>
                            )}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setDocModalEvent(evt)}
                            >
                              PDF Letter
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onEventCreated={loadEvents}
        />
      )}

      {/* Review / Decision Modal */}
      {approvalModalEvent && (
        <ApprovalModal
          event={approvalModalEvent}
          userRole="INCHARGE"
          currentUser={currentUser}
          onClose={() => setApprovalModalEvent(null)}
          onActionSuccess={loadEvents}
        />
      )}

      {/* Document Modal */}
      {docModalEvent && (
        <DocumentModal
          event={docModalEvent}
          canUpload={true}
          onClose={() => setDocModalEvent(null)}
          onDocumentUploaded={loadEvents}
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
