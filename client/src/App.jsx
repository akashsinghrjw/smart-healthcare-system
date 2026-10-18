import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import { safeLoad } from "./utils/storage";
import { api } from "./utils/api";
import { FaTimes, FaFileMedicalAlt } from "react-icons/fa";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("patient");
  const [userName, setUserName] = useState("Patient");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authRole, setAuthRole] = useState("patient");

  const [viewingFileRecord, setViewingFileRecord] = useState(null);

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [triageLogs, setTriageLogs] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);

  const refreshState = () => {
    setRegisteredUsers(safeLoad("system_registered_users"));
    setRecords(safeLoad("real_records"));
    setMedicines(safeLoad("real_medicines"));
    setTriageLogs(safeLoad("real_triage_logs"));
    setSupportTickets(safeLoad("support_tickets_list"));
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole") || "patient";
      const name = localStorage.getItem("userName") || "Patient";
      const email = localStorage.getItem("userEmail") || "";
      const phone = localStorage.getItem("userPhone") || "";

      if (token) {
        setIsLoggedIn(true);
        setUserRole(role);
        setUserName(name);
        setUserEmail(email);
        setUserPhone(phone);
      }
      refreshState();
    } catch (e) {
      console.warn("Init handled:", e);
    }
  }, []);

  const handleLoginSuccess = (role, name, email, phone) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    setUserPhone(phone);
    setActiveTab("portal");
    refreshState();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");

    setIsLoggedIn(false);
    setUserRole("patient");
    setUserName("Patient");
    setUserEmail("");
    setUserPhone("");
    setActiveTab("home");
    refreshState();
  };

  // Live MongoDB Account Deletion Handler
  const handleDeleteMyAccount = async () => {
    if (window.confirm("Kya aap apna account delete karna chahte hain?")) {
      try {
        // 1. Live Backend API Call to delete from MongoDB Atlas
        await api.deleteAccount();
      } catch (err) {
        console.warn("MongoDB delete API note:", err.message);
      }

      // 2. Clear Local Storage Cache
      const currentUsers = safeLoad("system_registered_users").filter(
        (u) => (u?.email || "").toLowerCase() !== (userEmail || "").toLowerCase()
      );
      const r = safeLoad("real_records").filter(
        (x) => (x?.patientEmail || "").toLowerCase() !== (userEmail || "").toLowerCase()
      );
      const m = safeLoad("real_medicines").filter(
        (x) => (x?.patientEmail || "").toLowerCase() !== (userEmail || "").toLowerCase()
      );
      const t = safeLoad("real_triage_logs").filter(
        (x) => (x?.patientEmail || "").toLowerCase() !== (userEmail || "").toLowerCase()
      );

      localStorage.setItem("system_registered_users", JSON.stringify(currentUsers));
      localStorage.setItem("real_records", JSON.stringify(r));
      localStorage.setItem("real_medicines", JSON.stringify(m));
      localStorage.setItem("real_triage_logs", JSON.stringify(t));

      // 3. Logout
      handleLogout();
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif", color: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={isLoggedIn}
        userRole={userRole}
        userName={userName}
        onLogout={handleLogout}
        onOpenAuth={(mode, role) => {
          setAuthMode(mode);
          setAuthRole(role);
          setShowAuthModal(true);
        }}
      />

      <div style={{ flex: 1 }}>
        {activeTab === "home" ? (
          <Home
            isLoggedIn={isLoggedIn}
            setActiveTab={setActiveTab}
            showAuthModal={showAuthModal}
            setShowAuthModal={setShowAuthModal}
            authMode={authMode}
            setAuthMode={setAuthMode}
            authRole={authRole}
            setAuthRole={setAuthRole}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <main style={{ maxWidth: "1240px", margin: "30px auto 60px", padding: "0 24px" }}>
            {userRole === "admin" ? (
              <OwnerDashboard
                registeredUsers={registeredUsers}
                setRegisteredUsers={setRegisteredUsers}
                records={records}
                setRecords={setRecords}
                medicines={medicines}
                setMedicines={setMedicines}
                triageLogs={triageLogs}
                setTriageLogs={setTriageLogs}
                supportTickets={supportTickets}
                setSupportTickets={setSupportTickets}
                setViewingFileRecord={setViewingFileRecord}
                onNavigateHome={() => setActiveTab("home")}
              />
            ) : (
              <Dashboard
                userName={userName}
                userEmail={userEmail}
                userPhone={userPhone}
                records={records}
                setRecords={setRecords}
                medicines={medicines}
                setMedicines={setMedicines}
                triageLogs={triageLogs}
                setTriageLogs={setTriageLogs}
                supportTickets={supportTickets}
                setSupportTickets={setSupportTickets}
                setViewingFileRecord={setViewingFileRecord}
                onNavigateHome={() => setActiveTab("home")}
                handleDeleteMyAccount={handleDeleteMyAccount}
              />
            )}
          </main>
        )}
      </div>

      <Footer />

      {/* MODAL: VIEW UPLOADED DOCUMENT / IMAGE */}
      {viewingFileRecord && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }} onClick={() => setViewingFileRecord(null)}>
          <div style={{ background: "#ffffff", width: "90%", maxWidth: "650px", padding: "26px", borderRadius: "18px", maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <div>
                <h3 style={{ fontSize: "18px", margin: 0, color: "#0f172a" }}>{viewingFileRecord.title}</h3>
                <small style={{ color: "#64748b" }}>Category: {viewingFileRecord.type} | Uploaded: {viewingFileRecord.date}</small>
              </div>
              <button onClick={() => setViewingFileRecord(null)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}><FaTimes /></button>
            </div>

            <div style={{ textAlign: "center", background: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0", minHeight: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {viewingFileRecord.fileData ? (
                viewingFileRecord.fileData.startsWith("data:image") ? (
                  <img
                    src={viewingFileRecord.fileData}
                    alt={viewingFileRecord.title}
                    style={{ maxWidth: "100%", maxHeight: "380px", borderRadius: "8px", objectFit: "contain", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}
                  />
                ) : (
                  <div>
                    <FaFileMedicalAlt size={48} color="#0284c7" style={{ marginBottom: "12px" }} />
                    <h4 style={{ margin: "0 0 6px" }}>{viewingFileRecord.fileName}</h4>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>Document file securely stored.</p>
                    <a
                      href={viewingFileRecord.fileData}
                      download={viewingFileRecord.fileName}
                      style={{ background: "#0d9488", color: "#ffffff", padding: "8px 18px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "700" }}
                    >
                      Download / Open File
                    </a>
                  </div>
                )
              ) : (
                <div>
                  <FaFileMedicalAlt size={40} color="#94a3b8" style={{ marginBottom: "8px" }} />
                  <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Is record ke sath koi digital document/image attach nahi ki gayi thi.</p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                style={{ background: "#0d9488", color: "#ffffff", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                onClick={() => setViewingFileRecord(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}