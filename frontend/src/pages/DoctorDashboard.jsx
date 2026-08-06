import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VisualReport from '../components/VisualReport';

const TEST_PRICES = {
  "Lipid Profile": 50.00,
  "Cardiac Biomarkers Panel": 120.00,
  "Coagulation Profile": 45.00,
  "Neuro-Metabolic Screen": 150.00,
  "Cerebrospinal Fluid (CSF) Panel": 200.00,
  "Neuro-Autoimmune Panel": 180.00,
  "Thyroid Panel": 40.00,
  "Diabetic Monitoring Panel": 35.00,
  "Renal Function Panel": 55.00,
  "Electrolyte Panel": 30.00,
  "Urine Analysis": 20.00,
  "Complete Blood Count (CBC)": 25.00,
  "Anemia Workup Panel": 60.00,
  "Liver Function Test (LFT)": 50.00
};

export default function DoctorDashboard() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [activeConsult, setActiveConsult] = useState(null); // Selected appointment for consultation
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [message, setMessage] = useState('');

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [allergyAlert, setAllergyAlert] = useState('');
  const [prescribedTests, setPrescribedTests] = useState([]);
  const [selectedTestSelect, setSelectedTestSelect] = useState('');
  const [customTestName, setCustomTestName] = useState('');
  const [customTestPrice, setCustomTestPrice] = useState('');
  const [customPrices, setCustomPrices] = useState({});

  // Video controls mockup state
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Editing state for patient clinical details
  const [isEditingAllergies, setIsEditingAllergies] = useState(false);
  const [tempAllergies, setTempAllergies] = useState('');
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [tempHistory, setTempHistory] = useState('');

  // Tab and Reports states
  const [activeTab, setActiveTab] = useState('queue');
  const [patients, setPatients] = useState([]);
  const [selectedPatientForRpt, setSelectedPatientForRpt] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [selectedReportForRpt, setSelectedReportForRpt] = useState(null);
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [activePatientVitals, setActivePatientVitals] = useState([]);
  const [selectedPatientVitals, setSelectedPatientVitals] = useState([]);

  useEffect(() => {
    fetchProfileAndAppointments();
  }, []);

  useEffect(() => {
    const patientMap = new Map();
    appointments.forEach(app => {
      if (app.patient && app.patient.id) {
        patientMap.set(app.patient.id, app.patient);
      }
    });
    prescriptions.forEach(p => {
      if (p.patient && p.patient.id) {
        patientMap.set(p.patient.id, p.patient);
      }
    });
    setPatients(Array.from(patientMap.values()));
  }, [appointments, prescriptions]);

  const handleSelectPatientForReports = async (patient) => {
    setSelectedPatientForRpt(patient);
    setSelectedReportForRpt(null);
    setPatientReports([]);
    setSelectedPatientVitals([]);
    try {
      const [rptRes, vitalsRes] = await Promise.all([
        api.get(`/api/patients/${patient.id}/reports`),
        api.get(`/api/patients/${patient.id}/health-report`)
      ]);
      setPatientReports(rptRes.data);
      setSelectedPatientVitals(vitalsRes.data);
    } catch (err) {
      console.error("Error loading patient reports & vitals:", err);
    }
  };

  const fetchProfileAndAppointments = async () => {
    try {
      const profRes = await api.get('/api/doctors/profile');
      setProfile(profRes.data);

      const appRes = await api.get('/api/doctors/appointments');
      setAppointments(appRes.data);

      const prescRes = await api.get('/api/doctors/prescriptions');
      setPrescriptions(prescRes.data);
    } catch (err) { console.error("Error fetching doctor data:", err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/api/appointments/${id}/status?status=${status}`);
      setMessage(`Appointment ${status.toLowerCase()} successfully!`);
      fetchProfileAndAppointments();
    } catch (err) { setMessage('Error updating appointment status'); }
  };

  const handleStartConsult = async (appointment) => {
    setActiveConsult(appointment);
    setDiagnosis('');
    setPrescribedMeds('');
    setDosage('');
    setInstructions('');
    setAllergyAlert('');
    setPrescribedTests([]);
    setSelectedTestSelect('');
    setCustomTestName('');
    setIsVideoActive(appointment.consultationType === 'VIDEO');
    setActivePatientVitals([]);
    setIsEditingAllergies(false);
    setTempAllergies(appointment.patient?.allergies || 'None');
    setIsEditingHistory(false);
    setTempHistory(appointment.patient?.medicalHistory || 'None');
    try {
      const res = await api.get(`/api/patients/${appointment.patient.id}/health-report`);
      setActivePatientVitals(res.data);
    } catch (err) {
      console.error("Error loading patient vitals:", err);
    }
  };

  const handleSaveClinicalInfo = async (field) => {
    try {
      const patientId = activeConsult.patient?.id;
      if (!patientId) return;

      const nextAllergies = field === 'allergies' ? tempAllergies : (activeConsult.patient?.allergies || 'None');
      const nextHistory = field === 'history' ? tempHistory : (activeConsult.patient?.medicalHistory || 'None');

      const res = await api.put(`/api/patients/${patientId}/clinical-info?allergies=${encodeURIComponent(nextAllergies)}&medicalHistory=${encodeURIComponent(nextHistory)}`);
      
      // Update local state
      setActiveConsult(prev => ({
        ...prev,
        patient: res.data
      }));
      
      // Update appointments list so that other references are updated
      setAppointments(prev => prev.map(app => {
        if (app.patient?.id === patientId) {
          return { ...app, patient: res.data };
        }
        return app;
      }));

      if (field === 'allergies') {
        setIsEditingAllergies(false);
      } else {
        setIsEditingHistory(false);
      }
      setMessage('Clinical profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error updating clinical info:", err);
      alert("Error updating clinical info: " + (err.response?.data || err.message));
    }
  };

  const checkAllergies = (medsText) => {
    if (!activeConsult?.patient?.allergies) return;
    const patientAllergies = activeConsult.patient.allergies.toLowerCase();
    const inputMeds = medsText.toLowerCase();

    if (patientAllergies.includes('penicillin') && (inputMeds.includes('amoxicillin') || inputMeds.includes('penicillin'))) {
      setAllergyAlert('CRITICAL ACTION REQUIRED: Patient is allergic to Penicillin. You entered Amoxicillin/Penicillin. Please check alternative meds (e.g. Azithromycin).');
    } else if (patientAllergies.includes('ibuprofen') && inputMeds.includes('ibuprofen')) {
      setAllergyAlert('WARNING: Patient is allergic to Ibuprofen (NSAID). Please prescribe Paracetamol/Acetaminophen instead.');
    } else if (patientAllergies.includes('paracetamol') && inputMeds.includes('paracetamol')) {
      setAllergyAlert('WARNING: Patient is allergic to Paracetamol. Please prescribe Ibuprofen/NSAID instead.');
    } else {
      setAllergyAlert('');
    }
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!activeConsult) return;

    if (allergyAlert.startsWith('CRITICAL')) {
      alert("Cannot submit prescription. Drug allergy warning must be resolved!");
      return;
    }

    try {
      const payload = {
        appointment: { id: activeConsult.id },
        diagnosis: diagnosis,
        medicines: prescribedMeds,
        dosage: dosage,
        instructions: instructions
      };

      await api.post('/api/doctors/prescribe', payload);
      
      if (prescribedTests && prescribedTests.length > 0) {
        for (const testName of prescribedTests) {
          const price = customPrices[testName] !== undefined ? customPrices[testName] : (TEST_PRICES[testName] || 50.00);
          await api.post('/api/lab/order', null, {
            params: {
              patientId: activeConsult.patient.id,
              testName: testName,
              price: price
            }
          });
        }
      }

      setMessage('Prescription saved, lab tests ordered, and consultation marked complete!');
      setActiveConsult(null);
      setIsVideoActive(false);
      setDiagnosis('');
      setPrescribedMeds('');
      setDosage('');
      setInstructions('');
      setPrescribedTests([]);
      setCustomPrices({});
      fetchProfileAndAppointments();
    } catch (err) { setMessage('Error saving prescription'); }
  };

  const previousDoctorHistory = activeConsult 
    ? prescriptions.filter(p => p.patient?.id === activeConsult.patient?.id)
    : [];

  const filteredPatients = patients.filter(p => {
    const query = reportSearchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.phone && p.phone.toLowerCase().includes(query)) ||
      (p.address && p.address.toLowerCase().includes(query)) ||
      (p.allergies && p.allergies.toLowerCase().includes(query)) ||
      (p.medicalHistory && p.medicalHistory.toLowerCase().includes(query))
    );
  });

  return (
    <div className="container py-4 animate-fade-in text-start">
      <h2 className="fw-bold mb-4">Doctor <span className="gradient-text">Clinical Portal</span></h2>

      {/* Tabs Header */}
      <ul className="nav nav-pills mb-4 glass-card p-2 d-flex gap-2 d-print-none">
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'queue' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('queue')}>
            <i className="bi bi-calendar-check-fill me-2"></i>Consultations Queue
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link rounded-3 fw-semibold ${activeTab === 'reports' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveTab('reports')}>
            <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>Patient Visual Reports
          </button>
        </li>
      </ul>

      {activeTab === 'queue' && (
        <div className="row g-4 animate-fade-in">
          {/* Left Side: Profile & Queue */}
          <div className={activeConsult ? 'col-lg-6' : 'col-12'}>
          {profile && (
            <div className="glass-card p-4 mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="gradient-bg text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '64px', height: '64px', minWidth: '64px', fontSize: '1.8rem' }}>
                  {profile.name ? profile.name.replace('Dr. ', '').charAt(0).toUpperCase() : 'D'}
                </div>
                <div>
                  <h4 className="fw-bold mb-0">{profile.name}</h4>
                  <p className="text-muted mb-0">{profile.specialization} • {profile.department?.name || 'General OPD'}</p>
                </div>
              </div>
              <hr />
              <p className="mb-0 text-muted"><strong>Weekly Schedule:</strong> {profile.schedule}</p>
            </div>
          )}

          {appointments.filter(app => app.paymentStatus === 'PAID').length > 0 && (
            <div className="alert alert-info border-0 rounded-4 p-3 mb-4 shadow-sm">
              <h6 className="fw-bold text-info mb-2"><i className="bi bi-bell-fill me-2 animate-bounce"></i>New Patient Payment Notifications</h6>
              <ul className="mb-0 ps-3 small text-muted animate-fade-in">
                {appointments.filter(app => app.paymentStatus === 'PAID').map(app => (
                  <li key={app.id}>
                    Consultation fee has been successfully paid by <strong>{app.patient?.name}</strong> for the appointment scheduled on <strong>{app.appointmentDate}</strong> at <strong>{app.timeSlot}</strong>.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message && (
            <div className="alert alert-success alert-dismissible fade show rounded-3" role="alert">
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
            </div>
          )}

          {/* Appointment Queue */}
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-3">Consultation Queue</h4>
            {appointments.length === 0 ? (
              <p className="text-muted mb-0">No appointments scheduled for you.</p>
            ) : (
              <div className="list-group list-group-flush">
                {appointments.map(app => {
                  const linkedPresc = prescriptions.find(p => p.appointment?.id === app.id);
                  return (
                    <div key={app.id} className="list-group-item bg-transparent px-0 py-3 border-light-subtle d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 
                            className="fw-bold mb-0 text-primary text-decoration-underline" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              if (app.patient) {
                                handleSelectPatientForReports(app.patient);
                                setActiveTab('reports');
                              }
                            }}
                          >
                            {app.patient?.name}
                          </h6>
                          <span className={`badge ${
                            app.status === 'APPROVED' ? 'bg-info-subtle text-info border-info-subtle' :
                            app.status === 'COMPLETED' ? 'bg-success-subtle text-success border-success-subtle' :
                            app.status === 'CANCELLED' ? 'bg-secondary-subtle text-secondary' :
                            'bg-warning-subtle text-warning border-warning-subtle'
                          } border small`} style={{ fontSize: '0.7rem' }}>{app.status}</span>
                        </div>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-calendar3 me-1"></i>{app.appointmentDate} • <i className="bi bi-clock me-1"></i>{app.timeSlot}
                        </p>
                        <p className="text-muted small mb-0">
                          Type: <span className="fw-semibold">{app.consultationType}</span> • Allergies: <span className="text-danger fw-semibold">{app.patient?.allergies || 'None'}</span>
                        </p>
                        <div className="d-flex gap-2 align-items-center mt-1">
                          {app.paymentStatus === 'PAID' ? (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle rounded-3 px-2 py-0.5" style={{ fontSize: '0.75rem' }}><i className="bi bi-check-circle-fill me-1"></i>Consultation Fee Paid</span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle rounded-3 px-2 py-0.5" style={{ fontSize: '0.75rem' }}><i className="bi bi-x-circle-fill me-1"></i>Fee Unpaid</span>
                          )}
                          {linkedPresc && (
                            <button className="btn btn-xs btn-outline-primary rounded-3 px-2 py-0.5 fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }} onClick={() => setViewingPrescription(linkedPresc)}>
                              <i className="bi bi-file-earmark-medical"></i> View Prescription
                            </button>
                          )}
                        </div>
                      </div>
                    <div className="d-flex gap-2">
                      {app.status === 'PENDING' && (
                        <>
                          <button className="btn btn-sm btn-success rounded-2" onClick={() => handleStatusUpdate(app.id, 'APPROVED')}>Approve</button>
                          <button className="btn btn-sm btn-outline-danger rounded-2" onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}>Cancel</button>
                        </>
                      )}
                      {app.status === 'APPROVED' && (
                        <button className="btn btn-sm btn-premium-primary rounded-2" onClick={() => handleStartConsult(app)}>
                          Consult <i className="bi bi-arrow-right-short"></i>
                        </button>
                      )}
                      {app.status === 'COMPLETED' && (
                        <span className="badge bg-success rounded-2 px-3 py-2">Consultation Completed</span>
                      )}
                      {app.status === 'CANCELLED' && (
                        <span className="badge bg-secondary rounded-2 px-3 py-2">Cancelled</span>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Consultation Screen */}
        {activeConsult && (
          <div className="col-lg-6">
            <div className="glass-card p-4 border-primary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0">Consulting: <span className="text-primary">{activeConsult.patient?.name}</span></h4>
                <button className="btn-close" onClick={() => { setActiveConsult(null); setIsVideoActive(false); }}></button>
              </div>

              {/* Simulated Video Consult */}
              {isVideoActive && (
                <div className="mb-4">
                  <div className="video-grid">
                    <div className="video-container">
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-dark">
                        <i className="bi bi-person-video3 fs-1 text-primary"></i>
                      </div>
                      <span className="video-label">Patient Screen (Live WebRTC Simulator)</span>
                    </div>
                    <div className="video-container">
                      {videoMuted ? (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-secondary">
                          <i className="bi bi-camera-video-off-fill fs-2"></i>
                        </div>
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-dark">
                          <i className="bi bi-person-fill fs-1 text-success animate-pulse"></i>
                        </div>
                      )}
                      <span className="video-label">Doctor Feed (You)</span>
                    </div>
                  </div>
                  {/* Controls */}
                  <div className="d-flex justify-content-center gap-3 mt-3 bg-dark p-2 rounded-3">
                    <button className={`btn btn-sm ${audioMuted ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setAudioMuted(!audioMuted)}>
                      <i className={`bi ${audioMuted ? 'bi-mic-mute-fill' : 'bi-mic-fill'}`}></i>
                    </button>
                    <button className={`btn btn-sm ${videoMuted ? 'btn-danger' : 'btn-outline-light'}`} onClick={() => setVideoMuted(!videoMuted)}>
                      <i className={`bi ${videoMuted ? 'bi-camera-video-off-fill' : 'bi-camera-video-fill'}`}></i>
                    </button>
                    <button className="btn btn-sm btn-outline-light">
                      <i className="bi bi-display"></i> Screen Share
                    </button>
                    <button className="btn btn-sm btn-danger px-3" onClick={() => setIsVideoActive(false)}>
                      Stop Stream
                    </button>
                  </div>
                </div>
              )}

              {/* Diagnosis and Prescription Form */}
              <form onSubmit={handleSavePrescription}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Patient Demographics & Clinical History Summary</label>
                  <div className="card border-light-subtle rounded-3 p-3 bg-light bg-opacity-50">
                    <div className="row g-2 text-start">
                      <div className="col-6">
                        <span className="text-muted small d-block"><i className="bi bi-calendar3 me-1"></i>Age / Gender</span>
                        <span className="fw-bold text-dark">{activeConsult.patient?.age} Yrs / {activeConsult.patient?.gender}</span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small d-block"><i className="bi bi-droplet-fill text-danger me-1"></i>Blood Group</span>
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle font-bold px-2.5 py-0.5 mt-0.5 d-inline-block">{activeConsult.patient?.bloodGroup || 'O+'}</span>
                      </div>
                      <div className="col-12"><hr className="my-1 border-light-subtle" /></div>
                      <div className="col-12">
                        <span className="text-danger small d-flex justify-content-between align-items-center fw-bold mb-1">
                          <span><i className="bi bi-shield-slash-fill me-1"></i>Known Allergies</span>
                          {!isEditingAllergies ? (
                            <button type="button" className="btn btn-sm btn-link text-primary p-0 fw-semibold text-decoration-none" onClick={() => { setTempAllergies(activeConsult.patient?.allergies || 'None'); setIsEditingAllergies(true); }}>
                              <i className="bi bi-pencil-square me-1"></i>Edit
                            </button>
                          ) : (
                            <div className="d-flex gap-2">
                              <button type="button" className="btn btn-sm btn-link text-success p-0 fw-semibold text-decoration-none animate-pulse" onClick={() => handleSaveClinicalInfo('allergies')}>Save</button>
                              <button type="button" className="btn btn-sm btn-link text-secondary p-0 fw-semibold text-decoration-none" onClick={() => setIsEditingAllergies(false)}>Cancel</button>
                            </div>
                          )}
                        </span>
                        {!isEditingAllergies ? (
                          <p className="mb-1 text-dark small bg-white p-2 rounded border border-danger-subtle">{activeConsult.patient?.allergies || 'No allergies reported'}</p>
                        ) : (
                          <input type="text" className="form-control form-control-sm rounded-3 mb-1" value={tempAllergies} onChange={e => setTempAllergies(e.target.value)} placeholder="Enter allergies..." />
                        )}
                      </div>
                      <div className="col-12">
                        <span className="text-primary small d-flex justify-content-between align-items-center fw-bold mb-1">
                          <span><i className="bi bi-clock-history me-1"></i>Clinical History</span>
                          {!isEditingHistory ? (
                            <button type="button" className="btn btn-sm btn-link text-primary p-0 fw-semibold text-decoration-none" onClick={() => { setTempHistory(activeConsult.patient?.medicalHistory || 'None'); setIsEditingHistory(true); }}>
                              <i className="bi bi-pencil-square me-1"></i>Edit
                            </button>
                          ) : (
                            <div className="d-flex gap-2">
                              <button type="button" className="btn btn-sm btn-link text-success p-0 fw-semibold text-decoration-none animate-pulse" onClick={() => handleSaveClinicalInfo('history')}>Save</button>
                              <button type="button" className="btn btn-sm btn-link text-secondary p-0 fw-semibold text-decoration-none" onClick={() => setIsEditingHistory(false)}>Cancel</button>
                            </div>
                          )}
                        </span>
                        {!isEditingHistory ? (
                          <p className="mb-0 text-dark small bg-white p-2 rounded border border-primary-subtle">{activeConsult.patient?.medicalHistory || 'No clinical history'}</p>
                        ) : (
                          <textarea className="form-control form-control-sm rounded-3 mb-0" rows="2" value={tempHistory} onChange={e => setTempHistory(e.target.value)} placeholder="Enter clinical history..."></textarea>
                        )}
                      </div>
                      
                      {activePatientVitals && activePatientVitals.length > 0 ? (
                        <div className="col-12 mt-2">
                          <span className="text-success small d-block fw-bold mb-2"><i className="bi bi-heart-pulse-fill me-1"></i>Latest Vitals</span>
                          <div className="bg-white p-3 rounded border border-success-subtle row g-2 mt-0.5">
                            <div className="col-6 small"><strong>Weight:</strong> <span className="text-primary fw-bold">{activePatientVitals[0].weight} kg</span></div>
                            <div className="col-6 small"><strong>Blood Pressure:</strong> <span className="text-danger fw-bold">{activePatientVitals[0].bp} mmHg</span></div>
                            {activePatientVitals[0].height && <div className="col-6 small"><strong>Height:</strong> {activePatientVitals[0].height} cm</div>}
                            {activePatientVitals[0].temperature && <div className="col-6 small"><strong>Temp:</strong> {activePatientVitals[0].temperature} °C</div>}
                            {activePatientVitals[0].heartRate && <div className="col-6 small"><strong>Pulse:</strong> {activePatientVitals[0].heartRate} bpm</div>}
                            {activePatientVitals[0].sugarLevel && <div className="col-6 small"><strong>Sugar:</strong> {activePatientVitals[0].sugarLevel} mg/dL</div>}
                          </div>
                        </div>
                      ) : (
                        <div className="col-12 mt-2">
                          <span className="text-success small d-block fw-bold mb-2"><i className="bi bi-heart-pulse-fill me-1"></i>Latest Vitals</span>
                          <p className="mb-0 text-muted small bg-white p-3 rounded border border-success-subtle">No vital signs logged by patient yet.</p>
                        </div>
                      )}

                      {activePatientVitals && activePatientVitals.length > 0 && (
                        <div className="col-12 mt-3">
                          <span className="text-primary small d-block fw-bold"><i className="bi bi-clock-history me-1"></i>Vitals Log History (Date-Wise)</span>
                          <div className="table-responsive bg-white rounded border border-light-subtle mt-1" style={{ maxHeight: '150px' }}>
                            <table className="table table-sm table-hover align-middle mb-0 text-start" style={{ fontSize: '0.78rem' }}>
                              <thead className="table-light">
                                <tr>
                                  <th>Date / Time</th>
                                  <th>Weight</th>
                                  <th>BP</th>
                                  <th>Sugar</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activePatientVitals.map(rpt => (
                                  <tr key={rpt.id}>
                                    <td className="font-monospace text-nowrap">{new Date(rpt.dateRecorded).toLocaleString()}</td>
                                    <td className="text-primary fw-bold">{rpt.weight} kg</td>
                                    <td className="text-danger fw-bold">{rpt.bp}</td>
                                    <td>{rpt.sugarLevel ? `${rpt.sugarLevel} mg/dL` : '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      <div className="col-12 mt-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-premium-primary text-white w-100 rounded-3 fw-semibold shadow-sm"
                          onClick={() => {
                            if (activeConsult.patient) {
                              handleSelectPatientForReports(activeConsult.patient);
                              setActiveTab('reports');
                            }
                          }}
                        >
                          <i className="bi bi-file-earmark-bar-graph me-1"></i> View Full Reports & Vitals History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Previous Doctor Consultations History */}
                {previousDoctorHistory.length > 0 && (
                  <div className="mb-3 animate-scale-up">
                    <label className="form-label small fw-bold text-success"><i className="bi bi-clock-history me-1"></i>Previous Consults with You ({previousDoctorHistory.length})</label>
                    <div className="list-group overflow-y-auto" style={{ maxHeight: '180px' }}>
                      {previousDoctorHistory.map(hist => (
                        <div key={hist.id} className="list-group-item bg-white border-light-subtle rounded-3 p-2.5 mb-2 small text-start shadow-sm">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-primary">Diagnosis: {hist.diagnosis}</span>
                            <span className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{hist.appointment?.appointmentDate || 'Prior Visit'}</span>
                          </div>
                          <div className="text-dark"><strong className="small text-muted">Meds:</strong> {hist.medicines}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}><strong className="small text-muted">Dosage:</strong> {hist.dosage}</div>
                          {hist.instructions && <div className="text-muted" style={{ fontSize: '0.75rem' }}><strong className="small text-muted">Inst:</strong> {hist.instructions}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Diagnosis Description</label>
                  <textarea className="form-control rounded-3" rows="2" placeholder="Describe symptoms and diagnosed disease" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Prescribe Medicines</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="e.g. Amoxicillin 500mg, Cetirizine 10mg"
                    value={prescribedMeds}
                    onChange={e => {
                      setPrescribedMeds(e.target.value);
                      checkAllergies(e.target.value);
                    }}
                    required
                  />
                  {allergyAlert && (
                    <div className={`mt-2 alert ${allergyAlert.startsWith('CRITICAL') ? 'alert-danger' : 'alert-warning'} p-2 small mb-0 rounded-3`}>
                      <i className="bi bi-exclamation-octagon-fill me-1"></i> {allergyAlert}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Dosage Schedule</label>
                  <input type="text" className="form-control rounded-3" placeholder="e.g. 1-0-1 (twice daily after meals)" value={dosage} onChange={e => setDosage(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Instructions for Patient</label>
                  <textarea className="form-control rounded-3" rows="2" placeholder="Drink warm water, rest for 3 days, avoid cold food" value={instructions} onChange={e => setInstructions(e.target.value)}></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Prescribe Laboratory Tests</label>
                  <div className="d-flex gap-2 mb-3">
                    <select
                      className="form-select rounded-3"
                      value={selectedTestSelect}
                      onChange={e => setSelectedTestSelect(e.target.value)}
                    >
                      <option value="">-- Choose Standard Panel --</option>
                      <optgroup label="Cardiology (Cardio)">
                        <option value="Lipid Profile">Lipid Profile (₹50.00)</option>
                        <option value="Cardiac Biomarkers Panel">Cardiac Biomarkers Panel (₹120.00)</option>
                        <option value="Coagulation Profile">Coagulation Profile (₹45.00)</option>
                      </optgroup>
                      <optgroup label="Neurology (Neuro)">
                        <option value="Neuro-Metabolic Screen">Neuro-Metabolic Screen (₹150.00)</option>
                        <option value="Cerebrospinal Fluid (CSF) Panel">Cerebrospinal Fluid (CSF) Panel (₹200.00)</option>
                        <option value="Neuro-Autoimmune Panel">Neuro-Autoimmune Panel (₹180.00)</option>
                      </optgroup>
                      <optgroup label="Endocrinology">
                        <option value="Thyroid Panel">Thyroid Panel (₹40.00)</option>
                        <option value="Diabetic Monitoring Panel">Diabetic Monitoring Panel (₹35.00)</option>
                      </optgroup>
                      <optgroup label="Nephrology & Urology">
                        <option value="Renal Function Panel">Renal Function Panel (₹55.00)</option>
                        <option value="Electrolyte Panel">Electrolyte Panel (₹30.00)</option>
                        <option value="Urine Analysis">Urine Analysis (₹20.00)</option>
                      </optgroup>
                      <optgroup label="Hematology & Hepatology">
                        <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC) (₹25.00)</option>
                        <option value="Anemia Workup Panel">Anemia Workup Panel (₹60.00)</option>
                        <option value="Liver Function Test (LFT)">Liver Function Test (LFT) (₹50.00)</option>
                      </optgroup>
                    </select>
                    
                    <button
                      type="button"
                      className="btn btn-premium-primary d-flex align-items-center justify-content-center"
                      style={{ padding: '8px 16px', minWidth: '46px' }}
                      onClick={() => {
                        if (selectedTestSelect && !prescribedTests.includes(selectedTestSelect)) {
                          setPrescribedTests([...prescribedTests, selectedTestSelect]);
                          setSelectedTestSelect('');
                        }
                      }}
                      title="Add selected test"
                    >
                      <i className="bi bi-plus-lg text-white"></i>
                    </button>
                  </div>

                  {/* Or Custom Test Name & Price Input */}
                  <div className="row g-2 mb-3">
                    <div className="col-7">
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Or enter custom test name..."
                        value={customTestName}
                        onChange={e => setCustomTestName(e.target.value)}
                      />
                    </div>
                    <div className="col-5">
                      <div className="input-group">
                        <span className="input-group-text bg-light">₹</span>
                        <input
                          type="number"
                          className="form-control rounded-3"
                          placeholder="Price"
                          value={customTestPrice}
                          onChange={e => setCustomTestPrice(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-premium-secondary d-flex align-items-center justify-content-center"
                          style={{ padding: '8px 12px' }}
                          onClick={() => {
                            const trimmed = customTestName.trim();
                            if (trimmed) {
                              const enteredPrice = parseFloat(customTestPrice) || 50.00;
                              setCustomPrices(prev => ({ ...prev, [trimmed]: enteredPrice }));
                              if (!prescribedTests.includes(trimmed)) {
                                setPrescribedTests([...prescribedTests, trimmed]);
                              }
                              setCustomTestName('');
                              setCustomTestPrice('');
                            }
                          }}
                          title="Add custom test"
                        >
                          <i className="bi bi-plus-lg text-white"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Selected Tests List */}
                  {prescribedTests.length > 0 && (
                    <div className="p-3 bg-light rounded-3 border border-light-subtle small mb-4">
                      <div className="fw-semibold text-muted mb-2"><i className="bi bi-cart-check-fill me-1"></i>Prescribed Lab Panels ({prescribedTests.length}):</div>
                      <div className="d-flex flex-column gap-2 mb-3">
                        {prescribedTests.map((test, index) => {
                          const price = customPrices[test] !== undefined ? customPrices[test] : (TEST_PRICES[test] || 50.00);
                          return (
                            <div key={index} className="d-flex justify-content-between align-items-center bg-white px-3 py-2.5 rounded-3 border border-light-subtle animate-scale-up">
                              <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-premium-primary text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.65rem' }}>
                                  Test Order
                                </span>
                                <span className="fw-bold text-dark">{test}</span>
                              </div>
                              <div className="d-flex align-items-center gap-3">
                                <span className="fw-extrabold text-primary font-monospace">₹{price.toFixed(2)}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger border-0 p-1.5 d-flex align-items-center justify-content-center rounded-circle"
                                  style={{ width: '28px', height: '28px' }}
                                  onClick={() => {
                                    setPrescribedTests(prescribedTests.filter((_, idx) => idx !== index));
                                    const nextCustomPrices = { ...customPrices };
                                    delete nextCustomPrices[test];
                                    setCustomPrices(nextCustomPrices);
                                  }}
                                >
                                  <i className="bi bi-trash-fill fs-6"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2.5 border-top border-light-subtle text-dark fw-bold">
                        <span>Consolidated Lab Booking Fee:</span>
                        <span className="fs-5 text-primary font-monospace">
                          ₹{prescribedTests.reduce((sum, test) => sum + (customPrices[test] !== undefined ? customPrices[test] : (TEST_PRICES[test] || 50.00)), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-premium-primary flex-grow-1 rounded-3">
                    Save Prescription & Finish
                  </button>
                  <button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => { 
                    setActiveConsult(null); 
                    setIsVideoActive(false); 
                    setDiagnosis('');
                    setPrescribedMeds('');
                    setDosage('');
                    setInstructions('');
                    setPrescribedTests([]);
                    setCustomPrices({});
                  }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
              <h4 className="fw-bold mb-4"><i className="bi bi-file-earmark-bar-graph text-primary me-2"></i>Clinical Reports Archives Lookup</h4>
              
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

                    <label className="form-label small fw-bold text-dark mb-2">Select Patient ({filteredPatients.length})</label>
                    <div className="list-group overflow-y-auto" style={{ maxHeight: '300px' }}>
                      {filteredPatients.map(pat => (
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
                      ))}
                      {filteredPatients.length === 0 && (
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

                      {/* Health Reports (Vitals Log) Card */}
                      <div className="card p-3 border-light-subtle rounded-3 shadow-sm bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                          <div>
                            <h6 className="fw-bold text-dark mb-0">Physiological Vitals History</h6>
                            <span className="small text-muted">Daily physiological checks logged by patient</span>
                          </div>
                          <span className="badge bg-success px-2.5 py-1">{selectedPatientVitals.length} Logs Found</span>
                        </div>

                        {selectedPatientVitals.length === 0 ? (
                          <div className="text-center py-4 text-muted small">
                            <i className="bi bi-heart-pulse fs-2 text-muted mb-1 block"></i>
                            <p className="mb-0">No vitals logs submitted by this patient.</p>
                          </div>
                        ) : (
                          <div className="table-responsive" style={{ maxHeight: '250px' }}>
                            <table className="table table-hover align-middle mb-0">
                              <thead>
                                <tr style={{ fontSize: '0.8rem' }} className="text-muted">
                                  <th>Date Logged</th>
                                  <th>Weight</th>
                                  <th>BP</th>
                                  <th>Pulse</th>
                                  <th>Temp</th>
                                  <th>Sugar</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPatientVitals.map(rpt => (
                                  <tr key={rpt.id} style={{ fontSize: '0.85rem' }}>
                                    <td className="fw-bold text-dark">{new Date(rpt.dateRecorded).toLocaleString()}</td>
                                    <td className="text-primary fw-semibold">{rpt.weight} kg</td>
                                    <td className="text-danger fw-semibold">{rpt.bp} mmHg</td>
                                    <td>{rpt.heartRate ? `${rpt.heartRate} bpm` : 'N/A'}</td>
                                    <td>{rpt.temperature ? `${rpt.temperature} °C` : 'N/A'}</td>
                                    <td>{rpt.sugarLevel ? `${rpt.sugarLevel} mg/dL` : 'N/A'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
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

      {/* View Prescription Modal */}
      {viewingPrescription && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden animate-scale-up">
              <div className="modal-header bg-premium-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold"><i className="bi bi-file-earmark-medical me-2"></i>Prescription Record</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setViewingPrescription(null)}></button>
              </div>
              <div className="modal-body p-4 text-start">
                <div className="mb-3">
                  <span className="text-muted small d-block">Patient Name</span>
                  <span className="fw-bold text-dark fs-5">{viewingPrescription.patient?.name}</span>
                </div>
                <div className="mb-3">
                  <span className="text-muted small d-block">Diagnosis / Findings</span>
                  <span className="fw-semibold text-dark block">{viewingPrescription.diagnosis}</span>
                </div>
                <div className="mb-3">
                  <span className="text-muted small d-block">Prescribed Medications</span>
                  <pre className="bg-light p-3 rounded-3 border border-light-subtle text-dark small mb-0 font-monospace" style={{ whiteSpace: 'pre-wrap' }}>
                    {viewingPrescription.medicines}
                  </pre>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Dosage Schedule</span>
                    <span className="text-dark small">{viewingPrescription.dosage || 'N/A'}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small d-block">Instructions</span>
                    <span className="text-dark small">{viewingPrescription.instructions || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-muted small border-top pt-2">
                  Issued On: {new Date(viewingPrescription.dateCreated).toLocaleString()}
                </div>
              </div>
              <div className="modal-footer bg-light border-0 py-3">
                <button type="button" className="btn btn-secondary px-4 rounded-3" onClick={() => setViewingPrescription(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
