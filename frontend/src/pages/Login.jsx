import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [loginRole, setLoginRole] = useState('PATIENT'); // PATIENT or CLINICIAN
  
  const [formData, setFormData] = useState({
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

  const [forgotData, setForgotData] = useState({
    username: '',
    otp: '',
    newPassword: '',
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [departments, setDepartments] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/admin/departments');
      setDepartments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/departments', newDept);
      setNewDept({ name: '', description: '' });
      setShowDeptModal(false);
      fetchDepartments();
    } catch (err) { alert('Error adding department'); }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotInputChange = (e) => {
    setForgotData({ ...forgotData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      if (isRegister) {
        // Register flow
        const payload = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          role: formData.role,
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          phone: formData.phone,
          specialization: formData.specialization,
          departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
          schedule: formData.schedule,
        };
        await api.post('/api/auth/register', payload);
        setMessage({ text: 'Registration successful! Please login.', type: 'success' });
        setIsRegister(false);
      } else {
        // Login flow
        const res = await api.post('/api/auth/login', {
          username: formData.username,
          password: loginRole === 'PATIENT' ? '' : formData.password,
        });
        const { token, role, username, userId, profileId, name } = res.data;
        
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('role', role);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('profileId', profileId || '');
        sessionStorage.setItem('name', name);

        // Redirect based on role
        if (role === 'ROLE_ADMIN') navigate('/admin');
        else if (role === 'ROLE_DOCTOR') navigate('/doctor');
        else if (role === 'ROLE_PATIENT') navigate('/patient');
        else if (role === 'ROLE_PHARMACIST') navigate('/pharmacy');
        else if (role === 'ROLE_LAB_STAFF') navigate('/lab');
        else navigate('/');
        
        window.location.reload(); // Refresh to update Navbar State
      }
    } catch (err) {
      setMessage({
        text: err.response?.data || 'An error occurred. Please try again.',
        type: 'danger',
      });
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      if (forgotStep === 1) {
        const res = await api.post('/api/auth/forgot-password', { username: forgotData.username });
        setMessage({
          text: `OTP sent! Mobile number ending in: ${res.data.phoneMask || '****'}. Simulated OTP Code is: ${res.data.otp || 'XXXXXX'}`,
          type: 'success'
        });
        setForgotStep(2);
      } else {
        await api.post('/api/auth/reset-password', {
          username: forgotData.username,
          otp: forgotData.otp,
          newPassword: forgotData.newPassword,
        });
        setMessage({ text: 'Password reset successful! You can now login with your new password.', type: 'success' });
        setIsForgot(false);
        setForgotStep(1);
        setForgotData({ username: '', otp: '', newPassword: '' });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data || 'Error processing forgot password request.',
        type: 'danger',
      });
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-card p-4 shadow-lg w-100" style={{ maxWidth: '550px' }}>
        <h2 className="text-center fw-bold mb-4">
          {isForgot ? (
            <span className="gradient-text">Reset Password</span>
          ) : isRegister ? (
            <span className="gradient-text">Register Account</span>
          ) : (
            <span className="gradient-text">Secure Portal Login</span>
          )}
        </h2>

        {message.text && (
          <div className={`alert alert-${message.type} rounded-3`} role="alert">
            {message.text}
          </div>
        )}

        {!isForgot && !isRegister && (
          <div className="d-flex bg-light p-1 rounded-3 mb-4 border border-light-subtle">
            <button
              type="button"
              className={`btn w-50 py-2 rounded-2 fw-semibold transition-all small border-0 ${
                loginRole === 'PATIENT'
                  ? 'btn-premium-primary shadow-sm text-white'
                  : 'btn-light text-muted'
              }`}
              onClick={() => {
                setLoginRole('PATIENT');
                setFormData(prev => ({ ...prev, password: '' }));
              }}
            >
              <i className="bi bi-person-fill me-1"></i>Patient Portal
            </button>
            <button
              type="button"
              className={`btn w-50 py-2 rounded-2 fw-semibold transition-all small border-0 ${
                loginRole === 'CLINICIAN'
                  ? 'btn-premium-primary shadow-sm text-white'
                  : 'btn-light text-muted'
              }`}
              onClick={() => setLoginRole('CLINICIAN')}
            >
              <i className="bi bi-shield-lock-fill me-1"></i>Doctor
            </button>
          </div>
        )}

        {isForgot ? (
          /* Forgot Password View */
          <form onSubmit={handleForgotPasswordSubmit}>
            {forgotStep === 1 ? (
              <>
                <p className="text-muted small">Enter your username below. We will generate a 6-digit OTP code and deliver it to your registered phone number (simulated in backend console).</p>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control rounded-3"
                    placeholder="Enter your username"
                    value={forgotData.username}
                    onChange={handleForgotInputChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-premium-primary w-100 py-2.5 rounded-3">
                  Request Reset OTP
                </button>
              </>
            ) : (
              <>
                 <p className="text-muted small">Enter the 6-digit OTP code displayed in the success alert above (or check the backend server logs), and your new password.</p>
                <div className="mb-3">
                  <label className="form-label fw-semibold">OTP Code</label>
                  <input
                    type="text"
                    name="otp"
                    className="form-control rounded-3"
                    placeholder="Enter 6-digit OTP"
                    value={forgotData.otp}
                    onChange={handleForgotInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control rounded-3"
                    placeholder="Enter new password"
                    value={forgotData.newPassword}
                    onChange={handleForgotInputChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-premium-primary w-100 py-2.5 rounded-3">
                  Confirm Reset Password
                </button>
              </>
            )}

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link text-secondary text-decoration-none fw-semibold small"
                onClick={() => {
                  setIsForgot(false);
                  setForgotStep(1);
                  setMessage({ text: '', type: '' });
                }}
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          /* Login and Register View */
          <form onSubmit={handleFormSubmit}>
            {/* Username */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Username</label>
              <input
                type="text"
                name="username"
                className="form-control rounded-3"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Password */}
            {(loginRole === 'PATIENT' && !isRegister) ? null : (
              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control rounded-3"
                  placeholder={isRegister ? "Enter password" : "Enter password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required={isRegister || loginRole === 'CLINICIAN'}
                />
                {!isRegister && (
                  <div className="text-end mt-1">
                    <button
                      type="button"
                      className="btn btn-link text-primary p-0 small fw-semibold text-decoration-none"
                      onClick={() => {
                        setIsForgot(true);
                        setForgotStep(1);
                        setMessage({ text: '', type: '' });
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {isRegister && (
              <>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control rounded-3"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Role Selection */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">I want to register as a:</label>
                  <select name="role" className="form-select rounded-3" value={formData.role} onChange={handleInputChange}>
                    <option value="ROLE_PATIENT">Patient</option>
                    <option value="ROLE_DOCTOR">Doctor</option>
                  </select>
                </div>

                {/* Shared Profile fields */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control rounded-3"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Patient Fields */}
                {formData.role === 'ROLE_PATIENT' && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Age</label>
                      <input
                        type="number"
                        name="age"
                        className="form-control rounded-3"
                        placeholder="Age"
                        value={formData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Gender</label>
                      <select name="gender" className="form-select rounded-3" value={formData.gender} onChange={handleInputChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Blood Group</label>
                      <input
                        type="text"
                        name="bloodGroup"
                        className="form-control rounded-3"
                        placeholder="O+, A-, etc."
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control rounded-3"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Address</label>
                      <textarea
                        name="address"
                        className="form-control rounded-3"
                        placeholder="Address"
                        rows="2"
                        value={formData.address}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Doctor Fields */}
                {formData.role === 'ROLE_DOCTOR' && (
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Department / Speciality</label>
                      <div className="input-group">
                        <select
                          name="departmentId"
                          className="form-select rounded-start-3"
                          value={formData.departmentId || ''}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">-- Choose Speciality --</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <button className="btn btn-outline-primary rounded-end-3 fw-bold" type="button" onClick={() => setShowDeptModal(true)} title="Add Speciality Department">+</button>
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Weekly Schedule</label>
                      <input
                        type="text"
                        name="schedule"
                        className="form-control rounded-3"
                        placeholder="e.g. Mon-Fri: 9AM-5PM"
                        value={formData.schedule}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn btn-premium-primary w-100 py-2.5 mt-3 fs-5 rounded-3">
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>
        )}

        {!isForgot && (
          <div className="text-center mt-4">
            <p className="text-muted">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setMessage({ text: '', type: '' });
                }}
                className="btn btn-link text-primary p-0 fw-semibold align-baseline text-decoration-none"
              >
                {isRegister ? 'Login Here' : 'Register Here'}
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Inline Department Creation Modal */}
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
