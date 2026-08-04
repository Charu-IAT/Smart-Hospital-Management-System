import React, { useState, useEffect } from 'react';
import api from '../services/api';

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
  const [departments, setDepartments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bills, setBills] = useState([]);

  // Form states
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newInv, setNewInv] = useState({ itemName: '', category: '', quantity: 10, threshold: 5 });
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
    fetchDepartments();
    fetchInventory();
    fetchBills();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) { console.error("Error fetching stats:", err); }
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
      setNewInv({ itemName: '', category: '', quantity: 10, threshold: 5 });
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
              <h3 className="fw-bold">${stats.totalRevenue?.toFixed(2)}</h3>
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
                  <td>${bill.consultationFee?.toFixed(2)}</td>
                  <td>${bill.labFee?.toFixed(2)}</td>
                  <td>${bill.pharmacyFee?.toFixed(2)}</td>
                  <td className="fw-bold text-primary">${bill.totalAmount?.toFixed(2)}</td>
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
    </div>
  );
}
