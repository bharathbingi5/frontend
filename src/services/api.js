import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach bearer token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("campx_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const login = (username, password) =>
  api.post("/auth/login", { username, password });

export const getCurrentUser = () => api.get("/auth/me");

export const logout = () => {
  localStorage.removeItem("campx_token");
  localStorage.removeItem("campx_user");
  return api.post("/auth/logout").catch(() => {});
};

export const getUsers = () => api.get("/auth/users");
export const createUser = (userData) => api.post("/auth/users", userData);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);

// Students
export const getStudents = () => api.get("/students");
export const getStudent = (id) => api.get(`/students/${id}`);
export const addStudent = (student) => api.post("/students", student);
export const updateStudent = (id, student) => api.put(`/students/${id}`, student);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Events
export const getEvents = () => api.get("/events");
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (eventData) => api.post("/events", eventData);
export const updateEvent = (id, eventData) => api.put(`/events/${id}`, eventData);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// Event Students (participants)
export const getStudentsByEvent = (eventId) =>
  api.get(`/event-students/event/${eventId}`);
export const getEventsByStudent = (studentId) =>
  api.get(`/event-students/student/${studentId}`);
export const addStudentToEvent = (data) =>
  api.post("/event-students", data);
export const removeStudentFromEvent = (id) =>
  api.delete(`/event-students/${id}`);

// Documents (PDF)
export const uploadDocument = (eventId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/documents/upload/${eventId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getDocumentsByEvent = (eventId) =>
  api.get(`/documents/event/${eventId}`);
export const getDocumentViewUrl = (id) => `${API_BASE_URL}/documents/view/${id}`;
export const getDocumentDownloadUrl = (id) => `${API_BASE_URL}/documents/download/${id}`;

// Approvals
export const approveByIncharge = (eventId, approvedBy, remarks) =>
  api.post(`/approvals/incharge/${eventId}?approvedBy=${encodeURIComponent(approvedBy || "")}&remarks=${encodeURIComponent(remarks || "")}`);

export const approveByHod = (eventId, approvedBy, remarks) =>
  api.post(`/approvals/hod/${eventId}?approvedBy=${encodeURIComponent(approvedBy || "")}&remarks=${encodeURIComponent(remarks || "")}`);

export const approveByDean = (eventId, approvedBy, remarks) =>
  api.post(`/approvals/dean/${eventId}?approvedBy=${encodeURIComponent(approvedBy || "")}&remarks=${encodeURIComponent(remarks || "")}`);

export const rejectEvent = (eventId, level, remarks, rejectedBy) =>
  api.post(`/approvals/reject/${eventId}?level=${encodeURIComponent(level || "")}&remarks=${encodeURIComponent(remarks || "")}&rejectedBy=${encodeURIComponent(rejectedBy || "")}`);

export const getApprovalHistory = (eventId) =>
  api.get(`/approvals/event/${eventId}`);

// Attendance
export const getAllAttendance = () => api.get("/attendance");
export const getEventAttendance = (eventId) =>
  api.get(`/attendance/event/${eventId}`);
export const getStudentAttendance = (studentId) =>
  api.get(`/attendance/student/${studentId}`);
export const markAttendance = (data) => api.post("/attendance/mark", data);
export const bulkMarkAttendance = (records) => api.post("/attendance/bulk-mark", records);
export const updateAttendanceStatus = (id, attendanceStatus) =>
  api.put(`/attendance/${id}`, { attendanceStatus });

// Dashboard Stats & Audit Logs
export const getStats = () => api.get("/stats");
export const getAuditLogs = () => api.get("/audit-logs");

export default api;
