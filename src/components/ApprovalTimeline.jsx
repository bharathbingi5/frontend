import React, { useEffect, useState } from "react";
import { getApprovalHistory } from "../services/api";

export default function ApprovalTimeline({ event, historyList }) {
  const [history, setHistory] = useState(historyList || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!historyList && event?.id) {
      setLoading(true);
      getApprovalHistory(event.id)
        .then((res) => setHistory(res.data || []))
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    } else if (historyList) {
      setHistory(historyList);
    }
  }, [event?.id, historyList]);

  if (!event) return null;

  const inchargeRecord = history.find((h) => h.approvalLevel?.toUpperCase() === "INCHARGE");
  const hodRecord = history.find((h) => h.approvalLevel?.toUpperCase() === "HOD");
  const deanRecord = history.find((h) => h.approvalLevel?.toUpperCase() === "DEAN");
  const isRejected = (event.approvalStatus || "").toUpperCase() === "REJECTED";
  const rejectedRecord = history.find((h) => h.approvalStatus?.toUpperCase() === "REJECTED");

  const steps = [
    {
      title: "1. Event Creation & Submission",
      role: "Class Incharge",
      completed: true,
      approver: "Staff Submitted",
      date: event.eventDate,
      remarks: "Official event draft registered in CAMPX",
    },
    {
      title: "2. Class Incharge Verification",
      role: "Class Incharge",
      completed: !!inchargeRecord,
      approver: inchargeRecord?.approvedBy,
      date: inchargeRecord?.approvalDate,
      remarks: inchargeRecord?.remarks,
      isCurrent: !inchargeRecord && !isRejected,
    },
    {
      title: "3. Head of Department (HOD) Approval",
      role: "HOD",
      completed: !!hodRecord,
      approver: hodRecord?.approvedBy,
      date: hodRecord?.approvalDate,
      remarks: hodRecord?.remarks,
      isCurrent: inchargeRecord && !hodRecord && !isRejected,
    },
  ];

  if (event.deanApprovalRequired) {
    steps.push({
      title: "4. Dean Academics Approval (Required)",
      role: "Dean",
      completed: !!deanRecord,
      approver: deanRecord?.approvedBy,
      date: deanRecord?.approvalDate,
      remarks: deanRecord?.remarks,
      isCurrent: hodRecord && !deanRecord && !isRejected,
    });
  }

  const isVerified = (event.approvalStatus || "").toUpperCase() === "VERIFIED";

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Approval Process & Audit History</h4>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Dean Approval: {event.deanApprovalRequired ? "Required" : "Not Required"}
        </span>
      </div>

      {loading ? (
        <p style={{ color: "#64748b", fontSize: 13 }}>Loading approval records...</p>
      ) : (
        <div className="timeline">
          {steps.map((step, idx) => {
            let dotClass = "timeline-dot";
            if (step.completed) dotClass += " active";
            else if (step.isCurrent) dotClass += " pending";

            return (
              <div key={idx} className="timeline-item">
                <div className={dotClass}></div>
                <div style={{ fontSize: 14, fontWeight: 600, color: step.completed ? "#0f172a" : "#64748b" }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {step.completed ? (
                    <>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>Approved by: {step.approver}</span>
                      {step.date && <span> &bull; {new Date(step.date).toLocaleString()}</span>}
                      {step.remarks && <div style={{ fontStyle: "italic", marginTop: 3 }}>"{step.remarks}"</div>}
                    </>
                  ) : step.isCurrent ? (
                    <span style={{ color: "#d97706", fontWeight: 500 }}>Awaiting action at this stage</span>
                  ) : (
                    <span>Pending previous stage completion</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Final Verification Step */}
          <div className="timeline-item">
            <div className={`timeline-dot ${isVerified ? "active" : isRejected ? "rejected" : ""}`}></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isVerified ? "#10b981" : isRejected ? "#ef4444" : "#94a3b8" }}>
              {isVerified ? "Final Status: VERIFIED (Eligible for Attendance)" : isRejected ? "Status: REJECTED" : "Final Status: Pending Verification"}
            </div>
            {isRejected && rejectedRecord && (
              <div style={{ fontSize: 12, color: "#b91c1c", marginTop: 2 }}>
                Rejected by: {rejectedRecord.approvedBy} ({rejectedRecord.approvalLevel}) &bull; Reason: {rejectedRecord.remarks || "No reason specified"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
