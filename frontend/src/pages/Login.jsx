import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
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
    schedule: 'Mon-Fri: 9AM-5PM',
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          schedule: formData.schedule,
        };
        await api.post('/api/auth/register', payload);
        setMessage({ text: 'Registration successful! Please login.', type: 'success' });
        setIsRegister(false);
      } else {
        // Login flow
        const res = await api.post('/api/auth/login', {
          username: formData.username,
          password: formData.password,
        });
        const { token, role, username, userId, profileId, name } = res.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', userId);
        localStorage.setItem('profileId', profileId || '');
        localStorage.setItem('name', name);

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

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-card p-4 shadow-lg w-100" style={{ maxWidth: '550px' }}>
        <h2 className="text-center fw-bold mb-4">
          {isRegister ? <span className="gradient-text">Register Account</span> : <span className="gradient-text">Secure Portal Login</span>}
        </h2>

        {message.text && (
          <div className={`alert alert-${message.type} rounded-3`} role="alert">
            {message.text}
          </div>
        )}

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
          </div>

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
                    <label className="form-label fw-semibold">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      className="form-control rounded-3"
                      placeholder="e.g. Cardiologist, Neurologist"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                    />
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
      </div>
    </div>
  );
}
