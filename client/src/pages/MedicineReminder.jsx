// src/pages/MedicineReminder.jsx
import React, { useState } from "react";
import { FaPills, FaClock, FaPlus, FaTrash } from "react-icons/fa";
import { safeLoad } from "../utils/storage";

export default function MedicineReminder({ medicines, setMedicines, userName, userEmail, userPhone }) {
  const [newMed, setNewMed] = useState({
    name: "",
    exactTime: "08:00",
    days: "Everyday / Daily",
    dose: "1 Tablet"
  });

  const userMeds = (medicines || []).filter(
    (m) => (m?.patientEmail || "").toLowerCase() === (userEmail || "").toLowerCase()
  );

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMed.name) return;

    const currentMeds = safeLoad("real_medicines");
    const item = {
      id: Date.now(),
      name: newMed.name,
      exactTime: newMed.exactTime || "08:00",
      days: newMed.days,
      dose: newMed.dose,
      patientName: userName,
      patientEmail: userEmail,
      patientPhone: userPhone
    };

    const updated = [item, ...currentMeds];
    setMedicines(updated);
    localStorage.setItem("real_medicines", JSON.stringify(updated));
    setNewMed({ name: "", exactTime: "08:00", days: "Everyday / Daily", dose: "1 Tablet" });
  };

  const handleDeleteMed = (id) => {
    const currentMeds = safeLoad("real_medicines").filter((m) => m?.id !== id);
    setMedicines(currentMeds);
    localStorage.setItem("real_medicines", JSON.stringify(currentMeds));
  };

  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
      <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
        <FaPills color="#ea580c" /> Medicine Reminders ({userMeds.length})
      </div>
      <small style={{ color: "#64748b", display: "block", marginBottom: "12px" }}>
        Set custom time and daily schedule for routine dosage tracking.
      </small>

      <form onSubmit={handleAddMed} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        <input
          style={{ padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "12.5px", gridColumn: "span 2" }}
          placeholder="Medicine Name (e.g. Paracetamol, Dolo 650)"
          value={newMed.name}
          onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
          required
        />

        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "8px", padding: "4px 8px" }}>
          <FaClock color="#64748b" size={13} />
          <input
            type="time"
            style={{ border: "none", background: "none", fontSize: "12.5px", outline: "none", width: "100%", fontWeight: "600", color: "#0f172a" }}
            value={newMed.exactTime}
            onChange={(e) => setNewMed({ ...newMed, exactTime: e.target.value })}
            required
          />
        </div>

        <select
          style={{ padding: "8px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "12px" }}
          value={newMed.days}
          onChange={(e) => setNewMed({ ...newMed, days: e.target.value })}
        >
          <option>Everyday / Daily</option>
          <option>Mon - Wed - Fri</option>
          <option>Tue - Thu - Sat</option>
          <option>Weekends (Sat & Sun)</option>
        </select>

        <input
          style={{ padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "12px" }}
          placeholder="Dose (e.g. 1 Tablet)"
          value={newMed.dose}
          onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
        />

        <button
          type="submit"
          style={{
            gridColumn: "span 2",
            background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
            color: "#ffffff",
            border: "none",
            padding: "8px",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "12.5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          <FaPlus /> Schedule Dose
        </button>
      </form>

      <div style={{ maxHeight: "240px", overflowY: "auto" }}>
        {userMeds.length === 0 ? (
          <p style={{ fontSize: "12.5px", color: "#94a3b8", textAlign: "center", padding: "16px" }}>
            No medicines scheduled yet.
          </p>
        ) : (
          userMeds.map((m) => (
            <div key={m?.id || Math.random()} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "13.5px" }}>{m?.name}</strong>
                <small style={{ display: "block", color: "#ea580c" }}>{m?.exactTime} • {m?.days} ({m?.dose})</small>
              </div>
              <button onClick={() => handleDeleteMed(m?.id)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}><FaTrash /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}