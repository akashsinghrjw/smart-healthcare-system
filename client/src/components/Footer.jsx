import React from "react";
import { FaHeartbeat, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

export default function Footer({ setActiveTab, onOpenAuth, isLoggedIn }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHomeClick = () => {
    if (setActiveTab) setActiveTab("home");
    scrollToTop();
  };

  const handlePortalClick = () => {
    if (isLoggedIn && setActiveTab) {
      setActiveTab("portal");
      scrollToTop();
    } else if (onOpenAuth) {
      onOpenAuth("login", "patient");
    } else {
      scrollToTop();
    }
  };

  return (
    <footer
      style={{
        background: "#0b1329",
        color: "#94a3b8",
        borderTop: "1px solid #1e293b",
        padding: "24px 20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "18px"
        }}
      >
        {/* BRAND LOGO & TITLE */}
        <div
          onClick={handleHomeClick}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px"
            }}
          >
            <FaHeartbeat />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#ffffff" }}>
              AI-Powered <span style={{ color: "#2dd4bf" }}>Healthcare System</span>
            </h4>
            <small style={{ fontSize: "10.5px", color: "#64748b" }}>SMART CLINICAL PORTAL</small>
          </div>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13.5px" }}>
          <button
            onClick={handleHomeClick}
            style={{
              background: "none",
              border: "none",
              color: "#e2e8f0",
              fontWeight: "600",
              cursor: "pointer",
              padding: 0
            }}
            onMouseEnter={(e) => (e.target.style.color = "#2dd4bf")}
            onMouseLeave={(e) => (e.target.style.color = "#e2e8f0")}
          >
            Home
          </button>

          <button
            onClick={handlePortalClick}
            style={{
              background: "none",
              border: "none",
              color: "#e2e8f0",
              fontWeight: "600",
              cursor: "pointer",
              padding: 0
            }}
            onMouseEnter={(e) => (e.target.style.color = "#2dd4bf")}
            onMouseLeave={(e) => (e.target.style.color = "#e2e8f0")}
          >
            Patient Portal
          </button>

          <a
            href="mailto:support@smarthealthcare.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#38bdf8",
              textDecoration: "none",
              fontWeight: "600"
            }}
          >
            <FaEnvelope size={13} /> support@smarthealthcare.com
          </a>

          <a
            href="tel:108"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#f87171",
              textDecoration: "none",
              fontWeight: "700"
            }}
          >
            <FaPhoneAlt size={12} /> Helpline: 108
          </a>
        </div>

        {/* FULL PROJECT COPYRIGHT */}
        <div style={{ fontSize: "12.5px", color: "#64748b" }}>
          © {new Date().getFullYear()} <strong>AI-Powered Healthcare System</strong>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}