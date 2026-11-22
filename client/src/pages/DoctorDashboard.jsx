import React, { useState, useEffect } from "react";
import { FaUserMd, FaCamera, FaSave, FaCheckCircle, FaCalendarCheck, FaUserInjured, FaRupeeSign, FaStethoscope, FaChartPie, FaTimes } from "react-icons/fa";

export default function DoctorDashboard({ userName, userEmail, onNavigateHome }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [profile, setProfile] = useState({
    name: userName || "Doctor",
    phone: "",
    qualification: "MBBS, MD",
    specialization: "General Physician",
    hospital: "Smart Healthcare Hospital",
    location: "Main City",
    fee: 500,
    bio: "",
    profileImage: ""
  });

  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [prescription, setPrescription] = useState("Consultation completed. Take care!");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDoctorWorkspace = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // 1. Fetch Doctor Profile
        const profileRes = await fetch("http://localhost:5000/api/doctors/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data) {
            setProfile(prev => ({
              ...prev,
              name: data.name || prev.name,
              qualification: data.qualification || prev.qualification,
              specialization: data.specialization || prev.specialization,
              hospital: data.hospitalName || prev.hospital,
              location: data.location || prev.location,
              fee: data.fees || prev.fee,
              phone: data.phone || prev.phone,
              profileImage: data.profileImage || prev.profileImage,
              bio: data.bio || prev.bio
            }));
          }
        }

        // 2. Fetch Real Booked Appointments from Backend Database
        const apptRes = await fetch("http://localhost:5000/api/appointments/doctor/appointments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (apptRes.ok) {
          const apptData = await apptRes.json();
          if (Array.isArray(apptData)) {
            setAppointments(apptData.filter(a => a.status !== 'Completed'));
          }
        }
      } catch (err) {
        console.error("Error fetching workspace data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorWorkspace();
  }, [userName]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/doctors/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profile.name,
          qualification: profile.qualification,
          specialization: profile.specialization,
          hospitalName: profile.hospital,
          location: profile.location,
          fees: profile.fee,
          phone: profile.phone,
          profileImage: profile.profileImage,
          bio: profile.bio
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Profile updated successfully!");
      } else {
        throw new Error(data.message || "Failed to save profile.");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!selectedAppt) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apptId = selectedAppt._id || selectedAppt.id;

      const res = await fetch(`http://localhost:5000/api/appointments/${apptId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prescription })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(prev => prev.filter(a => (a._id || a.id) !== apptId));
        setSelectedAppt(null);
        alert("Prescription saved & consultation completed successfully!");
      } else {
        throw new Error(data.message || "Failed to complete consultation.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "13.5px", background: "#f8fafc", outline: "none" };
  const labelStyle = { display: "block", fontSize: "12.5px", fontWeight: 700, color: "#334155", marginBottom: "5px" };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px", color: "#0d9488", fontWeight: "700" }}>Loading Workspace...</div>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#0f172a" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", background: "#ffffff", padding: "20px 24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
        <div>
          <h2 style={{ fontSize: "22px", margin: 0, fontWeight: "800", color: "#0f172a" }}>Doctor Workspace Dashboard</h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>Welcome back, Dr. {profile.name}! Manage your patients & credentials.</p>
        </div>
        <button style={{ background: "#ffffff", color: "#0d9488", border: "1.5px solid #0d9488", padding: "8px 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }} onClick={onNavigateHome}>← Back to Home</button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { id: "dashboard", label: "Overview", icon: <FaChartPie /> },
          { id: "appointments", label: `Appointments (${appointments.length})`, icon: <FaCalendarCheck /> },
          { id: "patients", label: "My Patients", icon: <FaUserInjured /> },
          { id: "profile", label: "Profile Settings", icon: <FaUserMd /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              background: activeTab === tab.id ? "#0d9488" : "#ffffff",
              color: activeTab === tab.id ? "#ffffff" : "#475569",
              border: activeTab === tab.id ? "none" : "1px solid #e2e8f0",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13.5px",
              boxShadow: activeTab === tab.id ? "0 4px 12px rgba(13,148,136,0.25)" : "none"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f0fdfa", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}><FaCalendarCheck size={22} /></div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Total Bookings</span>
                <h3 style={{ fontSize: "22px", margin: "2px 0 0", color: "#0f172a" }}>{appointments.length}</h3>
              </div>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}><FaRupeeSign size={22} /></div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Consultation Fee</span>
                <h3 style={{ fontSize: "22px", margin: "2px 0 0", color: "#0f172a" }}>₹{profile.fee}</h3>
              </div>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}><FaStethoscope size={22} /></div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Status</span>
                <h3 style={{ fontSize: "16px", margin: "6px 0 0", color: "#16a34a", fontWeight: "800" }}>● Online & Active</h3>
              </div>
            </div>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "17px", color: "#0f172a" }}>Recent Patient Appointments</h3>
            {appointments.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "13.5px", textAlign: "center", padding: "30px 0" }}>No real patient appointments booked yet.</p>
            ) : (
              appointments.map(app => (
                <div key={app._id || app.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "14.5px", color: "#0f172a" }}>{app.patientName}</strong>
                    <small style={{ display: "block", color: "#64748b", marginTop: "2px" }}>Email: {app.patientEmail} • Date: {app.date} ({app.time})</small>
                  </div>
                  <button onClick={() => { setSelectedAppt(app); setPrescription("Consultation completed. Take care!"); }} style={{ background: "#0d9488", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "12px" }}>Consult</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS */}
      {activeTab === "appointments" && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>All Booked Patient Appointments</h3>
          {appointments.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "13.5px", textAlign: "center", padding: "40px 0" }}>No appointments found in database.</p>
          ) : (
            appointments.map(app => (
              <div key={app._id || app.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>Token</span>
                  <strong style={{ display: "block", fontSize: "15px", color: "#0f172a", marginTop: "4px" }}>{app.patientName}</strong>
                  <small style={{ color: "#64748b" }}>Email: {app.patientEmail} | Date: {app.date} | Time: {app.time}</small>
                </div>
                <button onClick={() => { setSelectedAppt(app); setPrescription("Consultation completed. Take care!"); }} style={{ background: "#0d9488", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "12.5px" }}>Take Action</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: MY PATIENTS */}
      {activeTab === "patients" && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "18px", color: "#0f172a" }}>My Patients History</h3>
          {appointments.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "13.5px", textAlign: "center", padding: "40px 0" }}>No patient records found.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {appointments.map(app => (
                <div key={app._id || app.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: "16px", color: "#0f172a" }}>{app.patientName}</h4>
                  <p style={{ fontSize: "12.5px", color: "#64748b", margin: "2px 0" }}>Email: {app.patientEmail}</p>
                  <p style={{ fontSize: "12.5px", color: "#0d9488", margin: "6px 0 0", fontWeight: "600" }}>Booked Slot: {app.date} at {app.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "30px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Professional Profile Settings</h3>

          {message && (
            <div style={{ background: message.includes("Error") ? "#fee2e2" : "#dcfce7", color: message.includes("Error") ? "#b91c1c" : "#15803d", padding: "12px", borderRadius: "8px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
              {message.includes("Error") ? null : <FaCheckCircle />} {message}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "20px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div style={{ width: "75px", height: "75px", borderRadius: "50%", background: "#e2e8f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0d9488" }}>
              {profile.profileImage ? <img src={profile.profileImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <FaUserMd size={32} color="#64748b" />}
            </div>
            <div>
              <label style={{ display: "inline-block", background: "#0d9488", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontSize: "12.5px", fontWeight: "700", cursor: "pointer" }}>
                <FaCamera style={{ marginRight: "6px" }} /> Upload Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </label>
              <small style={{ display: "block", color: "#64748b", marginTop: "4px", fontSize: "11.5px" }}>Square JPG or PNG, max 2MB.</small>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Full Name (Dr.)</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Qualification</label>
              <input type="text" value={profile.qualification} onChange={(e) => setProfile({...profile, qualification: e.target.value})} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Specialization</label>
              <input type="text" value={profile.specialization} onChange={(e) => setProfile({...profile, specialization: e.target.value})} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hospital / Clinic Name</label>
              <input type="text" value={profile.hospital} onChange={(e) => setProfile({...profile, hospital: e.target.value})} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Consultation Fee (₹)</label>
              <input type="number" value={profile.fee} onChange={(e) => setProfile({...profile, fee: e.target.value})} required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Professional Bio</label>
            <textarea rows="3" value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <button type="submit" disabled={loading} style={{ background: "#0d9488", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: loading ? "wait" : "pointer" }}>
            {loading ? "Saving Profile..." : "Save Professional Profile"}
          </button>
        </form>
      )}

      {/* CONSULTATION MODAL */}
      {selectedAppt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }} onClick={() => setSelectedAppt(null)}>
          <div style={{ background: "#ffffff", width: "100%", maxWidth: "500px", padding: "26px", borderRadius: "18px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <h3 style={{ fontSize: "17px", margin: 0 }}>Consult Patient: {selectedAppt.patientName}</h3>
              <button onClick={() => setSelectedAppt(null)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}><FaTimes /></button>
            </div>
            <div style={{ marginBottom: "14px", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>
              <strong>Patient Email:</strong> {selectedAppt.patientEmail}<br />
              <strong>Booked Slot:</strong> {selectedAppt.date} at {selectedAppt.time}
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Write Prescription / Clinical Notes</label>
              <textarea rows="3" value={prescription} onChange={(e) => setPrescription(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} placeholder="Enter prescription notes or take care message..." />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setSelectedAppt(null)} style={{ flex: 1, padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#ffffff", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleCompleteConsultation} disabled={actionLoading} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#0d9488", color: "#ffffff", fontWeight: "700", cursor: "pointer" }}>
                {actionLoading ? "Saving..." : "Complete & Prescribe"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}