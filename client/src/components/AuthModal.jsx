
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { FaTimes } from "react-icons/fa";

export default function AuthModal({
  showAuthModal,
  setShowAuthModal,
  authMode = "login",
  setAuthMode,
  authRole = "patient",
  onLoginSuccess,
}) {
  const isAdminModal = authRole === "admin";

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLogin(isAdminModal || authMode === "login");
    setError("");
  }, [authMode, isAdminModal, showAuthModal]);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setError("");
    setShowAuthModal(false);
  };

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    try {
      let response;

      if (isLogin) {
        response = await api.login({ email, password });
      } else {
        response = await api.register({
          name: formData.name.trim(),
          email,
          password,
          phone: formData.phone.trim(),
          role: "patient",
        });
      }

      if (!response?.token) {
        throw new Error("Backend did not return an authentication token.");
      }

      const role = String(response.role || "patient").toLowerCase();

      if (isAdminModal && role !== "admin") {
        throw new Error(
          "This account is not an administrator account."
        );
      }

      if (!isAdminModal && role === "admin") {
        throw new Error(
          "Please use the Hospital Admin Portal for this account."
        );
      }

      const name = response.name || formData.name.trim() || "Patient";
      const userEmail = response.email || email;
      const phone = response.phone || formData.phone.trim() || "";

      localStorage.setItem("token", response.token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("userPhone", phone);

      onLoginSuccess?.(role, name, userEmail, phone);

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      handleClose();
    } catch (err) {
      console.error("Authentication failed:", err.message);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "5px",
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
        padding: "20px",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "30px",
          width: "100%",
          maxWidth: "420px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: "#0f172a", fontSize: "20px" }}>
              {isAdminModal
                ? "Admin Console Login"
                : isLogin
                  ? "Welcome Back"
                  : "Create Patient Account"}
            </h2>
            <small style={{ color: "#0d9488", fontWeight: 700 }}>
              {isAdminModal
                ? "Hospital Admin Portal"
                : "Smart Healthcare Portal"}
            </small>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            style={{
              border: 0,
              background: "none",
              cursor: "pointer",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "14px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          {!isLogin && !isAdminModal && (
            <>
              <div>
                <label htmlFor="auth-name" style={labelStyle}>
                  Full Name
                </label>
                <input
                  id="auth-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="auth-phone" style={labelStyle}>
                  Phone Number
                </label>
                <input
                  id="auth-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Mobile number"
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" style={labelStyle}>
              Email Address
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="username"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="auth-password" style={labelStyle}>
              Password
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              background: "#0d9488",
              color: "#fff",
              border: 0,
              borderRadius: "8px",
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading
              ? "Authenticating..."
              : isAdminModal
                ? "Secure Admin Sign In"
                : isLogin
                  ? "Sign In"
                  : "Register Account"}
          </button>
        </form>

        {!isAdminModal && (
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <button
              type="button"
              onClick={() => {
                const nextMode = isLogin ? "register" : "login";
                setIsLogin(!isLogin);
                setAuthMode?.(nextMode);
                setError("");
              }}
              style={{
                border: 0,
                background: "none",
                color: "#0d9488",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {isLogin ? "Register Now" : "Login Here"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
