import React from "react";

export default function Sidebar({ currentUser, currentView, onViewChange }) {
  const role = currentUser?.role?.toUpperCase();

  const getNavItems = () => {
    switch (role) {
      case "ADMIN":
        return [
          { id: "dashboard", label: "Admin Control Center", icon: "📊" },
          { id: "audit", label: "System Audit Trail", icon: "🛡️" },
        ];
      case "INCHARGE":
        return [
          { id: "incharge", label: "Incharge Portal", icon: "✍️" },
          { id: "audit", label: "Approval History", icon: "📋" },
        ];
      case "HOD":
        return [
          { id: "hod", label: "HOD Approvals", icon: "📋" },
          { id: "audit", label: "Audit Logs", icon: "🛡️" },
        ];
      case "DEAN":
        return [
          { id: "dean", label: "Dean Approvals", icon: "🏛️" },
          { id: "audit", label: "Audit Logs", icon: "🛡️" },
        ];
      case "FACULTY":
        return [
          { id: "faculty", label: "Attendance Portal", icon: "👨‍🏫" },
          { id: "audit", label: "Attendance Logs", icon: "📝" },
        ];
      case "STUDENT":
        return [
          { id: "student", label: "Student Events & Attendance", icon: "👨‍🎓" },
        ];
      default:
        return [{ id: "dashboard", label: "Dashboard", icon: "📊" }];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="campx-sidebar">
      {/* Brand Header */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            boxShadow: "0 4px 10px rgba(79, 70, 229, 0.3)"
          }}>
            🎓
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", letterSpacing: -0.5 }}>
              CAMPX
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
              Smart Event Attendance
            </div>
          </div>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div style={{ padding: "16px 20px 8px" }}>
        <div style={{
          padding: "8px 12px",
          background: "rgba(255, 255, 255, 0.04)",
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", color: "#64748b", fontWeight: 700, letterSpacing: 0.5 }}>
            Active Dashboard
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", marginTop: 2 }}>
            {role ? `${role} MODE` : "DASHBOARD"}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: "12px 16px", flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", padding: "0 8px 8px" }}>
          Navigation
        </div>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${currentView === item.id ? "active" : ""}`}
            onClick={() => onViewChange(item.id)}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Hierarchy Info Footer */}
      <div style={{ padding: 20, borderTop: "1px solid rgba(255, 255, 255, 0.08)", fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>
        <div style={{ fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>Workflow Order:</div>
        <div>Incharge → HOD → Dean* → Verified → Faculty Attendance</div>
      </div>
    </aside>
  );
}
