import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { FaTimes } from "react-icons/fa";

// Authorized Project Owner Credentials
const MASTER_ADMIN_EMAIL = "admin@hospital.com";
const MASTER_ADMIN_PASS = "admin123";

export default function AuthModal({
  showAuthModal,
  setShowAuthModal,
  authMode = "login",
  setAuthMode,
  authRole = "patient",
  onLoginSuccess
}) {
  const isAdminModal = authRole === "admin";
  const [isLogin, setIsLogin] = useState(isAdminModal ? true : authMode === "login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminModal) {
      setIsLogin(true);
    } else {
      setIsLogin(authMode === "login");
    }
  }, [authMode, isAdminModal]);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setError("");
    if (setShowAuthModal) setShowAuthModal(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const inputEmail = formData.email.trim().toLowerCase();
    const inputPass = formData.password.trim();

    // 1. MASTER ADMIN DIRECT LOGIN CHECK
    if (isAdminModal) {
      if (inputEmail === MASTER_ADMIN_EMAIL && inputPass === MASTER_ADMIN_PASS) {
        const adminToken = "authorized_admin_token_" + Date.now();
        const adminName = "Hospital Administrator";

        localStorage.setItem("token", adminToken);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("userName", adminName);
        localStorage.setItem("userEmail", MASTER_ADMIN_EMAIL);
        localStorage.setItem("userPhone", "9876543210");

        if (onLoginSuccess) {
          onLoginSuccess("admin", adminName, MASTER_ADMIN_EMAIL, "9876543210");
        }

        setLoading(false);
        handleClose();
        return;
      } else {
        setLoading(false);
        setError("Invalid Admin Credentials! Kripya sahi email aur password bharein.");
        return;
      }
    }

    // 2. REGULAR PATIENT LOGIN / REGISTER
    try {
      let res;
      if (isLogin) {
        res = await api.login({
          email: inputEmail,
          password: inputPass
        });
      } else {
        res = await api.register({
          name: formData.name.trim(),
          email: inputEmail,
          password: inputPass,
          phone: formData.phone.trim(),
          role: "patient"
        });
      }

      if (res && res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("userRole", "patient");
        localStorage.setItem("userName", res.name || formData.name || "Patient");
        localStorage.setItem("userEmail", res.email || inputEmail);
        localStorage.setItem("userPhone", formData.phone || "");

        if (onLoginSuccess) {
          onLoginSuccess(
            "patient",
            res.name || formData.name || "Patient",
            res.email || inputEmail,
            formData.phone || ""
          );
        }

        handleClose();
      } else {
        throw new Error("Authentication failed. Invalid response from server.");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
        padding: "20px"
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "30px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, color: "#0f172a", fontSize: "20px", fontWeight: "800" }}>
              {isAdminModal ? "Admin Console Login" : (isLogin ? "Welcome Back" : "Create Patient Account")}
            </h2>
            <small style={{ color: "#0d9488", fontWeight: "700", textTransform: "uppercase", fontSize: "11px" }}>
              {isAdminModal ? "Hospital Admin Portal" : "Smart Healthcare Portal"}
            </small>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {!isLogin && !isAdminModal && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>
              {isAdminModal ? "Authorized Admin Email" : "Email Address"}
            </label>
            <input
              type="email"
              name="email"
              placeholder={isAdminModal ? "admin@hospital.com" : "example@mail.com"}
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "5px" }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#0d9488",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "8px"
            }}
          >
            {loading ? "Authenticating..." : isAdminModal ? "Secure Admin Sign In" : isLogin ? "Sign In" : "Register Account"}
          </button>
        </form>

        {!isAdminModal && (
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#64748b" }}>
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                if (setAuthMode) setAuthMode(isLogin ? "register" : "login");
                setError("");
              }}
              style={{ background: "none", border: "none", color: "#0d9488", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
            >
              {isLogin ? "Register Now" : "Login Here"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}