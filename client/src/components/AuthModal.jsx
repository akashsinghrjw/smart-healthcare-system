// src/components/AuthModal.jsx
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { safeLoad } from "../utils/storage";

export default function AuthModal({
  showAuthModal,
  setShowAuthModal,
  authMode,
  setAuthMode,
  authRole,
  setAuthRole,
  onLoginSuccess
}) {
  const [authError, setAuthError] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  if (!showAuthModal) return null;

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError("");
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setAuthError("Kripya saari details bharein!");
      return;
    }

    const currentUsers = safeLoad("system_registered_users");
    if (currentUsers.some((u) => (u?.email || "").toLowerCase() === regEmail.trim().toLowerCase())) {
      setAuthError("Yeh Email pehle se registered hai!");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim(),
      password: regPassword,
      registeredAt: new Date().toLocaleDateString()
    };

    const updated = [newUser, ...currentUsers];
    localStorage.setItem("system_registered_users", JSON.stringify(updated));

    localStorage.setItem("token", "token_" + newUser.id);
    localStorage.setItem("userRole", "patient");
    localStorage.setItem("userName", newUser.name);
    localStorage.setItem("userEmail", newUser.email);
    localStorage.setItem("userPhone", newUser.phone);

    onLoginSuccess("patient", newUser.name, newUser.email, newUser.phone);
    setShowAuthModal(false);
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegPassword("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");
    const iden = (loginIdentifier || "").trim().toLowerCase();
    const pass = loginPassword;

    if (authRole === "admin") {
      if ((iden === "admin@smarthealthcare.com" || iden === "admin") && pass === "admin123") {
        localStorage.setItem("token", "admin_token");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userName", "Hospital Chief Admin");
        localStorage.setItem("userEmail", "admin@smarthealthcare.com");

        onLoginSuccess("admin", "Hospital Chief Admin", "admin@smarthealthcare.com", "");
        setShowAuthModal(false);
        setLoginIdentifier("");
        setLoginPassword("");
        return;
      } else {
        setAuthError("Galat Admin Details! (Email: admin@smarthealthcare.com | Pass: admin123)");
        return;
      }
    }

    const currentUsers = safeLoad("system_registered_users");
    const user = currentUsers.find(
      (u) => ((u?.email || "").toLowerCase() === iden || (u?.phone || "") === iden) && u?.password === pass
    );

    if (user) {
      localStorage.setItem("token", "token_" + user.id);
      localStorage.setItem("userRole", "patient");
      localStorage.setItem("userName", user.name || "Patient");
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userPhone", user.phone || "");

      onLoginSuccess("patient", user.name || "Patient", user.email || "", user.phone || "");
      setShowAuthModal(false);
      setLoginIdentifier("");
      setLoginPassword("");
    } else {
      setAuthError("Galat Email/Contact ya Password!");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }} onClick={() => setShowAuthModal(false)}>
      <div style={{ background: "#ffffff", width: "90%", maxWidth: "420px", padding: "24px", borderRadius: "16px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "17px", margin: 0 }}>{authMode === "login" ? "Login Portal" : "Create Account"}</h3>
          <button onClick={() => setShowAuthModal(false)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}><FaTimes /></button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button type="button" style={{ flex: 1, padding: "8px", borderRadius: "6px", border: authRole === "patient" ? "1.5px solid #0d9488" : "1px solid #cbd5e1", background: authRole === "patient" ? "#e6f7f5" : "#ffffff", color: authRole === "patient" ? "#0d9488" : "#64748b", fontWeight: "700", cursor: "pointer" }} onClick={() => setAuthRole("patient")}>Patient</button>
          <button type="button" style={{ flex: 1, padding: "8px", borderRadius: "6px", border: authRole === "admin" ? "1.5px solid #6366f1" : "1px solid #cbd5e1", background: authRole === "admin" ? "#e0e7ff" : "#ffffff", color: authRole === "admin" ? "#4338ca" : "#64748b", fontWeight: "700", cursor: "pointer" }} onClick={() => { setAuthRole("admin"); setAuthMode("login"); }}>Hospital Admin</button>
        </div>

        {authError && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px", borderRadius: "6px", fontSize: "12px", marginBottom: "10px" }}>{authError}</div>}

        {authRole === "patient" && (
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "12px" }}>
            <button type="button" style={{ flex: 1, padding: "6px", background: "none", border: "none", borderBottom: authMode === "login" ? "2px solid #0d9488" : "none", color: authMode === "login" ? "#0d9488" : "#64748b", fontWeight: "700", cursor: "pointer" }} onClick={() => { setAuthMode("login"); setAuthError(""); }}>Sign In</button>
            <button type="button" style={{ flex: 1, padding: "6px", background: "none", border: "none", borderBottom: authMode === "register" ? "2px solid #0d9488" : "none", color: authMode === "register" ? "#0d9488" : "#64748b", fontWeight: "700", cursor: "pointer" }} onClick={() => { setAuthMode("register"); setAuthError(""); }}>Sign Up</button>
          </div>
        )}

        {authRole === "patient" && authMode === "register" ? (
          <form onSubmit={handleRegister}>
            <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box" }} placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
            <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box" }} type="email" placeholder="Email Address" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box" }} type="tel" placeholder="Contact Number" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
            <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", marginBottom: "12px", boxSizing: "border-box" }} type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            <button type="submit" style={{ width: "100%", padding: "9px", border: "none", borderRadius: "6px", background: "#0d9488", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}>Register</button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", marginBottom: "8px", boxSizing: "border-box" }} placeholder={authRole === "admin" ? "admin@smarthealthcare.com" : "Email or Phone"} value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required />
            <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", marginBottom: "12px", boxSizing: "border-box" }} type="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            <button type="submit" style={{ width: "100%", padding: "9px", border: "none", borderRadius: "6px", background: "#0d9488", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}>Sign In</button>
          </form>
        )}
      </div>
    </div>
  );
}