import React, { useState, useEffect } from "react";
import { getAuditLogs } from "../services/api";

export default function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("ALL");
  const [search, setSearch] = useState("");

  const loadLogs = () => {
    setLoading(true);
    getAuditLogs()
      .then((res) => setLogs(res.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    const matchesSearch =
      (log.details || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.performedBy || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.action || "").toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
            System Audit Trail & Security Logs
          </h2>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
            Immutable chronological record of logins, event creations, hierarchical approvals, and attendance entries.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadLogs}>
          🔄 Refresh Logs
        </button>
      </div>

      {/* Filter bar */}
      <div className="campx-card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search details, actor, action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["ALL", "APPROVAL_INCHARGE", "APPROVAL_HOD", "APPROVAL_DEAN", "EVENT_REJECTED", "ATTENDANCE_MARKED", "EVENT_CREATED", "USER_LOGIN"].map((act) => (
              <button
                key={act}
                className={`btn btn-sm ${filterAction === act ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFilterAction(act)}
              >
                {act.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="campx-card">
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
          Recorded Audit Entries ({filtered.length})
        </h3>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading audit records...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
            No audit logs found.
          </div>
        ) : (
          <div className="table-container">
            <table className="campx-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Performed By</th>
                  <th>Details & Audit Context</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  let badgeStyle = { background: "#f1f5f9", color: "#334155" };
                  if (log.action.includes("APPROVED")) {
                    badgeStyle = { background: "#ecfdf5", color: "#047857" };
                  } else if (log.action.includes("REJECTED")) {
                    badgeStyle = { background: "#fef2f2", color: "#b91c1c" };
                  } else if (log.action.includes("ATTENDANCE")) {
                    badgeStyle = { background: "#eff6ff", color: "#1d4ed8" };
                  } else if (log.action.includes("CREATED")) {
                    badgeStyle = { background: "#f5f3ff", color: "#6d28d9" };
                  }

                  return (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>#{log.id}</td>
                      <td style={{ color: "#64748b", fontSize: 13, whiteSpace: "nowrap" }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            ...badgeStyle,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: "#64748b" }}>{log.entityType}</td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>{log.performedBy}</td>
                      <td style={{ fontSize: 13, color: "#334155" }}>{log.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
