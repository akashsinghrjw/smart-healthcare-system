
import React, { useEffect, useState } from 'react';
import {
  FaFileMedicalAlt,
  FaEye,
  FaTrashAlt,
  FaUpload,
  FaTimes
} from 'react-icons/fa';
import { api } from '../utils/api';

export default function HealthRecords({ userEmail }) {
  const [vaultReports, setVaultReports] = useState([]);
  const [recordTitle, setRecordTitle] = useState('');
  const [recordType, setRecordType] = useState('Diagnostic Lab Report');
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load reports from MongoDB through the backend API
  const loadReports = async () => {
    setLoading(true);
    setError('');

    try {
      const records = await api.getRecords();
      setVaultReports(Array.isArray(records) ? records : []);
    } catch (err) {
      setError(err.message || 'Reports load nahi ho paaye.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [userEmail]);

  const handleUploadReport = async (e) => {
    e.preventDefault();

    if (!recordTitle.trim()) {
      alert('Kripya report ka title bharein!');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let fileData = null;

      if (selectedFileObj) {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error('File read nahi ho paayi.'));
          reader.readAsDataURL(selectedFileObj);
        });
      }

      const newRecord = await api.addRecord({
        title: recordTitle.trim(),
        type: recordType,
        date: new Date().toISOString(),
        fileName: selectedFileObj?.name || '',
        fileData
      });

      setVaultReports((previous) => [newRecord, ...previous]);
      setRecordTitle('');
      setRecordType('Diagnostic Lab Report');
      setSelectedFileObj(null);

      alert('Report database mein successfully save ho gayi!');
    } catch (err) {
      setError(err.message || 'Report upload nahi ho paayi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Kya aap yeh report delete karna chahte hain?')) {
      return;
    }

    setError('');

    try {
      await api.deleteRecord(id);
      setVaultReports((previous) =>
        previous.filter((report) => report._id !== id)
      );

      if (viewingReport?._id === id) {
        setViewingReport(null);
      }
    } catch (err) {
      setError(err.message || 'Report delete nahi ho paayi.');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? date
      : parsed.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '20px auto 60px',
      padding: '0 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '26px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 4px'
        }}>
          Personal Health Records Vault
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Store, preview and manage your medical reports and prescriptions.
        </p>
      </div>

      {error && (
        <div role="alert" style={{
          background: '#fef2f2',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '18px',
          fontSize: '13px'
        }}>
          {error}
          <button
            onClick={loadReports}
            style={{
              marginLeft: '12px',
              cursor: 'pointer',
              border: 0,
              background: 'transparent',
              color: '#991b1b',
              fontWeight: 700
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Upload Form */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
        marginBottom: '28px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <FaUpload color="#0d9488" size={16} />
          <h3 style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: '700',
            color: '#0f172a'
          }}>
            Upload New Clinical Document
          </h3>
        </div>

        <form onSubmit={handleUploadReport}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginBottom: '14px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: '#475569',
                marginBottom: '5px'
              }}>
                Document / Test Title
              </label>
              <input
                type="text"
                placeholder="e.g. Thyroid Profile, Chest X-Ray"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                color: '#475569',
                marginBottom: '5px'
              }}>
                Document Type
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  background: '#fff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Diagnostic Lab Report">Diagnostic Lab Report</option>
                <option value="Doctor Prescription">Doctor Prescription</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Vaccination Record">Vaccination Record</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <label style={{
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
            }}>
              <FaFileMedicalAlt />
              {selectedFileObj
                ? `File: ${selectedFileObj.name}`
                : 'Choose PDF or Image File'}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) =>
                  setSelectedFileObj(e.target.files?.[0] || null)
                }
                style={{ display: 'none' }}
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '11px 26px',
                background: saving ? '#94a3b8' : '#0d9488',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {saving ? 'Uploading...' : 'Upload to Vault'}
            </button>
          </div>
        </form>
      </div>

      {/* Reports List */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: '800',
            color: '#0f172a'
          }}>
            Uploaded Medical Vault Files
          </h3>
          <span style={{
            fontSize: '12px',
            background: '#f0fdfa',
            color: '#0d9488',
            padding: '3px 10px',
            borderRadius: '6px',
            fontWeight: '700'
          }}>
            Total Files: {vaultReports.length}
          </span>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
            Loading reports...
          </p>
        ) : vaultReports.length === 0 ? (
          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
            margin: '30px 0'
          }}>
            No records uploaded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {vaultReports.map((report) => (
              <div
                key={report._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    <FaFileMedicalAlt />
                  </div>
                  <div>
                    <strong style={{
                      fontSize: '14.5px',
                      color: '#0f172a',
                      display: 'block'
                    }}>
                      {report.title}
                    </strong>
                    <small style={{ color: '#64748b', fontSize: '12px' }}>
                      Category: {report.type} • Uploaded on {formatDate(report.date || report.createdAt)}
                    </small>
                    {report.patientEmail && (
                      <small style={{
                        display: 'block',
                        color: '#64748b',
                        fontSize: '12px'
                      }}>
                        Patient: {report.patientName || report.patientEmail}
                      </small>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setViewingReport(report)}
                    style={{
                      background: '#0d9488',
                      color: '#fff',
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
                    onClick={() => handleDeleteReport(report._id)}
                    title="Delete Report"
                    style={{
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {viewingReport && (
        <div
          onClick={() => setViewingReport(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '26px',
              width: '100%',
              maxWidth: '580px',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  color: '#0f172a'
                }}>
                  {viewingReport.title}
                </h3>
                <small style={{ color: '#64748b' }}>
                  {viewingReport.type} • {formatDate(viewingReport.date || viewingReport.createdAt)}
                </small>
              </div>
              <button
                onClick={() => setViewingReport(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {viewingReport.fileData ? (
                viewingReport.fileData.startsWith('data:image') ? (
                  <img
                    src={viewingReport.fileData}
                    alt={viewingReport.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '350px',
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div>
                    <FaFileMedicalAlt
                      size={48}
                      color="#0d9488"
                      style={{ marginBottom: '10px' }}
                    />
                    <h4 style={{ margin: '0 0 6px' }}>
                      {viewingReport.fileName || 'Medical document'}
                    </h4>
                    <a
                      href={viewingReport.fileData}
                      download={viewingReport.fileName || 'medical-report.pdf'}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        background: '#0d9488',
                        color: '#fff',
                        padding: '8px 18px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '700'
                      }}
                    >
                      View / Download File
                    </a>
                  </div>
                )
              ) : (
                <div>
                  <FaFileMedicalAlt
                    size={44}
                    color="#94a3b8"
                    style={{ marginBottom: '8px' }}
                  />
                  <p style={{
                    color: '#475569',
                    fontSize: '13px',
                    margin: 0
                  }}>
                    No file was attached to this clinical record.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setViewingReport(null)}
                style={{
                  background: '#0d9488',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
