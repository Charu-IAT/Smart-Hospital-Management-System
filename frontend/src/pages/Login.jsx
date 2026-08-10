import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [loginRole, setLoginRole] = useState('PATIENT'); // PATIENT or CLINICIAN
  const [otpPhone, setOtpPhone] = useState('');
  
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
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchDepartments();
  }, []);

  React.useEffect(() => {
    if (message.text && message.type !== 'success') {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
      setToast({ message: 'Department created successfully!', type: 'success' });
      setShowDeptModal(false);
      fetchDepartments();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error adding department';
      setToast({ message: errorMsg, type: 'error' });
    }
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

        if (onLoginSuccess) {
          onLoginSuccess({ token, role, name });
        }

        // Redirect based on role
        if (role === 'ROLE_ADMIN') navigate('/admin');
        else if (role === 'ROLE_DOCTOR') navigate('/doctor');
        else if (role === 'ROLE_PATIENT') navigate('/patient');
        else if (role === 'ROLE_PHARMACIST') navigate('/pharmacy');
        else if (role === 'ROLE_LAB_STAFF') navigate('/lab');
        else navigate('/');
      }
    } catch (err) {
      const errorMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'An error occurred. Please try again.';
      setMessage({
        text: errorMsg,
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
        setOtpPhone(res.data.phoneMask || '****');
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
      const errorMsg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'Error processing forgot password request.';
      setMessage({
        text: errorMsg,
        type: 'danger',
      });
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      {/* Scope specific styles */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes float-reverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.03); }
        }
        @keyframes ecg-draw {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        .medical-float-nurse { animation: float-slow 7s ease-in-out infinite; }
        .medical-float-scissors { animation: float-reverse 8s ease-in-out infinite; }
        .medical-float-steth { animation: float-slow 6s ease-in-out infinite; }
        .medical-float-cross { animation: float-reverse 9s ease-in-out infinite; }
        .ecg-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: ecg-draw 6s linear infinite;
        }
      `}</style>

      <div className="card border-0 rounded-4 shadow-lg overflow-hidden w-100 bg-white" style={{ maxWidth: '1050px' }}>
        <div className="row g-0">
          
          {/* Left Side: Animated Medical Information */}
          <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden" 
               style={{ 
                 background: 'linear-gradient(135deg, #0b1528 0%, #1e3c72 50%, #2a5298 100%)',
                 minHeight: '650px'
               }}>
            
            {/* Background glowing circle grids */}
            <div className="position-absolute top-50 start-50 translate-middle rounded-circle" 
                 style={{ 
                   width: '450px', 
                   height: '450px', 
                   background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                   animation: 'pulse-glow 5s ease-in-out infinite'
                 }}></div>

            {/* App branding */}
            <div className="position-relative z-1">
              <span className="badge bg-success bg-opacity-25 text-success border border-success-subtle fw-semibold px-3 py-1.5 rounded-pill mb-3">
                <i className="bi bi-activity me-1"></i> Live Medical Ecosystem
              </span>
              <h1 className="fw-bold mb-2 text-white text-start">Smart Hospital</h1>
              <p className="text-white-50 text-start small">Advanced Clinical Diagnostics & Patient Support Portal</p>
            </div>

            {/* Grid of floating medical tools */}
            <div className="row g-4 my-auto position-relative z-1 text-center justify-content-center">
              
              <div className="col-5 medical-float-nurse">
                <div className="p-3 bg-white bg-opacity-10 rounded-4 border border-white-subtle shadow-sm backdrop-blur d-flex flex-column align-items-center">
                  <svg width="56" height="56" viewBox="0 0 64 64" fill="none" className="mb-2">
                    <circle cx="32" cy="24" r="10" fill="#fecdd3" stroke="#ffffff" strokeWidth="2"/>
                    <path d="M32 40C42 40 48 45 48 54V56H16V54C16 45 22 40 32 40Z" fill="#3b82f6" fillOpacity="0.8" stroke="#ffffff" strokeWidth="2"/>
                    <path d="M22 18C22 13 25 10 32 10C39 10 42 13 42 18H22Z" fill="#ffffff" stroke="#3b82f6" strokeWidth="2"/>
                    <path d="M32 12V16M30 14H34" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="fw-semibold text-white small">Nursing Operations</span>
                </div>
              </div>

              <div className="col-5 medical-float-scissors">
                <div className="p-3 bg-white bg-opacity-10 rounded-4 border border-white-subtle shadow-sm backdrop-blur d-flex flex-column align-items-center">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="mb-2">
                    <path d="M6 18L18 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 6L18 18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="5" cy="5" r="2" stroke="#ffffff" strokeWidth="2"/>
                    <circle cx="5" cy="19" r="2" stroke="#ffffff" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="1" fill="#ef4444"/>
                  </svg>
                  <span className="fw-semibold text-white small">Surgical Care</span>
                </div>
              </div>

              <div className="col-5 medical-float-steth">
                <div className="p-3 bg-white bg-opacity-10 rounded-4 border border-white-subtle shadow-sm backdrop-blur d-flex flex-column align-items-center">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="mb-2">
                    <path d="M6 3V9C6 12.3137 8.68629 15 12 15C15.3137 15 18 12.3137 18 9V3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 3H8M16 3H18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 15V19C12 20.1046 12.8954 21 14 21H16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="17" cy="21" r="2" fill="#ef4444" stroke="#ffffff" strokeWidth="2"/>
                  </svg>
                  <span className="fw-semibold text-white small">Diagnostics</span>
                </div>
              </div>

              <div className="col-5 medical-float-cross">
                <div className="p-3 bg-white bg-opacity-10 rounded-4 border border-white-subtle shadow-sm backdrop-blur d-flex flex-column align-items-center">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="mb-2">
                    <rect x="2" y="2" width="20" height="20" rx="4" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="2"/>
                    <path d="M12 7V17M7 12H17" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  <span className="fw-semibold text-white small">Clinical Units</span>
                </div>
              </div>

            </div>

            {/* Beating ECG line at the bottom */}
            <div className="position-relative w-100 z-1" style={{ height: '60px' }}>
              <svg viewBox="0 0 400 100" className="w-100 h-100 opacity-25">
                <path d="M0 50 L100 50 L120 20 L130 80 L140 40 L150 60 L160 50 L250 50 L270 10 L280 90 L290 40 L300 60 L310 50 L400 50" 
                      fill="none" stroke="#10b981" strokeWidth="4" className="ecg-path" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

          </div>

          {/* Right Side: Login Box */}
          <div className="col-lg-6 col-12 p-4 p-md-5 d-flex flex-column justify-content-center bg-white" style={{ minHeight: '650px' }}>
            <h2 className="fw-bold mb-4 text-center">
              {isForgot ? (
                <span className="gradient-text">Reset Password</span>
              ) : isRegister ? (
                <span className="gradient-text">Register Patient</span>
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
                  <i className="bi bi-shield-lock-fill me-1"></i>Hospital Staff Portal
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
                <div className="alert alert-warning border-0 rounded-3 p-3 text-start small mb-3 animate-scale-up">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="bi bi-shield-lock-fill text-warning"></i>
                    <strong className="text-dark">OTP Security Authentication</strong>
                  </div>
                  <p className="mb-0 text-muted">A 6-digit code has been delivered to your registered phone number: <strong className="text-dark font-monospace">{otpPhone}</strong></p>
                </div>
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
            {(!isRegister && loginRole === 'CLINICIAN') && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control rounded-3"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
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
        </div>
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
      {/* Custom Toast Notifications */}
      {toast && (
        <div className="custom-toast-container">
          <div className={`custom-toast toast-${toast.type}`}>
            <i className={`bi ${toast.type === 'error' ? 'bi-exclamation-circle-fill text-danger' : 'bi-check-circle-fill text-success'} fs-5`}></i>
            <div className="custom-toast-message">{toast.message}</div>
            <button type="button" className="btn-close" style={{ fontSize: '0.75rem' }} onClick={() => setToast(null)}></button>
          </div>
        </div>
      )}
    </div>
  );
}
