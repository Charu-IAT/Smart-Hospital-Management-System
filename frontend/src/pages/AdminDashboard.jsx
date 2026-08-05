import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VisualReport from '../components/VisualReport';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    lowStockAlerts: 0,
    totalRevenue: 0.00,
    pendingAppointments: 0,
  });

  const [activeTab, setActiveTab] = useState('stats');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bills, setBills] = useState([]);

  // Reports state
  const [selectedPatientForRpt, setSelectedPatientForRpt] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [selectedReportForRpt, setSelectedReportForRpt] = useState(null);
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');

  const handleSelectPatientForReports = async (patient) => {
    setSelectedPatientForRpt(patient);
    setSelectedReportForRpt(null);
    setPatientReports([]);
    try {
      const res = await api.get(`/api/patients/${patient.id}/reports`);
      setPatientReports(res.data);
    } catch (err) {
      console.error("Error loading patient reports:", err);
    }
  };

  const [healthReportForm, setHealthReportForm] = useState({
    weight: '',
    bp: '',
    height: '',
    temperature: '',
    heartRate: '',
    sugarLevel: '',
    notes: ''
  });

  const handleSaveHealthReport = async (e) => {
    e.preventDefault();
    if (!selectedPatientForRpt) {
      alert("Please select a patient first!");
      return;
    }
    if (!healthReportForm.weight || !healthReportForm.bp) {
      alert("Weight and Blood Pressure are required!");
      return;
    }
    try {
      const payload = {
        patient: { id: selectedPatientForRpt.id },
        weight: parseFloat(healthReportForm.weight),
        bp: healthReportForm.bp,
        height: healthReportForm.height ? parseFloat(healthReportForm.height) : null,
        temperature: healthReportForm.temperature ? parseFloat(healthReportForm.temperature) : null,
        heartRate: healthReportForm.heartRate ? parseInt(healthReportForm.heartRate) : null,
        sugarLevel: healthReportForm.sugarLevel ? parseFloat(healthReportForm.sugarLevel) : null,
        notes: healthReportForm.notes
      };
      await api.post('/api/patients/health-report', payload);
      setMessage("Health report logged successfully!");
      setTimeout(() => setMessage(''), 4000);
      setHealthReportForm({
        weight: '',
        bp: '',
        height: '',
        temperature: '',
        heartRate: '',
        sugarLevel: '',
        notes: ''
      });
    } catch (err) {
      console.error("Error saving health report:", err);
      const errorMsg = err.response?.data 
        ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data))
        : err.message;
      alert("Error saving health report: " + errorMsg);
    }
  };

  // Form states
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newInv, setNewInv] = useState({ itemName: '', category: '', quantity: 10, threshold: 5, status: 'IN_STOCK' });
  const [restockQty, setRestockQty] = useState({});
  const [message, setMessage] = useState('');
  const [regForm, setRegForm] = useState({
    username: '',
    password: '',
    email: '',
    role: 'ROLE_PATIENT',
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    phone: '',
    specialization: '',
    departmentId: '',
    schedule: 'Mon-Fri: 9AM-5PM',
  });

  useEffect(() => {
    fetchStats();
    fetchDoctors();
    fetchPatients();
    fetchDepartments();
    fetchInventory();
    fetchBills();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) { console.error("Error fetching stats:", err); }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/patients/all');
      setPatients(res.data);
    } catch (err) { console.error("Error fetching patients:", err); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/api/doctors/all');
      setDoctors(res.data);
    } catch (err) { console.error("Error fetching doctors:", err); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/admin/departments');
      setDepartments(res.data);
    } catch (err) { console.error("Error fetching departments:", err); }
  };

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/admin/inventory');
      setInventory(res.data);
    } catch (err) { console.error("Error fetching inventory:", err); }
  };

  const fetchBills = async () => {
    try {
      const res = await api.get('/api/billing/all');
      setBills(res.data);
    } catch (err) { console.error("Error fetching billing:", err); }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/departments', newDept);
      setNewDept({ name: '', description: '' });
      setMessage('Department created successfully!');
      setShowDeptModal(false);
      fetchDepartments();
    } catch (err) { setMessage('Error creating department'); }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/inventory', newInv);
      setNewInv({ itemName: '', category: '', quantity: 10, threshold: 5, status: 'IN_STOCK' });
      setMessage('Inventory item added successfully!');
      fetchInventory();
      fetchStats();
    } catch (err) { setMessage('Error adding inventory item'); }
  };

  const handleRestock = async (id) => {
    const qty = parseInt(restockQty[id] || 0);
    if (!qty || qty <= 0) return;
    try {
      await api.put(`/api/admin/inventory/${id}/restock?quantity=${qty}`);
      setRestockQty({ ...restockQty, [id]: '' });
      setMessage('Inventory restocked successfully!');
      fetchInventory();
      fetchStats();
    } catch (err) { setMessage('Error restocking inventory'); }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: regForm.username,
        password: regForm.password,
        email: regForm.email,
        role: regForm.role,
        name: regForm.name,
        age: regForm.age ? parseInt(regForm.age) : null,
        gender: regForm.gender,
        bloodGroup: regForm.bloodGroup,
        address: regForm.address,
        phone: regForm.phone,
        specialization: regForm.specialization,
        departmentId: regForm.departmentId ? parseInt(regForm.departmentId) : null,
        schedule: regForm.schedule,
      };
      await api.post('/api/auth/register', payload);
      setMessage(`User ${regForm.username} successfully registered with role ${regForm.role.replace('ROLE_', '')}!`);
      setRegForm({
        username: '',
        password: '',
        email: '',
        role: 'ROLE_PATIENT',
        name: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'O+',
        address: '',
        phone: '',
        specialization: '',
        departmentId: '',
        schedule: 'Mon-Fri: 9AM-5PM',
      });
      fetchDoctors();
      fetchStats();
    } catch (err) {
      setMessage(err.response?.data || 'Error registering user');
    }
  };

  const filteredPatientsForRpt = patients.filter(p => {
    const query = reportSearchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.phone && p.phone.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.allergies && p.allergies.toLowerCase().includes(query)) ||
      (p.medicalHistory && p.medicalHistory.toLowerCase().includes(query))
    );
  });

  const filteredPatientsForDirectory = patients.filter(p => {
    const query = patientSearchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.phone && p.phone.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.allergies && p.allergies.toLowerCase().includes(query)) ||
      (p.medicalHistory && p.medicalHistory.toLowerCase().includes(query))
    );
  });

  return (
    <div className="container py-4 animate-fade-in">
      <h2 className="fw-bold mb-4">Admin <span className="gradient-text">Dashboard</span></h2>
      
      {message && (
        <div className="alert alert-info alert-dismissible fade show rounded-3" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {/* Tabs Headers */}
      <ul className="nav nav-pills mb-4 glass-card p-2 d-flex gap-2">
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'stats' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('stats')}>
            <i className="bi bi-bar-chart-fill me-2"></i>Analytics
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'doctors' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('doctors')}>
            <i className="bi bi-people-fill me-2"></i>Doctors ({doctors.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'patients' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('patients')}>
            <i className="bi bi-person-fill me-2"></i>Patients ({patients.length})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'depts' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('depts')}>
            <i className="bi bi-building-fill me-2"></i>Departments
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'inventory' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('inventory')}>
            <i className="bi bi-box-seam-fill me-2"></i>Inventory
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'billing' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('billing')}>
            <i className="bi bi-receipt me-2"></i>Billing
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'register' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('register')}>
            <i className="bi bi-person-plus-fill me-2"></i>Register Users
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'reports' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('reports')}>
            <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>Visual Reports
          </button>
        </li>
      </ul>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="glass-card p-4 text-center">
              <i className="bi bi-people text-primary fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.totalPatients}</h3>
              <p className="text-muted mb-0">Total Patients</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 text-center">
              <i className="bi bi-heart-pulse text-success fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.totalDoctors}</h3>
              <p className="text-muted mb-0">Total Doctors</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 text-center">
              <i className="bi bi-calendar-check text-info fs-1 mb-2"></i>
              <h3 className="fw-bold">{stats.totalAppointments}</h3>
              <p className="text-muted mb-0">Total Appointments ({stats.pendingAppointments} Pending)</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass-card p-4 text-center">
              <i className="bi bi-cash-stack text-warning fs-1 mb-2"></i>
              <h3 className="fw-bold">₹{stats.totalRevenue?.toFixed(2)}</h3>
              <p className="text-muted mb-0">Settled Revenue</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass-card p-4 text-center border-danger">
              <i className="bi bi-exclamation-triangle text-danger fs-1 mb-2"></i>
              <h3 className="fw-bold text-danger">{stats.lowStockAlerts}</h3>
              <p className="text-danger mb-0 fw-semibold">Low Stock Inventory Alerts</p>
            </div>
          </div>
        </div>
      )}

      {/* Doctors Tab */}
      {activeTab === 'doctors' && (
        <div className="glass-card p-4 table-responsive">
          <h4 className="fw-bold mb-3">Registered Clinicians</h4>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor Name</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Weekly Schedule</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td className="fw-semibold text-primary">{doc.name}</td>
                  <td>{doc.specialization}</td>
                  <td>{doc.department?.name || 'General Clinic'}</td>
                  <td>{doc.schedule}</td>
                  <td>
                    <span className={`badge ${doc.availability ? 'bg-success' : 'bg-secondary'}`}>
                      {doc.availability ? 'Available' : 'On Leave'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="glass-card p-4 table-responsive animate-fade-in text-start">
          <h4 className="fw-bold mb-3"><i className="bi bi-person-fill text-primary me-2"></i>Registered Patients Directory</h4>
          {patients.length === 0 ? (
            <p className="text-muted small">No registered patients found in directory.</p>
          ) : (
            <>
              <div className="mb-3 col-md-5">
                <label className="form-label small fw-bold text-dark mb-1">Search Patient by Name, Phone, Place, Allergies, or History</label>
                <div className="input-group shadow-sm rounded-3">
                  <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control rounded-end-3 border-start-0" 
                    placeholder="Type name, phone, place, allergies, or history..." 
                    value={patientSearchQuery}
                    onChange={e => setPatientSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {filteredPatientsForDirectory.length === 0 ? (
                <div className="p-4 text-center text-muted border rounded-3 bg-white shadow-sm small">
                  No patients match the search query.
                </div>
              ) : (
                <table className="table table-hover align-middle bg-white shadow-sm rounded-3 overflow-hidden border">
                  <thead>
                    <tr style={{ fontSize: '0.85rem' }}>
                      <th>ID</th>
                      <th>Patient Name</th>
                      <th>Age/Gender</th>
                      <th>Blood Group</th>
                      <th>Contact Info</th>
                      <th>Medical Profile</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatientsForDirectory.map(pat => (
                      <tr key={pat.id} style={{ fontSize: '0.9rem' }}>
                        <td className="font-monospace fw-bold">{pat.id}</td>
                        <td>
                          <span 
                            className="fw-semibold text-primary block text-decoration-underline" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              handleSelectPatientForReports(pat);
                              setActiveTab('reports');
                            }}
                          >
                            {pat.name}
                          </span>
                          <span className="text-muted small block">User: {pat.user?.username || 'N/A'}</span>
                        </td>
                        <td>{pat.age || 'N/A'} yrs / {pat.gender || 'N/A'}</td>
                        <td><span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle">{pat.bloodGroup || 'O+'}</span></td>
                        <td>
                          <div className="small text-muted mb-0.5"><i className="bi bi-telephone me-1"></i>{pat.phone || 'N/A'}</div>
                          <div className="small text-muted"><i className="bi bi-geo-alt me-1"></i>{pat.address || 'N/A'}</div>
                        </td>
                        <td>
                          <div className="small"><strong className="text-dark">Allergies:</strong> {pat.allergies || 'None'}</div>
                          <div className="small"><strong className="text-dark">History:</strong> {pat.medicalHistory || 'None'}</div>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary rounded-2 px-2 py-1 small d-inline-flex align-items-center gap-1 fw-semibold"
                            onClick={() => {
                              handleSelectPatientForReports(pat);
                              setActiveTab('reports');
                            }}
                          >
                            <i className="bi bi-file-earmark-bar-graph"></i> View Reports
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'depts' && (
        <div className="glass-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">Clinical Departments</h4>
            <button className="btn btn-premium-primary rounded-3 fw-semibold animate-pulse" onClick={() => setShowDeptModal(true)}>
              <i className="bi bi-plus-circle-fill me-2"></i>Add Department
            </button>
          </div>

          <div className="row g-3">
            {departments.length === 0 ? (
              <div className="col-12 text-center text-muted py-4">No departments found. Click "Add Department" to create one.</div>
            ) : (
              departments.map(dept => (
                <div key={dept.id} className="col-md-4">
                  <div className="card p-3 border-light-subtle rounded-3 h-100 shadow-sm hover-up">
                    <h5 className="fw-bold text-primary mb-1">{dept.name}</h5>
                    <p className="text-muted small mb-0">{dept.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>


        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="row g-4">
          <div className="col-md-8">
            <div className="glass-card p-4 table-responsive">
              <h4 className="fw-bold mb-3">Clinical Supplies & Stocks</h4>
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Threshold</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td className="fw-semibold">{item.itemName}</td>
                      <td>{item.category}</td>
                      <td className={item.quantity <= item.threshold ? 'text-danger fw-bold' : ''}>{item.quantity}</td>
                      <td>{item.threshold}</td>
                      <td>
                        <span className={`badge ${
                          item.status === 'IN_STOCK' ? 'bg-success' : item.status === 'LOW_STOCK' ? 'bg-warning text-dark' : 'bg-danger'
                        }`}>{item.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2" style={{ maxWidth: '180px' }}>
                          <input type="number" className="form-control form-control-sm rounded-2" placeholder="Qty" value={restockQty[item.id] || ''} onChange={e => setRestockQty({...restockQty, [item.id]: e.target.value})} />
                          <button className="btn btn-sm btn-success rounded-2" onClick={() => handleRestock(item.id)}>Restock</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-3">Add Inventory Item</h4>
              <form onSubmit={handleAddInventory}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Item Name</label>
                  <input type="text" className="form-control rounded-3" value={newInv.itemName} onChange={e => setNewInv({...newInv, itemName: e.target.value})} required/>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Category</label>
                  <input type="text" className="form-control rounded-3" placeholder="PPE, Devices, Consumables" value={newInv.category} onChange={e => setNewInv({...newInv, category: e.target.value})} required/>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Initial Quantity</label>
                  <input type="number" className="form-control rounded-3" value={newInv.quantity} onChange={e => setNewInv({...newInv, quantity: parseInt(e.target.value)})} required/>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Low Stock Threshold</label>
                  <input type="number" className="form-control rounded-3" value={newInv.threshold} onChange={e => setNewInv({...newInv, threshold: parseInt(e.target.value)})} required/>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select rounded-3" value={newInv.status} onChange={e => setNewInv({...newInv, status: e.target.value})}>
                    <option value="IN_STOCK">IN_STOCK</option>
                    <option value="LOW_STOCK">LOW_STOCK</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-premium-primary w-100 rounded-3">Add Stock Item</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="glass-card p-4 table-responsive">
          <h4 className="fw-bold mb-3">All Hospital Accounts Ledger</h4>
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Patient</th>
                <th>Consultation Fee</th>
                <th>Lab Fee</th>
                <th>Pharmacy Fee</th>
                <th>Total Bill</th>
                <th>Billing Date</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id}>
                  <td>INV-00{bill.id}</td>
                  <td className="fw-semibold">{bill.patient?.name}</td>
                  <td>₹{bill.consultationFee?.toFixed(2)}</td>
                  <td>₹{bill.labFee?.toFixed(2)}</td>
                  <td>₹{bill.pharmacyFee?.toFixed(2)}</td>
                  <td className="fw-bold text-primary">₹{bill.totalAmount?.toFixed(2)}</td>
                  <td>{bill.billingDate}</td>
                  <td>
                    <span className={`badge ${
                      bill.status === 'PAID' ? 'bg-success' : bill.status === 'CLAIMED' ? 'bg-info' : 'bg-danger'
                    }`}>{bill.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Registration Tab */}
      {activeTab === 'register' && (
        <div className="glass-card p-4 mx-auto" style={{ maxWidth: '650px' }}>
          <h4 className="fw-bold mb-4 text-center"><i className="bi bi-person-plus text-primary me-2"></i>Register Hospital User (Admin Only)</h4>
          <form onSubmit={handleRegisterUser}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Username</label>
                <input type="text" className="form-control rounded-3" value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Password</label>
                <input type="password" className="form-control rounded-3" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">Email</label>
                <input type="email" className="form-control rounded-3" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-semibold">User Role</label>
                <select className="form-select rounded-3" value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})}>
                  <option value="ROLE_PATIENT">Patient</option>
                  <option value="ROLE_DOCTOR">Doctor</option>
                  <option value="ROLE_PHARMACIST">Pharmacist</option>
                  <option value="ROLE_LAB_STAFF">Laboratory Staff</option>
                  <option value="ROLE_ADMIN">Clinic Staff / Admin</option>
                </select>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label small fw-semibold">Full Name</label>
                <input type="text" className="form-control rounded-3" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} required />
              </div>

              {regForm.role === 'ROLE_PATIENT' && (
                <>
                  <div className="col-md-4 mb-3">
                    <label className="form-label small fw-semibold">Age</label>
                    <input type="number" className="form-control rounded-3" value={regForm.age} onChange={e => setRegForm({...regForm, age: e.target.value})} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label small fw-semibold">Gender</label>
                    <select className="form-select rounded-3" value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label small fw-semibold">Blood Group</label>
                    <input type="text" className="form-control rounded-3" value={regForm.bloodGroup} onChange={e => setRegForm({...regForm, bloodGroup: e.target.value})} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-semibold">Phone</label>
                    <input type="text" className="form-control rounded-3" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label small fw-semibold">Address</label>
                    <textarea className="form-control rounded-3" rows="2" value={regForm.address} onChange={e => setRegForm({...regForm, address: e.target.value})}></textarea>
                  </div>
                </>
              )}

              {regForm.role === 'ROLE_DOCTOR' && (
                <>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-semibold">Department / Speciality</label>
                    <div className="input-group">
                      <select className="form-select rounded-start-3" value={regForm.departmentId || ''} onChange={e => setRegForm({...regForm, departmentId: e.target.value})} required>
                        <option value="">-- Choose Speciality --</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <button className="btn btn-outline-primary rounded-end-3 fw-bold" type="button" onClick={() => setShowDeptModal(true)} title="Add Speciality Department">+</button>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label small fw-semibold">Weekly Schedule</label>
                    <input type="text" className="form-control rounded-3" value={regForm.schedule} onChange={e => setRegForm({...regForm, schedule: e.target.value})} />
                  </div>
                </>
              )}
            </div>
            <button type="submit" className="btn btn-premium-primary w-100 rounded-3 mt-3">Register User Account</button>
          </form>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          {selectedReportForRpt ? (
            <div className="glass-card visual-report-wrapper p-4 text-start animate-fade-in">
              <VisualReport 
                report={selectedReportForRpt} 
                onBack={() => setSelectedReportForRpt(null)} 
              />
            </div>
          ) : (
            <div className="glass-card p-4 text-start animate-fade-in">
              <h4 className="fw-bold mb-4"><i className="bi bi-file-earmark-bar-graph text-primary me-2"></i>Patient Visual Diagnostics Lookup</h4>
              
              <div className="row g-4 mb-4">
                {/* Patient Search and Selector Card */}
                <div className="col-md-5">
                  <div className="card p-3 border-light-subtle rounded-3 shadow-sm bg-white">
                    <label className="form-label small fw-bold text-dark mb-2">Search Patient by Name, Phone, Place, Allergies, or History</label>
                    <div className="input-group mb-3">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                      <input 
                        type="text" 
                        className="form-control rounded-end-3 border-start-0" 
                        placeholder="Type name, phone, place, allergies, or history..." 
                        value={reportSearchQuery}
                        onChange={e => setReportSearchQuery(e.target.value)}
                      />
                    </div>

                    <label className="form-label small fw-bold text-dark mb-2">Select Patient ({filteredPatientsForRpt.length})</label>
                    <div className="list-group overflow-y-auto" style={{ maxHeight: '300px' }}>
                      {filteredPatientsForRpt.map(pat => (
                          <button
                            key={pat.id}
                            type="button"
                            className={`list-group-item list-group-item-action border-light-subtle d-flex justify-content-between align-items-center ${selectedPatientForRpt?.id === pat.id ? 'active' : ''}`}
                            onClick={() => handleSelectPatientForReports(pat)}
                          >
                            <div>
                              <div className="fw-bold text-dark">{pat.name}</div>
                              <span className="small text-muted font-monospace block" style={{ fontSize: '0.75rem' }}>ID: {pat.id} • {pat.age} yrs / {pat.gender}</span>
                            </div>
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle">{pat.bloodGroup || 'O+'}</span>
                          </button>
                        ))
                      }
                      {filteredPatientsForRpt.length === 0 && (
                        <div className="p-3 text-center text-muted small">No patients match search query.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient's Lab Reports list */}
                <div className="col-md-7 d-flex flex-column gap-4 text-start">
                  {selectedPatientForRpt ? (
                    <>
                      {/* Lab Reports Card */}
                      <div className="card p-3 border-light-subtle rounded-3 shadow-sm bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                          <div>
                            <h6 className="fw-bold text-dark mb-0">Diagnostic Reports for {selectedPatientForRpt.name}</h6>
                            <span className="small text-muted font-monospace">Patient ID: #{selectedPatientForRpt.id}</span>
                          </div>
                          <span className="badge bg-primary px-2.5 py-1">{patientReports.length} Reports Found</span>
                        </div>

                        {patientReports.length === 0 ? (
                          <div className="text-center py-4 text-muted small">
                            <i className="bi bi-folder2-open fs-2 text-muted mb-1 block"></i>
                            <p className="mb-0">No diagnostic reports finalized on file for this patient.</p>
                          </div>
                        ) : (
                          <div className="table-responsive" style={{ maxHeight: '250px' }}>
                            <table className="table table-hover align-middle mb-0">
                              <thead>
                                <tr style={{ fontSize: '0.8rem' }} className="text-muted">
                                  <th>Test Name</th>
                                  <th>Test Date</th>
                                  <th>Status</th>
                                  <th className="text-end">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {patientReports.map(rep => (
                                  <tr key={rep.id} style={{ fontSize: '0.85rem' }}>
                                    <td className="fw-bold text-dark">{rep.testName}</td>
                                    <td>{rep.testDate}</td>
                                    <td>
                                      <span className={`badge ${rep.status === 'COMPLETED' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                        {rep.status}
                                      </span>
                                    </td>
                                    <td className="text-end">
                                      <button 
                                        className="btn btn-sm btn-premium-primary rounded-2 px-3 py-1 text-white fw-semibold small" 
                                        onClick={() => setSelectedReportForRpt(rep)}
                                      >
                                        <i className="bi bi-eye-fill me-1"></i> Visual Report
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Log Vitals Card */}
                      <div className="card p-3 border-light-subtle rounded-3 shadow-sm bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                          <div>
                            <h6 className="fw-bold text-dark mb-0"><i className="bi bi-heart-pulse-fill text-danger me-1"></i>Log Vitals for {selectedPatientForRpt.name}</h6>
                            <span className="small text-muted">Record the patient's current physiological measurements</span>
                          </div>
                        </div>

                        <form onSubmit={handleSaveHealthReport}>
                          <div className="row g-3 text-start">
                            <div className="col-md-6">
                              <label className="form-label font-semibold text-dark mb-1">Weight (kg) *</label>
                              <input 
                                type="number" 
                                step="any" 
                                className="form-control rounded-3" 
                                placeholder="e.g. 72.5" 
                                value={healthReportForm.weight} 
                                onChange={e => setHealthReportForm({...healthReportForm, weight: e.target.value})} 
                                required 
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label font-semibold text-dark mb-1">BP (mmHg) *</label>
                              <input 
                                type="text" 
                                className="form-control rounded-3" 
                                placeholder="e.g. 120/80" 
                                value={healthReportForm.bp} 
                                onChange={e => setHealthReportForm({...healthReportForm, bp: e.target.value})} 
                                required 
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label font-semibold text-dark mb-1">Temp (°C)</label>
                              <input 
                                type="number" 
                                step="any" 
                                className="form-control rounded-3" 
                                placeholder="e.g. 36.6" 
                                value={healthReportForm.temperature} 
                                onChange={e => setHealthReportForm({...healthReportForm, temperature: e.target.value})} 
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label font-semibold text-dark mb-1">Heart Rate (bpm)</label>
                              <input 
                                type="number" 
                                className="form-control rounded-3" 
                                placeholder="e.g. 72" 
                                value={healthReportForm.heartRate} 
                                onChange={e => setHealthReportForm({...healthReportForm, heartRate: e.target.value})} 
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label font-semibold text-dark mb-1">Sugar Level (mg/dL)</label>
                              <input 
                                type="number" 
                                step="any" 
                                className="form-control rounded-3" 
                                placeholder="e.g. 95" 
                                value={healthReportForm.sugarLevel} 
                                onChange={e => setHealthReportForm({...healthReportForm, sugarLevel: e.target.value})} 
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label font-semibold text-dark mb-1">Clinical Notes</label>
                              <textarea 
                                className="form-control rounded-3" 
                                rows="3" 
                                placeholder="Write general clinical signs/findings here..." 
                                value={healthReportForm.notes} 
                                onChange={e => setHealthReportForm({...healthReportForm, notes: e.target.value})}
                              ></textarea>
                            </div>
                          </div>
                          <button type="submit" className="btn btn-premium-primary w-100 rounded-3 mt-4 fw-semibold">Save Physiological Vitals</button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="card p-5 border-light-subtle rounded-3 shadow-sm bg-white h-100 d-flex flex-column align-items-center justify-content-center text-center text-muted">
                      <i className="bi bi-person-bounding-box fs-1 mb-3 text-muted opacity-50"></i>
                      <h5 className="fw-bold text-dark">No Patient Selected</h5>
                      <p className="small max-w-xs mb-0">Search and select a patient from the directory on the left to pull and inspect their physiological reports.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Department Creation Modal */}
      {showDeptModal && (
        <div className="modal fade show d-block animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-premium-primary border-0 text-white p-3">
                <h5 className="modal-title fw-bold"><i className="bi bi-building me-2"></i>Create Department</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeptModal(false)}></button>
              </div>
              <form onSubmit={handleAddDept} className="p-4 bg-white">
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Department Name</label>
                  <input type="text" className="form-control rounded-3" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} placeholder="e.g. Cardiology" required/>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Description</label>
                  <textarea className="form-control rounded-3" rows="3" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} placeholder="Describe clinical functions..." required></textarea>
                </div>
                <div className="d-flex gap-2 justify-content-end mt-3">
                  <button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => setShowDeptModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-premium-primary rounded-3">Save Department</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
