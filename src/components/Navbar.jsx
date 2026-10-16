import React from "react";
import { logout } from "../services/api";

const ROLES = [
  { role: "ADMIN", label: "Admin", username: "admin", icon: "⚙️" },
  { role: "INCHARGE", label: "Incharge", username: "incharge", icon: "✍️" },
  { role: "HOD", label: "HOD", username: "hod", icon: "📋" },
  { role: "DEAN", label: "Dean", username: "dean", icon: "🏛️" },
  { role: "FACULTY", label: "Faculty", username: "faculty", icon: "👨‍🏫" },
  { role: "STUDENT", label: "Student", username: "student1", icon: "👨‍🎓" },
];

export default function Navbar({ currentUser, onRoleSwitch, onLogout }) {
  const handleQuickSwitch = (acc) => {
    onRoleSwitch(acc.username, acc.role);
  };

  return (
    <header className="campx-header">
      {/* Title / Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>🏛️</span>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            CAMPX Attendance Portal
          </span>
          <span style={{ fontSize: 13, color: "#64748b", marginLeft: 8 }}>
            &bull; Anurag University / AIML Dept
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Quick Role Switcher for seamless demo & grading */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f1f5f9", padding: "4px 8px", borderRadius: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Switch:</span>
          {ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              onClick={() => handleQuickSwitch(r)}
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                border: "none",
                background: currentUser?.role === r.role ? "#4f46e5" : "transparent",
                color: currentUser?.role === r.role ? "#ffffff" : "#475569",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title={`Switch active view to ${r.label}`}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {/* User Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 8, borderLeft: "1px solid #e2e8f0" }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#4f46e5",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
          }}>
            {currentUser?.fullName?.charAt(0) || currentUser?.username?.charAt(0) || "U"}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {currentUser?.fullName || currentUser?.username}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              <span className="badge badge-incharge" style={{ padding: "1px 6px", fontSize: 10 }}>
                {currentUser?.role}
              </span>
              {currentUser?.department && ` • ${currentUser?.department}`}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onLogout}
          style={{ color: "#ef4444" }}
          title="Sign out of current account"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
