import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [payingBill, setPayingBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payments, setPayments] = useState([]);

  // Active section state
  const [activeSection, setActiveSection] = useState('profile');

  // Appointment Form
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    appointmentDate: '',
    timeSlot: '09:00 AM - 09:30 AM',
    consultationType: 'IN_PERSON',
  });

  // AI Disease Prediction Form
  const [symptomsInput, setSymptomsInput] = useState('');
  const [predictedResult, setPredictedResult] = useState(null);

  // AI Medicine Recommendation Form
  const [diagInput, setDiagInput] = useState('');
  const [recMedsResult, setRecMedsResult] = useState(null);

  // Chatbot Sidebar state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Hello! I am your Smart Hospital AI Assistant. How can I help you today? You can ask about appointment bookings, doctor availability, or timings.' }
  ]);

  // Video call consult state
  const [activeCall, setActiveCall] = useState(null);
  const [callConnected, setCallConnected] = useState(false);

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfileData();
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/api/admin/departments');
      setDepartments(res.data);
    } catch (err) { console.error("Error fetching departments:", err); }
  };

  const fetchProfileData = async () => {
    try {
      const profRes = await api.get('/api/patients/profile');
      setProfile(profRes.data);
      const patientId = profRes.data.id;

      // Fetch patient relational data
      const [appRes, billRes, prescRes, repRes, payRes] = await Promise.all([
        api.get('/api/appointments/patient'),
        api.get('/api/billing/patient'),
        api.get(`/api/patients/${patientId}/prescriptions`),
        api.get(`/api/patients/${patientId}/reports`),
        api.get('/api/billing/payments'),
      ]);

      setAppointments(appRes.data);
      setBills(billRes.data);
      setPrescriptions(prescRes.data);
      setReports(repRes.data);
      setPayments(payRes.data);
    } catch (err) { console.error("Error loading patient data:", err); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/api/doctors/all');
      setDoctors(res.data);
    } catch (err) { console.error("Error fetching doctors:", err); }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!bookingForm.doctorId || !bookingForm.appointmentDate) {
      alert("Please select a doctor and date");
      return;
    }

    try {
      const payload = {
        doctor: { id: bookingForm.doctorId },
        appointmentDate: bookingForm.appointmentDate,
        timeSlot: bookingForm.timeSlot,
        consultationType: bookingForm.consultationType,
      };

      await api.post('/api/appointments/book', payload);
      setMessage('Appointment booked successfully! Consultation invoice generated.');
      setBookingForm({
        doctorId: '',
        appointmentDate: '',
        timeSlot: '09:00 AM - 09:30 AM',
        consultationType: 'IN_PERSON',
      });
      fetchProfileData();
      setActiveSection('appointments');
    } catch (err) {
      setMessage('Error booking appointment');
    }
  };

  const handlePayBill = async (billId, method) => {
    setIsPaying(true);
    try {
      await api.post(`/api/billing/${billId}/pay?paymentMethod=${method}`);
      setPaymentSuccess(true);
    } catch (err) {
      alert(err.response?.data || 'Error processing payment');
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubmitClaim = async (billId) => {
    try {
      await api.post(`/api/insurance/claim?billingId=${billId}`);
      setMessage('Insurance claim submitted successfully. Awaiting provider approval.');
      fetchProfileData();
    } catch (err) {
      setMessage('Claim failed. Please verify you have an active verified insurance policy on file.');
    }
  };

  const handlePredictDisease = async (e) => {
    e.preventDefault();
    if (!symptomsInput) return;
    try {
      const symptomsList = symptomsInput.split(',').map(s => s.trim());
      const res = await api.post('/api/ai/predict', { symptoms: symptomsList });
      setPredictedResult(res.data);
    } catch (err) { console.error(err); }
  };

  const handleRecommendMeds = async (e) => {
    e.preventDefault();
    if (!diagInput) return;
    try {
      const res = await api.post('/api/ai/recommend', {
        diagnosis: diagInput,
        allergies: profile?.allergies || '',
      });
      setRecMedsResult(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userText }]);

    try {
      const res = await api.post('/api/ai/chatbot', { message: userText });
      setChatHistory(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting right now.' }]);
    }
  };

  const triggerMockCall = (appointment) => {
    setActiveCall(appointment);
    setCallConnected(false);
    setTimeout(() => {
      setCallConnected(true);
    }, 1500);
  };

  return (
    <div className="container py-4 animate-fade-in">
      <h2 className="fw-bold mb-4">Patient <span className="gradient-text">Portal Dashboard</span></h2>

      {message && (
        <div className="alert alert-info alert-dismissible fade show rounded-3" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {/* Tabs Header */}
      <ul className="nav nav-pills mb-4 glass-card p-2 d-flex gap-2">
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'profile' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('profile')}><i className="bi bi-person-fill me-2"></i>My Profile</button></li>
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'book' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('book')}><i className="bi bi-calendar-plus me-2"></i>Book Visit</button></li>
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'appointments' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('appointments')}><i className="bi bi-calendar-check-fill me-2"></i>Visits Queue</button></li>
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'billing' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('billing')}><i className="bi bi-credit-card-fill me-2"></i>Settlements</button></li>
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'records' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('records')}><i className="bi bi-file-medical-fill me-2"></i>Clinical Records</button></li>
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'ai-tools' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('ai-tools')}><i className="bi bi-robot me-2"></i>AI Healthcare</button></li>
      </ul>

      <div className="row g-4">
        {/* Main Content Area */}
        <div className="col-lg-12">
          {/* Profile Section */}
          {activeSection === 'profile' && profile && (
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-3">Demographics & Vitals</h4>
              <div className="row g-3">
                <div className="col-md-6"><p><strong>Full Name:</strong> {profile.name}</p></div>
                <div className="col-md-6"><p><strong>Age / Gender:</strong> {profile.age} years / {profile.gender}</p></div>
                <div className="col-md-6"><p><strong>Blood Group:</strong> {profile.bloodGroup}</p></div>
                <div className="col-md-6"><p><strong>Phone:</strong> {profile.phone}</p></div>
                <div className="col-12"><p><strong>Home Address:</strong> {profile.address}</p></div>
                <div className="col-md-6">
                  <div className="card p-3 border-danger-subtle bg-danger-subtle bg-opacity-25 rounded-3">
                    <h6 className="text-danger fw-bold"><i className="bi bi-shield-slash-fill me-2"></i>Known Allergies</h6>
                    <p className="mb-0 text-dark small">{profile.allergies || 'No allergies reported'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card p-3 border-primary-subtle bg-primary-subtle bg-opacity-10 rounded-3">
                    <h6 className="text-primary fw-bold"><i className="bi bi-clock-history me-2"></i>Medical History Details</h6>
                    <p className="mb-0 text-dark small">{profile.medicalHistory || 'No previous medical records'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Book Visit */}
          {activeSection === 'book' && (
            <div className="glass-card p-4" style={{ maxWidth: '650px', margin: '0 auto' }}>
              <h4 className="fw-bold mb-3 text-center">Schedule Clinician Consultation</h4>
              <form onSubmit={handleBookAppointment}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Filter by Speciality / Department</label>
                  <select className="form-select rounded-3" value={selectedDeptId} onChange={e => { setSelectedDeptId(e.target.value); setBookingForm({...bookingForm, doctorId: ''}); }}>
                    <option value="">-- All Specialities --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Consulting Doctor</label>
                  <select className="form-select rounded-3" value={bookingForm.doctorId} onChange={e => setBookingForm({...bookingForm, doctorId: e.target.value})} required>
                    <option value="">-- Choose Doctor --</option>
                    {doctors
                      .filter(doc => !selectedDeptId || (doc.department && doc.department.id === parseInt(selectedDeptId)))
                      .map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization}) - Availability: {doc.schedule}</option>
                      ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Appointment Date</label>
                  <input type="date" className="form-control rounded-3" value={bookingForm.appointmentDate} onChange={e => setBookingForm({...bookingForm, appointmentDate: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Preferred Time Slot</label>
                  <select className="form-select rounded-3" value={bookingForm.timeSlot} onChange={e => setBookingForm({...bookingForm, timeSlot: e.target.value})}>
                    <option value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</option>
                    <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                    <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                    <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                    <option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Consultation Mode</label>
                  <select className="form-select rounded-3" value={bookingForm.consultationType} onChange={e => setBookingForm({...bookingForm, consultationType: e.target.value})}>
                    <option value="IN_PERSON">In-Person OPD Visit</option>
                    <option value="VIDEO">Online Video Consultation (WebRTC Simulator)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-premium-primary w-100 py-2.5 rounded-3">Request Booking</button>
              </form>
            </div>
          )}

          {/* Visits Queue */}
          {activeSection === 'appointments' && (
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-3">Your Bookings List</h4>
              {appointments.length === 0 ? (
                <p className="text-muted">No appointments booked yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialty</th>
                        <th>Date & Time</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(app => (
                        <tr key={app.id}>
                          <td className="fw-semibold text-primary">{app.doctor?.name}</td>
                          <td>{app.doctor?.specialization}</td>
                          <td>{app.appointmentDate} at {app.timeSlot}</td>
                          <td>
                            <span className={`badge ${app.consultationType === 'VIDEO' ? 'bg-info' : 'bg-secondary'}`}>{app.consultationType}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              app.status === 'APPROVED' ? 'bg-success' : app.status === 'PENDING' ? 'bg-warning text-dark' : app.status === 'COMPLETED' ? 'bg-primary' : 'bg-danger'
                            }`}>{app.status}</span>
                          </td>
                          <td>
                            {app.status === 'APPROVED' && app.consultationType === 'VIDEO' && (
                              <button className="btn btn-sm btn-danger rounded-2" onClick={() => triggerMockCall(app)}>
                                <i className="bi bi-camera-video-fill me-1"></i> Join Call
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Video call Screen Simulator */}
              {activeCall && (
                <div className="mt-5 glass-card p-4 border-danger">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 text-danger"><i className="bi bi-broadcast me-2"></i>Active Telehealth consultation</h5>
                    <button className="btn-close" onClick={() => setActiveCall(null)}></button>
                  </div>
                  <div className="video-grid">
                    <div className="video-container">
                      {callConnected ? (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-dark">
                          <i className="bi bi-person-fill-check fs-1 text-success animate-pulse"></i>
                        </div>
                      ) : (
                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white bg-secondary">
                          <div className="spinner-border text-light mb-2" role="status"></div>
                          <span>Connecting to {activeCall.doctor?.name}...</span>
                        </div>
                      )}
                      <span className="video-label">{activeCall.doctor?.name} (Remote Clinician)</span>
                    </div>
                    <div className="video-container">
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white bg-dark">
                        <i className="bi bi-person-video3 fs-1 text-primary"></i>
                      </div>
                      <span className="video-label">Local Camera (You)</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-center gap-3 mt-3 bg-dark p-2 rounded-3">
                    <button className="btn btn-sm btn-outline-light"><i className="bi bi-mic-fill"></i> Mute</button>
                    <button className="btn btn-sm btn-outline-light"><i className="bi bi-camera-video-fill"></i> Camera</button>
                    <button className="btn btn-sm btn-danger px-4" onClick={() => setActiveCall(null)}>Disconnect</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settlements */}
          {activeSection === 'billing' && (
            <div className="glass-card p-4">
              <h4 className="fw-bold mb-3">Hospital Invoices</h4>
              {bills.length === 0 ? (
                <p className="text-muted">No invoices found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>Consultation Fee</th>
                        <th>Lab Fee</th>
                        <th>Pharmacy Fee</th>
                        <th>Total Amount</th>
                        <th>Invoice Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map(bill => (
                        <tr key={bill.id}>
                          <td>INV-00{bill.id}</td>
                          <td>₹{bill.consultationFee?.toFixed(2)}</td>
                          <td>₹{bill.labFee?.toFixed(2)}</td>
                          <td>₹{bill.pharmacyFee?.toFixed(2)}</td>
                          <td className="fw-bold text-primary">₹{bill.totalAmount?.toFixed(2)}</td>
                          <td>
                            <span className={`badge ${
                              bill.status === 'PAID' ? 'bg-success' : bill.status === 'CLAIMED' ? 'bg-info' : 'bg-danger'
                            }`}>{bill.status}</span>
                          </td>
                          <td>
                            {bill.status === 'UNPAID' && (
                              <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-premium-primary rounded-2" onClick={() => { setPayingBill(bill); setPaymentMethod('Card'); }}>Pay Card</button>
                                <button className="btn btn-sm btn-outline-primary rounded-2" onClick={() => { setPayingBill(bill); setPaymentMethod('UPI'); }}>Pay UPI</button>
                                <button className="btn btn-sm btn-premium-secondary rounded-2" onClick={() => handleSubmitClaim(bill.id)}>Claim Insurance</button>
                              </div>
                            )}
                            {bill.status === 'CLAIMED' && (
                              <span className="small text-muted">Awaiting claim settlement</span>
                            )}
                            {bill.status === 'PAID' && (
                              <span className="small text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i>Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Payment History Ledger */}
              <div className="mt-5">
                <h5 className="fw-bold mb-3"><i className="bi bi-clock-history text-primary me-2"></i>Paid Transactions History Ledger</h5>
                {payments.length === 0 ? (
                  <p className="text-muted small">No payment transactions recorded.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle bg-white rounded-3 shadow-sm border border-light-subtle">
                      <thead className="table-light">
                        <tr>
                          <th>Transaction ID</th>
                          <th>Invoice Ref</th>
                          <th>Payment Date</th>
                          <th>Method</th>
                          <th>Amount Paid</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(pay => (
                          <tr key={pay.id}>
                            <td className="fw-semibold text-dark">{pay.transactionId}</td>
                            <td>INV-00{pay.billing?.id}</td>
                            <td>{new Date(pay.paymentDate).toLocaleString()}</td>
                            <td><span className="badge bg-secondary-subtle text-secondary-emphasis">{pay.paymentMethod}</span></td>
                            <td className="fw-bold text-success">₹{pay.amountPaid?.toFixed(2)}</td>
                            <td><span className="badge bg-success bg-opacity-10 text-success border border-success-subtle px-2.5 py-1.5"><i className="bi bi-check-circle-fill me-1"></i>{pay.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payment Overlay Modal */}
              {payingBill && !paymentSuccess && (
                <div className="modal fade show d-block animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} tabIndex="-1">
                  <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
                    <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                      <div className="modal-header bg-premium-primary text-white border-0 p-3">
                        <h5 className="modal-title fw-bold"><i className="bi bi-credit-card me-2"></i>Settle Hospital Invoice</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={() => setPayingBill(null)}></button>
                      </div>
                      <div className="modal-body p-4 bg-light bg-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white border border-light-subtle rounded-3">
                          <div>
                            <span className="text-muted small block">Total Amount Due</span>
                            <span className="fw-bold text-dark block">INV-00{payingBill.id}</span>
                          </div>
                          <span className="fs-3 fw-bold text-primary">₹{payingBill.totalAmount?.toFixed(2)}</span>
                        </div>

                        {paymentMethod === 'UPI' ? (
                          /* UPI QR Code Interface */
                          <div className="d-flex flex-column align-items-center mb-3 text-center">
                            <div className="p-2 bg-white rounded-3 shadow-sm border border-light-subtle mb-3" style={{ width: '200px' }}>
                              <img src="/qr_code.jpg" className="img-fluid rounded-2" alt="Charumathi Dhanasekaran UPI QR Code" />
                            </div>
                            <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle mb-2 px-2.5 py-1">GPay Merchant Account</span>
                            <h6 className="fw-bold text-dark mb-1">Charumathi Dhanasekaran</h6>
                            <p className="small text-muted mb-0">Phone: 9524980991</p>
                            <p className="small text-muted mb-0">UPI ID: dhanasekarancharumathi@okhdfcbank</p>
                            <p className="small text-muted mt-2">Scan to pay with any UPI app</p>
                          </div>
                        ) : (
                          /* Card Inputs Interface */
                          <div>
                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark">Cardholder Name</label>
                              <input type="text" className="form-control rounded-3" placeholder="John Doe" required />
                            </div>
                            <div className="mb-3">
                              <label className="form-label small fw-semibold text-dark">Card Number</label>
                              <input type="text" className="form-control rounded-3" placeholder="XXXX XXXX XXXX XXXX" maxLength="19" required />
                            </div>
                            <div className="row">
                              <div className="col-6 mb-3">
                                <label className="form-label small fw-semibold text-dark">Expiry Date</label>
                                <input type="text" className="form-control rounded-3" placeholder="MM/YY" maxLength="5" required />
                              </div>
                              <div className="col-6 mb-3">
                                <label className="form-label small fw-semibold text-dark">CVV Code</label>
                                <input type="password" className="form-control rounded-3" placeholder="***" maxLength="3" required />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="d-flex gap-2 justify-content-end mt-4">
                          <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={() => setPayingBill(null)}>Cancel</button>
                          <button
                            type="button"
                            className="btn btn-premium-primary rounded-3 px-4"
                            onClick={() => handlePayBill(payingBill.id, paymentMethod)}
                            disabled={isPaying}
                          >
                            {isPaying ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing...
                              </>
                            ) : (
                              `Confirm Payment`
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full-Screen Payment Success Overlay */}
              {paymentSuccess && payingBill && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-white d-flex align-items-center justify-content-center animate-fade-in text-center" style={{ zIndex: 9999 }}>
                  <div className="p-5 animate-scale-up" style={{ maxWidth: '550px' }}>
                    <div className="mb-4 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle animate-bounce mx-auto" style={{ width: '100px', height: '100px' }}>
                      <i className="bi bi-shield-check text-success animate-scale-up" style={{ fontSize: '3.5rem' }}></i>
                    </div>
                    <h2 className="fw-bold text-dark mb-2">Invoice Settled Successfully!</h2>
                    <p className="text-muted mb-4 fs-5">Hospital Invoice <strong>INV-00{payingBill.id}</strong> has been fully paid.</p>
                    
                    <div className="bg-light p-4 rounded-4 mb-4 text-start small shadow-sm border border-light-subtle">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Transaction ID</span>
                        <span className="fw-bold text-dark">TXN-{Math.floor(Math.random() * 9000000000) + 1000000000}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Payment Mode</span>
                        <span className="fw-semibold text-dark">{paymentMethod}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Transaction Date</span>
                        <span className="fw-semibold text-dark">{new Date().toLocaleString()}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-dark">Total Paid Amount</span>
                        <span className="fw-bold text-success fs-4">₹{payingBill.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="alert alert-info border-0 rounded-3 p-3 text-start small mb-4 d-flex gap-2">
                      <i className="bi bi-info-circle-fill text-info fs-5"></i>
                      <div>
                        <strong>Consultation Fee Settled</strong>
                        <p className="mb-0 text-muted">A payment notification message has been sent to the doctor to proceed with your consultation.</p>
                      </div>
                    </div>
                    
                    <div className="d-flex gap-3 justify-content-center">
                      <button className="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-semibold" onClick={() => window.print()}>
                        <i className="bi bi-printer me-2"></i>Print Receipt
                      </button>
                      <button className="btn btn-premium-primary px-4 py-2.5 rounded-3 fw-semibold animate-pulse" onClick={() => {
                        setPaymentSuccess(false);
                        setPayingBill(null);
                        fetchProfileData();
                      }}>
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clinical Records */}
          {activeSection === 'records' && (
            <div className="row g-4">
              <div className="col-md-6">
                <div className="glass-card p-4">
                  <h4 className="fw-bold mb-3"><i className="bi bi-file-earmark-medical text-primary me-2"></i>Doctor Prescriptions</h4>
                  {prescriptions.length === 0 ? (
                    <p className="text-muted">No prescriptions issued.</p>
                  ) : (
                    <div className="list-group list-group-flush">
                      {prescriptions.map(p => (
                        <div key={p.id} className="list-group-item bg-transparent px-0 border-light-subtle">
                          <h6 className="fw-bold mb-1">{p.diagnosis}</h6>
                          <p className="text-muted small mb-1"><strong>Meds:</strong> {p.medicines} • {p.dosage}</p>
                          <p className="text-muted small mb-2"><strong>Instructions:</strong> {p.instructions}</p>
                          <span className="small text-muted block"><i className="bi bi-person me-1"></i>{p.doctor?.name} • <i className="bi bi-calendar3 me-1"></i>{new Date(p.dateCreated).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="glass-card p-4">
                  <h4 className="fw-bold mb-3"><i className="bi bi-file-earmark-bar-graph text-success me-2"></i>Laboratory Reports</h4>
                  {reports.length === 0 ? (
                    <p className="text-muted">No lab reports uploaded.</p>
                  ) : (
                    <div className="list-group list-group-flush">
                      {reports.map(r => (
                        <div key={r.id} className="list-group-item bg-transparent px-0 border-light-subtle d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="fw-bold mb-1 text-primary">{r.testName}</h6>
                            <p className="text-muted small mb-0">Result: {r.resultSummary}</p>
                            <span className="small text-muted"><i className="bi bi-person me-1"></i>Uploaded By: {r.uploadedBy} • {r.testDate}</span>
                          </div>
                          <a href={r.fileUrl} download className="btn btn-sm btn-outline-success rounded-2"><i className="bi bi-download"></i> PDF</a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Healthcare Tools */}
          {activeSection === 'ai-tools' && (
            <div className="row g-4">
              {/* Disease Predictor */}
              <div className="col-md-6">
                <div className="glass-card p-4">
                  <h4 className="fw-bold mb-3"><i className="bi bi-cpu text-primary me-2"></i>AI Disease Diagnosis Predictor</h4>
                  <form onSubmit={handlePredictDisease}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Enter Symptoms (comma separated)</label>
                      <input type="text" className="form-control rounded-3" placeholder="e.g. fever, cough, loss of smell" value={symptomsInput} onChange={e => setSymptomsInput(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-premium-primary w-100 rounded-3">Process Symptoms</button>
                  </form>

                  {predictedResult && (
                    <div className="mt-4 card p-3 border-primary-subtle bg-primary-subtle bg-opacity-10 rounded-3 animate-fade-in">
                      <h5 className="fw-bold text-primary mb-1">Match: {predictedResult.predictedDisease}</h5>
                      <p className="mb-2"><strong>Confidence Score:</strong> <span className="badge bg-success">{predictedResult.confidence}</span></p>
                      <p className="mb-2 small text-dark">{predictedResult.description}</p>
                      {predictedResult.matchedSymptoms?.length > 0 && (
                        <p className="mb-0 small text-muted"><strong>Matched Symptoms:</strong> {predictedResult.matchedSymptoms.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Medicine Recommender */}
              <div className="col-md-6">
                <div className="glass-card p-4">
                  <h4 className="fw-bold mb-3"><i className="bi bi-capsule-therapeutic text-success me-2"></i>AI Medicine Recommendation</h4>
                  <form onSubmit={handleRecommendMeds}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Diagnosed Disease / Category</label>
                      <input type="text" className="form-control rounded-3" placeholder="e.g. Covid, Flu, Strep Throat, Migraine" value={diagInput} onChange={e => setDiagInput(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Your Profile Allergies (Auto-scanned)</label>
                      <input type="text" className="form-control rounded-3 bg-light" value={profile?.allergies || 'No allergies listed'} readOnly />
                    </div>
                    <button type="submit" className="btn btn-premium-secondary w-100 rounded-3">Generate Suggestions</button>
                  </form>

                  {recMedsResult && (
                    <div className="mt-4 card p-3 border-success-subtle bg-success-subtle bg-opacity-10 rounded-3 animate-fade-in">
                      <h6 className="fw-bold text-success mb-2">Recommended Drug Schedule:</h6>
                      <ul className="mb-3 small">
                        {recMedsResult.recommendedMedicines.map((m, idx) => (
                          <li key={idx} className="mb-1">{m}</li>
                        ))}
                      </ul>
                      {recMedsResult.warnings?.length > 0 && (
                        <div className="alert alert-danger p-2 small mb-0 rounded-3">
                          {recMedsResult.warnings.map((w, idx) => (
                            <div key={idx} className="fw-semibold"><i className="bi bi-exclamation-triangle-fill"></i> {w}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Chatbot Button & Sidebar Panel */}
      <div>
        <div className="chatbot-toggle" onClick={() => setIsChatOpen(!isChatOpen)}>
          <i className={`bi ${isChatOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`}></i>
        </div>

        {isChatOpen && (
          <div className="chatbot-panel animate-fade-in">
            <div className="gradient-bg p-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold"><i className="bi bi-robot me-2"></i>SHMS AI Assistant</h5>
              <button className="btn-close btn-close-white" onClick={() => setIsChatOpen(false)}></button>
            </div>
            
            {/* Chat History */}
            <div className="flex-grow-1 p-3 overflow-y-auto small d-flex flex-column gap-2 bg-light">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`d-flex ${chat.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className={`p-2.5 rounded-3 px-3`} style={{
                    maxWidth: '80%',
                    background: chat.sender === 'user' ? 'var(--primary-color)' : 'white',
                    color: chat.sender === 'user' ? 'white' : 'black',
                    boxShadow: chat.sender === 'user' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                  }}>
                    {chat.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-2 border-top d-flex gap-1.5 bg-white">
              <input type="text" className="form-control rounded-pill text-sm px-3" placeholder="Type query (e.g. book visit)..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} required />
              <button type="submit" className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}><i className="bi bi-send-fill text-white fs-6"></i></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
