const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://smart-healthcare-system-ykl7.onrender.com"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  } catch (error) {
    console.error(`[API Network Error] on ${path}:`, error.message);
    throw error;
  }
}

export const api = {
  // User Authentication & Account
  register: (data) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  login: (data) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  getProfile: () => request("/api/auth/profile"),
  deleteAccount: () =>
    request("/api/auth/delete-account", {
      method: "DELETE"
    }),

  // Medical Records Vault
  getRecords: () => request("/api/records"),
  addRecord: (data) =>
    request("/api/records", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  deleteRecord: (id) =>
    request(`/api/records/${id}`, {
      method: "DELETE"
    }),

  // Medication Schedule Tracker
  getMedications: () => request("/api/medications"),
  addMedication: (data) =>
    request("/api/medications", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  deleteMedication: (id) =>
    request(`/api/medications/${id}`, {
      method: "DELETE"
    }),

  // AI Symptom Triage
  analyzeSymptoms: (query, userContext = {}) =>
    request("/api/triage/analyze", {
      method: "POST",
      body: JSON.stringify({
        query,
        email: userContext.email,
        name: userContext.name
      })
    }),
  getTriageHistory: () => request("/api/triage/history"),

  // Support & Helpdesk Tickets
  createTicket: (data) =>
    request("/api/tickets", {
      method: "POST",
      body: JSON.stringify(data)
    }),
  trackTicket: (ticketId) => request(`/api/tickets/${ticketId}`),
  replyTicket: (id, reply) =>
    request(`/api/tickets/${id}/reply`, {
      method: "PATCH",
      body: JSON.stringify({ adminReply: reply })
    })
};