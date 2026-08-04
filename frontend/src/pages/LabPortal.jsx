import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function LabPortal() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    patientId: '',
    testName: '',
    resultSummary: '',
    fileUrl: '',
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReports();
    fetchPatients();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/api/lab/reports');
      setReports(res.data);
    } catch (err) { console.error("Error loading lab reports:", err); }
  };

  const fetchPatients = async () => {
    // Just fetch patient names for selection drop downs, we can use a text field or simple patient profiles search.
    // For simplicity, let's load all bills or patients. Let's do a simple Patient ID text input, but we can also display a list of patient profiles.
    try {
      const res = await api.get('/api/admin/stats'); // We can fetch patient stats or just list users. Let's just use a Patient ID text field.
    } catch (err) { }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.patientId || !uploadForm.testName || !uploadForm.resultSummary) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await api.post(`/api/lab/upload?patientId=${uploadForm.patientId}&testName=${uploadForm.testName}&resultSummary=${uploadForm.resultSummary}&fileUrl=${uploadForm.fileUrl}`);
      setMessage('Lab report uploaded successfully! Laboratory test fee ($30) issued to patient.');
      setUploadForm({ patientId: '', testName: '', resultSummary: '', fileUrl: '' });
      fetchReports();
    } catch (err) {
      setMessage('Error uploading report. Verify Patient ID is valid.');
    }
  };

  return (
    <div className="container py-4 animate-fade-in">
      <h2 className="fw-bold mb-4">Laboratory <span className="gradient-text">Diagnostics Portal</span></h2>

      {message && (
        <div className="alert alert-info alert-dismissible fade show rounded-3" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Upload Form */}
        <div className="col-lg-4">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-3"><i className="bi bi-file-earmark-medical-fill text-primary me-2"></i>Upload Test Results</h4>
            <form onSubmit={handleUpload}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Patient ID</label>
                <input type="number" className="form-control rounded-3" placeholder="Enter Patient ID (e.g. 1)" value={uploadForm.patientId} onChange={e => setUploadForm({...uploadForm, patientId: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Test / Lab Panel Name</label>
                <input type="text" className="form-control rounded-3" placeholder="e.g. Lipid Profile, Complete Blood Count" value={uploadForm.testName} onChange={e => setUploadForm({...uploadForm, testName: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Diagnostics Findings (Summary)</label>
                <textarea className="form-control rounded-3" rows="3" placeholder="Enter diagnostic results details" value={uploadForm.resultSummary} onChange={e => setUploadForm({...uploadForm, resultSummary: e.target.value})} required></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Report File Link (PDF)</label>
                <input type="text" className="form-control rounded-3" placeholder="e.g. /reports/cbc-result.pdf" value={uploadForm.fileUrl} onChange={e => setUploadForm({...uploadForm, fileUrl: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-premium-primary w-100 rounded-3">Upload & Finalize Lab Test</button>
            </form>
          </div>
        </div>

        {/* Uploaded Reports Log */}
        <div className="col-lg-8">
          <div className="glass-card p-4 table-responsive">
            <h4 className="fw-bold mb-3"><i className="bi bi-journal-medical text-success me-2"></i>Diagnostics Laboratory Logs</h4>
            {reports.length === 0 ? (
              <p className="text-muted">No diagnostic reports uploaded yet.</p>
            ) : (
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Test Panel</th>
                    <th>Findings</th>
                    <th>Date</th>
                    <th>Uploaded By</th>
                    <th>Document</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(rep => (
                    <tr key={rep.id}>
                      <td className="fw-semibold text-primary">{rep.patient?.name}</td>
                      <td>{rep.testName}</td>
                      <td className="small text-muted">{rep.resultSummary}</td>
                      <td>{rep.testDate}</td>
                      <td><span className="small font-monospace">{rep.uploadedBy}</span></td>
                      <td>
                        <a href={rep.fileUrl} className="btn btn-sm btn-outline-success rounded-2"><i className="bi bi-file-pdf"></i> View PDF</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
