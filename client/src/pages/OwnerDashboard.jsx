import React, { useState } from "react";
import {
  FaUsers,
  FaDatabase,
  FaPills,
  FaRobot,
  FaEnvelopeOpenText,
  FaEye,
  FaEdit,
  FaTrash,
  FaReply,
  FaTimes
} from "react-icons/fa";
import { safeLoad } from "../utils/storage";

export default function OwnerDashboard({
  registeredUsers,
  setRegisteredUsers,
  records,
  setRecords,
  medicines,
  setMedicines,
  triageLogs,
  setTriageLogs,
  supportTickets,
  setSupportTickets,
  setViewingFileRecord,
  onNavigateHome
}) {
  const [adminModal, setAdminModal] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [replyingTicket, setReplyingTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState("");

  const handleDeleteTriageLog = (logId) => {
    if (window.confirm("Admin: Kya aap is AI Consultation Query ko database se permanently delete karna chahte hain? Yeh user history se bhi hat jayegi.")) {
      const currentLogs = safeLoad("real_triage_logs") || [];
      const updatedLogs = currentLogs.filter((t) => t?.id !== logId && t?._id !== logId);
      localStorage.setItem("real_triage_logs", JSON.stringify(updatedLogs));
      setTriageLogs(updatedLogs);
    }
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!replyingTicket || !adminReplyText.trim()) return;

    const currentTickets = safeLoad("support_tickets_list") || [];
    const updated = currentTickets.map((t) => {
      if (String(t.id || t._id) === String(replyingTicket.id || replyingTicket._id)) {
        return {
          ...t,
          status: "RESOLVED",
          adminReply: adminReplyText.trim(),
          resolvedAt: new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
      }
      return t;
    });

    localStorage.setItem("support_tickets_list", JSON.stringify(updated));
    setSupportTickets(updated);
    setReplyingTicket(null);
    setAdminReplyText("");
  };

  const handleDeleteTicket = (id) => {
    const currentTickets = safeLoad("support_tickets_list") || [];
    const updated = currentTickets.filter((t) => String(t?.id || t?._id) !== String(id));
    localStorage.setItem("support_tickets_list", JSON.stringify(updated));
    setSupportTickets(updated);
  };

  const handleSavePatientEdit = (e) => {
    e.preventDefault();
    if (!editingPatient) return;

    const currentUsers = safeLoad("system_registered_users") || [];
    const targetId = editingPatient.id || editingPatient._id;
    const oldUser = currentUsers.find((u) => String(u?.id || u?._id) === String(targetId));
    
    const updatedUsers = currentUsers.map((u) =>
      String(u?.id || u?._id) === String(targetId) ? { ...u, name: editingPatient.name, phone: editingPatient.phone, email: editingPatient.email } : u
    );

    if (oldUser && oldUser.email !== editingPatient.email) {
      const allRecords = safeLoad("real_records") || [];
      const allMeds = safeLoad("real_medicines") || [];
      const allTriage = safeLoad("real_triage_logs") || [];
      
      // Update local storage matches
      localStorage.setItem("real_records", JSON.stringify(allRecords));
      localStorage.setItem("real_medicines", JSON.stringify(allMeds));
      localStorage.setItem("real_triage_logs", JSON.stringify(allTriage));
    }

    localStorage.setItem("system_registered_users", JSON.stringify(updatedUsers));
    setRegisteredUsers(updatedUsers);

    if (selectedPatient && String(selectedPatient.id || selectedPatient._id) === String(targetId)) {
      setSelectedPatient(editingPatient);
    }
    setEditingPatient(null);
  };

  const handleAdminDeletePatient = (email, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Admin: Is patient ko hospital system se remove karein?")) {
      const currentUsers = safeLoad("system_registered_users") || [];
      const currentUsersFiltered = currentUsers.filter((u) => (u?.email || "").toLowerCase() !== (email || "").toLowerCase());
      
      const r = (safeLoad("real_records") || []).filter((x) => (x?.patientEmail || "").toLowerCase() !== (email || "").toLowerCase());
      const m = (safeLoad("real_medicines") || []).filter((x) => (x?.patientEmail || "").toLowerCase() !== (email || "").toLowerCase());
      const t = (safeLoad("real_triage_logs") || []).filter((x) => (x?.patientEmail || "").toLowerCase() !== (email || "").toLowerCase());

      localStorage.setItem("system_registered_users", JSON.stringify(currentUsersFiltered));
      localStorage.setItem("real_records", JSON.stringify(r));
      localStorage.setItem("real_medicines", JSON.stringify(m));
      localStorage.setItem("real_triage_logs", JSON.stringify(t));

      setRegisteredUsers(currentUsersFiltered);
      setRecords(r);
      setMedicines(m);
      setTriageLogs(t);

      if (selectedPatient && (selectedPatient?.email || "").toLowerCase() === (email || "").toLowerCase()) {
        setSelectedPatient(null);
      }
    }
  };

  const selRecords = selectedPatient ? (records || []).filter((r) => (r?.patientEmail || r?.email || "").toLowerCase() === (selectedPatient?.email || "").toLowerCase()) : [];
  const selMeds = selectedPatient ? (medicines || []).filter((m) => (m?.patientEmail || m?.email || "").toLowerCase() === (selectedPatient?.email || "").toLowerCase()) : [];
  const selTriage = selectedPatient ? (triageLogs || []).filter((t) => (t?.patientEmail || t?.email || "").toLowerCase() === (selectedPatient?.email || "").toLowerCase()) : [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "22px", margin: 0 }}>Hospital Admin Live Dashboard</h2>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Inspect patient database, review uploaded medical reports/images, delete AI queries, and resolve user tickets.</p>
        </div>
        <button style={{ background: "#ffffff", color: "#0d9488", border: "1.5px solid #0d9488", padding: "8px 18px", borderRadius: "999px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }} onClick={onNavigateHome}>← Back to Home</button>
      </div>

      {/* 5 METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "24px" }}>
        <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setAdminModal("patients")}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e6f7f5", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}><FaUsers size={16} /></div>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>{(registeredUsers || []).length}</h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Patients</span>
            </div>
          </div>
          <FaEye color="#94a3b8" />
        </div>

        <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setAdminModal("records")}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}><FaDatabase size={16} /></div>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>{(records || []).length}</h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Reports</span>
            </div>
          </div>
          <FaEye color="#94a3b8" />
        </div>

        <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setAdminModal("meds")}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ffedd5", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center" }}><FaPills size={16} /></div>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>{(medicines || []).length}</h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Meds</span>
            </div>
          </div>
          <FaEye color="#94a3b8" />
        </div>

        <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setAdminModal("triage")}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e6f7f5", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}><FaRobot size={16} /></div>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>{(triageLogs || []).length}</h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>AI Logs</span>
            </div>
          </div>
          <FaEye color="#94a3b8" />
        </div>

        <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setAdminModal("queries")}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}><FaEnvelopeOpenText size={16} /></div>
            <div>
              <h3 style={{ fontSize: "18px", margin: 0 }}>{(supportTickets || []).length}</h3>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Queries</span>
            </div>
          </div>
          <FaEye color="#94a3b8" />
        </div>
      </div>

      {/* DIRECTORY SECTION */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", marginBottom: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h4 style={{ fontSize: "16px", margin: 0, color: "#0f172a" }}>Hospital Patients Directory ({(registeredUsers || []).length})</h4>
          <small style={{ color: "#0d9488", fontWeight: "600" }}>Admin Access: View Files, Documents & Edit Patient</small>
        </div>

        {(!registeredUsers || registeredUsers.length === 0) ? (
          <p style={{ textAlign: "center", color: "#94a3b8", padding: "16px" }}>No registered patients yet.</p>
        ) : (
          registeredUsers.map((p) => (
            <div key={p?.id || p?._id || Math.random()} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 16px", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
              <div>
                <strong>{p?.name || "Patient"}</strong> ({p?.phone || "N/A"})
                <small style={{ display: "block", color: "#64748b", marginTop: "2px" }}>{p?.email || "No Email"} | Added: {p?.registeredAt || p?.createdAt ? new Date(p.registeredAt || p.createdAt).toLocaleDateString() : "N/A"}</small>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ background: "#f1f5f9", color: "#0f172a", border: "1px solid #cbd5e1", padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }} onClick={() => setEditingPatient({ ...p, id: p.id || p._id })}>
                  <FaEdit color="#0d9488" /> Edit
                </button>
                <button style={{ background: "#ffffff", color: "#0d9488", border: "1.5px solid #0d9488", padding: "5px 12px", borderRadius: "999px", fontWeight: "600", cursor: "pointer", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }} onClick={() => setSelectedPatient(p)}>
                  <FaEye /> View Patient Dossier & Docs
                </button>
                <button style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "5px 12px", borderRadius: "8px", fontWeight: "600", fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }} onClick={(e) => handleAdminDeletePatient(p?.email, e)}>
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* LIVE SUPPORT QUERIES */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaEnvelopeOpenText color="#d97706" size={18} style={{ width: "18px", height: "18px" }} />
            <h4 style={{ fontSize: "16px", margin: 0, color: "#0f172a" }}>Submitted Support Queries ({(supportTickets || []).length})</h4>
          </div>
          <small style={{ color: "#64748b" }}>Admin Action: Click 'Reply & Resolve' to send response</small>
        </div>

        {(!supportTickets || supportTickets.length === 0) ? (
          <div style={{ textAlign: "center", padding: "26px", background: "#f8fafc", borderRadius: "10px", border: "1.5px dashed #cbd5e1" }}>
            <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>📬</span>
            <strong style={{ fontSize: "14px", color: "#0f172a" }}>No pending queries right now.</strong>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {supportTickets.map((ticket) => (
              <div key={ticket?.id || ticket?._id} style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <span style={{
                      background: ticket?.status === "RESOLVED" ? "#dcfce7" : "#fef3c7",
                      color: ticket?.status === "RESOLVED" ? "#15803d" : "#b45309",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "700"
                    }}>
                      {ticket?.ticketId || "TICKET"} | {ticket?.status === "RESOLVED" ? "SOLVED" : "PENDING"}
                    </span>
                    <strong style={{ display: "block", fontSize: "14px", color: "#0f172a", marginTop: "4px" }}>
                      {ticket?.name}
                    </strong>
                    <small style={{ color: "#64748b" }}>{ticket?.email} | {ticket?.date}</small>
                  </div>

                  <button onClick={() => handleDeleteTicket(ticket?.id || ticket?._id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                    <FaTrash />
                  </button>
                </div>

                <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12.5px", color: "#334155", marginBottom: "10px" }}>
                  "{ticket?.msg || ticket?.message}"
                </div>

                {ticket?.status === "RESOLVED" ? (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }}>
                    <strong style={{ color: "#166534" }}>Sent:</strong> {ticket?.adminReply}
                  </div>
                ) : (
                  <div>
                    {String(replyingTicket?.id || replyingTicket?._id) === String(ticket?.id || ticket?._id) ? (
                      <form onSubmit={handleResolveSubmit} style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <textarea
                          rows="2"
                          placeholder="Type reply to resolve query..."
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          required
                          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", boxSizing: "border-box" }}
                        />
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button type="submit" style={{ flex: 1, background: "#0d9488", color: "#fff", border: "none", padding: "6px", borderRadius: "6px", fontWeight: "700", fontSize: "11.5px", cursor: "pointer" }}>Send Reply</button>
                          <button type="button" onClick={() => setReplyingTicket(null)} style={{ background: "#e2e8f0", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "11.5px", cursor: "pointer" }}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button
                        style={{ width: "100%", background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)", color: "#ffffff", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        onClick={() => { setReplyingTicket(ticket); setAdminReplyText(""); }}
                      >
                        <FaReply /> Reply & Mark as Solved
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PATIENT DOSSIER */}
      {selectedPatient && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setSelectedPatient(null)}>
          <div style={{ background: "#ffffff", width: "90%", maxWidth: "580px", padding: "26px", borderRadius: "18px", maxHeight: "88vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <div>
                <h3 style={{ fontSize: "18px", margin: 0 }}>Patient Dossier: {selectedPatient?.name}</h3>
                <small style={{ color: "#64748b" }}>{selectedPatient?.email} | {selectedPatient?.phone}</small>
              </div>
              <button onClick={() => setSelectedPatient(null)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}><FaTimes /></button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <strong style={{ fontSize: "13.5px", color: "#0284c7", display: "block", marginBottom: "6px" }}>
                Uploaded Health Reports & Files ({selRecords.length})
              </strong>
              <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                {selRecords.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>No documents uploaded by this patient.</p>
                ) : (
                  selRecords.map((r) => (
                    <div key={r?.id || r?._id} style={{ fontSize: "12.5px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 12px", marginBottom: "6px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{r?.title}</strong> ({r?.type})
                        <small style={{ display: "block", color: "#64748b" }}>File: {r?.fileName || "N/A"}</small>
                      </div>
                      <button
                        onClick={() => setViewingFileRecord(r)}
                        style={{ background: "#e0f2fe", color: "#0284c7", border: "1px solid #bae6fd", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <FaEye /> Open File
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <strong style={{ fontSize: "13.5px", color: "#0d9488", display: "block", marginBottom: "6px" }}>
                Patient AI Triage History ({selTriage.length})
              </strong>
              <div style={{ maxHeight: "140px", overflowY: "auto" }}>
                {selTriage.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>No AI queries asked by this patient.</p>
                ) : (
                  selTriage.map((t) => (
                    <div key={t?.id || t?._id} style={{ fontSize: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 12px", marginBottom: "6px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>Query: "{t?.query}"</strong>
                        <small style={{ display: "block", color: "#0d9488", marginTop: "2px" }}>{t?.condition} | {t?.date} ({t?.time})</small>
                      </div>
                      <button
                        onClick={() => handleDeleteTriageLog(t?.id || t?._id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                        title="Delete this query from patient history & system"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <strong style={{ fontSize: "13.5px", color: "#ea580c", display: "block", marginBottom: "6px" }}>Scheduled Medicines ({selMeds.length})</strong>
              <div style={{ maxHeight: "90px", overflowY: "auto" }}>
                {selMeds.length === 0 ? <p style={{ fontSize: "12px", color: "#94a3b8" }}>No medicines.</p> : selMeds.map((m) => (
                  <div key={m?.id || m?._id} style={{ fontSize: "12px", background: "#f8fafc", padding: "4px 8px", marginBottom: "4px", borderRadius: "4px" }}>
                    {m?.name} ({m?.exactTime} | {m?.days})
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", background: "#fee2e2", color: "#ef4444", fontWeight: "600", cursor: "pointer" }} onClick={(e) => handleAdminDeletePatient(selectedPatient?.email, e)}>Remove Patient</button>
              <button style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", background: "#0d9488", color: "#ffffff", fontWeight: "600", cursor: "pointer" }} onClick={() => setSelectedPatient(null)}>Close Dossier</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PATIENT MODAL */}
      {editingPatient && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setEditingPatient(null)}>
          <div style={{ background: "#ffffff", width: "90%", maxWidth: "460px", padding: "24px", borderRadius: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "17px", margin: 0 }}>Edit Patient Details</h3>
              <button onClick={() => setEditingPatient(null)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}><FaTimes /></button>
            </div>
            <form onSubmit={handleSavePatientEdit}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: "600", display: "block", marginBottom: "4px" }}>Name</label>
                <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }} value={editingPatient.name || ""} onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: "600", display: "block", marginBottom: "4px" }}>Phone</label>
                <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }} value={editingPatient.phone || ""} onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", color: "#475569", fontWeight: "600", display: "block", marginBottom: "4px" }}>Email</label>
                <input style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "6px", fontSize: "13px" }} type="email" value={editingPatient.email || ""} onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })} required />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" style={{ flex: 1, padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff", cursor: "pointer" }} onClick={() => setEditingPatient(null)}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "8px", border: "none", borderRadius: "6px", background: "#0d9488", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN STATS CARDS MODAL */}
      {adminModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setAdminModal(null)}>
          <div style={{ background: "#ffffff", width: "90%", maxWidth: "580px", padding: "24px", borderRadius: "16px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "17px", margin: 0 }}>
                {adminModal === "patients" && "All Patients"}
                {adminModal === "records" && "All Uploaded Reports"}
                {adminModal === "meds" && "All Medicines"}
                {adminModal === "triage" && "All AI Consultation Logs"}
                {adminModal === "queries" && "All Support Tickets"}
              </h3>
              <button onClick={() => setAdminModal(null)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}><FaTimes /></button>
            </div>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {adminModal === "patients" && ((registeredUsers || []).length === 0 ? <p style={{ color: "#94a3b8" }}>No data.</p> : registeredUsers.map((p) => (
                <div key={p?.id || p?._id || Math.random()} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", marginBottom: "6px", fontSize: "12.5px" }}>
                  <strong>{p?.name}</strong> ({p?.phone})<small style={{ display: "block", color: "#64748b" }}>{p?.email}</small>
                </div>
              )))}
              {adminModal === "records" && ((records || []).length === 0 ? <p style={{ color: "#94a3b8" }}>No data.</p> : records.map((r) => (
                <div key={r?.id || r?._id || Math.random()} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", marginBottom: "6px", fontSize: "12.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{r?.title}</strong><small style={{ display: "block", color: "#64748b" }}>{r?.patientName} ({r?.type})</small>
                  </div>
                  <button onClick={() => setViewingFileRecord(r)} style={{ border: "none", background: "#e0f2fe", color: "#0284c7", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>View Doc</button>
                </div>
              )))}
              {adminModal === "meds" && ((medicines || []).length === 0 ? <p style={{ color: "#94a3b8" }}>No data.</p> : medicines.map((m) => (
                <div key={m?.id || m?._id || Math.random()} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", marginBottom: "6px", fontSize: "12.5px" }}>
                  <strong>{m?.name}</strong><small style={{ display: "block", color: "#ea580c" }}>{m?.patientName} | {m?.exactTime} ({m?.days})</small>
                </div>
              )))}
              {adminModal === "triage" && ((triageLogs || []).length === 0 ? <p style={{ color: "#94a3b8" }}>No AI queries found.</p> : triageLogs.map((t) => (
                <div key={t?.id || t?._id || Math.random()} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 12px", borderRadius: "8px", marginBottom: "8px", fontSize: "12.5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>Query: "{t?.query}"</strong>
                    <small style={{ display: "block", color: "#0d9488", margin: "2px 0" }}>Patient: {t?.patientName} ({t?.patientEmail})</small>
                    <small style={{ color: "#64748b" }}>{t?.condition} | {t?.date} ({t?.time})</small>
                  </div>
                  <button
                    onClick={() => handleDeleteTriageLog(t?.id || t?._id)}
                    style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                    title="Delete this query from patient & system"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              )))}
              {adminModal === "queries" && ((supportTickets || []).length === 0 ? <p style={{ color: "#94a3b8" }}>No queries found.</p> : supportTickets.map((t) => (
                <div key={t?.id || t?._id || Math.random()} style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", marginBottom: "6px", fontSize: "12.5px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{t?.name} ({t?.ticketId})</strong>
                    <span style={{ color: t?.status === "RESOLVED" ? "#16a34a" : "#d97706", fontSize: "11px", fontWeight: "700" }}>{t?.status}</span>
                  </div>
                  <small style={{ display: "block", color: "#64748b" }}>{t?.email}</small>
                  <p style={{ margin: "4px 0 0", color: "#334155" }}>"{t?.msg || t?.message}"</p>
                </div>
              )))}
            </div>
            <button style={{ width: "100%", padding: "8px", marginTop: "14px", border: "none", borderRadius: "6px", background: "#0d9488", color: "#ffffff", fontWeight: "600", cursor: "pointer" }} onClick={() => setAdminModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}