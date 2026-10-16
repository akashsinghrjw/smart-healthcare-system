// src/pages/HealthRecords.jsx
import React, { useState } from "react";
import { FaFileMedicalAlt, FaFileUpload, FaPlus, FaEye, FaEdit, FaTrash, FaFileImage, FaTimes } from "react-icons/fa";
import { safeLoad } from "../utils/storage";

export default function HealthRecords({ records, setRecords, userName, userEmail, setViewingFileRecord }) {
  const [newRecord, setNewRecord] = useState({
    title: "",
    type: "Diagnostic Lab Report",
    date: "",
    fileData: "",
    fileName: ""
  });
  const [editingRecord, setEditingRecord] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size 2MB se kam honi chahiye!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewRecord((prev) => ({
        ...prev,
        fileData: event.target.result,
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newRecord.title.trim()) return;

    const currentRecords = safeLoad("real_records");
    const item = {
      id: Date.now(),
      title: newRecord.title.trim(),
      type: newRecord.type,
      patientName: userName,
      patientEmail: userEmail,
      date: newRecord.date || new Date().toISOString().split("T")[0],
      fileData: newRecord.fileData || "",
      fileName: newRecord.fileName || "Document File"
    };

    const updated = [item, ...currentRecords];
    setRecords(updated);
    localStorage.setItem("real_records", JSON.stringify(updated));
    setNewRecord({
      title: "",
      type: "Diagnostic Lab Report",
      date: "",
      fileData: "",
      fileName: ""
    });
  };

  const handleSaveRecordEdit = (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    const currentRecords = safeLoad("real_records");
    const updated = currentRecords.map((r) => (r.id === editingRecord.id ? editingRecord : r));
    setRecords(updated);
    localStorage.setItem("real_records", JSON.stringify(updated));
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id) => {
    const currentRecords = safeLoad("real_records").filter((r) => r?.id !== id);
    setRecords(currentRecords);
    localStorage.setItem("real_records", JSON.stringify(currentRecords));
  };

  const userRecords = (records || []).filter(
    (r) => (r?.patientEmail || "").toLowerCase() === (userEmail || "").toLowerCase()
  );

  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
      <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
        <FaFileMedicalAlt color="#0284c7" size={16} style={{ width: "16px", height: "16px", flexShrink: 0 }} />
        <span>Health Records Vault ({userRecords.length})</span>
      </div>
      <small style={{ color: "#64748b", display: "block", marginBottom: "12px" }}>
        Upload medical lab reports, prescriptions, or docs images from your phone/laptop to database!
      </small>

      <form onSubmit={handleAddRecord} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "8px", marginBottom: "14px" }}>
        <input
          style={{ padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
          placeholder="Report Title (e.g. Blood Test Report)"
          value={newRecord.title}
          onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
          required
        />

        <select
          style={{ padding: "8px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "12px" }}
          value={newRecord.type}
          onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
        >
          <option>Diagnostic Lab Report</option>
          <option>Doctor Prescription</option>
          <option>Discharge Summary</option>
          <option>X-Ray / Scan Document</option>
        </select>

        {/* COMPACT UPLOAD INPUT ROW */}
        <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "8px 12px", border: "1.5px dashed #cbd5e1", borderRadius: "8px" }}>
          <FaFileUpload color="#0284c7" size={16} style={{ width: "16px", height: "16px", minWidth: "16px", flexShrink: 0 }} />
          <input
            type="file"
            accept="image/*,application/pdf,.doc,.docx"
            style={{ fontSize: "12px", width: "100%", color: "#475569" }}
            onChange={handleFileUpload}
          />
        </div>

        <button
          type="submit"
          style={{
            gridColumn: "span 2",
            background: "linear-gradient(135deg, #0284c7 0%, #0d9488 100%)",
            color: "#ffffff",
            border: "none",
            padding: "9px",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          <FaPlus size={12} style={{ width: "12px", height: "12px" }} /> Upload & Save Document to Vault
        </button>
      </form>

      <div style={{ maxHeight: "250px", overflowY: "auto" }}>
        {userRecords.length === 0 ? (
          <p style={{ fontSize: "12.5px", color: "#94a3b8", textAlign: "center", padding: "16px" }}>
            No reports added. Choose file and click upload above!
          </p>
        ) : (
          userRecords.map((r) => (
            <div key={r?.id || Math.random()} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{r?.title}</strong>
                  <small style={{ display: "block", color: "#64748b", marginTop: "2px" }}>
                    {r?.type} • Date: {r?.date}
                  </small>
                  {r?.fileName && (
                    <span style={{ fontSize: "11px", color: "#0284c7", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <FaFileImage size={11} style={{ width: "11px", height: "11px" }} /> {r?.fileName}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setViewingFileRecord(r)}
                    style={{ background: "#e0f2fe", color: "#0284c7", border: "1px solid #bae6fd", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <FaEye size={11} style={{ width: "11px", height: "11px" }} /> View
                  </button>
                  <button
                    onClick={() => setEditingRecord({ ...r })}
                    style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                  >
                    <FaEdit size={11} style={{ width: "11px", height: "11px" }} />
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(r?.id)}
                    style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
                  >
                    <FaTrash size={11} style={{ width: "11px", height: "11px" }} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: EDIT RECORD DETAILS */}
      {editingRecord && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }} onClick={() => setEditingRecord(null)}>
          <div style={{ background: "#ffffff", width: "90%", maxWidth: "460px", padding: "24px", borderRadius: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "17px", margin: 0 }}>Update Report Information</h3>
              <button onClick={() => setEditingRecord(null)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}><FaTimes /></button>
            </div>
            <form onSubmit={handleSaveRecordEdit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: "600", display: "block", marginBottom: "4px" }}>Report Title</label>
                <input
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                  value={editingRecord.title}
                  onChange={(e) => setEditingRecord({ ...editingRecord, title: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: "600", display: "block", marginBottom: "4px" }}>Report Type</label>
                <select
                  style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", boxSizing: "border-box" }}
                  value={editingRecord.type}
                  onChange={(e) => setEditingRecord({ ...editingRecord, type: e.target.value })}
                >
                  <option>Diagnostic Lab Report</option>
                  <option>Doctor Prescription</option>
                  <option>Discharge Summary</option>
                  <option>X-Ray / Scan Document</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" style={{ flex: 1, padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff", cursor: "pointer" }} onClick={() => setEditingRecord(null)}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", background: "#0d9488", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}