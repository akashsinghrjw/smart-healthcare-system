// src/pages/Home.jsx
import React, { useState } from "react";
import {
  FaHeartbeat,
  FaRobot,
  FaFileMedicalAlt,
  FaArrowRight,
  FaUserMd,
  FaAmbulance,
  FaPaperPlane,
  FaCheckCircle,
  FaHeadset,
  FaSearch
} from "react-icons/fa";
import AuthModal from "../components/AuthModal";
import { safeLoad } from "../utils/storage";

export default function Home({
  isLoggedIn,
  setActiveTab,
  showAuthModal,
  setShowAuthModal,
  authMode,
  setAuthMode,
  authRole,
  setAuthRole,
  onLoginSuccess
}) {
  const [supportTab, setSupportTab] = useState("submit");
  const [queryData, setQueryData] = useState({ name: "", email: "", msg: "" });
  const [ticketId, setTicketId] = useState(null);
  const [sosAlert, setSosAlert] = useState(null);

  const [trackInput, setTrackInput] = useState("");
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [trackError, setTrackError] = useState("");

  const triggerAuth = (mode, role) => {
    setAuthMode(mode);
    setAuthRole(role);
    setShowAuthModal(true);
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (!queryData.name.trim() || !queryData.email.trim() || !queryData.msg.trim()) return;

    const generatedId = "MED-" + Math.floor(100000 + Math.random() * 900000);
    const newTicket = {
      id: Date.now(),
      ticketId: generatedId,
      name: queryData.name.trim(),
      email: queryData.email.trim(),
      msg: queryData.msg.trim(),
      status: "PENDING",
      adminReply: "",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      resolvedAt: ""
    };

    const currentTickets = safeLoad("support_tickets_list");
    const updated = [newTicket, ...currentTickets];
    localStorage.setItem("support_tickets_list", JSON.stringify(updated));

    setTicketId(generatedId);
    setQueryData({ name: "", email: "", msg: "" });
  };

  const handleTrackTicket = (e) => {
    e.preventDefault();
    setTrackError("");
    setTrackedTicket(null);
    const q = (trackInput || "").trim().toLowerCase();
    if (!q) return;

    const currentTickets = safeLoad("support_tickets_list");
    const found = currentTickets.find(
      (t) => (t?.ticketId || "").toLowerCase() === q || (t?.email || "").toLowerCase() === q
    );

    if (found) {
      setTrackedTicket(found);
    } else {
      setTrackError("Ticket ID ya Email database me nahi mila!");
    }
  };

  return (
    <main>
      {/* HERO SECTION */}
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "60px 24px 50px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "48px" }}>
        <div style={{ flex: 1.2 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#e6f7f5", color: "#0d9488", padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", marginBottom: "16px" }}>
            <FaHeartbeat /> ADVANCED CLINICAL AI PORTAL
          </span>
          <h1 style={{ fontSize: "44px", lineHeight: "1.2", fontWeight: "800", marginBottom: "18px", color: "#0f172a" }}>
            AI-Powered <span style={{ color: "#0d9488" }}>Healthcare System</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.7", marginBottom: "28px", maxWidth: "580px" }}>
            A digital clinical ecosystem engineered to streamline patient triage, secure personal medical records vault with real document uploads, and empower hospital administration.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              style={{ background: "#0d9488", color: "#ffffff", border: "none", padding: "11px 24px", borderRadius: "999px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px" }}
              onClick={() => {
                if (isLoggedIn) setActiveTab("portal");
                else triggerAuth("login", "patient");
              }}
            >
              {isLoggedIn ? "Open Dashboard" : "Access Healthcare Portal"} <FaArrowRight />
            </button>
            <button
              style={{ background: "#ffffff", color: "#0d9488", border: "1.5px solid #0d9488", padding: "9px 20px", borderRadius: "999px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
              onClick={() => triggerAuth("login", "admin")}
            >
              Hospital Admin Portal
            </button>
          </div>
        </div>

        <div style={{ flex: 0.95, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "24px", padding: "28px", boxShadow: "0 12px 30px rgba(0, 0, 0, 0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaUserMd color="#0d9488" size={18} />
              <strong style={{ fontSize: "14px" }}>Clinical Consultation Desk</strong>
            </div>
            <span style={{ background: "#dcfce7", color: "#16a34a", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>
              ● 24/7 Active
            </span>
          </div>

          <div
            style={{ background: "#0d9488", borderRadius: "16px", padding: "18px", color: "#ffffff", display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px", cursor: "pointer" }}
            onClick={() => {
              if (isLoggedIn) setActiveTab("portal");
              else triggerAuth("login", "patient");
            }}
          >
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}><FaRobot /></div>
            <div>
              <h4 style={{ fontSize: "15px", margin: 0 }}>Smart Healthcare AI Assistant</h4>
              <span style={{ fontSize: "12px", opacity: 0.9 }}>Powered by Gemini Clinical Reasoning</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 14px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              onClick={() => {
                if (isLoggedIn) setActiveTab("portal");
                else triggerAuth("login", "patient");
              }}
            >
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#e6f7f5", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                <FaRobot />
              </div>
              <div>
                <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>Instant Triage</strong>
                <small style={{ fontSize: "11px", color: "#64748b" }}>Gemini Clinical AI</small>
              </div>
            </div>

            <div
              style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", padding: "12px 14px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              onClick={() => {
                if (isLoggedIn) setActiveTab("portal");
                else triggerAuth("login", "patient");
              }}
            >
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#ffedd5", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                <FaFileMedicalAlt />
              </div>
              <div>
                <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>Digital Vault</strong>
                <small style={{ fontSize: "11px", color: "#64748b" }}>Device Docs Upload</small>
              </div>
            </div>
          </div>

          <div
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 14px", cursor: "pointer", marginBottom: "8px" }}
            onClick={() => {
              if (isLoggedIn) setActiveTab("portal");
              else triggerAuth("login", "patient");
            }}
          >
            <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>Patient Portal Access</strong>
            <small style={{ color: "#64748b" }}>AI symptom triage, health vault, and medicine schedule.</small>
          </div>

          <div
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 14px", cursor: "pointer" }}
            onClick={() => triggerAuth("login", "admin")}
          >
            <strong style={{ fontSize: "13px", color: "#0f172a", display: "block" }}>Hospital Admin Portal</strong>
            <small style={{ color: "#64748b" }}>Inspect patient database, review uploaded files, and resolve queries.</small>
          </div>
        </div>
      </section>

      {/* EMERGENCY HELPLINE */}
      <section style={{ maxWidth: "1240px", margin: "40px auto", padding: "0 24px" }}>
        <div style={{ background: "#0f172a", color: "#ffffff", borderRadius: "18px", padding: "28px 34px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ background: "#ef4444", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>SOS DISPATCH</span>
            <h3 style={{ fontSize: "18px", margin: "6px 0 2px" }}>24/7 Emergency Medical Helpline</h3>
            <p style={{ fontSize: "13px", color: "#94a3b8" }}>Direct connection for instant ambulance and hospital support.</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "9px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={() => setSosAlert({ name: "National Ambulance", num: "108" })}>
              <FaAmbulance /> Call 108
            </button>
          </div>
        </div>
      </section>

      {/* HELPDESK & QUERY TRACKING TABS */}
      <section style={{ maxWidth: "1240px", margin: "40px auto 60px", padding: "0 24px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "34px", display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "36px" }}>
          <div>
            <span style={{ color: "#0d9488", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase" }}>Support & Grievance Desk</span>
            <h3 style={{ fontSize: "20px", color: "#0f172a", margin: "8px 0 10px" }}>Have Any Query?</h3>
            <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: "1.6", marginBottom: "14px" }}>
              Aap yahan se apni problem submit kar sakte hain aur submit karne ke baad usi ticket ID se status track kar sakte hain!
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155", fontSize: "13px", marginBottom: "16px" }}>
              <FaHeadset color="#0d9488" size={16} />
              <span>support@smarthealthcare.com</span>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: supportTab === "submit" ? "1.5px solid #0d9488" : "1px solid #cbd5e1",
                  background: supportTab === "submit" ? "#e6f7f5" : "#ffffff",
                  color: supportTab === "submit" ? "#0d9488" : "#64748b",
                  fontWeight: "700",
                  fontSize: "12.5px",
                  cursor: "pointer"
                }}
                onClick={() => { setSupportTab("submit"); setTrackError(""); }}
              >
                Submit Query
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: supportTab === "track" ? "1.5px solid #0d9488" : "1px solid #cbd5e1",
                  background: supportTab === "track" ? "#e6f7f5" : "#ffffff",
                  color: supportTab === "track" ? "#0d9488" : "#64748b",
                  fontWeight: "700",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={() => {
                  setSupportTab("track");
                  setTrackInput("");
                  setTrackedTicket(null);
                  setTrackError("");
                }}
              >
                <FaSearch size={12} /> Track Ticket Status
              </button>
            </div>
          </div>

          {/* SUBMIT / TRACK FORM */}
          {supportTab === "submit" ? (
            <div>
              {ticketId ? (
                <div style={{ background: "#dcfce7", color: "#166534", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
                  <FaCheckCircle size={30} style={{ marginBottom: "6px" }} />
                  <h4 style={{ margin: 0 }}>Query Submitted to Admin Desk!</h4>
                  <p style={{ fontSize: "13px", marginTop: "4px" }}>
                    Your Ticket ID: <strong style={{ background: "#ffffff", padding: "2px 8px", borderRadius: "4px", border: "1px solid #86efac" }}>{ticketId}</strong>
                  </p>
                  <button
                    style={{ background: "#ffffff", color: "#15803d", border: "1px solid #86efac", padding: "6px 14px", borderRadius: "999px", fontSize: "12px", cursor: "pointer", marginTop: "10px" }}
                    onClick={() => { setTicketId(null); setQueryData({ name: "", email: "", msg: "" }); }}
                  >
                    ← New Query Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuerySubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input style={{ padding: "9px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }} placeholder="Your Name" value={queryData.name} onChange={(e) => setQueryData({ ...queryData, name: e.target.value })} required />
                  <input style={{ padding: "9px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }} type="email" placeholder="Your Email" value={queryData.email} onChange={(e) => setQueryData({ ...queryData, email: e.target.value })} required />
                  <textarea style={{ gridColumn: "span 2", padding: "9px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }} rows="3" placeholder="Describe your query..." value={queryData.msg} onChange={(e) => setQueryData({ ...queryData, msg: e.target.value })} required />
                  <button type="submit" style={{ gridColumn: "span 2", background: "#0d9488", color: "#ffffff", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    Submit Query <FaPaperPlane />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div>
              <form onSubmit={handleTrackTicket} style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                <input
                  style={{ flex: 1, padding: "9px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                  placeholder="Enter Ticket ID (e.g. MED-123456) or Email"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  required
                />
                <button type="submit" style={{ background: "#0d9488", color: "#ffffff", border: "none", padding: "0 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <FaSearch /> Track
                </button>
              </form>

              {trackError && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", marginBottom: "10px" }}>{trackError}</div>}

              {trackedTicket && (
                <div style={{ background: "#f8fafc", border: `1.5px solid ${trackedTicket.status === "RESOLVED" ? "#86efac" : "#fde68a"}`, borderRadius: "12px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "700" }}>Ticket: {trackedTicket.ticketId}</span>
                    <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", background: trackedTicket.status === "RESOLVED" ? "#dcfce7" : "#fef3c7", color: trackedTicket.status === "RESOLVED" ? "#15803d" : "#b45309" }}>
                      {trackedTicket.status === "RESOLVED" ? "● SOLVED" : "⏳ PENDING"}
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "#475569" }}>"{trackedTicket.msg}"</p>
                  {trackedTicket.status === "RESOLVED" && (
                    <div style={{ background: "#ffffff", borderLeft: "4px solid #16a34a", padding: "10px 12px", borderRadius: "6px", fontSize: "12.5px" }}>
                      <strong style={{ color: "#166534" }}>Admin Resolution:</strong> {trackedTicket.adminReply}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* REUSABLE AUTH MODAL */}
      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authRole={authRole}
        setAuthRole={setAuthRole}
        onLoginSuccess={onLoginSuccess}
      />

      {/* SOS MODAL */}
      {sosAlert && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }} onClick={() => setSosAlert(null)}>
          <div style={{ background: "#ffffff", width: "90%", maxWidth: "340px", padding: "22px", borderRadius: "14px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <FaAmbulance size={32} color="#ef4444" style={{ marginBottom: "8px" }} />
            <h3 style={{ margin: "0 0 6px" }}>Emergency Helpline</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 12px" }}>Calling {sosAlert.name}</p>
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "8px", borderRadius: "6px", fontWeight: "bold", marginBottom: "14px" }}>
              Helpline: {sosAlert.num}
            </div>
            <button style={{ width: "100%", padding: "8px", border: "none", borderRadius: "6px", background: "#0d9488", color: "#ffffff", fontWeight: "600", cursor: "pointer" }} onClick={() => setSosAlert(null)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}