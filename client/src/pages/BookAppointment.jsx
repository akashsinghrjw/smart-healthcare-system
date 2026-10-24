import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookAppointment.css'; // Optional styling file

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appDate, setAppDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI / Google Pay');
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Doctors List on Load
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming JWT token is stored here
        const res = await axios.get('http://localhost:5000/api/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctors(res.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors list.');
      }
    };
    fetchDoctors();
  }, []);

  // Handle Booking & Dummy Payment
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !appDate || !time) {
      alert('Please select a doctor, date, and time slot.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const bookingPayload = {
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        hospitalName: selectedDoctor.hospitalName,
        qualification: selectedDoctor.qualification,
        appDate,
        time,
        paymentMode,
        amount: selectedDoctor.fees
      };

      const res = await axios.post('http://localhost:5000/api/appointments/book', bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setReceiptData(res.data.appointment);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Booking failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Print / Save as PDF Function
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="booking-container" style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h2>🩺 Book Appointment & Consultation</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* If booking is successful, show Receipt / PDF view */}
      {receiptData ? (
        <div className="receipt-card" style={{ border: '2px dashed #008080', padding: '25px', borderRadius: '10px', background: '#f9f9f9' }}>
          <h3 style={{ color: '#008080', textAlign: 'center' }}>Smart Healthcare Portal - Payment & Booking Receipt</h3>
          <hr />
          <p><strong>Receipt ID:</strong> {receiptData.receiptId}</p>
          <p><strong>Patient Email:</strong> {receiptData.patientEmail}</p>
          <p><strong>Doctor Name:</strong> {receiptData.doctorName} ({receiptData.qualification})</p>
          <p><strong>Hospital Name:</strong> {receiptData.hospitalName}</p>
          <p><strong>Appointment Date & Time:</strong> {receiptData.appDate} at {receiptData.time}</p>
          <p><strong>Consultation Fee Paid:</strong> ₹{receiptData.amount}</p>
          <p><strong>Payment Mode:</strong> {receiptData.paymentMode} (Dummy Successful)</p>
          <p><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{receiptData.status}</span></p>
          <hr />
          <div style={{ textAlign: 'center', marginTop: '20px' }} className="no-print">
            <button onClick={handlePrintReceipt} style={{ padding: '10px 20px', background: '#008080', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px' }}>
              📥 Download / Print PDF Receipt
            </button>
            <button onClick={() => setReceiptData(null)} style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Book Another
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form & Doctor Selection */
        <form onSubmit={handleBooking}>
          <h4>1. Select a Doctor</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            {doctors.map((doc) => (
              <div 
                key={doc._id} 
                onClick={() => setSelectedDoctor(doc)}
                style={{
                  border: selectedDoctor?._id === doc._id ? '2px solid #008080' : '1px solid #ddd',
                  padding: '15px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedDoctor?._id === doc._id ? '#eefdfd' : '#fff'
                }}
              >
                <h4>{doc.name}</h4>
                <p style={{ fontSize: '13px', color: '#666' }}>{doc.qualification} - {doc.specialization}</p>
                <p style={{ fontSize: '13px' }}>🏥 {doc.hospitalName}</p>
                <p style={{ fontSize: '13px' }}>📍 {doc.location}</p>
                <p style={{ fontWeight: 'bold', color: '#008080' }}>Fee: ₹{doc.fees}</p>
              </div>
            ))}
          </div>

          {selectedDoctor && (
            <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
              <h4>2. Appointment Schedule & Dummy Payment</h4>
              <div style={{ marginBottom: '10px' }}>
                <label>Date: </label>
                <input type="date" value={appDate} onChange={(e) => setAppDate(e.target.value)} required style={{ marginLeft: '10px', padding: '5px' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Time Slot: </label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required style={{ marginLeft: '10px', padding: '5px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Payment Mode: </label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }}>
                  <option value="UPI / Google Pay">UPI / Google Pay (Dummy)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card (Dummy)</option>
                  <option value="Net Banking">Net Banking (Dummy)</option>
                </select>
              </div>

              <button type="submit" disabled={loading} style={{ padding: '10px 25px', background: '#008080', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? 'Processing Payment...' : `Pay ₹${selectedDoctor.fees} & Book Appointment`}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default BookAppointment;