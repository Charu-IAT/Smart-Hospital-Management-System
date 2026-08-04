import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="container py-5 animate-fade-in">
      {/* Hero Section */}
      <div className="row align-items-center mb-5 py-5 glass-card p-5">
        <div className="col-lg-6 mb-4 mb-lg-0">
          <span className="badge bg-primary-subtle text-primary mb-3 px-3 py-2 fs-6">Powered by Artificial Intelligence</span>
          <h1 className="display-4 fw-extrabold mb-3 text-dark">
            Next-Gen <span className="gradient-text">Hospital Operations</span> & Diagnosis
          </h1>
          <p className="lead text-muted mb-4">
            The Smart Hospital Management System (SHMS) integrates appointment bookings, digital prescribing, pharmacy stocks, billing, insurance, WebRTC consultation simulation, and AI disease prediction.
          </p>
          <div className="d-flex gap-3">
            <Link to="/login" className="btn btn-premium-primary btn-lg">
              Get Started
            </Link>
            <a href="#features" className="btn btn-outline-secondary btn-lg rounded-3">
              Learn More
            </a>
          </div>
        </div>
        <div className="col-lg-6 text-center">
          <div className="p-4 bg-primary-subtle rounded-5 shadow-sm inline-block">
            <i className="bi bi-activity text-primary" style={{ fontSize: '10rem', display: 'inline-block' }}></i>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="row text-center mb-5 g-4">
        <div className="col-md-3">
          <div className="glass-card p-4">
            <h3 className="fw-bold text-primary">24/7</h3>
            <p className="text-muted mb-0">Emergency Support</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4">
            <h3 className="fw-bold text-primary">99.9%</h3>
            <p className="text-muted mb-0">Operational Uptime</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4">
            <h3 className="fw-bold text-primary">100%</h3>
            <p className="text-muted mb-0">Digital Prescriptions</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card p-4">
            <h3 className="fw-bold text-primary">AI</h3>
            <p className="text-muted mb-0">Disease Matching</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-5">
        <h2 className="text-center fw-bold mb-5">Explore Our Core Modules</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="bg-primary-subtle rounded-3 p-3 text-primary d-inline-block mb-3">
                <i className="bi bi-person-fill fs-3"></i>
              </div>
              <h4 className="fw-bold">Patient Portal</h4>
              <p className="text-muted">Register, book appointments, make online payments, view medical records, and ask the AI chatbot.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="bg-success-subtle rounded-3 p-3 text-success d-inline-block mb-3">
                <i className="bi bi-heart-pulse-fill fs-3"></i>
              </div>
              <h4 className="fw-bold">Doctor Consults</h4>
              <p className="text-muted">Manage patient schedule, write instant digital prescriptions, and run online video consults.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="bg-warning-subtle rounded-3 p-3 text-warning d-inline-block mb-3">
                <i className="bi bi-robot fs-3"></i>
              </div>
              <h4 className="fw-bold">AI Assistance</h4>
              <p className="text-muted">Heuristic disease prediction based on symptom checkers and medicine recommender with allergy filters.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="bg-info-subtle rounded-3 p-3 text-info d-inline-block mb-3">
                <i className="bi bi-receipt-cutoff fs-3"></i>
              </div>
              <h4 className="fw-bold">Billing & Insurance</h4>
              <p className="text-muted">Pay bills online securely and process claim approvals or status updates with insurance providers.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="bg-danger-subtle rounded-3 p-3 text-danger d-inline-block mb-3">
                <i className="bi bi-capsule fs-3"></i>
              </div>
              <h4 className="fw-bold">Pharmacy & Inventory</h4>
              <p className="text-muted">Update medicine inventories automatically and track stocks and medicine expiry dates.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card p-4 h-100">
              <div className="bg-secondary-subtle rounded-3 p-3 text-secondary d-inline-block mb-3">
                <i className="bi bi-file-earmark-medical-fill fs-3"></i>
              </div>
              <h4 className="fw-bold">Laboratory Portal</h4>
              <p className="text-muted">Review tests ordered by doctors, submit result details, and generate clinical files for download.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
