import React from "react";
import { FaStethoscope, FaUserCircle, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";

export default function Navbar({ activeTab, setActiveTab, isLoggedIn, userRole, userName, onLogout, onOpenAuth }) {
  return (
    <header style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setActiveTab("home")}>
        <div style={{ width: "42px", height: "42px", background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)", color: "#ffffff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
          <FaStethoscope />
        </div>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>AI-Powered Healthcare System</h2>
          <span style={{ fontSize: "11px", color: "#0d9488", fontWeight: "700" }}>SMART HEALTHCARE</span>
        </div>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <button style={{ background: "none", border: "none", fontSize: "14.5px", fontWeight: "600", color: activeTab === "home" ? "#0d9488" : "#64748b", borderBottom: activeTab === "home" ? "2px solid #0d9488" : "none", cursor: "pointer", padding: "6px 2px" }} onClick={() => setActiveTab("home")}>
          Home
        </button>
        <button
          style={{ background: "none", border: "none", fontSize: "14.5px", fontWeight: "600", color: activeTab === "portal" ? "#0d9488" : "#64748b", borderBottom: activeTab === "portal" ? "2px solid #0d9488" : "none", cursor: "pointer", padding: "6px 2px" }}
          onClick={() => {
            if (isLoggedIn) setActiveTab("portal");
            else onOpenAuth("login", "patient");
          }}
        >
          {userRole === "admin" ? "Hospital Admin" : "Patient Portal"}
        </button>
      </nav>

      <div>
        {isLoggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#f1f5f9", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaUserCircle color="#0d9488" size={16} />
              <span>{userName}</span>
              <span style={{ background: userRole === "admin" ? "#6366f1" : "#0d9488", color: "#ffffff", fontSize: "9px", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>{userRole}</span>
            </div>
            <button onClick={onLogout} style={{ background: "#fee2e2", color: "#ef4444", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ background: "#ffffff", color: "#0d9488", border: "1.5px solid #0d9488", padding: "8px 16px", borderRadius: "999px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }} onClick={() => onOpenAuth("register", "patient")}>
              Register
            </button>
            <button style={{ background: "#0d9488", color: "#ffffff", border: "none", padding: "9px 20px", borderRadius: "999px", fontWeight: "600", cursor: "pointer", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={() => onOpenAuth("login", "patient")}>
              <FaSignInAlt /> Login
            </button>
          </div>
        )}
      </div>
    </header>
  );
}