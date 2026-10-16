// src/pages/Dashboard.jsx
import React, { useState } from "react";
import {
  FaRobot,
  FaSpinner,
  FaFileMedicalAlt,
  FaPills,
  FaHistory,
  FaEye,
  FaTimes,
  FaTrash
} from "react-icons/fa";
import HealthRecords from "./HealthRecords";
import MedicineReminder from "./MedicineReminder";
import { safeLoad } from "../utils/storage";

const GEMINI_API_KEY = "AQ.Ab8RN6JbuixL47YX8OeMlfa891koP5O9Z5u2leHx-BbxUmDndA";

export default function Dashboard({
  userName,
  userEmail,
  userPhone,
  records,
  setRecords,
  medicines,
  setMedicines,
  triageLogs,
  setTriageLogs,
  supportTickets,
  setViewingFileRecord,
  onNavigateHome,
  handleDeleteMyAccount
}) {
  const [symptomInput, setSymptomInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [patientCardModal, setPatientCardModal] = useState(null);

  const userRecords = (records || []).filter((r) => (r?.patientEmail || "").toLowerCase() === (userEmail || "").toLowerCase());
  const userMeds = (medicines || []).filter((m) => (m?.patientEmail || "").toLowerCase() === (userEmail || "").toLowerCase());
  const userTriage = (triageLogs || []).filter((t) => (t?.patientEmail || "").toLowerCase() === (userEmail || "").toLowerCase());
  const userMyTickets = (supportTickets || []).filter((t) => (t?.email || "").toLowerCase() === (userEmail || "").toLowerCase());

  const saveTriage = (query, res) => {
    setAiResponse(res);
    setAiLoading(false);
    const currentLogs = safeLoad("real_triage_logs");
    const log = {
      id: Date.now(),
      patientName: userName,
      patientEmail: userEmail,
      query: query,
      condition: res.condition,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString()
    };
    const updated = [log, ...currentLogs];
    localStorage.setItem("real_triage_logs", JSON.stringify(updated));
    setTriageLogs(updated);
  };

  const handleAnalyzeSymptom = async (e) => {
    e.preventDefault();
    const query = (symptomInput || "").trim();
    if (!query) return;

    setAiLoading(true);
    setAiResponse(null);

    const lowerQ = query.toLowerCase();

    if (["hi", "hello", "good morning", "hey", "namaste"].some((g) => lowerQ === g || lowerQ.startsWith(g + " "))) {
      setTimeout(() => {
        saveTriage(query, {
          source: "Smart Healthcare AI",
          condition: "Greeting / Clinical Welcome",
          guidance: "Hello! Main aapka AI Health Advisor hoon. Kripya apna lakshan (jaise pain in finger, body ache, fever, stomach pain) likhein."
        });
      }, 150);
      return;
    }

    if (["cricket", "score", "movie", "song", "joke", "code", "python", "weather", "match"].some((w) => lowerQ.includes(w))) {
      setTimeout(() => {
        saveTriage(query, {
          source: "Smart Healthcare AI",
          condition: "Out of Medical Scope",
          guidance: "Main ek Clinical Healthcare Assistant hoon. Kripya sirf sharir ki takleef, bimari ya lakshano se jude sawal puchein."
        });
      }, 150);
      return;
    }

    const key = (GEMINI_API_KEY || "").trim();
    if (key.length > 10) {
      try {
        const clinicalPrompt = `You are a certified Clinical AI Health Advisor.
A patient reports this symptom: "${query}".

Provide a detailed, practical clinical assessment in clear Hinglish with the following points:
1. Condition Analysis: What issue or strain this usually indicates.
2. Immediate Home Relief: 3 specific steps for relief.
3. Hydration & What to Avoid: Things to drink and things to strictly avoid.
4. Warning Signs: When to visit a doctor or hospital immediately.

Give comprehensive, symptom-specific advice for "${query}".`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": key
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: clinicalPrompt }] }]
            })
          }
        );

        const data = await response.json();

        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          saveTriage(query, {
            source: "Google Gemini 1.5 Clinical AI",
            condition: `Clinical Observation: "${query}"`,
            guidance: data.candidates[0].content.parts[0].text
          });
          return;
        }
      } catch (err) {
        console.warn("API Connection failed, falling back to local engine:", err);
      }
    }

    setTimeout(() => {
      let advice = {
        condition: `Clinical Assessment: "${query}"`,
        guidance: "• Takleef wale hisse ko rest dein aur kisi tarah ka physical strain na daalein.\n• Hydration maintain rakhein aur halka gunguna paani piyein.\n• Agar yeh takleef 24 ghante me theek na ho toh local physician se consult karein."
      };

      if (lowerQ.includes("finger") || lowerQ.includes("ungli") || lowerQ.includes("thumb") || lowerQ.includes("wrist") || lowerQ.includes("joint")) {
        advice = {
          condition: "Digital Arthralgia / Finger Tendon Strain (उंगलियों में दर्द / मोच)",
          guidance: "• Ungli par kisi tarah ka bhaari wazan na daalein aur mobile/keyboard typing kam karein.\n• Sujan ya dard hone par 10-15 minute ke liye barf (ice pack) kapde me lapet kar sekain.\n• Ungli ko seedha rakhein. Agar neeli pad rahi ho ya hilane par tez chubhan ho toh X-Ray ke liye clinic jayein."
        };
      } else if (lowerQ.includes("body") || lowerQ.includes("badan") || lowerQ.includes("muscle") || lowerQ.includes("myalgia")) {
        advice = {
          condition: "Generalized Myalgia / Muscle Fatigue (बदन दर्द / थकान)",
          guidance: "• Gungune paani se nahayein taaki muscles ki stiffness aur jakdan release ho.\n• ORS, nimbu-paani ya nariyal paani piyein.\n• Shareer ko kam se kam 8 ghante ka complete bed rest dein."
        };
      } else if (lowerQ.includes("head") || lowerQ.includes("sar") || lowerQ.includes("sir") || lowerQ.includes("migraine")) {
        advice = {
          condition: "Tension Cephalea / Acute Headache (सर दर्द)",
          guidance: "• Screen time turant band karein aur andhere shant kamre me let jayein.\n• 1-2 glass taaza paani piyein.\n• Maathe par halka thanda cloth compress lagayein."
        };
      } else if (lowerQ.includes("tummy") || lowerQ.includes("stomach") || lowerQ.includes("pet") || lowerQ.includes("abdomen")) {
        advice = {
          condition: "Gastrointestinal Cramps / Dyspepsia (पेट दर्द व अपच)",
          guidance: "• Khane me sirf halki diet lein (Khichdi, Moong Daal, Dahi, Kela).\n• Oily aur spicy cheezein bilkul band karein.\n• Gunguna ajwain water piyein."
        };
      } else if (lowerQ.includes("fever") || lowerQ.includes("bukhar") || lowerQ.includes("temperature")) {
        advice = {
          condition: "Viral Pyrexia / Elevated Temperature (बुखार)",
          guidance: "• Har 4-6 ghante me digital thermometer se body temperature note karein.\n• Maathe par taaze paani ki normal patti rakhein.\n• ORS aur gungune paani se body ko hydrated rakhein."
        };
      } else if (lowerQ.includes("cough") || lowerQ.includes("cold") || lowerQ.includes("khasi") || lowerQ.includes("gala") || lowerQ.includes("throat")) {
        advice = {
          condition: "Pharyngitis / Respiratory Congestion (खांसी व गले में खराश)",
          guidance: "• Din me 3 baar gungune namak paani se gargle karein.\n• Plain steam lein taaki naak aur gale ki airway clear ho sake.\n• Chilled paani aur thandi cheezein band karein."
        };
      } else if (lowerQ.includes("chest") || lowerQ.includes("seene") || lowerQ.includes("heart")) {
        advice = {
          condition: "Thoracic Evaluation (सीने में दर्द व बेचैनी)",
          guidance: "• Turant aaram se baith jayein aur koi bhi physical strain na lein.\n• Tight kapde dheeley karein aur gehri saans lein.\n• ⚠ Warning: Agar dard baayein haath me faile, toh turant 108 helpline call karein."
        };
      }

      saveTriage(query, {
        source: "Smart Healthcare Engine",
        condition: advice.condition,
        guidance: advice.guidance
      });
    }, 200);
  };

  const handleDeleteMedDirect = (id) => {
    const currentMeds = safeLoad("real_medicines").filter((m) => m?.id !== id);
    setMedicines(currentMeds);
    localStorage.setItem("real_medicines", JSON.stringify(currentMeds));
  };

  return (
    <div>
      {/* PATIENT HEADER */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "22px", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "16px", background: "linear-gradient(135deg, #0d9488 0%, #3b82f6 50%, #8b5cf6 100%)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "800", boxShadow: "0 6px 16px rgba(59, 130, 246, 0.3)" }}>
            {userName ? userName.charAt(0).toUpperCase() : "P"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a" }}>Welcome,</span>
              <h2 style={{ fontSize: "26px", fontWeight: "900", background: "linear-gradient(135deg, #0d9488 0%, #2563eb 50%, #7c3aed 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
                {userName}!
              </h2>
              <span style={{ background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)", color: "#15803d", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", border: "1px solid #86efac" }}>
                ● ACTIVE PATIENT
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px", margin: 0 }}>
              Registered Mobile: <strong>{userPhone || "Not set"}</strong> • Email: <strong>{userEmail}</strong>
            </p>
          </div>
        </div>

        <button style={{ background: "#ffffff", color: "#0d9488", border: "1.5px solid #0d9488", padding: "8px 18px", borderRadius: "999px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }} onClick={onNavigateHome}>
          ← Back to Home
        </button>
      </div>

      {/* 3 CLICKABLE FEATURE CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "22px" }}>
        <div
          style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          onClick={() => setPatientCardModal("reports")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              <FaFileMedicalAlt />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Saved Reports</span>
              <strong style={{ fontSize: "18px", color: "#0f172a", display: "block" }}>{userRecords.length} Files</strong>
            </div>
          </div>
          <FaEye color="#94a3b8" />
        </div>

        <div
          style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          onClick={() => setPatientCardModal("reminders")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#ffedd5", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              <FaPills />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Active Reminders</span>
              <strong style={{ fontSize: "18px", color: "#0f172a", display: "block" }}>{userMeds.length} Meds</strong>
            </div>
          </div>
          <FaEye color="#94a3b8" />
        </div>

        <div
          style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "16px", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          onClick={() => setPatientCardModal("triage")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#e6f7f5", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              <FaRobot />
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>AI Consultations</span>
              <strong style={{ fontSize: "18px", color: "#0f172a", display: "block" }}>{userTriage.length} Queries</strong>
            </div>
          </div>
          <FaHistory color="#94a3b8" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* AI ADVISOR */}
        <div style={{ gridColumn: "span 2", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
          <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FaRobot color="#0d9488" /> AI Health Advisor (Powered by Gemini)
          </div>
          <form onSubmit={handleAnalyzeSymptom} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <input style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13.5px" }} placeholder="Type symptoms (e.g. pain in finger, pain in body, bukhar, pet dard)..." value={symptomInput} onChange={(e) => setSymptomInput(e.target.value)} />
            <button type="submit" style={{ background: "#0d9488", color: "#ffffff", border: "none", padding: "10px 22px", borderRadius: "999px", fontWeight: "600", cursor: "pointer", fontSize: "13.5px" }} disabled={aiLoading}>
              {aiLoading ? <FaSpinner className="spin" /> : "Check My Health"}
            </button>
          </form>
          {aiResponse && (
            <div style={{ background: "#f0fdfa", borderLeft: "4px solid #0d9488", padding: "14px 18px", borderRadius: "8px", fontSize: "13.5px" }}>
              <strong style={{ fontSize: "14px", color: "#0d9488" }}>{aiResponse.condition}</strong>
              <p style={{ whiteSpace: "pre-line", color: "#334155", margin: "6px 0 0", lineHeight: "1.6" }}>{aiResponse.guidance}</p>
            </div>
          )}
        </div>

        {/* HEALTH RECORDS VAULT (MODULE) */}
        <HealthRecords
          records={records}
          setRecords={setRecords}
          userName={userName}
          userEmail={userEmail}
          setViewingFileRecord={setViewingFileRecord}
        />

        {/* MEDICINE REMINDER (MODULE) */}
        <MedicineReminder
          medicines={medicines}
          setMedicines={setMedicines}
          userName={userName}
          userEmail={userEmail}
          userPhone={userPhone}
        />
      </div>

      {/* MY QUERIES STATUS */}
      {userMyTickets.length > 0 && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", marginTop: "20px" }}>
          <h4 style={{ fontSize: "15px", margin: "0 0 12px", color: "#0f172a" }}>My Submitted Support Queries Status</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {userMyTickets.map((t) => (
              <div key={t.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong>{t.ticketId}</strong>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: t.status === "RESOLVED" ? "#16a34a" : "#d97706" }}>
                    {t.status === "RESOLVED" ? "SOLVED" : "PENDING"}
                  </span>
                </div>
                <p style={{ margin: "4px 0", fontSize: "12px", color: "#475569" }}>"{t.msg}"</p>
                {t.status === "RESOLVED" && (
                  <div style={{ background: "#dcfce7", color: "#166534", padding: "6px 8px", borderRadius: "6px", fontSize: "11.5px", marginTop: "6px" }}>
                    <b>Admin Reply:</b> {t.adminReply}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT BUTTON */}
      <div style={{ marginTop: "30px", borderTop: "1px solid #e2e8f0", paddingTop: "16px", display: "flex", justifyContent: "flex-end" }}>
        <button style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "12.5px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }} onClick={handleDeleteMyAccount}>
          <FaTrash /> Delete My Patient Account
        </button>
      </div>

      {/* POPUP: 3 CLICKABLE METRIC CARDS */}
      {patientCardModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setPatientCardModal(null)}>
          <div style={{ background: "#ffffff", width: "90%", maxWidth: "500px", padding: "26px", borderRadius: "18px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", margin: 0 }}>
                {patientCardModal === "reports" && "Saved Health Reports"}
                {patientCardModal === "reminders" && "Active Medication Reminders"}
                {patientCardModal === "triage" && "My Consultation History"}
              </h3>
              <button onClick={() => setPatientCardModal(null)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}><FaTimes /></button>
            </div>

            {patientCardModal === "reports" && (
              <div>
                {userRecords.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "26px 14px", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: "14px" }}>
                    <span style={{ fontSize: "38px", display: "block", marginBottom: "8px" }}>📄🥺</span>
                    <h4 style={{ color: "#0f172a", margin: "0 0 6px" }}>Koi Report Upload Nahi Hai</h4>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                      Note: Aapke portal me abhi tak koi lab report upload nahi hui hai.
                    </p>
                  </div>
                ) : (
                  <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                    {userRecords.map((r) => (
                      <div key={r?.id || Math.random()} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", border: "1px solid #e2e8f0" }}>
                        <div>
                          <strong>{r?.title}</strong>
                          <small style={{ display: "block", color: "#64748b", marginTop: "2px" }}>{r?.type} • {r?.date}</small>
                        </div>
                        <button onClick={() => { setPatientCardModal(null); setViewingFileRecord(r); }} style={{ border: "none", background: "#e0f2fe", color: "#0284c7", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>View Doc</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {patientCardModal === "reminders" && (
              <div>
                {userMeds.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "26px 14px", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: "14px" }}>
                    <span style={{ fontSize: "38px", display: "block", marginBottom: "8px" }}>💊😔</span>
                    <h4 style={{ color: "#0f172a", margin: "0 0 6px" }}>Koi Medicine Scheduled Nahi Hai</h4>
                  </div>
                ) : (
                  <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                    {userMeds.map((m) => (
                      <div key={m?.id || Math.random()} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", border: "1px solid #e2e8f0" }}>
                        <div>
                          <strong>{m?.name}</strong>
                          <small style={{ display: "block", color: "#ea580c", marginTop: "2px" }}>Time: {m?.exactTime} • Routine: {m?.days} ({m?.dose})</small>
                        </div>
                        <button onClick={() => handleDeleteMedDirect(m?.id)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}><FaTrash /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {patientCardModal === "triage" && (
              <div>
                {userTriage.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "26px 14px", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: "14px" }}>
                    <span style={{ fontSize: "38px", display: "block", marginBottom: "8px" }}>🤖💤</span>
                    <h4 style={{ color: "#0f172a", margin: "0 0 6px" }}>No Consultation Queries Found</h4>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                      Note: Aapke account me koi consultation query nahi hai (ya admin ne remove kar di hai).
                    </p>
                  </div>
                ) : (
                  <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                    {userTriage.map((t) => (
                      <div key={t?.id || Math.random()} style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", marginBottom: "8px", border: "1px solid #e2e8f0", fontSize: "12.5px" }}>
                        <strong>Question: "{t?.query}"</strong>
                        <span style={{ display: "block", color: "#0d9488", fontWeight: "600", margin: "2px 0" }}>{t?.condition} • {t?.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button style={{ width: "100%", padding: "10px", marginTop: "16px", border: "none", borderRadius: "8px", background: "#0d9488", color: "#ffffff", fontWeight: "600", cursor: "pointer" }} onClick={() => setPatientCardModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}