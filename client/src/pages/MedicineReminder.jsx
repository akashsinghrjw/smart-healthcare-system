import React, { useState } from 'react';
import { FaPills, FaPlus, FaClock, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';

export default function MedicineReminder({ userEmail }) {
  const daysOfWeek = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [selectedDay, setSelectedDay] = useState('All');

  const [medList, setMedList] = useState(() => {
    const saved = localStorage.getItem(`calendar_medicines_${userEmail}`);
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, name: 'Paracetamol 650mg', time: '08:00', slot: 'Morning', days: ['Mon', 'Wed', 'Fri', 'Sun'], status: 'Taken' },
          { id: 2, name: 'Amoxicillin 500mg', time: '14:00', slot: 'Afternoon', days: ['All'], status: 'Pending' },
          { id: 3, name: 'Vitamin D3 & Calcium', time: '20:30', slot: 'Night', days: ['Sun'], status: 'Pending' }
        ];
  });

  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedSlot, setNewMedSlot] = useState('Morning');
  const [newMedDays, setNewMedDays] = useState(['All']);

  const saveMedList = (list) => {
    setMedList(list);
    localStorage.setItem(`calendar_medicines_${userEmail}`, JSON.stringify(list));
  };

  const toggleDaySelection = (day) => {
    if (day === 'All') {
      setNewMedDays(['All']);
      return;
    }
    let filtered = newMedDays.filter((d) => d !== 'All');
    if (filtered.includes(day)) {
      filtered = filtered.filter((d) => d !== day);
      if (filtered.length === 0) filtered = ['All'];
    } else {
      filtered.push(day);
    }
    setNewMedDays(filtered);
  };

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newMed = {
      id: Date.now(),
      name: newMedName.trim(),
      time: newMedTime,
      slot: newMedSlot,
      days: newMedDays,
      status: 'Pending'
    };

    saveMedList([...medList, newMed]);
    setNewMedName('');
    setNewMedTime('08:00');
    setNewMedSlot('Morning');
    setNewMedDays(['All']);
  };

  const handleToggleMedStatus = (id) => {
    const updated = medList.map((m) =>
      m.id === id ? { ...m, status: m.status === 'Taken' ? 'Pending' : 'Taken' } : m
    );
    saveMedList(updated);
  };

  const handleDeleteMedicine = (id) => {
    if (window.confirm('Kya aap yeh schedule delete karna chahte hain?')) {
      const updated = medList.filter((m) => m.id !== id);
      saveMedList(updated);
    }
  };

  const filteredMedicines = medList.filter((m) => {
    if (selectedDay === 'All') return true;
    return m.days.includes('All') || m.days.includes(selectedDay);
  });

  const takenCount = filteredMedicines.filter((m) => m.status === 'Taken').length;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto 60px', padding: '0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
          Medicine & Routine Schedule
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Manage your daily prescriptions with day-wise tracking and routine dose timers.
        </p>
      </div>

      {/* Add Medicine Schedule Form */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FaPlus color="#0d9488" />
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>Add New Prescription Schedule</h3>
        </div>

        <form onSubmit={handleAddMedicine}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>Medicine Name & Dosage</label>
              <input
                type="text"
                placeholder="e.g. Paracetamol 650mg, Dolo"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>Time</label>
              <input
                type="time"
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
                required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>Routine Slot</label>
              <select
                value={newMedSlot}
                onChange={(e) => setNewMedSlot(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>

          {/* Repeat Days Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
              Repeat on Days:
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {daysOfWeek.map((d) => (
                <button
                  type="button"
                  key={`add-day-${d}`}
                  onClick={() => toggleDaySelection(d)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: newMedDays.includes(d) ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                    background: newMedDays.includes(d) ? '#ccfbf1' : '#ffffff',
                    color: newMedDays.includes(d) ? '#0f766e' : '#64748b',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '11px 24px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '13.5px'
            }}
          >
            Save Schedule
          </button>
        </form>
      </div>

      {/* Routine Schedule List with Calendar Filter */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Daily Prescriptions</h3>
            <small style={{ color: '#64748b' }}>Filter by specific day to track compliance</small>
          </div>
          <span style={{ fontSize: '12.5px', background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '6px', fontWeight: '700' }}>
            {takenCount} / {filteredMedicines.length} Doses Taken
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '18px' }}>
          {daysOfWeek.map((day) => (
            <button
              key={`filter-${day}`}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                border: selectedDay === day ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                background: selectedDay === day ? '#0d9488' : '#f8fafc',
                color: selectedDay === day ? '#ffffff' : '#475569',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* List Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMedicines.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', margin: '30px 0' }}>
              No medicines scheduled for {selectedDay}.
            </p>
          ) : (
            filteredMedicines.map((med) => (
              <div
                key={med.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    <FaPills />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14.5px', color: '#0f172a', display: 'block' }}>{med.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: '#0d9488', fontWeight: '700' }}>
                        <FaClock size={11} style={{ marginRight: '4px' }} />
                        {med.time} ({med.slot})
                      </span>
                      <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                        Days: {med.days.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleToggleMedStatus(med.id)}
                    style={{
                      background: med.status === 'Taken' ? '#dcfce7' : '#fef3c7',
                      color: med.status === 'Taken' ? '#16a34a' : '#d97706',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {med.status === 'Taken' ? 'Taken ✓' : 'Pending ⏳'}
                  </button>

                  <button
                    onClick={() => handleDeleteMedicine(med.id)}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    title="Delete Reminder"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}