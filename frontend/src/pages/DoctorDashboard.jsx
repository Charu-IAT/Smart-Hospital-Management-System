import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VisualReport from '../components/VisualReport';

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
  const [prescribedTest, setPrescribedTest] = useState('');

  // Video controls mockup state
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Tab and Reports states
  const [activeTab, setActiveTab] = useState('queue');
  const [patients, setPatients] = useState([]);
  const [selectedPatientForRpt, setSelectedPatientForRpt] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [selectedReportForRpt, setSelectedReportForRpt] = useState(null);
  const [reportSearchQuery, setReportSearchQuery] = useState('');

  useEffect(() => {
    fetchProfileAndAppointments();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/patients/all');
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

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

  const handleStartConsult = (appointment) => {
    setActiveConsult(appointment);
    setDiagnosis('');
    setPrescribedMeds('');
    setDosage('');
    setInstructions('');
    setAllergyAlert('');
    setPrescribedTest('');
    setIsVideoActive(appointment.consultationType === 'VIDEO');
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
      
      if (prescribedTest) {
        await api.post('/api/lab/order', null, {
          params: {
            patientId: activeConsult.patient.id,
            testName: prescribedTest
          }
        });
      }

      setMessage('Prescription saved, lab test ordered, and consultation marked complete!');
      setActiveConsult(null);
      setIsVideoActive(false);
      fetchProfileAndAppointments();
    } catch (err) { setMessage('Error saving prescription'); }
  };

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
                          <h6 className="fw-bold mb-0 text-primary">{app.patient?.name}</h6>
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
                  <label className="form-label small fw-semibold">Patient Demographics & Medical History</label>
                  <div className="bg-light p-3 rounded-3 border-0 small">
                    <p className="mb-1"><strong>Age/Gender:</strong> {activeConsult.patient?.age} yrs / {activeConsult.patient?.gender}</p>
                    <p className="mb-1"><strong>Blood Group:</strong> {activeConsult.patient?.bloodGroup}</p>
                    <p className="mb-1 text-danger"><strong>Allergies:</strong> {activeConsult.patient?.allergies || 'None reported'}</p>
                    <p className="mb-0"><strong>History:</strong> {activeConsult.patient?.medicalHistory || 'No previous history'}</p>
                  </div>
                </div>

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
                  <label className="form-label small fw-semibold text-dark">Prescribe Laboratory Test (Optional)</label>
                  <select
                    className="form-select rounded-3"
                    value={prescribedTest}
                    onChange={e => setPrescribedTest(e.target.value)}
                  >
                    <option value="">-- No Lab Tests Recommended --</option>
                    <optgroup label="Cardiology (Cardio)">
                      <option value="Lipid Profile">Lipid Profile</option>
                      <option value="Cardiac Biomarkers Panel">Cardiac Biomarkers Panel</option>
                      <option value="Coagulation Profile">Coagulation Profile</option>
                    </optgroup>
                    <optgroup label="Neurology (Neuro)">
                      <option value="Neuro-Metabolic Screen">Neuro-Metabolic Screen</option>
                      <option value="Cerebrospinal Fluid (CSF) Panel">Cerebrospinal Fluid (CSF) Panel</option>
                      <option value="Neuro-Autoimmune Panel">Neuro-Autoimmune Panel</option>
                    </optgroup>
                    <optgroup label="Endocrinology">
                      <option value="Thyroid Panel">Thyroid Panel</option>
                      <option value="Diabetic Monitoring Panel">Diabetic Monitoring Panel</option>
                    </optgroup>
                    <optgroup label="Nephrology & Urology">
                      <option value="Renal Function Panel">Renal Function Panel</option>
                      <option value="Electrolyte Panel">Electrolyte Panel</option>
                      <option value="Urine Analysis">Urine Analysis</option>
                    </optgroup>
                    <optgroup label="Hematology & Hepatology">
                      <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                      <option value="Anemia Workup Panel">Anemia Workup Panel</option>
                      <option value="Liver Function Test (LFT)">Liver Function Test (LFT)</option>
                    </optgroup>
                  </select>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-premium-primary flex-grow-1 rounded-3">
                    Save Prescription & Finish
                  </button>
                  <button type="button" className="btn btn-outline-secondary rounded-3" onClick={() => { setActiveConsult(null); setIsVideoActive(false); }}>
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
        <div className="glass-card p-4 text-start animate-fade-in">
          {selectedReportForRpt ? (
            <VisualReport 
              report={selectedReportForRpt} 
              onBack={() => setSelectedReportForRpt(null)} 
            />
          ) : (
            <div>
              <h4 className="fw-bold mb-4"><i className="bi bi-file-earmark-bar-graph text-primary me-2"></i>Clinical Reports Archives Lookup</h4>
              
              <div className="row g-4 mb-4">
                {/* Patient Search and Selector Card */}
                <div className="col-md-5">
                  <div className="card p-3 border-light-subtle rounded-3 shadow-sm bg-white">
                    <label className="form-label small fw-bold text-dark mb-2">Search Patient by Name</label>
                    <div className="input-group mb-3">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                      <input 
                        type="text" 
                        className="form-control rounded-end-3 border-start-0" 
                        placeholder="Type name to search..." 
                        value={reportSearchQuery}
                        onChange={e => setReportSearchQuery(e.target.value)}
                      />
                    </div>

                    <label className="form-label small fw-bold text-dark mb-2">Select Patient ({patients.filter(p => p.name.toLowerCase().includes(reportSearchQuery.toLowerCase())).length})</label>
                    <div className="list-group overflow-y-auto" style={{ maxHeight: '300px' }}>
                      {patients
                        .filter(p => p.name.toLowerCase().includes(reportSearchQuery.toLowerCase()))
                        .map(pat => (
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
                      {patients.filter(p => p.name.toLowerCase().includes(reportSearchQuery.toLowerCase())).length === 0 && (
                        <div className="p-3 text-center text-muted small">No patients match search query.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient's Lab Reports list */}
                <div className="col-md-7">
                  {selectedPatientForRpt ? (
                    <div className="card p-3 border-light-subtle rounded-3 shadow-sm bg-white h-100">
                      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                        <div>
                          <h6 className="fw-bold text-dark mb-0">Diagnostic Reports for {selectedPatientForRpt.name}</h6>
                          <span className="small text-muted font-monospace">Patient ID: #{selectedPatientForRpt.id}</span>
                        </div>
                        <span className="badge bg-primary px-2.5 py-1">{patientReports.length} Reports Found</span>
                      </div>

                      {patientReports.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-folder2-open fs-1 text-muted mb-2 block"></i>
                          <p className="mb-0">No diagnostic reports finalized on file for this patient.</p>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle">
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
        </div>
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
