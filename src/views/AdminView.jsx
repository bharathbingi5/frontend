import React, { useState, useEffect } from "react";
import { getStats, getEvents, getStudents, addStudent, deleteStudent, getUsers, createUser, deleteUser, deleteEvent } from "../services/api";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ApprovalTimeline from "../components/ApprovalTimeline";
import DocumentModal from "../components/DocumentModal";

export default function AdminView({ currentUser }) {
  const [stats, setStats] = useState({});
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("events"); // 'events', 'students', 'users'

  // Sub-modals & state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timelineEvent, setTimelineEvent] = useState(null);
  const [docModalEvent, setDocModalEvent] = useState(null);

  // New Student Form
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ studentId: "", name: "", department: "AI & ML", year: "IV", section: "A" });

  // New User Form
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", fullName: "", role: "FACULTY", department: "AI & ML", email: "" });

  const loadAll = () => {
    getStats().then((res) => setStats(res.data || {})).catch(() => {});
    getEvents().then((res) => setEvents(res.data || [])).catch(() => {});
    getStudents().then((res) => setStudents(res.data || [])).catch(() => {});
    getUsers().then((res) => setUsers(res.data || [])).catch(() => {});
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.studentId || !newStudent.name) return;
    await addStudent(newStudent);
    setShowAddStudent(false);
    setNewStudent({ studentId: "", name: "", department: "AI & ML", year: "IV", section: "A" });
    loadAll();
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student record?")) {
      await deleteStudent(id);
      loadAll();
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.fullName) return;
    await createUser(newUser);
    setShowAddUser(false);
    setNewUser({ username: "", password: "", fullName: "", role: "FACULTY", department: "AI & ML", email: "" });
    loadAll();
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff/user account?")) {
      await deleteUser(id);
      loadAll();
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm("Delete event record and associated details?")) {
      await deleteEvent(id);
      loadAll();
    }
  };

  return (
    <div>
      {/* Top Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Admin Management & Control Center
        </h2>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
          Comprehensive oversight of users, students, event records, and system statistics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <StatCard label="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="#2563eb" bg="#eff6ff" />
        <StatCard label="Total Events" value={stats.totalEvents} icon="📅" color="#4f46e5" bg="#eef2ff" />
        <StatCard label="Pending Incharge" value={stats.pendingIncharge} icon="⏳" color="#d97706" bg="#fef3c7" />
        <StatCard label="Pending HOD" value={stats.pendingHod} icon="📋" color="#7c3aed" bg="#f5f3ff" />
        <StatCard label="Pending Dean" value={stats.pendingDean} icon="🏛️" color="#0284c7" bg="#f0f9ff" />
        <StatCard label="Verified Events" value={stats.verifiedEvents} icon="✅" color="#059669" bg="#ecfdf5" />
        <StatCard label="Attendance Logs" value={stats.totalAttendance} icon="📝" color="#0891b2" bg="#ecfeff" />
        <StatCard label="System Users" value={stats.totalUsers} icon="👥" color="#4b5563" bg="#f3f4f6" />
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
        <button
          className={`btn ${activeTab === "events" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("events")}
        >
          Event Records ({events.length})
        </button>
        <button
          className={`btn ${activeTab === "students" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("students")}
        >
          Student Database ({students.length})
        </button>
        <button
          className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("users")}
        >
          Staff & User Accounts ({users.length})
        </button>
      </div>

      {/* TAB 1: EVENTS */}
      {activeTab === "events" && (
        <div className="campx-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>All Registered Events</h3>
            <span style={{ fontSize: 13, color: "#64748b" }}>Showing {events.length} records</span>
          </div>

          <div className="table-container">
            <table className="campx-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Dean Required</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "#64748b" }}>No events found.</td></tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.id}>
                      <td style={{ fontWeight: 600, color: "#4f46e5" }}>{evt.eventId}</td>
                      <td style={{ fontWeight: 600 }}>{evt.eventName}</td>
                      <td>{evt.eventType}</td>
                      <td>{evt.eventDate}</td>
                      <td>{evt.venue}</td>
                      <td>{evt.deanApprovalRequired ? "Yes" : "No"}</td>
                      <td><StatusBadge status={evt.approvalStatus} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setTimelineEvent(evt)}
                          >
                            Timeline
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setDocModalEvent(evt)}
                          >
                            Letter
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteEvent(evt.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === "students" && (
        <div className="campx-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Student Directory</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddStudent(true)}>
              + Add New Student
            </button>
          </div>

          <div className="table-container">
            <table className="campx-table">
              <thead>
                <tr>
                  <th>Roll / Student ID</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.studentId}</td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>{s.year}</td>
                    <td>{s.section}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStudent(s.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USERS */}
      {activeTab === "users" && (
        <div className="campx-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>System Roles & User Logins</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(true)}>
              + Add Staff User
            </button>
          </div>

          <div className="table-container">
            <table className="campx-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Assigned Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.username}</td>
                    <td>{u.fullName}</td>
                    <td>
                      <span className="badge badge-incharge" style={{ textTransform: "uppercase" }}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.department || "-"}</td>
                    <td>{u.email || "-"}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Student */}
      {showAddStudent && (
        <div className="modal-overlay" onClick={() => setShowAddStudent(false)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateStudent}>
              <div className="modal-header">
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add Student Record</h3>
                <button type="button" onClick={() => setShowAddStudent(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Roll Number / Student ID</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g., 21AIML009"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Student full name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select
                      className="form-control"
                      value={newStudent.year}
                      onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                    >
                      <option value="I">I Year</option>
                      <option value="II">II Year</option>
                      <option value="III">III Year</option>
                      <option value="IV">IV Year</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newStudent.section}
                      onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddStudent(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateUser}>
              <div className="modal-header">
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add Staff / System User</h3>
                <button type="button" onClick={() => setShowAddUser(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g., incharge_ece, prof_kumar"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Defaults to password123 if empty"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name & Title</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g., Dr. Sunita Varma"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-control"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="INCHARGE">CLASS INCHARGE</option>
                    <option value="HOD">HEAD OF DEPARTMENT (HOD)</option>
                    <option value="DEAN">DEAN ACADEMICS</option>
                    <option value="FACULTY">SUBJECT FACULTY</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="staff@college.edu"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUser(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {timelineEvent && (
        <div className="modal-overlay" onClick={() => setTimelineEvent(null)}>
          <div className="modal-content" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
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

      {/* Document Modal */}
      {docModalEvent && (
        <DocumentModal
          event={docModalEvent}
          canUpload={true}
          onClose={() => setDocModalEvent(null)}
          onDocumentUploaded={loadAll}
        />
      )}
    </div>
  );
}
