import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PharmacyPortal from './pages/PharmacyPortal';
import LabPortal from './pages/LabPortal';
import InsurancePortal from './pages/InsurancePortal';

function ProtectedRoute({ children, allowedRoles }) {
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    const isReload = 
      performance.getEntriesByType('navigation')[0]?.type === 'reload' ||
      performance.navigation?.type === 1;

    if (isReload) {
      sessionStorage.clear();
      localStorage.clear();
      return null;
    }
    
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    const name = sessionStorage.getItem('name');
    return token ? { token, role, name } : null;
  });

  useEffect(() => {
    const isReload = 
      performance.getEntriesByType('navigation')[0]?.type === 'reload' ||
      performance.navigation?.type === 1;

    if (isReload) {
      sessionStorage.clear();
      localStorage.clear();
      setUser(null);
      window.location.hash = '/';
    } else {
      localStorage.clear();

      const token = sessionStorage.getItem('token');
      const role = sessionStorage.getItem('role');
      const name = sessionStorage.getItem('name');

      if (token) {
        setUser({ token, role, name });
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg custom-navbar sticky-top mb-4">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-extrabold" to="/">
            <i className="bi bi-activity text-primary fs-3"></i>
            <span className="gradient-text fs-4 fw-bold">SmartHospital</span>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/">Home</Link>
              </li>

              {/* Dynamic Dashboard Links based on role */}
              {user && (
                <>
                  {user.role === 'ROLE_ADMIN' && (
                    <li className="nav-item">
                      <Link className="nav-link nav-link-custom" to="/admin">Admin Panel</Link>
                    </li>
                  )}
                  {user.role === 'ROLE_DOCTOR' && (
                    <li className="nav-item">
                      <Link className="nav-link nav-link-custom" to="/doctor">Doctor Panel</Link>
                    </li>
                  )}
                  {user.role === 'ROLE_PATIENT' && (
                    <li className="nav-item">
                      <Link className="nav-link nav-link-custom" to="/patient">Patient Panel</Link>
                    </li>
                  )}
                  {user.role === 'ROLE_PHARMACIST' && (
                    <li className="nav-item">
                      <Link className="nav-link nav-link-custom" to="/pharmacy">Pharmacy</Link>
                    </li>
                  )}
                  {user.role === 'ROLE_LAB_STAFF' && (
                    <li className="nav-item">
                      <Link className="nav-link nav-link-custom" to="/lab">Laboratory</Link>
                    </li>
                  )}
                  {user.role === 'ROLE_ADMIN' && (
                    <li className="nav-item">
                      <Link className="nav-link nav-link-custom" to="/insurance">Insurance Claims</Link>
                    </li>
                  )}
                </>
              )}
            </ul>

            <div className="d-flex align-items-center gap-3">
              {user ? (
                <>
                  <span className="text-muted small">
                    Logged in as: <strong className="text-primary">{user.name} ({user.role.replace('ROLE_', '')})</strong>
                  </span>
                  <button className="btn btn-sm btn-outline-danger px-3 py-1.5 rounded-pill fw-semibold" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </>
              ) : (
                <Link className="btn btn-premium-primary btn-sm px-4 py-2" to="/login">
                  Portal Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLoginSuccess={(userData) => setUser(userData)} />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />

        <Route path="/pharmacy" element={
          <ProtectedRoute allowedRoles={['ROLE_PHARMACIST']}>
            <PharmacyPortal />
          </ProtectedRoute>
        } />

        <Route path="/lab" element={
          <ProtectedRoute allowedRoles={['ROLE_LAB_STAFF']}>
            <LabPortal />
          </ProtectedRoute>
        } />

        <Route path="/insurance" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <InsurancePortal />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
