import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function DoctorDashboard() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeConsult, setActiveConsult] = useState(null); // Selected appointment for consultation
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [message, setMessage] = useState('');

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [allergyAlert, setAllergyAlert] = useState('');

  // Video controls mockup state
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    fetchProfileAndAppointments();
  }, []);

  const fetchProfileAndAppointments = async () => {
    try {
      const profRes = await api.get('/api/doctors/profile');
      setProfile(profRes.data);

      const appRes = await api.get('/api/doctors/appointments');
      setAppointments(appRes.data);
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
      setMessage('Prescription saved and consultation marked complete!');
      setActiveConsult(null);
      setIsVideoActive(false);
      fetchProfileAndAppointments();
    } catch (err) { setMessage('Error saving prescription'); }
  };

  return (
    <div className="container py-4 animate-fade-in">
      <div className="row g-4">
        {/* Left Side: Profile & Queue */}
        <div className={activeConsult ? 'col-lg-6' : 'col-12'}>
          {profile && (
            <div className="glass-card p-4 mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary-subtle text-primary rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-person-pulse-fill fs-2"></i>
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
                {appointments.map(app => (
                  <div key={app.id} className="list-group-item bg-transparent px-0 py-3 border-light-subtle d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                    <div>
                      <h6 className="fw-bold mb-1 text-primary">{app.patient?.name}</h6>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-calendar3 me-1"></i>{app.appointmentDate} • <i className="bi bi-clock me-1"></i>{app.timeSlot}
                      </p>
                      <p className="text-muted small mb-0">
                        Type: <span className="fw-semibold">{app.consultationType}</span> • Allergies: <span className="text-danger fw-semibold">{app.patient?.allergies || 'None'}</span>
                      </p>
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
                ))}
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
    </div>
  );
}
