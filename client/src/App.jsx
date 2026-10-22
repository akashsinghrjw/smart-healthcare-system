
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

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [triageLogs, setTriageLogs] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authRole, setAuthRole] = useState("patient");

  // Load existing local data without deleting it.
  const loadLocalData = useCallback(() => {
    setRecords(safeLoad("real_records") || []);
    setMedicines(safeLoad("real_medicines") || []);
    setTriageLogs(safeLoad("real_triage_logs") || []);
    setSupportTickets(safeLoad("support_tickets_list") || []);
  }, []);

  // Load MongoDB data for the Admin Dashboard.
  const refreshState = useCallback(
    async (role) => {
      const currentRole = String(
        role || localStorage.getItem("userRole") || "patient"
      ).toLowerCase();

      if (currentRole !== "admin") {
        setRegisteredUsers(
          safeLoad("system_registered_users") || []
        );
        loadLocalData();
        return;
      }

      // Fetch registered patients.
      try {
        const response = await api.getPatients();

        const patients = Array.isArray(response)
          ? response
          : Array.isArray(response?.patients)
            ? response.patients
            : Array.isArray(response?.data)
              ? response.data
              : null;

        if (!patients) {
          throw new Error("Unexpected patients API response.");
        }

        const normalizedPatients = patients
          .filter(
            (patient) =>
              patient &&
              typeof patient === "object" &&
              (!patient.role || patient.role === "patient")
          )
          .map((patient) => ({
            ...patient,
            id: patient._id || patient.id,
            registeredAt:
              patient.createdAt || patient.registeredAt || null,
          }));

        setRegisteredUsers(normalizedPatients);
      } catch (error) {
        console.error("Unable to load patients:", error);
        setRegisteredUsers(
          safeLoad("system_registered_users") || []
        );
      }

      // Fetch medical records, medicines and AI logs.
      const results = await Promise.allSettled([
        api.getRecords(),
        api.getMedications(),
        api.getTriageHistory(),
      ]);

      const [recordsResult, medicinesResult, triageResult] = results;

      if (recordsResult.status === "fulfilled") {
        const data = recordsResult.value;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.records)
            ? data.records
            : Array.isArray(data?.data)
              ? data.data
              : null;

        if (list) {
          setRecords(list);
        }
      } else {
        console.error(
          "Unable to load medical records:",
          recordsResult.reason
        );
        setRecords(safeLoad("real_records") || []);
      }

      if (medicinesResult.status === "fulfilled") {
        const data = medicinesResult.value;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.medications)
            ? data.medications
            : Array.isArray(data?.data)
              ? data.data
              : null;

        if (list) {
          setMedicines(list);
        }
      } else {
        console.error(
          "Unable to load medicines:",
          medicinesResult.reason
        );
        setMedicines(safeLoad("real_medicines") || []);
      }

      if (triageResult.status === "fulfilled") {
        const data = triageResult.value;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.logs)
            ? data.logs
            : Array.isArray(data?.data)
              ? data.data
              : null;

        if (list) {
          setTriageLogs(list);
        }
      } else {
        console.error(
          "Unable to load AI history:",
          triageResult.reason
        );
        setTriageLogs(safeLoad("real_triage_logs") || []);
      }

      // Tickets are currently loaded from local storage.
      // MongoDB ticket fetching will need a backend list endpoint.
      setSupportTickets(
        safeLoad("support_tickets_list") || []
      );
    },
    [loadLocalData]
  );

  // Restore an existing session after page refresh.
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = (
      localStorage.getItem("userRole") || "patient"
    ).toLowerCase();

    const name = localStorage.getItem("userName") || "Patient";
    const email = localStorage.getItem("userEmail") || "";
    const phone = localStorage.getItem("userPhone") || "";
    const savedTab = localStorage.getItem("activeTab") || "home";

    if (!token) {
      loadLocalData();
      setRegisteredUsers(
        safeLoad("system_registered_users") || []
      );
      return;
    }

    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);
    setUserPhone(phone);
    setActiveTab(savedTab === "portal" ? "portal" : "home");

    refreshState(role);
  }, [loadLocalData, refreshState]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  // Called after successful login.
  const handleLoginSuccess = async (role, name, email, phone) => {
    const actualRole = String(role || "patient").toLowerCase();

    setIsLoggedIn(true);
    setUserRole(actualRole);
    setUserName(name || "Patient");
    setUserEmail(email || "");
    setUserPhone(phone || "");

    localStorage.setItem("userRole", actualRole);
    localStorage.setItem("userName", name || "Patient");
    localStorage.setItem("userEmail", email || "");
    localStorage.setItem("userPhone", phone || "");

    handleTabChange("portal");
    setShowAuthModal(false);

    await refreshState(actualRole);
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
    setRegisteredUsers(
      safeLoad("system_registered_users") || []
    );
    setActiveTab("home");
    setShowAuthModal(false);

    alert("Aap safaltapurvak logout ho gaye hain.");
  };

  const handleDeleteMyAccount = async () => {
    if (
      !window.confirm(
        "Kya aap apna account permanently delete karna chahte hain?"
      )
    ) {
      return;
    }

    try {
      await api.deleteAccount();
      alert("Your account has been deleted.");
      handleLogout();
    } catch (error) {
      alert("Account delete nahi hua: " + error.message);
    }
  };

  const openAuth = (mode = "login", role = "patient") => {
    setAuthMode(mode);
    setAuthRole(role);
    setShowAuthModal(true);
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
        onOpenAuth={openAuth}
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
        ) : !isLoggedIn ? (
          <main
            style={{
              maxWidth: "1240px",
              margin: "30px auto 60px",
              padding: "0 24px",
            }}
          >
            <h2>Please log in to access your portal.</h2>
            <button onClick={() => openAuth("login", "patient")}>
              Login
            </button>
          </main>
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
        onOpenAuth={openAuth}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
