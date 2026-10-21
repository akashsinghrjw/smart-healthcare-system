
import React, { useState, useEffect, useCallback } from "react";
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

  // Load existing browser data and live patients from MongoDB
  const refreshState = useCallback(async (role = userRole) => {
    setRecords(safeLoad("real_records") || []);
    setMedicines(safeLoad("real_medicines") || []);
    setTriageLogs(safeLoad("real_triage_logs") || []);
    setSupportTickets(safeLoad("support_tickets_list") || []);

    // Local data is used as a fallback if the API fails
    setRegisteredUsers(safeLoad("system_registered_users") || []);

    if (role === "admin") {
      try {
        const patients = await api.getPatients();

        if (Array.isArray(patients)) {
          setRegisteredUsers(patients);
        } else {
          console.error("Patients API did not return a list.");
        }
      } catch (error) {
        console.error(
          "Unable to fetch patients from MongoDB:",
          error.message
        );
      }
    }
  }, [userRole]);

  // Restore login state when the app opens
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") || "patient";
    const name = localStorage.getItem("userName") || "Patient";
    const email = localStorage.getItem("userEmail") || "";
    const phone = localStorage.getItem("userPhone") || "";
    const savedTab = localStorage.getItem("activeTab") || "home";

    setRecords(safeLoad("real_records") || []);
    setMedicines(safeLoad("real_medicines") || []);
    setTriageLogs(safeLoad("real_triage_logs") || []);
    setSupportTickets(safeLoad("support_tickets_list") || []);
    setRegisteredUsers(safeLoad("system_registered_users") || []);

    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserName(name);
      setUserEmail(email);
      setUserPhone(phone);
      setActiveTab(savedTab);

      if (role === "admin") {
        refreshState(role);
      }
    }
  }, [refreshState]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  const handleLoginSuccess = (role, name, email, phone) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    setUserPhone(phone || "");

    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", name || "Patient");
    localStorage.setItem("userEmail", email || "");
    localStorage.setItem("userPhone", phone || "");

    handleTabChange("portal");
    refreshState(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("activeTab");

    setIsLoggedIn(false);
    setUserRole("patient");
    setUserName("Patient");
    setUserEmail("");
    setUserPhone("");
    setRegisteredUsers([]);
    setActiveTab("home");

    alert("👋 Aap safaltapurvak logout ho gaye hain. Phir milenge!");
  };

  const handleDeleteMyAccount = async () => {
    if (window.confirm("Kya aap apna account delete karna chahte hain?")) {
      try {
        await api.deleteAccount();
        alert("Your account has been deleted.");
      } catch (error) {
        alert("Account delete nahi hua: " + error.message);
        return;
      }

      handleLogout();
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
        color: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
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
            setActiveTab={handleTabChange}
            showAuthModal={showAuthModal}
            setShowAuthModal={setShowAuthModal}
            authMode={authMode}
            setAuthMode={setAuthMode}
            authRole={authRole}
            setAuthRole={setAuthRole}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <main
            style={{
              maxWidth: "1240px",
              margin: "30px auto 60px",
              padding: "0 24px",
            }}
          >
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
                onNavigateHome={() => handleTabChange("home")}
              />
            ) : (
              <Dashboard
                userName={userName}
                setUserName={setUserName}
                userEmail={userEmail}
                userPhone={userPhone}
                setUserPhone={setUserPhone}
                onNavigateHome={() => handleTabChange("home")}
                handleDeleteMyAccount={handleDeleteMyAccount}
              />
            )}
          </main>
        )}
      </div>

      <Footer
        setActiveTab={handleTabChange}
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
