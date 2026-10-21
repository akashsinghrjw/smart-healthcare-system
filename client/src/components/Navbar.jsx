import React from "react";
import { FaStethoscope } from "react-icons/fa";

export default function Navbar({
  activeTab,
  setActiveTab,
  isLoggedIn,
  userRole,
  userName,
  onLogout,
  onOpenAuth
}) {
  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    if (activeTab !== "home") {
      setActiveTab("home");
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 35px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 1000 }}>
      {/* Purana Original Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} onClick={() => setActiveTab("home")}>
        <div style={{ background: "#0d9488", color: "#fff", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)" }}>
          <FaStethoscope size={20} />
        </div>
        <div>
          <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f172a" }}>
            AI-Powered Healthcare System
          </div>
          <small style={{ color: "#0d9488", fontSize: "10.5px", fontWeight: "700", letterSpacing: "0.5px" }}>
            SMART HEALTHCARE
          </small>
        </div>
      </div>
      
      {/* Capsule Navigation */}
      <nav style={{ display: "flex", gap: "4px", alignItems: "center", background: "#f8fafc", padding: "4px 6px", borderRadius: "9999px", border: "1px solid #e2e8f0" }}>
        <a 
          href="#home" 
          onClick={(e) => handleScrollTo(e, "home")}
          style={{ 
            padding: "6px 18px", 
            borderRadius: "9999px", 
            background: activeTab === "home" ? "#0d9488" : "transparent", 
            color: activeTab === "home" ? "#fff" : "#334155", 
            textDecoration: "none", 
            fontWeight: "600", 
            fontSize: "13.5px",
            transition: "all 0.3s ease"
          }}
        >
          Home
        </a>

        {/* Agar login nahi hai tabhi baaki options (Patient Portal, Features, About, Contact) dikhenge */}
        {!isLoggedIn && (
          <>
            <button 
              onClick={() => onOpenAuth("login", "patient")} 
              style={{ 
                padding: "6px 18px", 
                borderRadius: "9999px", 
                background: "transparent", 
                color: "#334155", 
                border: "none", 
                fontWeight: "600", 
                cursor: "pointer", 
                fontSize: "13.5px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#ccfbf1";
                e.target.style.color = "#0f766e";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#334155";
              }}
            >
              Patient Portal
            </button>

            <a 
              href="#features" 
              onClick={(e) => handleScrollTo(e, "features")}
              style={{ 
                padding: "6px 18px", 
                borderRadius: "9999px", 
                background: "transparent", 
                color: "#334155", 
                textDecoration: "none", 
                fontWeight: "600", 
                fontSize: "13.5px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#ccfbf1";
                e.target.style.color = "#0f766e";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#334155";
              }}
            >
              Features
            </a>

            <a 
              href="#about" 
              onClick={(e) => handleScrollTo(e, "about")}
              style={{ 
                padding: "6px 18px", 
                borderRadius: "9999px", 
                background: "transparent", 
                color: "#334155", 
                textDecoration: "none", 
                fontWeight: "600", 
                fontSize: "13.5px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#ccfbf1";
                e.target.style.color = "#0f766e";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#334155";
              }}
            >
              About
            </a>

            <a 
              href="#contact" 
              onClick={(e) => handleScrollTo(e, "contact")}
              style={{ 
                padding: "6px 18px", 
                borderRadius: "9999px", 
                background: "transparent", 
                color: "#334155", 
                textDecoration: "none", 
                fontWeight: "600", 
                fontSize: "13.5px",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#ccfbf1";
                e.target.style.color = "#0f766e";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#334155";
              }}
            >
              Contact
            </a>
          </>
        )}
      </nav>

      {/* Auth / User Profile Actions */}
      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        {isLoggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#f8fafc", padding: "6px 14px", borderRadius: "999px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#0f172a" }}>
              Hi, {userName}
            </span>
            {/* Teal Green Logout Button */}
            <button
              onClick={onLogout}
              style={{
                padding: "6px 16px",
                background: "#ccfbf1",
                color: "#0f766e",
                border: "1px solid #99f6e4",
                borderRadius: "9999px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "13px",
                boxShadow: "0 2px 6px rgba(13, 148, 136, 0.15)",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#0d9488";
                e.target.style.color = "#ffffff";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#ccfbf1";
                e.target.style.color = "#0f766e";
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => onOpenAuth("register", "patient")}
              style={{
                padding: "8px 20px",
                background: "#ccfbf1",
                color: "#0f766e",
                border: "1px solid #99f6e4",
                borderRadius: "9999px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#99f6e4";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#ccfbf1";
                e.target.style.transform = "scale(1)";
              }}
            >
              Register
            </button>

            <button
              onClick={() => onOpenAuth("login", "patient")}
              style={{
                padding: "8px 20px",
                background: "#0d9488",
                color: "#ffffff",
                border: "none",
                borderRadius: "9999px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#0f766e";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#0d9488";
                e.target.style.transform = "scale(1)";
              }}
            >
              Login
            </button>
          </>
        )}
      </div>
    </header>
  );
}