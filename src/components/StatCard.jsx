import React from "react";

export default function StatCard({ label, value, icon, color = "#4f46e5", bg = "#eef2ff" }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ backgroundColor: bg, color }}>
        {icon}
      </div>
      <div>
        <div className="stat-number">{value ?? 0}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
