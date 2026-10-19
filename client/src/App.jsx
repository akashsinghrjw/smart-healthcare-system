import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import { safeLoad } from "./utils/storage";
import { api } from "./utils/api";

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

  const handleDeleteMyAccount = async () => {
    if (window.confirm("Kya aap apna account delete karna chahte hain?")) {
      try {
        await api.deleteAccount();
      } catch (err) {
        console.warn("Delete account note:", err.message);
      }
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
                onNavigateHome={() => setActiveTab("home")}
              />
            ) : (
              <Dashboard
                userName={userName}
                setUserName={setUserName}
                userEmail={userEmail}
                userPhone={userPhone}
                setUserPhone={setUserPhone}
                onNavigateHome={() => setActiveTab("home")}
                handleDeleteMyAccount={handleDeleteMyAccount}
              />
            )}
          </main>
        )}
      </div>

      <Footer
        setActiveTab={setActiveTab}
        onOpenAuth={(mode, role) => {
          setAuthMode(mode);
          setAuthRole(role);
          setShowAuthModal(true);
        }}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}