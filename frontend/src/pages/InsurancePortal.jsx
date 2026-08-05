import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function InsurancePortal() {
  const [policies, setPolicies] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  
  // Verification Form
  const [verifyForm, setVerifyForm] = useState({
    patientId: '',
    policyNumber: '',
    provider: '',
    coverageDetails: '',
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPolicies();
    fetchPendingClaims();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/api/insurance/all');
      setPolicies(res.data);
    } catch (err) { console.error("Error loading policies:", err); }
  };

  const fetchPendingClaims = async () => {
    try {
      const res = await api.get('/api/billing/all');
      // Filter only claimed bills
      const claimed = res.data.filter(b => b.status === 'CLAIMED');
      setPendingClaims(claimed);
    } catch (err) { console.error("Error loading claims:", err); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyForm.patientId || !verifyForm.policyNumber || !verifyForm.provider) {
      alert("Please fill all required verification fields");
      return;
    }

    try {
      await api.post('/api/insurance/verify', null, {
        params: {
          patientId: verifyForm.patientId,
          policyNumber: verifyForm.policyNumber,
          provider: verifyForm.provider,
          coverageDetails: verifyForm.coverageDetails
        }
      });
      setMessage('Insurance policy verified successfully!');
      setVerifyForm({ patientId: '', policyNumber: '', provider: '', coverageDetails: '' });
      fetchPolicies();
    } catch (err) {
      setMessage('Error verifying policy. Verify Patient ID is valid.');
    }
  };

  const handleClaimStatus = async (billId, approve) => {
    try {
      await api.put(`/api/insurance/claim/${billId}/approve?approve=${approve}`);
      setMessage(`Claim ${approve ? 'approved' : 'rejected'} successfully!`);
      fetchPendingClaims();
    } catch (err) { setMessage('Error processing claim'); }
  };

  return (
    <div className="container py-4 animate-fade-in">
      <h2 className="fw-bold mb-4">Insurance <span className="gradient-text">Claims & Coverage Portal</span></h2>

      {message && (
        <div className="alert alert-info alert-dismissible fade show rounded-3" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Verification Form */}
        <div className="col-lg-4">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-3"><i className="bi bi-shield-check text-primary me-2"></i>Verify Policy Coverage</h4>
            <form onSubmit={handleVerify}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Patient ID</label>
                <input type="number" className="form-control rounded-3" placeholder="Enter Patient ID (e.g. 1)" value={verifyForm.patientId} onChange={e => setVerifyForm({...verifyForm, patientId: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Policy Number</label>
                <input type="text" className="form-control rounded-3" placeholder="e.g. POL-998811" value={verifyForm.policyNumber} onChange={e => setVerifyForm({...verifyForm, policyNumber: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Insurance Provider</label>
                <input type="text" className="form-control rounded-3" placeholder="e.g. BlueCross, UnitedHealth" value={verifyForm.provider} onChange={e => setVerifyForm({...verifyForm, provider: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Coverage Details</label>
                <textarea className="form-control rounded-3" rows="3" placeholder="e.g. Covers 80% OPD, 100% Labs and Pharmacy up to ₹5000" value={verifyForm.coverageDetails} onChange={e => setVerifyForm({...verifyForm, coverageDetails: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn btn-premium-primary w-100 rounded-3">Register verified policy</button>
            </form>
          </div>
        </div>

        {/* Claim Queue & Policies Logs */}
        <div className="col-lg-8">
          {/* Claims Queue */}
          <div className="glass-card p-4 mb-4">
            <h4 className="fw-bold mb-3 text-danger"><i className="bi bi-hourglass-split me-2"></i>Pending Settlement Claims Queue</h4>
            {pendingClaims.length === 0 ? (
              <p className="text-muted mb-0">No claims submitted for approval.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Total Fees</th>
                      <th>Billing Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingClaims.map(claim => (
                      <tr key={claim.id}>
                        <td>
                          <h6 className="mb-0 fw-semibold">{claim.patient?.name}</h6>
                          <span className="small text-muted">ID: {claim.patient?.id}</span>
                        </td>
                        <td className="fw-bold text-primary">₹{claim.totalAmount?.toFixed(2)}</td>
                        <td>{claim.billingDate}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-success rounded-2" onClick={() => handleClaimStatus(claim.id, true)}>Approve Pay</button>
                            <button className="btn btn-sm btn-outline-danger rounded-2" onClick={() => handleClaimStatus(claim.id, false)}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Policies */}
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-3"><i className="bi bi-shield-lock-fill text-success me-2"></i>Active Registered Coverage Policies</h4>
            {policies.length === 0 ? (
              <p className="text-muted mb-0">No active insurance policies registered.</p>
            ) : (
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Policy Number</th>
                    <th>Provider</th>
                    <th>Coverage Terms</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map(pol => (
                    <tr key={pol.id}>
                      <td className="fw-semibold text-primary">{pol.patient?.name}</td>
                      <td><code>{pol.policyNumber}</code></td>
                      <td>{pol.provider}</td>
                      <td className="small text-muted">{pol.coverageDetails}</td>
                      <td>
                        <span className="badge bg-success">{pol.status}</span>
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
