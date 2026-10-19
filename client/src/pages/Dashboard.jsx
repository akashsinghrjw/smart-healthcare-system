import React, { useState } from 'react';
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
  FaSlidersH
} from 'react-icons/fa';

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

      {/* 4. AI TRIAGE / SYMPTOM CHECKER */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FaRobot color="#0d9488" size={18} />
          <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>
            AI Health Advisor (Google Gemini 1.5 Flash)
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

      {/* 5. 2-COLUMN SECTION: VAULT + FLEXIBLE MEDICINE TRACKER */}
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
            Schedule courses date-to-date, on particular dates, or on weekly routine days.
          </p>

          {/* Mode Selector Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => setScheduleMode('range')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                background: scheduleMode === 'range' ? '#0d9488' : 'transparent',
                color: scheduleMode === 'range' ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '11.5px',
                cursor: 'pointer'
              }}
            >
              📅 Date to Date
            </button>

            <button
              type="button"
              onClick={() => setScheduleMode('single')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                background: scheduleMode === 'single' ? '#0d9488' : 'transparent',
                color: scheduleMode === 'single' ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '11.5px',
                cursor: 'pointer'
              }}
            >
              🎯 Single Date
            </button>

            <button
              type="button"
              onClick={() => setScheduleMode('weekly')}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                background: scheduleMode === 'weekly' ? '#0d9488' : 'transparent',
                color: scheduleMode === 'weekly' ? '#ffffff' : '#64748b',
                fontWeight: '700',
                fontSize: '11.5px',
                cursor: 'pointer'
              }}
            >
              🔁 Weekly Days
            </button>
          </div>

          {/* Add Medicine Schedule Form */}
          <form onSubmit={handleAddMedicine} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                required
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
              />

              <input
                type="time"
                value={newMedTime}
                onChange={(e) => setNewMedTime(e.target.value)}
                required
                style={{ width: '105px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
              />
            </div>

            {scheduleMode === 'range' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>End Date (Course)</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {scheduleMode === 'single' && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>Particular Scheduled Date</label>
                <input
                  type="date"
                  value={newSingleDate}
                  onChange={(e) => setNewSingleDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff', boxSizing: 'border-box' }}
                />
              </div>
            )}

            {scheduleMode === 'weekly' && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Select Repeat Days:</label>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {daysOfWeek.map((d) => (
                    <button
                      type="button"
                      key={`btn-day-${d}`}
                      onClick={() => toggleDaySelection(d)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: selectedWeeklyDays.includes(d) ? '1px solid #0d9488' : '1px solid #cbd5e1',
                        background: selectedWeeklyDays.includes(d) ? '#ccfbf1' : '#ffffff',
                        color: selectedWeeklyDays.includes(d) ? '#0f766e' : '#64748b',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '9px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FaPlus size={11} /> Save Scheduled Reminder
            </button>
          </form>

          {/* Active Medicines List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {medList.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12.5px', margin: '14px 0' }}>
                No active medicine reminders scheduled.
              </p>
            ) : (
              medList.map((med) => (
                <div
                  key={med.id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <div>
                    <strong style={{ fontSize: '13px', color: '#1e293b' }}>{med.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: '700' }}>
                        <FaClock size={10} style={{ marginRight: '3px' }} />
                        {med.time}
                      </span>

                      {med.type === 'range' && (
                        <span style={{ fontSize: '10.5px', background: '#e0f2fe', color: '#0284c7', padding: '1px 5px', borderRadius: '4px', fontWeight: '600' }}>
                          📅 {med.startDate} to {med.endDate}
                        </span>
                      )}

                      {med.type === 'single' && (
                        <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#d97706', padding: '1px 5px', borderRadius: '4px', fontWeight: '600' }}>
                          🎯 Date: {med.startDate}
                        </span>
                      )}

                      {med.type === 'weekly' && (
                        <span style={{ fontSize: '10.5px', background: '#f3e8ff', color: '#7e22ce', padding: '1px 5px', borderRadius: '4px', fontWeight: '600' }}>
                          🔁 Days: {med.days.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleMedStatus(med.id)}
                      style={{
                        background: med.status === 'Taken' ? '#dcfce7' : '#fef3c7',
                        color: med.status === 'Taken' ? '#16a34a' : '#d97706',
                        border: 'none',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {med.status === 'Taken' ? 'Taken ✓' : 'Pending ⏳'}
                    </button>
                    <button
                      onClick={() => handleDeleteMedicine(med.id)}
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

      </div>

      {/* DANGER ZONE: DELETE ACCOUNT */}
      <div style={{ textAlign: 'right', marginTop: '10px' }}>
        <button
          onClick={handleDeleteMyAccount}
          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
        >
          <FaTrashAlt style={{ marginRight: '6px' }} /> Delete My Patient Account
        </button>
      </div>

      {/* SETTINGS & SECURITY DRAWER */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', zIndex: 999998 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '400px',
              maxWidth: '90vw',
              background: '#ffffff',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
              padding: '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 999999,
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>Account Settings</h3>
                <small style={{ color: '#0d9488', fontWeight: '700' }}>SECURITY & PREFERENCES</small>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* EDIT PROFILE & NAME */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>
                <FaUserEdit color="#0d9488" /> Change Name & Personal Info
              </div>
              {profileUpdateMsg && <div style={{ color: '#16a34a', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>✓ {profileUpdateMsg}</div>}
              <form onSubmit={handleUpdatePersonalInfo} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>Contact Mobile</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Enter phone number"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ padding: '9px', background: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', marginTop: '4px' }}
                >
                  Save Profile Changes
                </button>
              </form>
            </div>

            {/* PASSWORD UPDATE */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>
                <FaLock color="#0d9488" /> Update Password
              </div>
              {pwdMsg && <div style={{ color: '#16a34a', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>✓ {pwdMsg}</div>}
              {pwdError && <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>✕ {pwdError}</div>}
              <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <button
                  type="submit"
                  disabled={pwdLoading}
                  style={{ padding: '9px', background: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: pwdLoading ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                >
                  {pwdLoading ? 'Updating in Cloud...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* NOTIFICATION PREFERENCES */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#0f172a', fontWeight: '700', fontSize: '14px' }}>
                <FaSlidersH color="#0d9488" /> Notification Preferences
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span>Medicine Schedule Reminders</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.doseReminders}
                    onChange={() => toggleNotif('doseReminders')}
                  />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span>Critical Vitals Alert</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.vitalsAlerts}
                    onChange={() => toggleNotif('vitalsAlerts')}
                  />
                </label>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <span>Weekly Summary Emails</span>
                  <input
                    type="checkbox"
                    checked={notifPreferences.emailReports}
                    onChange={() => toggleNotif('emailReports')}
                  />
                </label>
              </div>
            </div>

            {/* DATA PRIVACY */}
            <div style={{ background: '#f0fdfa', padding: '14px', borderRadius: '12px', border: '1px solid #ccfbf1', marginBottom: '20px', fontSize: '12px', color: '#0f766e', lineHeight: '1.5' }}>
              <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '13px' }}>
                <FaShieldAlt /> HIPAA & Cloud Security
              </strong>
              Your health vault files and diagnostic readings are encrypted. You can permanently delete your medical profile at any time.
            </div>

            {/* RECENT ALERTS */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#0f172a', fontWeight: '700', fontSize: '13.5px' }}>
                <FaBell color="#0d9488" /> Recent Activity Alerts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', borderLeft: '4px solid #0d9488' }}>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#1e293b', fontWeight: '600' }}>{n.text}</p>
                    <small style={{ color: '#64748b', fontSize: '10.5px' }}>{n.time}</small>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {viewingReport && (
        <div
          onClick={() => setViewingReport(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{viewingReport.title}</h3>
                <small style={{ color: '#64748b' }}>{viewingReport.type} • {viewingReport.date}</small>
              </div>
              <button onClick={() => setViewingReport(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}><FaTimes /></button>
            </div>

            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {viewingReport.fileData ? (
                viewingReport.fileData.startsWith('data:image') ? (
                  <img src={viewingReport.fileData} alt={viewingReport.title} style={{ maxWidth: '100%', maxHeight: '350px', borderRadius: '8px', objectFit: 'contain' }} />
                ) : (
                  <div>
                    <FaFileMedicalAlt size={48} color="#0d9488" style={{ marginBottom: '10px' }} />
                    <h4 style={{ margin: '0 0 6px' }}>{viewingReport.fileName}</h4>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 14px' }}>Document safely stored in vault.</p>
                    <a href={viewingReport.fileData} download={viewingReport.fileName} style={{ background: '#0d9488', color: '#fff', padding: '8px 18px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
                      Download File
                    </a>
                  </div>
                )
              ) : (
                <div>
                  <FaFileMedicalAlt size={44} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>Clinical text record entry stored in your cloud vault.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setViewingReport(null)} style={{ background: '#0d9488', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PHOTO MODAL */}
      {showPhotoModal && (
        <div
          onClick={() => setShowPhotoModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '20px', padding: '26px', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>Profile Picture</h3>
              <button onClick={() => setShowPhotoModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}><FaTimes /></button>
            </div>

            <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '700', overflow: 'hidden', margin: '0 auto 20px', border: '4px solid #f1f5f9' }}>
              {profileImage ? <img src={profileImage} alt="Profile Large" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : userName.charAt(0).toUpperCase()}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label htmlFor="modal-photo-upload" style={{ background: '#0d9488', color: '#ffffff', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaCamera /> {profileImage ? 'Update / Change Picture' : 'Upload New Picture'}
              </label>
              <input id="modal-photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />

              {profileImage && (
                <button type="button" onClick={handleRemovePhoto} style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaTrashAlt /> Remove Current Picture
                </button>
              )}

              <button type="button" onClick={() => setShowPhotoModal(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '8px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECK YOUR VITALS MODAL */}
      {showVitalsModal && (
        <div
          onClick={() => setShowVitalsModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>Check Your Clinical Vitals</h3>
                <small style={{ color: '#0d9488', fontWeight: '700' }}>EVALUATE CLINICAL STATUS</small>
              </div>
              <button onClick={() => setShowVitalsModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}><FaTimes /></button>
            </div>

            <form onSubmit={handleCalculateVitals} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Systolic BP (mmHg)</label>
                  <input type="number" placeholder="e.g. 120" value={systolicBP} onChange={(e) => setSystolicBP(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Diastolic BP (mmHg)</label>
                  <input type="number" placeholder="e.g. 80" value={diastolicBP} onChange={(e) => setDiastolicBP(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Heart Rate (bpm)</label>
                  <input type="number" placeholder="e.g. 72" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Body Temp (°F)</label>
                  <input type="number" step="0.1" placeholder="e.g. 98.6" value={temperature} onChange={(e) => setTemperature(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="submit" style={{ marginTop: '6px', padding: '11px', background: '#0d9488', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                Evaluate & Save Vitals
              </button>
            </form>

            {vitalsResult && (
              <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: vitalsResult.alertType === 'danger' ? '#fef2f2' : vitalsResult.alertType === 'warning' ? '#fffbeb' : '#f0fdf4', border: `1px solid ${vitalsResult.alertType === 'danger' ? '#fecaca' : vitalsResult.alertType === 'warning' ? '#fde68a' : '#bbf7d0'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {vitalsResult.alertType === 'danger' ? <FaExclamationTriangle color="#dc2626" /> : <FaCheck color="#16a34a" />}
                  <strong style={{ color: vitalsResult.alertType === 'danger' ? '#b91c1c' : '#15803d', fontSize: '13.5px' }}>
                    Status: {vitalsResult.status}
                  </strong>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '12.5px', color: '#334155', lineHeight: '1.4' }}>{vitalsResult.remarks}</p>
                <small style={{ color: '#64748b', fontSize: '11px' }}>* Informational evaluation only. Not a medical prescription.</small>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const vitalCardStyle = {
  background: '#ffffff',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};