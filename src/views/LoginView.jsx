import React, { useState } from "react";
import { login } from "../services/api";

const DEMO_ACCOUNTS = [
  { role: "ADMIN", name: "Admin", username: "admin", pass: "admin123", desc: "System Administrator" },
  { role: "INCHARGE", name: "Incharge", username: "incharge", pass: "incharge123", desc: "Class Incharge (Event Creator)" },
  { role: "HOD", name: "HOD", username: "hod", pass: "hod123", desc: "Head of Department" },
  { role: "DEAN", name: "Dean", username: "dean", pass: "dean123", desc: "Dean Academics" },
  { role: "FACULTY", name: "Faculty", username: "faculty", pass: "faculty123", desc: "Subject Faculty" },
  { role: "STUDENT", name: "Student", username: "student1", pass: "student123", desc: "Student (21AIML001)" },
];

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoSelect = (acc) => {
    setUsername(acc.username);
    setPassword(acc.pass);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await login(username.trim(), password);
      const { token, user } = res.data;
      localStorage.setItem("campx_token", token);
      localStorage.setItem("campx_user", JSON.stringify(user));
      onLoginSuccess(user);
    } catch (err) {
      const msg = typeof err.response?.data === "string" ? err.response?.data : err.response?.data?.message || err.message;
      setError(msg || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #1e1b4b 100%)",
      padding: 20
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        maxWidth: 520,
        width: "100%",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        {/* Header Banner */}
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#ffffff",
          padding: "32px 36px",
          borderBottom: "1px solid #334155",
          textAlign: "center"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            fontSize: 28,
            marginBottom: 16,
            boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.4)"
          }}>
            🎓
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.5, color: "#f8fafc" }}>
            CAMPX
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
            Smart Event-Based Attendance Management System
          </p>
        </div>

        {/* Content & Form */}
        <div style={{ padding: "32px 36px" }}>
          {error && (
            <div style={{
              padding: "12px 16px",
              background: "#fef2f2",
              color: "#b91c1c",
              borderRadius: 10,
              marginBottom: 20,
              fontSize: 13,
              fontWeight: 500,
              border: "1px solid #fecaca"
            }}>
              {error}
            </div>
          )}

          {/* Demo Role One-Click Switcher */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 10
            }}>
              Quick Demo Login: Select Role
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoSelect(acc)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: username === acc.username ? "2px solid #4f46e5" : "1px solid #e2e8f0",
                    background: username === acc.username ? "#eef2ff" : "#f8fafc",
                    color: username === acc.username ? "#4338ca" : "#334155",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "center"
                  }}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username (e.g., admin, incharge, hod...)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: 15 }}
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In to CAMPX"}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
            College Enterprise Attendance Platform &bull; BTech Demonstration
          </div>
        </div>
      </div>
    </div>
  );
}
