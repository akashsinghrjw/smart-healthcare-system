import React, { useState } from 'react';
import { FaFileMedicalAlt, FaEye, FaTrashAlt, FaUpload, FaTimes } from 'react-icons/fa';

export default function HealthRecords({ userEmail }) {
  const [vaultReports, setVaultReports] = useState(() => {
    const saved = localStorage.getItem(`vault_reports_${userEmail}`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: 'Complete Blood Count (CBC)',
            type: 'Diagnostic Lab Report',
            date: 'Oct 18, 2026',
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

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto 60px', padding: '0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
          Personal Health Records Vault
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Safely store, preview, and download your diagnostic lab reports, prescriptions, and clinical summaries.
        </p>
      </div>

      {/* Upload Form Box */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FaUpload color="#0d9488" size={16} />
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>Upload New Clinical Document</h3>
        </div>

        <form onSubmit={handleUploadReport}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>Document / Test Title</label>
              <input
                type="text"
                placeholder="e.g. Thyroid Profile, Chest X-Ray"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>Document Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Diagnostic Lab Report">Diagnostic Lab Report</option>
                <option value="Doctor Prescription">Doctor Prescription</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Vaccination Record">Vaccination Record</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <label
              style={{
                background: '#f8fafc',
                border: '1.5px dashed #0d9488',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0d9488',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaFileMedicalAlt /> {selectedFileObj ? `File Selected: ${selectedFileObj.name}` : 'Choose PDF or Image File'}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setSelectedFileObj(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>

            <button
              type="submit"
              style={{
                padding: '11px 26px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Upload to Vault
            </button>
          </div>
        </form>
      </div>

      {/* Reports Vault List */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Uploaded Medical Vault Files</h3>
          <span style={{ fontSize: '12px', background: '#f0fdfa', color: '#0d9488', padding: '3px 10px', borderRadius: '6px', fontWeight: '700' }}>
            Total Files: {vaultReports.length}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {vaultReports.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', margin: '30px 0' }}>No records uploaded yet.</p>
          ) : (
            vaultReports.map((report) => (
              <div
                key={report.id}
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
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                    <FaFileMedicalAlt />
                  </div>
                  <div>
                    <strong style={{ fontSize: '14.5px', color: '#0f172a', display: 'block' }}>{report.title}</strong>
                    <small style={{ color: '#64748b', fontSize: '12px' }}>
                      Category: {report.type} • Uploaded on {report.date}
                    </small>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setViewingReport(report)}
                    style={{
                      background: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaEye size={12} /> View Document
                  </button>

                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '7px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    title="Delete Report"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {viewingReport && (
        <div
          onClick={() => setViewingReport(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: '16px', padding: '26px', width: '100%', maxWidth: '580px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{viewingReport.title}</h3>
                <small style={{ color: '#64748b' }}>{viewingReport.type} • {viewingReport.date}</small>
              </div>
              <button onClick={() => setViewingReport(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>
                <FaTimes />
              </button>
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
    </div>
  );
}