import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://smart-healthcare-system-ykl7.onrender.com"
).replace(/\/$/, "");

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/appointments/patient/my-appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          setAppointments(res.data);
        }
      } catch (err) {
        console.error('Error fetching patient appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAppointments();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading appointments...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>📋 My Booked Appointments & Prescriptions</h2>
      {appointments.length === 0 ? (
        <p>Aapne abhi tak koi appointment book nahi kiya hai.</p>
      ) : (
        appointments.map((appt) => (
          <div key={appt._id} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <p><strong>Receipt ID:</strong> {appt.receiptId || 'N/A'}</p>
            <p><strong>Doctor Email:</strong> {appt.doctorEmail}</p>
            <p><strong>Date & Time:</strong> {appt.date} at {appt.time}</p>
            <p><strong>Status:</strong> <span style={{ color: appt.status === 'Completed' ? 'green' : 'orange', fontWeight: 'bold' }}>{appt.status}</span></p>
            
            {appt.prescription && (
              <div style={{ marginTop: '10px', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '12px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px', color: '#0f766e', fontWeight: 'bold' }}>🩺 Doctor's Prescription / Message:</p>
                <p style={{ margin: 0, color: '#334155' }}>{appt.prescription}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PatientAppointments;