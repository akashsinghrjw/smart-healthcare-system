# 🏥 Smart Healthcare System

A full-stack healthcare web application built with the **MERN Stack** (MongoDB, Express.js, React 19, Node.js) and integrated with **Google Gemini 3.8 Flash AI** for smart symptom triage and patient care management.

---

## 🚀 Key Features

- **User Authentication:** Secure JWT-based registration and login system with bcrypt password hashing.
- **Medical Records Vault:** Secure storage and retrieval of diagnostic lab reports and medical history.
- **Medication Schedule Tracker:** Track prescription timings, frequencies, and dosage reminders.
- **AI Symptom Checker:** Real-time symptom triage powered by Google Gemini 3.8 Flash via a secured backend route.
- **Support Helpdesk:** Automated ticket generation (`TKT-XXXXXX`) and status tracking for patient queries.
- **Backend Protection:** Enhanced with Helmet security headers, CORS origin filtering, and IP rate limiting.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, React Router 7, Context API, CSS
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB Atlas (Cloud Database)
- **AI Integration:** Google Gemini API (`gemini-3.8-flash`)
- **Security:** JSON Web Tokens (JWT), Bcrypt.js, Helmet, Express Rate Limit

---

## 📁 Project Structure

```text
smart-healthcare-system/
├── client/                     # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts
│   │   ├── pages/              # Dashboard, Records, Triage, Auth
│   │   ├── utils/              # API fetch handler (api.js)
│   │   └── App.jsx
│   └── .env                    # VITE_API_BASE_URL
└── server/                     # Backend (Node.js + Express + MongoDB)
    ├── config/                 # MongoDB database connection (db.js)
    ├── middleware/             # JWT Auth middleware
    ├── models/                 # Mongoose schemas (User, Record, Medication, Ticket)
    ├── routes/                 # REST endpoints & AI triage controller
    ├── server.js               # Express application entry point
    └── .env                    # Database URI & API keys