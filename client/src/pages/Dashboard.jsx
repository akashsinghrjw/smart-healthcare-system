import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  FaCamera,
  FaBars,
  FaTimes,
  FaBell,
  FaLock,
  FaHeartbeat,
  FaTint,
  FaThermometerHalf,
  FaWeight,
  FaTrashAlt,
  FaFileMedicalAlt,
  FaRobot,
  FaPills,
  FaPlus,
  FaCheck,
  FaExclamationTriangle,
  FaEye,
  FaClock,
  FaUserEdit,
  FaShieldAlt,
  FaSlidersH,
  FaUserMd,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaRupeeSign
} from 'react-icons/fa';

const vitalCardStyle = {
  background: '#ffffff',
  borderRadius: '14px',
  padding: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

export default function Dashboard({
  userName,
  setUserName,
  userEmail,
  userPhone,
  setUserPhone,
  onNavigateHome,
  handleDeleteMyAccount
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Profile Details State
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem(`profile_pic_${userEmail}`) || ''
  );
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [height, setHeight] = useState(localStorage.getItem(`height_${userEmail}`) || '178');
  const [weight, setWeight] = useState(localStorage.getItem(`weight_${userEmail}`) || '75');
  const [bloodGroup, setBloodGroup] = useState(localStorage.getItem(`bg_${userEmail}`) || 'O+');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Personal Info Edit
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone || '');
  const [profileUpdateMsg, setProfileUpdateMsg] = useState('');

  const handleUpdatePersonalInfo = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    if (setUserName) setUserName(editName.trim());
    if (setUserPhone) setUserPhone(editPhone.trim());
    localStorage.setItem('userName', editName.trim());
    localStorage.setItem('userPhone', editPhone.trim());
    setProfileUpdateMsg('Profile info updated!');
    setTimeout(() => setProfileUpdateMsg(''), 3000);
  };

  // Password Update
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('Passwords match nahi kar rahe hain!');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Password kam se kam 6 characters ka hona chahiye');
      return;
    }

    setPwdLoading(true);
    try {
      await api.updatePassword(newPassword);
      setPwdMsg('Password successfully update ho gaya!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.message || 'Password update failed');
    } finally {
      setPwdLoading(false);
    }
  };

  // Notification Preferences
  const [notifPreferences, setNotifPreferences] = useState({
    doseReminders: true,
    vitalsAlerts: true,
    emailReports: false
  });

  const toggleNotif = (key) => {
    setNotifPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [notifications] = useState([
    { id: 1, text: 'Clinical database synchronized with MongoDB Atlas.', time: 'Just now' },
    { id: 2, text: 'Password and medical data encrypted with SSL.', time: 'Today' }
  ]);

  // ==========================================
  // DOCTORS MODULE & APPOINTMENT BOOKING
  // ==========================================
  const [doctorsList, setDoctorsList] = useState([]);
  const [docLoading, setDocLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');
  const [latestReceipt, setLatestReceipt] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await api.getDoctors();
        setDoctorsList(data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setDocLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      alert('Kripya sabhi details bharein.');
      return;
    }

    setBookingLoading(true);
    setBookingMsg('');
    try {
      const data = await api.bookAppointment({
        doctorId: selectedDoctor._id,
        date: appointmentDate,
        time: appointmentTime
      });

      setLatestReceipt({
        bookingId: data?._id || `SHS-${Math.floor(100000 + Math.random() * 900000)}`,
        patientName: userName,
        patientEmail: userEmail,
        patientPhone: userPhone || 'Not provided',
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        hospital: selectedDoctor.hospitalName,
        fees: selectedDoctor.fees,
        date: appointmentDate,
        time: appointmentTime,
        bookedAt: new Date().toLocaleDateString()
      });

      setBookingMsg('Appointment successfully booked!');
      setSelectedDoctor(null);
      setTimeout(() => {
        setBookingMsg('');
      }, 3000);
    } catch (err) {
      setBookingMsg(err.message || 'Network error while booking appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  // ==========================================
  // AI SYMPTOMS ADVISOR (DIRECT GEMINI RESPONSE)
  // ==========================================
  const [symptomQuery, setSymptomQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleAnalyzeSymptom = async (queryText) => {
    const query = (queryText || symptomQuery || '').trim();
    if (!query) return;

    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await api.analyzeSymptoms(query, { email: userEmail, name: userName });
      if (res && res.analysis) {
        setAiResult(res.analysis);
      } else if (res && res.message) {
        setAiResult(res.message);
      } else {
        setAiResult('Clinical Guidance: Stay hydrated, take adequate rest, and observe your symptoms.');
      }
    } catch (err) {
      console.error("AI Triage Fetch Error:", err);
      setAiResult(`Notice: ${err.message || 'Failed to reach AI service. Please retry in a moment.'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================
  // HEALTH RECORDS VAULT
  // ==========================================
  const [vaultReports, setVaultReports] = useState(() => {
    const saved = localStorage.getItem(`vault_reports_${userEmail}`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: 'Complete Blood Count (CBC)',
            type: 'Diagnostic Lab Report',
            date: 'Oct 19, 2026',
            fileData: null,
            fileName: 'CBC_Report.pdf'
          }
        ];
  });
  const [recordTitle, setRecordTitle] = useState('');
  const [recordType, setRecordType] = useState('Diagnostic Lab Report');
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  const saveReports = (list) => {
    setVaultReports(list);
    localStorage.setItem(`vault_reports_${userEmail}`, JSON.stringify(list));
  };

  const handleUploadReport = (e) => {
    e.preventDefault();
    if (!recordTitle.trim()) {
      alert('Kripya report ka title bharein!');
      return;
    }

    if (selectedFileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newRecord = {
          id: Date.now(),
          title: recordTitle.trim(),
          type: recordType,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          fileData: reader.result,
          fileName: selectedFileObj.name
        };
        saveReports([newRecord, ...vaultReports]);
        setRecordTitle('');
        setSelectedFileObj(null);
        alert('Document vault me safely upload ho gaya!');
      };
      reader.readAsDataURL(selectedFileObj);
    } else {
      const newRecord = {
        id: Date.now(),
        title: recordTitle.trim(),
        type: recordType,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        fileData: null,
        fileName: 'Clinical_Note.pdf'
      };
      saveReports([newRecord, ...vaultReports]);
      setRecordTitle('');
      alert('Report title save ho gaya!');
    }
  };

  const handleDeleteReport = (id) => {
    if (window.confirm('Kya aap yeh report vault se delete karna chahte hain?')) {
      const updated = vaultReports.filter((r) => r.id !== id);
      saveReports(updated);
    }
  };

  // ====================================================
  // FLEXIBLE MEDICINE ROUTINE TRACKER
  // ====================================================
  const todayStr = new Date().toISOString().split('T')[0];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const [medList, setMedList] = useState(() => {
    const saved = localStorage.getItem(`flex_medicines_${userEmail}`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: 'Amoxicillin 500mg',
            type: 'range',
            startDate: todayStr,
            endDate: '2026-10-25',
            time: '08:00',
            days: [],
            status: 'Pending'
          },
          {
            id: 2,
            name: 'Vitamin D3 Capsule',
            type: 'weekly',
            startDate: '',
            endDate: '',
            time: '20:00',
            days: ['Sun'],
            status: 'Taken'
          }
        ];
  });

  const [scheduleMode, setScheduleMode] = useState('range');
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newStartDate, setNewStartDate] = useState(todayStr);
  const [newEndDate, setNewEndDate] = useState(todayStr);
  const [newSingleDate, setNewSingleDate] = useState(todayStr);
  const [selectedWeeklyDays, setSelectedWeeklyDays] = useState(['Mon']);

  const saveMedList = (list) => {
    setMedList(list);
    localStorage.setItem(`flex_medicines_${userEmail}`, JSON.stringify(list));
  };

  const toggleDaySelection = (day) => {
    if (selectedWeeklyDays.includes(day)) {
      const filtered = selectedWeeklyDays.filter((d) => d !== day);
      setSelectedWeeklyDays(filtered.length === 0 ? ['Mon'] : filtered);
    } else {
      setSelectedWeeklyDays([...selectedWeeklyDays, day]);
    }
  };

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    let scheduleDetail = {};
    if (scheduleMode === 'range') {
      scheduleDetail = {
        type: 'range',
        startDate: newStartDate,
        endDate: newEndDate,
        days: []
      };
    } else if (scheduleMode === 'single') {
      scheduleDetail = {
        type: 'single',
        startDate: newSingleDate,
        endDate: newSingleDate,
        days: []
      };
    } else {
      scheduleDetail = {
        type: 'weekly',
        startDate: '',
        endDate: '',
        days: selectedWeeklyDays
      };
    }

    const newMed = {
      id: Date.now(),
      name: newMedName.trim(),
      time: newMedTime,
      status: 'Pending',
      ...scheduleDetail
    };

    saveMedList([...medList, newMed]);
    setNewMedName('');
    setNewMedTime('08:00');
  };

  const handleToggleMedStatus = (id) => {
    const updated = medList.map((m) =>
      m.id === id ? { ...m, status: m.status === 'Taken' ? 'Pending' : 'Taken' } : m
    );
    saveMedList(updated);
  };

  const handleDeleteMedicine = (id) => {
    if (window.confirm('Kya aap yeh medicine reminder delete karna chahte hain?')) {
      const updated = medList.filter((m) => m.id !== id);
      saveMedList(updated);
    }
  };

  const takenCount = medList.filter((m) => m.status === 'Taken').length;

  // ==========================================
  // CHECK VITALS CALCULATOR
  // ==========================================
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [vitalsResult, setVitalsResult] = useState(null);

  const [currentVitals, setCurrentVitals] = useState(() => {
    const saved = localStorage.getItem(`vitals_${userEmail}`);
    return saved
      ? JSON.parse(saved)
      : { bp: '120/80', hr: '72', temp: '98.6', status: 'Normal Range' };
  });

  const handleCalculateVitals = (e) => {
    e.preventDefault();
    const sys = parseInt(systolicBP, 10);
    const dia = parseInt(diastolicBP, 10);
    const hr = parseInt(heartRate, 10);
    const temp = parseFloat(temperature);

    if (isNaN(sys) || isNaN(dia) || isNaN(hr) || isNaN(temp)) {
      alert('Kripya sabhi vitals ki valid numeric value bharein');
      return;
    }

    let status = 'Normal Range';
    let alertType = 'success';
    let remarks = 'All clinical parameters are within optimal adult ranges.';

    if (sys > 140 || dia > 90 || temp > 100.4 || hr > 100) {
      status = 'Needs Attention';
      alertType = 'danger';
      remarks = 'Elevated reading detected. Rest and consult a doctor if discomfort continues.';
    } else if (sys < 90 || dia < 60 || hr < 50) {
      status = 'Below Range';
      alertType = 'warning';
      remarks = 'Readings are on the lower side. Ensure proper hydration and rest.';
    }

    const result = {
      bp: `${sys}/${dia}`,
      hr: `${hr}`,
      temp: `${temp}`,
      status,
      alertType,
      remarks,
      date: new Date().toLocaleDateString()
    };

    setVitalsResult(result);
    setCurrentVitals(result);
    localStorage.setItem(`vitals_${userEmail}`, JSON.stringify(result));
  };

  // Profile Upload Handlers
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem(`profile_pic_${userEmail}`, reader.result);
        setProfileSavedMsg('Profile photo updated successfully!');
        setShowPhotoModal(false);
        setTimeout(() => setProfileSavedMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    if (window.confirm('Kya aap profile picture hatana chahte hain?')) {
      setProfileImage('');
      localStorage.removeItem(`profile_pic_${userEmail}`);
      setShowPhotoModal(false);
      setProfileSavedMsg('Profile photo removed.');
      setTimeout(() => setProfileSavedMsg(''), 3000);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem(`height_${userEmail}`, height);
    localStorage.setItem(`weight_${userEmail}`, weight);
    localStorage.setItem(`bg_${userEmail}`, bloodGroup);
    setProfileSavedMsg('Profile details successfully updated!');
    setTimeout(() => setProfileSavedMsg(''), 3000);
  };

  return (
    <div style={{ position: 'relative', minHeight: '80vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* 1. TOP HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Patient Health Dashboard
          </h2>
          <small style={{ color: '#0d9488', fontWeight: '700' }}>SMART CLINICAL WORKSPACE</small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowVitalsModal(true)}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaHeartbeat /> Check Your Vitals
          </button>

          <button
            onClick={onNavigateHome}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            ← Back to Home
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              border: '1.5px solid #0d9488',
              background: '#f0fdfa',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer'
            }}
            title="Open Profile Settings & Security Menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* 2. PROFILE BANNER CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
          border: '1px solid #ccfbf1',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            onClick={() => setShowPhotoModal(true)}
            style={{ position: 'relative', width: '74px', height: '74px', cursor: 'pointer' }}
            title="View or Change Profile Photo"
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#0d9488',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '700',
                overflow: 'hidden',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#0f172a',
                color: '#ffffff',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <FaCamera />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>{userName}</h3>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px' }}>
                ● ACTIVE PATIENT
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Email: <b>{userEmail}</b> | Mobile: <b>{userPhone || 'Not set'}</b>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={{ width: '75px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{ width: '75px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <button
            onClick={handleSaveProfile}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: '16px',
              fontSize: '13px'
            }}
          >
            Save Details
          </button>
        </div>
      </div>
      {profileSavedMsg && (
        <div style={{ color: '#0d9488', fontWeight: '700', fontSize: '13px', marginBottom: '14px' }}>
          ✓ {profileSavedMsg}
        </div>
      )}

      {/* 3. HEALTH OVERVIEW READINGS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={vitalCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7' }}><FaTint /> <span>Blood Pressure</span></div>
          <h4 style={{ margin: '6px 0 0', fontSize: '20px', color: '#0f172a' }}>{currentVitals.bp} <small style={{ fontSize: '12px', color: '#64748b' }}>mmHg</small></h4>
          <span style={{ fontSize: '11px', color: currentVitals.status === 'Needs Attention' ? '#dc2626' : '#16a34a', fontWeight: '700' }}>
            ● {currentVitals.status}
          </span>
        </div>
        <div style={vitalCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}><FaHeartbeat /> <span>Heart Rate</span></div>
          <h4 style={{ margin: '6px 0 0', fontSize: '20px', color: '#0f172a' }}>{currentVitals.hr} <small style={{ fontSize: '12px', color: '#64748b' }}>bpm</small></h4>
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>● Recorded</span>
        </div>
        <div style={vitalCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}><FaThermometerHalf /> <span>Temperature</span></div>
          <h4 style={{ margin: '6px 0 0', fontSize: '20px', color: '#0f172a' }}>{currentVitals.temp} <small style={{ fontSize: '12px', color: '#64748b' }}>°F</small></h4>
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>● Clinical</span>
        </div>
        <div style={vitalCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}><FaWeight /> <span>BMI Index</span></div>
          <h4 style={{ margin: '6px 0 0', fontSize: '20px', color: '#0f172a' }}>22.4 <small style={{ fontSize: '12px', color: '#64748b' }}>Normal</small></h4>
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>● Healthy</span>
        </div>
      </div>

      {/* 4. DOCTORS MODULE & APPOINTMENT BOOKING */}
      <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdfa 100%)', borderRadius: '20px', padding: '24px', border: '1.5px solid #ccfbf1', boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.08)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)', padding: '12px', borderRadius: '14px', color: '#ffffff', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)' }}>
              <FaUserMd size={22} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>
                Available Doctors & Consultations
              </h4>
              <small style={{ color: '#0d9488', fontWeight: '700' }}>Book your slot with verified clinical specialists</small>
            </div>
          </div>
          <span style={{ fontSize: '12px', background: '#0d9488', color: '#ffffff', padding: '6px 14px', borderRadius: '999px', fontWeight: '700', boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)' }}>
            ● {doctorsList.length} Doctors Online
          </span>
        </div>

        {docLoading ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', margin: '30px 0' }}>Loading doctors from MongoDB Atlas...</p>
        ) : doctorsList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: '30px 0' }}>No doctors found in database.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '18px' }}>
            {doctorsList.map((doc) => (
              <div 
                key={doc._id} 
                style={{ 
                  background: 'linear-gradient(145deg, #ffffff 0%, #f0fdf4 100%)', 
                  border: '1.5px solid #bbf7d0', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 24px -6px rgba(16, 185, 129, 0.2)';
                  e.currentTarget.style.borderColor = '#10b981';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#bbf7d0';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                      <FaUserMd />
                    </div>
                    <div>
                      <h5 style={{ margin: '0 0 2px', fontSize: '16.5px', color: '#0f172a', fontWeight: '800' }}>{doc.name}</h5>
                      <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '700' }}>{doc.qualification}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11.5px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      {doc.specialization}
                    </span>
                    <span style={{ fontSize: '13.5px', color: '#15803d', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <FaRupeeSign size={12} /> {doc.fees}
                    </span>
                  </div>
                  
                  <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', margin: '12px 0' }}>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaMapMarkerAlt size={12} color="#0d9488" /> <b>{doc.hospitalName}</b>, {doc.location}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDoctor(doc)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.92'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <FaCalendarCheck /> Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. AI TRIAGE / SYMPTOM CHECKER */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FaRobot color="#0d9488" size={18} />
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>
            AI Health Advisor (Google Gemini 3.8 Flash)
          </h4>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Type symptoms (e.g. high fever, headache, dry cough, stomach pain)..."
            value={symptomQuery}
            onChange={(e) => setSymptomQuery(e.target.value)}
            style={{ flex: 1, padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
          />
          <button
            onClick={() => handleAnalyzeSymptom(symptomQuery)}
            disabled={aiLoading}
            style={{
              padding: '0 24px',
              background: '#0d9488',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              opacity: aiLoading ? 0.7 : 1
            }}
          >
            {aiLoading ? 'Analyzing...' : 'Check Health'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b', alignSelf: 'center', fontWeight: '600' }}>Quick Chips:</span>
          {['🔥 High Fever', '🤕 Migraine', '🤢 Stomach Cramps', '🤧 Dry Cough'].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setSymptomQuery(chip);
                handleAnalyzeSymptom(chip);
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '999px',
                padding: '4px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#334155'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {aiResult && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 16px', borderRadius: '8px', marginTop: '16px', fontSize: '14px', color: '#166534', lineHeight: '1.6' }}>
            <b>Clinical Guidance:</b> {aiResult}
          </div>
        )}
      </div>

      {/* 6. 2-COLUMN SECTION: VAULT + FLEXIBLE MEDICINE TRACKER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        
        {/* HEALTH RECORDS VAULT */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaFileMedicalAlt color="#0d9488" size={17} />
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '800' }}>Health Records Vault</h4>
            </div>
            <span style={{ fontSize: '11.5px', background: '#f0fdfa', color: '#0d9488', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
              {vaultReports.length} Files
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px' }}>Upload clinical lab reports or prescriptions to personal vault.</p>

          <form onSubmit={handleUploadReport} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Report Title (e.g. Blood Test, X-Ray)"
              value={recordTitle}
              onChange={(e) => setRecordTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '13px', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#fff' }}
              >
                <option value="Diagnostic Lab Report">Diagnostic Lab Report</option>
                <option value="Doctor Prescription">Doctor Prescription</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>

              <label
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <FaFileMedicalAlt color="#0d9488" /> {selectedFileObj ? 'Chosen' : 'Choose File'}
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setSelectedFileObj(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '10px', background: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
            >
              Upload & Save to Vault
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {vaultReports.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: '14px 0' }}>No records uploaded yet.</p>
            ) : (
              vaultReports.map((report) => (
                <div
                  key={report.id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#1e293b', display: 'block' }}>{report.title}</strong>
                    <small style={{ color: '#64748b', fontSize: '11.5px' }}>{report.type} • {report.date}</small>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setViewingReport(report)}
                      style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FaEye size={11} /> View
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <FaTrashAlt size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FLEXIBLE MEDICINE ROUTINE TRACKER */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaPills color="#0d9488" size={17} />
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '800' }}>Medicine & Routine Tracker</h4>
            </div>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: '6px' }}>
              {takenCount} / {medList.length} Doses Taken
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px' }}>
            Schedule and track your daily prescription dosages.
          </p>

          <form onSubmit={handleAddMedicine} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Medicine Name & Dosage"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                required
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              />
              <input
                type="time"
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
                style={{ width: '90px', padding: '8px 6px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <select
                value={scheduleMode}
                onChange={(e) => setScheduleMode(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
              >
                <option value="range">Date Range</option>
                <option value="single">Single Date</option>
                <option value="weekly">Weekly Days</option>
              </select>

              {scheduleMode === 'range' && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} style={{ padding: '5px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>to</span>
                  <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} style={{ padding: '5px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              )}

              {scheduleMode === 'single' && (
                <input type="date" value={newSingleDate} onChange={(e) => setNewSingleDate(e.target.value)} style={{ padding: '5px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              )}
            </div>

            {scheduleMode === 'weekly' && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', justifyContent: 'space-between' }}>
                {daysOfWeek.map((day) => {
                  const active = selectedWeeklyDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDaySelection(day)}
                      style={{
                        flex: 1,
                        padding: '5px 0',
                        fontSize: '11px',
                        fontWeight: '700',
                        borderRadius: '6px',
                        border: active ? '1px solid #0d9488' : '1px solid #cbd5e1',
                        background: active ? '#0d9488' : '#ffffff',
                        color: active ? '#ffffff' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              style={{ width: '100%', padding: '8px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
            >
              + Add Medicine Reminder
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {medList.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', margin: '10px 0' }}>No medicine reminders active.</p>
            ) : (
              medList.map((med) => {
                const isTaken = med.status === 'Taken';
                return (
                  <div
                    key={med.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isTaken ? '#f0fdf4' : '#f8fafc',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isTaken ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block', textDecoration: isTaken ? 'line-through' : 'none' }}>
                        {med.name}
                      </strong>
                      <small style={{ color: '#64748b', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaClock size={10} /> {med.time} | {med.type === 'weekly' ? `Days: ${med.days.join(', ')}` : `${med.startDate || 'Today'}`}
                      </small>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleMedStatus(med.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isTaken ? '#dcfce7' : '#e2e8f0',
                          color: isTaken ? '#15803d' : '#334155',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {isTaken ? '✓ Taken' : 'Mark Taken'}
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(med.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <FaTrashAlt size={11} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ================= MODALS & SLIDE-OUT DRAWER ================= */}

      {/* 1. APPOINTMENT BOOKING MODAL */}
      {selectedDoctor && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', width: '420px', maxWidth: '100%', borderRadius: '16px', padding: '24px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUserMd color="#0d9488" /> Book Appointment
              </h3>
              <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}><FaTimes /></button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '15px' }}>{selectedDoctor.name}</h4>
              <p style={{ margin: '0 0 2px', fontSize: '12.5px', color: '#475569' }}>{selectedDoctor.specialization} • {selectedDoctor.hospitalName}</p>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#16a34a', fontWeight: '700' }}>Consultation Fee: ₹{selectedDoctor.fees}</p>
            </div>

            <form onSubmit={handleBookAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Appointment Date</label>
                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Appointment Time</label>
                <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" disabled={bookingLoading} style={{ width: '100%', padding: '11px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '6px' }}>
                {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>

            {bookingMsg && (
              <div style={{ background: bookingMsg.includes('success') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${bookingMsg.includes('success') ? '#bbf7d0' : '#fecaca'}`, padding: '12px', borderRadius: '8px', marginTop: '12px', color: bookingMsg.includes('success') ? '#166534' : '#dc2626', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}>
                {bookingMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PROFESSIONAL APPOINTMENT & PAYMENT RECEIPT MODAL */}
      {latestReceipt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', width: '520px', maxWidth: '100%', borderRadius: '16px', padding: '28px', boxSizing: 'border-box', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            {/* Receipt Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 4px', color: '#0d9488', fontSize: '20px', fontWeight: '800' }}>SMART HEALTHCARE SYSTEM</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Official Clinical Consultation & Payment Receipt</p>
              <span style={{ display: 'inline-block', marginTop: '8px', background: '#f0fdfa', color: '#0d9488', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px' }}>
                Receipt ID: {latestReceipt.bookingId}
              </span>
            </div>

            {/* Patient & Booking Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#334155', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><b>Patient Name:</b></span>
                <span>{latestReceipt.patientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><b>Email Address:</b></span>
                <span>{latestReceipt.patientEmail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><b>Phone Number:</b></span>
                <span>{latestReceipt.patientPhone}</span>
              </div>
              <hr style={{ border: '0', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><b>Consulting Doctor:</b></span>
                <span style={{ color: '#0d9488', fontWeight: '700' }}>{latestReceipt.doctorName} ({latestReceipt.specialization})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><b>Hospital / Clinic:</b></span>
                <span>{latestReceipt.hospital}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><b>Appointment Slot:</b></span>
                <span>{latestReceipt.date} at {latestReceipt.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><b>Payment Status:</b></span>
                <span style={{ color: '#16a34a', fontWeight: '700' }}>● SUCCESSFUL (Paid ₹{latestReceipt.fees})</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => window.print()} 
                style={{ flex: 1, padding: '11px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
              >
                🖨️ Print / Download PDF
              </button>
              <button 
                onClick={() => setLatestReceipt(null)} 
                style={{ flex: 1, padding: '11px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. SLIDE-OUT DRAWER FOR SETTINGS & SECURITY */}
      {isDrawerOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '380px', maxWidth: '100%', background: '#ffffff', height: '100%', padding: '24px', overflowY: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaSlidersH color="#0d9488" /> Profile & Security
              </h3>
              <button onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>
                <FaTimes />
              </button>
            </div>

            {/* Personal Info Update */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaUserEdit color="#0d9488" /> Personal Info
              </h4>
              <form onSubmit={handleUpdatePersonalInfo} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button type="submit" style={{ padding: '8px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                  Update Info
                </button>
              </form>
              {profileUpdateMsg && <small style={{ color: '#0d9488', fontWeight: '700', marginTop: '4px', display: 'block' }}>{profileUpdateMsg}</small>}
            </div>

            {/* Password Update */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaLock color="#0d9488" /> Change Password
              </h4>
              <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="password"
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button type="submit" disabled={pwdLoading} style={{ padding: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
              {pwdMsg && <small style={{ color: '#16a34a', fontWeight: '700', marginTop: '4px', display: 'block' }}>{pwdMsg}</small>}
              {pwdError && <small style={{ color: '#dc2626', fontWeight: '700', marginTop: '4px', display: 'block' }}>{pwdError}</small>}
            </div>

            {/* Notification Toggles */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaBell color="#0d9488" /> Notifications & Alerts
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span>Dose Reminders</span>
                  <input type="checkbox" checked={notifPreferences.doseReminders} onChange={() => toggleNotif('doseReminders')} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span>Vitals Threshold Alerts</span>
                  <input type="checkbox" checked={notifPreferences.vitalsAlerts} onChange={() => toggleNotif('vitalsAlerts')} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span>Email Clinical Reports</span>
                  <input type="checkbox" checked={notifPreferences.emailReports} onChange={() => toggleNotif('emailReports')} />
                </label>
              </div>
            </div>

            {/* System Status */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaShieldAlt color="#0d9488" /> Security Status
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#334155' }}>
                    <p style={{ margin: 0 }}>{n.text}</p>
                    <small style={{ color: '#94a3b8' }}>{n.time}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Deletion */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: 'auto' }}>
              <button
                onClick={handleDeleteMyAccount}
                style={{ width: '100%', padding: '10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
              >
                Delete My Patient Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. VITALS CALCULATOR MODAL */}
      {showVitalsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', width: '420px', maxWidth: '100%', borderRadius: '16px', padding: '24px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaHeartbeat color="#0d9488" /> Vitals Clinical Calculator
              </h3>
              <button onClick={() => setShowVitalsModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}><FaTimes /></button>
            </div>

            <form onSubmit={handleCalculateVitals} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Systolic BP (mmHg)</label>
                  <input type="number" placeholder="120" value={systolicBP} onChange={(e) => setSystolicBP(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Diastolic BP (mmHg)</label>
                  <input type="number" placeholder="80" value={diastolicBP} onChange={(e) => setDiastolicBP(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Heart Rate (bpm)</label>
                  <input type="number" placeholder="72" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>Temperature (°F)</label>
                  <input type="number" step="0.1" placeholder="98.6" value={temperature} onChange={(e) => setTemperature(e.target.value)} required style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="submit" style={{ width: '100%', padding: '11px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '6px' }}>
                Analyze Vitals
              </button>
            </form>

            {vitalsResult && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', marginTop: '16px' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>Status: {vitalsResult.status}</strong>
                <p style={{ fontSize: '13px', color: '#15803d', margin: 0 }}>{vitalsResult.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. PROFILE PHOTO MODAL */}
      {showPhotoModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', width: '360px', maxWidth: '100%', borderRadius: '16px', padding: '24px', textAlign: 'center', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>Manage Profile Photo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ background: '#0d9488', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                Upload New Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
              {profileImage && (
                <button onClick={handleRemovePhoto} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  Remove Current Photo
                </button>
              )}
              <button onClick={() => setShowPhotoModal(false)} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REPORT VIEW MODAL */}
      {viewingReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', width: '500px', maxWidth: '100%', borderRadius: '16px', padding: '24px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{viewingReport.title}</h3>
              <button onClick={() => setViewingReport(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}><FaTimes /></button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px' }}>Type: <b>{viewingReport.type}</b> | Date: <b>{viewingReport.date}</b></p>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', textAlign: 'center', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {viewingReport.fileData ? (
                viewingReport.fileName.endsWith('.pdf') ? (
                  <iframe src={viewingReport.fileData} title="PDF Preview" style={{ width: '100%', height: '260px', border: 'none' }} />
                ) : (
                  <img src={viewingReport.fileData} alt="Report Preview" style={{ maxWidth: '100%', maxHeight: '260px', objectFit: 'contain' }} />
                )
              ) : (
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Clinical note / Title record without attached binary file.</p>
              )}
            </div>

            <button onClick={() => setViewingReport(null)} style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Close Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
}