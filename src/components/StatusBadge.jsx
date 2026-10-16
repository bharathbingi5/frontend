import React from "react";

export default function StatusBadge({ status }) {
  const norm = (status || "").toUpperCase();

  switch (norm) {
    case "VERIFIED":
      return (
        <span className="badge badge-verified">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
          Verified
        </span>
      );
    case "INCHARGE_APPROVED":
      return (
        <span className="badge badge-incharge">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
          Incharge Approved
        </span>
      );
    case "HOD_APPROVED":
      return (
        <span className="badge badge-hod">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
          HOD Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="badge badge-rejected">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
          Rejected
        </span>
      );
    case "PENDING":
    default:
      return (
        <span className="badge badge-pending">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }}></span>
          Pending
        </span>
      );
  }
}
