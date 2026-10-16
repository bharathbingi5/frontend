import React, { useState } from "react";
import { approveByIncharge, approveByHod, approveByDean, rejectEvent } from "../services/api";

export default function ApprovalModal({ event, userRole, currentUser, onClose, onActionSuccess }) {
  const [remarks, setRemarks] = useState("");
  const [actionType, setActionType] = useState("APPROVE"); // 'APPROVE' or 'REJECT'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const approverName = currentUser?.username || userRole;

      if (actionType === "REJECT") {
        if (!remarks.trim()) {
          setError("Remarks are required when rejecting an event");
          setSubmitting(false);
          return;
        }
        await rejectEvent(event.id, userRole, remarks, approverName);
      } else {
        // APPROVE based on role
        if (userRole === "INCHARGE") {
          await approveByIncharge(event.id, approverName, remarks);
        } else if (userRole === "HOD") {
          await approveByHod(event.id, approverName, remarks);
        } else if (userRole === "DEAN") {
          await approveByDean(event.id, approverName, remarks);
        } else {
          throw new Error("Unauthorized approval level for role " + userRole);
        }
      }

      onActionSuccess();
      onClose();
    } catch (err) {
      const msg = typeof err.response?.data === "string" ? err.response?.data : err.response?.data?.message || err.message;
      setError(msg || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleLabel = () => {
    if (userRole === "INCHARGE") return "Class Incharge";
    if (userRole === "HOD") return "Head of Department (HOD)";
    if (userRole === "DEAN") return "Dean of Academics";
    return userRole;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                {getRoleLabel()} &bull; Review & Decision
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                Event: {event.eventName} ({event.eventId})
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

            <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
                <div><strong>Event Type:</strong> {event.eventType}</div>
                <div><strong>Event Date:</strong> {event.eventDate}</div>
                <div><strong>Venue:</strong> {event.venue}</div>
                <div><strong>Current Status:</strong> {event.approvalStatus}</div>
                <div style={{ gridColumn: "span 2" }}>
                  <strong>Dean Approval Required:</strong> {event.deanApprovalRequired ? "Yes" : "No"}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Decision Action</label>
              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#047857" }}>
                  <input
                    type="radio"
                    name="decision"
                    value="APPROVE"
                    checked={actionType === "APPROVE"}
                    onChange={() => setActionType("APPROVE")}
                  />
                  Approve Event
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#b91c1c" }}>
                  <input
                    type="radio"
                    name="decision"
                    value="REJECT"
                    checked={actionType === "REJECT"}
                    onChange={() => setActionType("REJECT")}
                  />
                  Reject Event
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Remarks & Justification {actionType === "REJECT" && <span style={{ color: "#ef4444" }}>*</span>}
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder={actionType === "APPROVE" ? "Enter any official approval remarks or conditions..." : "Provide specific reason for rejection..."}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div style={{ fontSize: 12, color: "#64748b" }}>
              Logged in as: <strong>{currentUser?.fullName || currentUser?.username || userRole}</strong> ({userRole})
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${actionType === "APPROVE" ? "btn-success" : "btn-danger"}`}
              disabled={submitting}
            >
              {submitting ? "Processing..." : actionType === "APPROVE" ? "Confirm Approval" : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
