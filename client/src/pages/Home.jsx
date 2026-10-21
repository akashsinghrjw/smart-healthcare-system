import React, { useState } from "react";
import AuthModal from "../components/AuthModal";
import {
  FaRobot,
  FaFolderOpen,
  FaPills,
  FaShieldAlt,
  FaPhoneAlt,
  FaArrowRight,
  FaUserMd
} from "react-icons/fa";

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
  const [supportName, setSupportName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportQuery, setSupportQuery] = useState("");
  const [trackTicketId, setTrackTicketId] = useState("");
  const [ticketStatusMsg, setTicketStatusMsg] = useState("");

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportQuery) return;
    const generatedId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    alert(`Aapki query submit ho gayi hai!\nTicket ID: ${generatedId}`);
    setSupportName("");
    setSupportEmail("");
    setSupportQuery("");
  };

  const handleTrackTicket = () => {
    if (!trackTicketId.trim()) return;
    setTicketStatusMsg(`Ticket [${trackTicketId}]: Active & In Review by admin support team.`);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* 1. HERO SECTION */}
      <section id="home" style={{ maxWidth: "1240px", margin: "0 auto", padding: "60px 24px 50px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "40px", alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f0fdfa", border: "1px solid #ccfbf1", padding: "6px 14px", borderRadius: "999px", color: "#0d9488", fontSize: "12px", fontWeight: "700", marginBottom: "18px" }}>
            <FaShieldAlt /> ADVANCED CLINICAL AI PORTAL
          </div>
          
          <h1 style={{ fontSize: "44px", fontWeight: "900", lineHeight: "1.15", margin: "0 0 16px", color: "#0f172a" }}>
            AI-Powered <span style={{ color: "#0d9488" }}>Healthcare System</span>
          </h1>
          
          <p style={{ fontSize: "16px", color: "#475569", lineHeight: "1.6", margin: "0 0 28px", maxWidth: "520px" }}>
            A digital clinical ecosystem engineered to streamline patient triage, secure personal medical records vault with real document uploads, and empower hospital administration.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                if (isLoggedIn) setActiveTab("portal");
                else {
                  setAuthMode("login");
                  setAuthRole("patient");
                  setShowAuthModal(true);
                }
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)", color: "#ffffff", border: "none", padding: "14px 28px", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 14px rgba(13,148,136,0.25)" }}
            >
              Access Healthcare Portal <FaArrowRight />
            </button>

            <button
              onClick={() => {
                setAuthMode("login");
                setAuthRole("admin");
                setShowAuthModal(true);
              }}
              style={{ background: "#ffffff", color: "#0f172a", border: "1.5px solid #cbd5e1", padding: "14px 24px", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}
            >
              Hospital Admin Portal
            </button>
          </div>
        </div>

        {/* Clinical Console Preview Card */}
        <div style={{ background: "#ffffff", borderRadius: "24px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaUserMd color="#0d9488" /> Clinical Consultation Desk
            </span>
            <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "999px" }}>
              ● 24/7 Active
            </span>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0d9488 0%, #0e7490 100%)", borderRadius: "14px", padding: "20px", color: "#ffffff", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <FaRobot size={22} />
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Smart Healthcare AI Assistant</h4>
            </div>
            <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
              Powered by Gemini Clinical Reasoning
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <b style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Instant Triage</b>
              <small style={{ color: "#64748b" }}>Gemini Clinical AI</small>
            </div>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <b style={{ display: "block", fontSize: "13px", color: "#0f172a" }}>Digital Vault</b>
              <small style={{ color: "#64748b" }}>Device Docs Upload</small>
            </div>
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 14px", borderRadius: "10px", marginTop: "12px", fontSize: "13px" }}>
            <b>Patient Portal Access:</b> AI symptom triage, health vault, and medicine schedule.
          </div>
          
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 14px", borderRadius: "10px", marginTop: "10px", fontSize: "13px" }}>
            <b>Hospital Admin Portal:</b> Inspect patient database, review uploaded files, and resolve queries.
          </div>
        </div>
      </section>

      {/* 2. CORE FEATURES SECTION (id="features") */}
      <section id="features" style={{ maxWidth: "1240px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "38px" }}>
          <div style={{ display: "inline-block", background: "#f0fdfa", color: "#0d9488", padding: "4px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
            Ecosystem Highlights
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
            Integrated Healthcare Capabilities
          </h2>
          <p style={{ color: "#64748b", fontSize: "15px", margin: "0 auto", maxWidth: "620px", lineHeight: "1.6" }}>
            Empowering patients with smart clinical triage, encrypted medical records, and precision dosage management.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "26px" }}>
          
          {/* CARD 1 */}
          <div style={{ background: "linear-gradient(180deg, #f0fdfa 0%, #ffffff 60%)", border: "1.5px solid #ccfbf1", borderRadius: "20px", padding: "28px", boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(13, 148, 136, 0.25)" }}>
                  <FaRobot size={24} />
                </div>
                <span style={{ background: "#ccfbf1", color: "#0f766e", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "999px" }}>
                  AI-POWERED
                </span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px" }}>
                AI Symptom Triage Desk
              </h3>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0 0 18px" }}>
                Natural language symptom evaluation using Google Gemini 1.5 Flash. Instantly categorizes clinical urgency levels and flags emergency risks.
              </p>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #ccfbf1", borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span>
              <span style={{ fontSize: "12.5px", color: "#0f766e", fontWeight: "700" }}>Gemini 1.5 Flash Reasoning</span>
            </div>
          </div>

          {/* CARD 2 */}
          <div style={{ background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 60%)", border: "1.5px solid #bae6fd", borderRadius: "20px", padding: "28px", boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(2, 132, 199, 0.25)" }}>
                  <FaFolderOpen size={24} />
                </div>
                <span style={{ background: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "999px" }}>
                  ENCRYPTED
                </span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px" }}>
                Encrypted Records Vault
              </h3>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0 0 18px" }}>
                Centralized vault for lab reports, doctor prescriptions, and discharge summaries with immediate in-browser document preview and export.
              </p>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #bae6fd", borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0284c7" }}></span>
              <span style={{ fontSize: "12.5px", color: "#0369a1", fontWeight: "700" }}>Cloud MongoDB Atlas Sync</span>
            </div>
          </div>

          {/* CARD 3 */}
          <div style={{ background: "linear-gradient(180deg, #fffbeb 0%, #ffffff 60%)", border: "1.5px solid #fde68a", borderRadius: "20px", padding: "28px", boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(217, 119, 6, 0.25)" }}>
                  <FaPills size={24} />
                </div>
                <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "11px", fontWeight: "800", padding: "4px 10px", borderRadius: "999px" }}>
                  ADHERENCE
                </span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px" }}>
                Smart Medication Tracker
              </h3>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0 0 18px" }}>
                Prescription dose scheduler with routine reminders, morning/night intervals, and interactive Taken/Pending adherence checklists.
              </p>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #fde68a", borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }}></span>
              <span style={{ fontSize: "12.5px", color: "#b45309", fontWeight: "700" }}>Daily Compliance Tracking</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW THE PLATFORM WORKS / ABOUT SECTION (id="about") */}
      <section id="about" style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "50px 24px" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "#ccfbf1", color: "#0f766e", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", marginBottom: "10px" }}>
            PROJECT INFORMATION & WORKFLOW
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 30px", color: "#0f172a" }}>How The Platform Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px" }}>
            <div style={{ textAlign: "left", background: "#f8fafc", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <div style={stepCircleStyle}>1</div>
              <h4 style={{ margin: "14px 0 6px", fontSize: "16px", color: "#0f172a" }}>Register & Create Profile</h4>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Sign up securely and modify your physical bio data parameters in-app.</p>
            </div>
            <div style={{ textAlign: "left", background: "#f8fafc", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <div style={stepCircleStyle}>2</div>
              <h4 style={{ margin: "14px 0 6px", fontSize: "16px", color: "#0f172a" }}>Upload Docs & Setup Doses</h4>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Upload diagnosis files in vault and check everyday medicine timers.</p>
            </div>
            <div style={{ textAlign: "left", background: "#f8fafc", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
              <div style={stepCircleStyle}>3</div>
              <h4 style={{ margin: "14px 0 6px", fontSize: "16px", color: "#0f172a" }}>Interact With Clinical AI</h4>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>Obtain reliable triage suggestions based on symptom prompts instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EMERGENCY SOS DISPATCH BAR */}
      <section style={{ maxWidth: "1240px", margin: "40px auto 20px", padding: "0 24px" }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "16px", padding: "24px 30px", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ background: "#ef4444", color: "#ffffff", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "800" }}>SOS DISPATCH</span>
            <h3 style={{ margin: "6px 0 2px", fontSize: "20px", fontWeight: "800" }}>24/7 Emergency Medical Helpline</h3>
            <small style={{ color: "#94a3b8" }}>Direct connection for instant ambulance and hospital support.</small>
          </div>
          <a
            href="tel:108"
            style={{ background: "#ef4444", color: "#ffffff", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <FaPhoneAlt /> Call 108
          </a>
        </div>
      </section>

      {/* 5. SUPPORT & GRIEVANCE DESK / CONTACT SECTION (id="contact") */}
      <section id="contact" style={{ maxWidth: "1240px", margin: "20px auto 60px", padding: "0 24px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
          <div>
            <span style={{ color: "#0d9488", fontWeight: "700", fontSize: "12px" }}>SUPPORT & GRIEVANCE DESK</span>
            <h3 style={{ margin: "6px 0 10px", fontSize: "22px", color: "#0f172a" }}>Have Any Query?</h3>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5" }}>
              Aap yahan se apni problem submit kar sakte hain aur submit karne ke baad usi ticket ID se status track kar sakte hain!
            </p>
            <div style={{ marginTop: "20px" }}>
              <input
                type="text"
                placeholder="Ticket ID (e.g. TKT-123456)"
                value={trackTicketId}
                onChange={(e) => setTrackTicketId(e.target.value)}
                style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginRight: "8px", fontSize: "13px" }}
              />
              <button
                onClick={handleTrackTicket}
                style={{ padding: "10px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
              >
                Track Ticket Status
              </button>
            </div>
            {ticketStatusMsg && <p style={{ color: "#0d9488", fontWeight: "600", fontSize: "13px", marginTop: "10px" }}>{ticketStatusMsg}</p>}
          </div>

          <form onSubmit={handleSupportSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Your Name"
                value={supportName}
                onChange={(e) => setSupportName(e.target.value)}
                required
                style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                required
                style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
            </div>
            <textarea
              placeholder="Describe your query..."
              rows="4"
              value={supportQuery}
              onChange={(e) => setSupportQuery(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", resize: "none", boxSizing: "border-box" }}
            />
            <button
              type="submit"
              style={{ background: "#0d9488", color: "#ffffff", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
            >
              Submit Query
            </button>
          </form>
        </div>
      </section>

      {/* AUTH MODAL CONTAINER */}
      <AuthModal
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authRole={authRole}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
}

const stepCircleStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#0d9488",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
  fontSize: "16px"
};