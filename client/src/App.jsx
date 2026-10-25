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

  // Admin File Preview Modal State
  const [viewingFileRecord, setViewingFileRecord] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authRole, setAuthRole] = useState("patient");

  // Helper: Scan both global keys AND per-patient keys from localStorage
  const getMergedLocalData = useCallback(() => {
    const localRecords = [...(safeLoad("real_records") || [])];
    const localMeds = [...(safeLoad("real_medicines") || [])];
    const localTriage = [...(safeLoad("real_triage_logs") || [])];
    const localTickets = [...(safeLoad("support_tickets_list") || [])];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith("vault_reports_")) {
        const email = key.replace("vault_reports_", "");
        const userReps = safeLoad(key) || [];
        userReps.forEach((r) => {
          if (r && !localRecords.some((ex) => String(ex.id) === String(r.id))) {
            localRecords.push({
              ...r,
              patientEmail: r.patientEmail || email,
              patientName: r.patientName || email.split("@")[0],
            });
          }
        });
      }

      if (key.startsWith("flex_medicines_")) {
        const email = key.replace("flex_medicines_", "");
        const userMeds = safeLoad(key) || [];
        userMeds.forEach((m) => {
          if (m && !localMeds.some((ex) => String(ex.id) === String(m.id))) {
            localMeds.push({
              ...m,
              patientEmail: m.patientEmail || email,
              patientName: m.patientName || email.split("@")[0],
              exactTime: m.exactTime || m.time || "08:00",
              days:
                Array.isArray(m.days) && m.days.length > 0
                  ? m.days.join(", ")
                  : m.startDate
                    ? `${m.startDate} to ${m.endDate || m.startDate}`
                    : "Daily",
            });
          }
        });
      }
    }

    return { localRecords, localMeds, localTriage, localTickets };
  }, []);

  // Load existing local data without deleting it.
  const loadLocalData = useCallback(() => {
    const { localRecords, localMeds, localTriage, localTickets } =
      getMergedLocalData();
    setRecords(localRecords);
    setMedicines(localMeds);
    setTriageLogs(localTriage);
    setSupportTickets(localTickets);
  }, [getMergedLocalData]);

  // Load MongoDB + Local data for the Admin Dashboard.
  const refreshState = useCallback(
    async (role) => {
      const currentRole = String(
        role || localStorage.getItem("userRole") || "patient"
      ).toLowerCase();

      const { localRecords, localMeds, localTriage, localTickets } =
        getMergedLocalData();

      if (currentRole !== "admin") {
        setRegisteredUsers(safeLoad("system_registered_users") || []);
        setRecords(localRecords);
        setMedicines(localMeds);
        setTriageLogs(localTriage);
        setSupportTickets(localTickets);
        return;
      }

      // 1. Fetch registered patients from MongoDB
      let loadedPatients = safeLoad("system_registered_users") || [];
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
              String(patient.role || "patient").toLowerCase() !== "admin"
          )
          .map((patient) => ({
            ...patient,
            id: patient._id || patient.id,
            registeredAt:
              patient.createdAt || patient.registeredAt || null,
          }));

        loadedPatients = normalizedPatients;
        setRegisteredUsers(normalizedPatients);
      } catch (error) {
        console.error("Unable to load patients:", error);
        setRegisteredUsers(loadedPatients);
      }

      // Helper to find patient name/email by user ID if MongoDB record only stores user ObjectId
      const resolvePatientInfo = (item) => {
        const directEmail =
          item.patientEmail || item.email || item.user?.email || "";
        const directName =
          item.patientName || item.name || item.user?.name || "";

        if (directEmail) {
          return {
            patientEmail: directEmail,
            patientName: directName || directEmail.split("@")[0],
          };
        }

        const ownerId =
          typeof item.user === "string"
            ? item.user
            : item.user?._id || item.userId;
        const matchedPatient = loadedPatients.find(
          (p) => String(p._id || p.id) === String(ownerId)
        );

        return {
          patientEmail: matchedPatient?.email || "patient@portal.com",
          patientName: matchedPatient?.name || "Registered Patient",
        };
      };

      // 2. Fetch medical records, medicines and AI logs from MongoDB & Merge with Local
      const results = await Promise.allSettled([
        api.getRecords(),
        api.getMedications(),
        api.getTriageHistory(),
      ]);

      const [recordsResult, medicinesResult, triageResult] = results;

      // Merge Medical Records
      if (recordsResult.status === "fulfilled") {
        const data = recordsResult.value;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.records)
            ? data.records
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const normalizedDbRecords = list.map((r) => ({
          ...r,
          id: r._id || r.id,
          ...resolvePatientInfo(r),
        }));

        const mergedRecords = [
          ...normalizedDbRecords,
          ...localRecords.filter(
            (lr) =>
              !normalizedDbRecords.some(
                (dr) => String(dr.id) === String(lr.id)
              )
          ),
        ];
        setRecords(mergedRecords);
      } else {
        setRecords(localRecords);
      }

      // Merge Medications
      if (medicinesResult.status === "fulfilled") {
        const data = medicinesResult.value;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.medications)
            ? data.medications
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const normalizedDbMeds = list.map((m) => ({
          ...m,
          id: m._id || m.id,
          ...resolvePatientInfo(m),
          exactTime: m.exactTime || m.time || "08:00",
          days: Array.isArray(m.days)
            ? m.days.join(", ")
            : m.days || m.startDate || "Daily",
        }));

        const mergedMeds = [
          ...normalizedDbMeds,
          ...localMeds.filter(
            (lm) =>
              !normalizedDbMeds.some(
                (dm) => String(dm.id) === String(lm.id)
              )
          ),
        ];
        setMedicines(mergedMeds);
      } else {
        setMedicines(localMeds);
      }

      // Merge AI Triage Logs
      if (triageResult.status === "fulfilled") {
        const data = triageResult.value;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.logs)
            ? data.logs
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const normalizedDbTriage = list.map((t) => ({
          ...t,
          id: t._id || t.id,
          ...resolvePatientInfo(t),
          condition:
            t.condition ||
            (t.analysis ? t.analysis.slice(0, 70) + "..." : "AI Consultation"),
          date: t.date || (t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Recent"),
          time: t.time || (t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""),
        }));

        const mergedTriage = [
          ...normalizedDbTriage,
          ...localTriage.filter(
            (lt) =>
              !normalizedDbTriage.some(
                (dt) => String(dt.id) === String(lt.id)
              )
          ),
        ];
        setTriageLogs(mergedTriage);
      } else {
        setTriageLogs(localTriage);
      }

      // Set Support Tickets
      setSupportTickets(localTickets);
    },
    [getMergedLocalData]
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
    if (tab === "portal") {
      refreshState(userRole);
    }
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
                setViewingFileRecord={setViewingFileRecord}
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

      {/* Global File Preview Modal for Admin Dossier / Records */}
      {viewingFileRecord && (
        <div
          onClick={() => setViewingFileRecord(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
                  {viewingFileRecord.title}
                </h3>
                <small style={{ color: "#64748b" }}>
                  {viewingFileRecord.type} - {viewingFileRecord.date || "Recorded"}
                </small>
              </div>
              <button
                onClick={() => setViewingFileRecord(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              {viewingFileRecord.fileData ? (
                viewingFileRecord.fileData.startsWith("data:image") ? (
                  <img
                    src={viewingFileRecord.fileData}
                    alt={viewingFileRecord.title}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "350px",
                      borderRadius: "8px",
                      objectFit: "contain",
                    }}
                  />
                ) : viewingFileRecord.fileData.startsWith("data:application/pdf") || 
                    (viewingFileRecord.fileName && viewingFileRecord.fileName.toLowerCase().endsWith(".pdf")) ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    <iframe
                      src={viewingFileRecord.fileData}
                      title={viewingFileRecord.title || "PDF Viewer"}
                      style={{
                        width: "100%",
                        height: "450px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        background: "#fff",
                      }}
                    />
                    <a
                      href={viewingFileRecord.fileData}
                      download={viewingFileRecord.fileName || "document.pdf"}
                      style={{
                        display: "inline-block",
                        background: "#0d9488",
                        color: "#fff",
                        padding: "8px 18px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      📥 Download PDF File
                    </a>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ margin: "0 0 8px" }}>
                      {viewingFileRecord.fileName || "Attached Document"}
                    </h4>
                    <a
                      href={viewingFileRecord.fileData}
                      download={viewingFileRecord.fileName || "document"}
                      style={{
                        display: "inline-block",
                        background: "#0d9488",
                        color: "#fff",
                        padding: "8px 18px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      Download / View File
                    </a>
                  </div>
                )
              ) : (
                <p style={{ color: "#475569", fontSize: "13px", margin: 0 }}>
                  Clinical record entry logged by {viewingFileRecord.patientName || "Patient"}.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer
        setActiveTab={handleTabChange}
        onOpenAuth={openAuth}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}