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
  const [newInv, setNewInv] = useState({ itemName: '', category: '', quantity: 10, threshold: 5 });
  const [restockQty, setRestockQty] = useState({});
  const [message, setMessage] = useState('');

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
        <div className="row g-4">
          <div className="col-md-8">
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-3">Clinical Departments</h4>
              <div className="row g-3">
                {departments.map(dept => (
                  <div key={dept.id} className="col-md-6">
                    <div className="card p-3 border-light-subtle rounded-3">
                      <h5 className="fw-bold text-primary mb-1">{dept.name}</h5>
                      <p className="text-muted small mb-0">{dept.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-3">Create Department</h4>
              <form onSubmit={handleAddDept}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Dept Name</label>
                  <input type="text" className="form-control rounded-3" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} required/>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea className="form-control rounded-3" rows="3" value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})} required></textarea>
                </div>
                <button type="submit" className="btn btn-premium-primary w-100 rounded-3">Save Department</button>
              </form>
            </div>
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
    </div>
  );
}
