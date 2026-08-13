import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function PharmacyPortal() {
  const [medicines, setMedicines] = useState([]);
  const [purchaseForm, setPurchaseForm] = useState({
    patientId: '',
    medicineId: '',
    quantity: 1,
  });
  const [newMed, setNewMed] = useState({
    name: '',
    category: 'Antibiotic',
    stockQuantity: 100,
    expiryDate: '',
    price: 5.00,
    genericName: '',
  });

  const [message, setMessage] = useState('');
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [hasSearchedPrescriptions, setHasSearchedPrescriptions] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchPatientPrescriptions = async (patientId) => {
    if (!patientId) {
      setPatientPrescriptions([]);
      setHasSearchedPrescriptions(false);
      return;
    }
    setIsLoadingPrescriptions(true);
    setHasSearchedPrescriptions(true);
    try {
      const res = await api.get(`/api/patients/${patientId}/prescriptions`);
      setPatientPrescriptions(res.data);
    } catch (err) {
      console.error("Error loading patient prescriptions:", err);
      setPatientPrescriptions([]);
    } finally {
      setIsLoadingPrescriptions(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (purchaseForm.patientId) {
        fetchPatientPrescriptions(purchaseForm.patientId);
      } else {
        setPatientPrescriptions([]);
        setHasSearchedPrescriptions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [purchaseForm.patientId]);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/api/pharmacy/medicines');
      setMedicines(res.data);
    } catch (err) { console.error("Error loading medicines:", err); }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!purchaseForm.patientId || !purchaseForm.medicineId || !purchaseForm.quantity) {
      alert("Please fill all purchase fields");
      return;
    }

    try {
      await api.post(`/api/pharmacy/purchase?patientId=${purchaseForm.patientId}&medicineId=${purchaseForm.medicineId}&quantity=${purchaseForm.quantity}`);
      setMessage('Medicine purchase successful! Pharmacy bill issued to patient ledger.');
      setPurchaseForm({ patientId: '', medicineId: '', quantity: 1 });
      fetchMedicines();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error processing purchase. Check if patient exists or stock is sufficient.');
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/pharmacy/medicines', newMed);
      setMessage('New medicine registered successfully!');
      setNewMed({
        name: '',
        category: 'Antibiotic',
        stockQuantity: 100,
        expiryDate: '',
        price: 5.00,
        genericName: '',
      });
      fetchMedicines();
    } catch (err) { setMessage('Error adding medicine'); }
  };

  return (
    <div className="container py-4 animate-fade-in">
      <h2 className="fw-bold mb-4">Pharmacy <span className="gradient-text">Management Portal</span></h2>

      {message && (
        <div className="alert alert-info alert-dismissible fade show rounded-3" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Medicine Inventory */}
        <div className="col-lg-8">
          <div className="glass-card p-4 table-responsive">
            <h4 className="fw-bold mb-3"><i className="bi bi-capsules text-primary me-2"></i>Medicines Inventory Stock</h4>
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Generic</th>
                  <th>Category</th>
                  <th>In Stock</th>
                  <th>Expiry Date</th>
                  <th>Unit Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(med => {
                  const isExpiring = new Date(med.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 6));
                  return (
                    <tr key={med.id}>
                      <td className="fw-semibold text-primary">{med.name}</td>
                      <td>{med.genericName}</td>
                      <td>{med.category}</td>
                      <td className={med.stockQuantity < 20 ? 'text-danger fw-bold' : ''}>{med.stockQuantity} units</td>
                      <td className={isExpiring ? 'text-danger fw-semibold' : ''}>
                        {med.expiryDate} {isExpiring && <span className="badge bg-danger ms-1 small">Expiring Soon</span>}
                      </td>
                      <td>₹{med.price?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${med.stockQuantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {med.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-lg-4">
          {/* Dispense Medicine Form */}
          <div className="glass-card p-4 mb-4">
            <h4 className="fw-bold mb-3"><i className="bi bi-cart-plus text-success me-2"></i>Dispense Medicines</h4>
            <form onSubmit={handlePurchase}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Patient ID</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control rounded-start-3"
                    placeholder="Enter Patient ID (e.g. 1)"
                    value={purchaseForm.patientId}
                    onChange={e => {
                      setPurchaseForm({...purchaseForm, patientId: e.target.value});
                      if (!e.target.value) {
                        setPatientPrescriptions([]);
                        setHasSearchedPrescriptions(false);
                      }
                    }}
                    required
                  />
                  <button
                    className="btn btn-outline-secondary rounded-end-3"
                    type="button"
                    onClick={() => fetchPatientPrescriptions(purchaseForm.patientId)}
                    disabled={!purchaseForm.patientId || isLoadingPrescriptions}
                  >
                    {isLoadingPrescriptions ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="bi bi-search"></i>
                    )}
                  </button>
                </div>
              </div>

              {isLoadingPrescriptions && (
                <div className="d-flex align-items-center justify-content-center py-2 mb-3 text-muted small">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Retrieving patient prescriptions...
                </div>
              )}

              {!isLoadingPrescriptions && hasSearchedPrescriptions && patientPrescriptions.length > 0 && (
                <div className="p-3 bg-primary bg-opacity-10 border border-primary-subtle rounded-3 mb-3 small text-start animate-fade-in">
                  <div className="fw-bold text-primary mb-2 d-flex justify-content-between align-items-center">
                    <span><i className="bi bi-file-earmark-medical me-1"></i> Patient Prescriptions ({patientPrescriptions.length})</span>
                    <span className="badge bg-primary text-white">ID: #{purchaseForm.patientId}</span>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: '160px' }}>
                    {patientPrescriptions.map(p => (
                      <div key={p.id} className="p-2 bg-white rounded-2 border border-light-subtle mb-2 shadow-sm">
                        <div className="fw-bold text-primary mb-1">{p.diagnosis}</div>
                        <div className="text-dark small mb-1">
                          <strong>Meds Prescribed:</strong> <span className="text-danger fw-semibold">{p.medicines}</span>
                        </div>
                        {p.tabletCount && (
                          <div className="text-dark small mb-1" style={{ fontSize: '0.75rem' }}>
                            <strong>Tablet Count:</strong> <span className="badge bg-secondary">{p.tabletCount} Tablets</span>
                          </div>
                        )}
                        {p.dosage && (
                          <div className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                            <strong>Dosage:</strong> {p.dosage}
                          </div>
                        )}
                        {p.instructions && (
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            <strong>Instructions:</strong> {p.instructions}
                          </div>
                        )}
                        <hr className="my-1 border-light-subtle" />
                        <div className="text-muted text-end" style={{ fontSize: '0.7rem' }}>
                          By: {p.doctor?.name} ({p.doctor?.specialization || 'OPD'})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isLoadingPrescriptions && hasSearchedPrescriptions && patientPrescriptions.length === 0 && purchaseForm.patientId && (
                <div className="alert alert-warning py-2 px-3 border border-warning-subtle rounded-3 small mb-3 text-start animate-fade-in">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i> No prescriptions found for Patient ID #{purchaseForm.patientId}.
                </div>
              )}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Medicine</label>
                <select className="form-select rounded-3" value={purchaseForm.medicineId} onChange={e => setPurchaseForm({...purchaseForm, medicineId: e.target.value})} required>
                  <option value="">-- Select Drug --</option>
                  {medicines.map(med => (
                    <option key={med.id} value={med.id} disabled={med.stockQuantity === 0}>
                      {med.name} (Stock: {med.stockQuantity}) - ₹{med.price?.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Quantity</label>
                <input type="number" className="form-control rounded-3" min="1" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: parseInt(e.target.value)})} required />
              </div>
              <button type="submit" className="btn btn-premium-primary w-100 rounded-3">Dispense & Issue Bill</button>
            </form>
          </div>

          {/* Add Medicine Form */}
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-3"><i className="bi bi-plus-circle text-primary me-2"></i>Register New Drug</h4>
            <form onSubmit={handleAddMedicine}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Medicine Name (Brand Name)</label>
                <input type="text" className="form-control rounded-3" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Generic Name</label>
                <input type="text" className="form-control rounded-3" value={newMed.genericName} onChange={e => setNewMed({...newMed, genericName: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Category</label>
                <select className="form-select rounded-3" value={newMed.category} onChange={e => setNewMed({...newMed, category: e.target.value})}>
                  <option value="Antibiotic">Antibiotic</option>
                  <option value="Cardiovascular">Cardiovascular</option>
                  <option value="Antidiabetic">Antidiabetic</option>
                  <option value="Antihypertensive">Antihypertensive</option>
                  <option value="Analgesic">Analgesic</option>
                  <option value="Antihistamine">Antihistamine</option>
                  <option value="Antipyretic">Antipyretic</option>
                  <option value="Gastrointestinal">Gastrointestinal</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Expiry Date</label>
                <input type="date" className="form-control rounded-3" value={newMed.expiryDate} onChange={e => setNewMed({...newMed, expiryDate: e.target.value})} required />
              </div>
              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label small fw-semibold">Qty</label>
                  <input type="number" className="form-control rounded-3" value={newMed.stockQuantity} onChange={e => setNewMed({...newMed, stockQuantity: parseInt(e.target.value) || 0})} required />
                </div>
                <div className="col-6 mb-3">
                  <label className="form-label small fw-semibold">Price Per Unit (₹)</label>
                  <input type="number" step="0.01" className="form-control rounded-3" value={newMed.price} onChange={e => setNewMed({...newMed, price: parseFloat(e.target.value) || 0})} required />
                </div>
              </div>

              {/* Real-time batch valuation preview */}
              <div className="p-3 bg-light rounded-3 border border-light-subtle small mb-3 text-start animate-scale-up">
                <div className="d-flex justify-content-between align-items-center fw-semibold text-dark">
                  <span>Batch Total Valuation:</span>
                  <span className="fs-5 text-primary font-monospace">₹{((newMed.stockQuantity || 0) * (newMed.price || 0)).toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-premium-secondary w-100 rounded-3">Register Drug</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
