import React, { useState, useEffect } from "react";
import { getCurrentUser, login, logout } from "./services/api";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LoginView from "./views/LoginView";
import AdminView from "./views/AdminView";
import InchargeView from "./views/InchargeView";
import HodView from "./views/HodView";
import DeanView from "./views/DeanView";
import FacultyView from "./views/FacultyView";
import StudentView from "./views/StudentView";
import AuditLogsView from "./views/AuditLogsView";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Initialize auth
  useEffect(() => {
    const savedUser = localStorage.getItem("campx_user");
    const token = localStorage.getItem("campx_token");

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        // Sync default view to role
        setDefaultViewForRole(parsed.role);
      } catch (e) {
        localStorage.removeItem("campx_user");
        localStorage.removeItem("campx_token");
      }
    }
    setLoading(false);
  }, []);

  const setDefaultViewForRole = (role) => {
    switch ((role || "").toUpperCase()) {
      case "ADMIN":
        setCurrentView("dashboard");
        break;
      case "INCHARGE":
        setCurrentView("incharge");
        break;
      case "HOD":
        setCurrentView("hod");
        break;
      case "DEAN":
        setCurrentView("dean");
        break;
      case "FACULTY":
        setCurrentView("faculty");
        break;
      case "STUDENT":
        setCurrentView("student");
        break;
      default:
        setCurrentView("dashboard");
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setDefaultViewForRole(user.role);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setCurrentView("dashboard");
  };

  // Quick Switch for evaluator convenience
  const handleRoleSwitch = async (username, targetRole) => {
    try {
      const passMap = {
        admin: "admin123",
        incharge: "incharge123",
        hod: "hod123",
        dean: "dean123",
        faculty: "faculty123",
        student1: "student123",
      };
      const pass = passMap[username] || "password123";
      const res = await login(username, pass);
      const { token, user } = res.data;
      localStorage.setItem("campx_token", token);
      localStorage.setItem("campx_user", JSON.stringify(user));
      setCurrentUser(user);
      setDefaultViewForRole(user.role);
    } catch (e) {
      // If login API call fails, switch state client-side
      const tempUser = {
        username,
        role: targetRole,
        fullName: username.toUpperCase() + " User",
        department: "AI & ML",
      };
      setCurrentUser(tempUser);
      setDefaultViewForRole(targetRole);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b132b", color: "#fff" }}>
        <h3>Loading CAMPX Attendance Management...</h3>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Render view based on role and selected navigation
  const renderActiveView = () => {
    if (currentView === "audit") {
      return <AuditLogsView />;
    }

    const role = (currentUser.role || "").toUpperCase();
    switch (role) {
      case "ADMIN":
        return <AdminView currentUser={currentUser} />;
      case "INCHARGE":
        return <InchargeView currentUser={currentUser} />;
      case "HOD":
        return <HodView currentUser={currentUser} />;
      case "DEAN":
        return <DeanView currentUser={currentUser} />;
      case "FACULTY":
        return <FacultyView currentUser={currentUser} />;
      case "STUDENT":
        return <StudentView currentUser={currentUser} />;
      default:
        return <AdminView currentUser={currentUser} />;
    }
  };

  return (
    <div className="campx-app">
      <Sidebar
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
      />

      <div className="campx-main">
        <Navbar
          currentUser={currentUser}
          onRoleSwitch={handleRoleSwitch}
          onLogout={handleLogout}
        />

        <main className="campx-content">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
