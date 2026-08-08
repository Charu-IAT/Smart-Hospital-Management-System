import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VisualReport from '../components/VisualReport';

const UPI_ID = import.meta.env.VITE_UPI_ID || '9524980991@upi';
const PAYEE_NAME = import.meta.env.VITE_PAYEE_NAME || 'Charumathi Dhanasekaran';
const PAYEE_PHONE = import.meta.env.VITE_PAYEE_PHONE || '9524980991';

const AVAILABLE_POLICIES = [
  { id: 1, provider: "Star Health", name: "Star Family Red Carpet (STAR-FRC-901)", premium: 1499, coverage: "Covers 100% OPD consultation, 80% Labs up to ₹15,000 annual limit", policyNo: "STAR-FRC-901" },
  { id: 2, provider: "Star Health", name: "Star Comprehensive Care (STAR-COMP-204)", premium: 2499, coverage: "Covers 100% OPD, 100% Labs and Pharmacy up to ₹30,000 limit", policyNo: "STAR-COMP-204" },
  { id: 3, provider: "Star Health", name: "Star Outpatient Care Silver (STAR-OPC-112)", premium: 999, coverage: "Covers 80% OPD, 80% Pharmacy up to ₹5,000 limit", policyNo: "STAR-OPC-112" },
  { id: 4, provider: "Star Health", name: "Star Outpatient Care Gold (STAR-OPG-882)", premium: 1999, coverage: "Covers 90% OPD, 90% Labs and Pharmacy up to ₹15,000 limit", policyNo: "STAR-OPG-882" },
  { id: 5, provider: "Star Health", name: "Star Cardiac Care Platinum (STAR-CCP-309)", premium: 4999, coverage: "Covers 100% Cardiac OPD, 100% Labs/ICU up to ₹1,00,000 limit", policyNo: "STAR-CCP-309" },
  { id: 6, provider: "HDFC Ergo", name: "Optima Restore Silver (HDFC-ORS-402)", premium: 1899, coverage: "Covers 80% OPD consultation, 100% Labs up to ₹20,000 limit", policyNo: "HDFC-ORS-402" },
  { id: 7, provider: "HDFC Ergo", name: "Optima Restore Gold (HDFC-ORG-507)", premium: 2999, coverage: "Covers 100% OPD, 100% Labs, 80% Pharmacy up to ₹40,000 limit", policyNo: "HDFC-ORG-507" },
  { id: 8, provider: "HDFC Ergo", name: "Optima Secure Platinum (HDFC-OSP-611)", premium: 3999, coverage: "Covers 100% OPD, 100% Labs and Pharmacy up to ₹75,000 limit", policyNo: "HDFC-OSP-611" },
  { id: 9, provider: "HDFC Ergo", name: "HDFC MyHealth Medisure (HDFC-MHM-714)", premium: 1299, coverage: "Covers 70% OPD, 80% Labs up to ₹10,000 limit", policyNo: "HDFC-MHM-714" },
  { id: 10, provider: "HDFC Ergo", name: "HDFC Critical Care Elite (HDFC-CCE-820)", premium: 5999, coverage: "Covers 100% Oncology/Cardiology OPD and Labs up to ₹2,00,000 limit", policyNo: "HDFC-CCE-820" },
  { id: 11, provider: "Niva Bupa", name: "ReAssure Bronze (NIVA-RAB-101)", premium: 899, coverage: "Covers 80% OPD consultations up to ₹5,000 limit", policyNo: "NIVA-RAB-101" },
  { id: 12, provider: "Niva Bupa", name: "ReAssure Silver (NIVA-RAS-202)", premium: 1699, coverage: "Covers 90% OPD, 90% Labs up to ₹15,000 limit", policyNo: "NIVA-RAS-202" },
  { id: 13, provider: "Niva Bupa", name: "ReAssure Gold (NIVA-RAG-303)", premium: 2799, coverage: "Covers 100% OPD, 100% Labs and Pharmacy up to ₹35,000 limit", policyNo: "NIVA-RAG-303" },
  { id: 14, provider: "Niva Bupa", name: "Health Companion Platinum (NIVA-HCP-404)", premium: 4499, coverage: "Covers 100% OPD, 100% Labs & Diagnostics with no co-pay up to ₹80,000 limit", policyNo: "NIVA-HCP-404" },
  { id: 15, provider: "Niva Bupa", name: "Health Premia Executive (NIVA-HPE-505)", premium: 6999, coverage: "Covers 100% OPD, Labs, and Global Pharmacy up to ₹5,00,000 limit", policyNo: "NIVA-HPE-505" },
  { id: 16, provider: "ICICI Lombard", name: "Complete Health Shield (ICICI-CHS-606)", premium: 1599, coverage: "Covers 80% OPD, 90% Labs up to ₹12,000 limit", policyNo: "ICICI-CHS-606" },
  { id: 17, provider: "ICICI Lombard", name: "Complete Health Super Gold (ICICI-CHG-707)", premium: 3199, coverage: "Covers 100% OPD, 100% Labs, 90% Pharmacy up to ₹50,000 limit", policyNo: "ICICI-CHG-707" },
  { id: 18, provider: "ICICI Lombard", name: "iShield Premium Platinum (ICICI-ISP-808)", premium: 4899, coverage: "Covers 100% OPD, 100% Labs and Pharmacy with zero deductions up to ₹90,000 limit", policyNo: "ICICI-ISP-808" },
  { id: 19, provider: "ICICI Lombard", name: "Health Booster Super TopUp (ICICI-HBT-909)", premium: 799, coverage: "Covers 80% OPD, 80% Labs up to ₹8,000 limit", policyNo: "ICICI-HBT-909" },
  { id: 20, provider: "ICICI Lombard", name: "ICICI Senior Citizen Elite (ICICI-SCE-010)", premium: 3499, coverage: "Covers 100% Geriatric OPD & Diagnostics up to ₹40,000 limit", policyNo: "ICICI-SCE-010" },
  { id: 21, provider: "Care Health", name: "Care Freedom Plan (CARE-CFP-111)", premium: 1199, coverage: "Covers 80% OPD, 80% Diagnostics up to ₹10,000 limit", policyNo: "CARE-CFP-111" },
  { id: 22, provider: "Care Health", name: "Care Advantage Super Gold (CARE-CASG-222)", premium: 2599, coverage: "Covers 100% OPD, 100% Labs up to ₹25,000 limit", policyNo: "CARE-CASG-222" },
  { id: 23, provider: "Care Health", name: "Care Classic Platinum (CARE-CCP-333)", premium: 3899, coverage: "Covers 100% OPD and Pharmacy up to ₹60,000 limit", policyNo: "CARE-CCP-333" },
  { id: 24, provider: "Care Health", name: "Care Heart Policy Elite (CARE-CHPE-444)", premium: 5299, coverage: "Covers 100% Cardiovascular OPD, Labs, Rehabilitation up to ₹1,50,000 limit", policyNo: "CARE-CHPE-444" },
  { id: 25, provider: "Care Health", name: "Care Global Shield Executive (CARE-GSE-555)", premium: 7999, coverage: "Covers 100% Worldwide OPD Consultation and Lab tests up to ₹1,00,000 limit", policyNo: "CARE-GSE-555" }
];

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
  const [rptViewMode, setRptViewMode] = useState({});
  const [selectedReportForView, setSelectedReportForView] = useState(null);

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

  const [healthReports, setHealthReports] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState(null);
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [insSearchText, setInsSearchText] = useState('');
  const [insFilterProvider, setInsFilterProvider] = useState('');
  const [customAlert, setCustomAlert] = useState(null);
  const [upiVerifyState, setUpiVerifyState] = useState('');
  const [billUpiVerifyState, setBillUpiVerifyState] = useState('');
  const [billUpiTxnId, setBillUpiTxnId] = useState('');
  const [availableSlots, setAvailableSlots] = useState([
    "09:00 AM - 09:30 AM",
    "10:00 AM - 10:30 AM",
    "11:30 AM - 12:00 PM",
    "02:00 PM - 02:30 PM",
    "03:30 PM - 04:00 PM"
  ]);
  const [slotError, setSlotError] = useState('');
  const showAlert = (message, type = 'error') => {
    const parsedMessage = typeof message === 'string'
      ? message
      : message?.message || (message ? JSON.stringify(message) : '') || 'An error occurred';
    setCustomAlert({ type, message: parsedMessage });
  };
  const [healthReportForm, setHealthReportForm] = useState({
    weight: '',
    bp: '',
    height: '',
    temperature: '',
    heartRate: '',
    sugarLevel: '',
    notes: ''
  });

  useEffect(() => {
    fetchProfileData();
    fetchDoctors();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      const ALL_TIME_SLOTS = [
        "09:00 AM - 09:30 AM",
        "10:00 AM - 10:30 AM",
        "11:30 AM - 12:00 PM",
        "02:00 PM - 02:30 PM",
        "03:30 PM - 04:00 PM"
      ];

      if (!bookingForm.doctorId || !bookingForm.appointmentDate) {
        setAvailableSlots(ALL_TIME_SLOTS);
        setSlotError('');
        return;
      }

      // 1. Day of week schedule check
      const selectedDoc = doctors.find(d => d.id === parseInt(bookingForm.doctorId));
      if (selectedDoc) {
        const [year, month, dayStr] = bookingForm.appointmentDate.split('-');
        const dateObj = new Date(year, month - 1, dayStr);
        const day = dateObj.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
        const schedule = (selectedDoc.schedule || '').toLowerCase();
        let isDayValid = true;
        let dayName = '';

        if (schedule.includes('mon-fri')) {
          isDayValid = (day >= 1 && day <= 5);
          dayName = 'Monday to Friday';
        } else if (schedule.includes('mon-sat')) {
          isDayValid = (day >= 1 && day <= 6);
          dayName = 'Monday to Saturday';
        }

        if (!isDayValid) {
          setSlotError(`Doctor ${selectedDoc.name} is only available ${dayName} (Schedule: ${selectedDoc.schedule}).`);
          setAvailableSlots([]);
          setBookingForm(prev => ({ ...prev, timeSlot: '' }));
          return;
        } else {
          setSlotError('');
        }
      }

      try {
        const res = await api.get(`/api/appointments/booked-slots`, {
          params: {
            doctorId: bookingForm.doctorId,
            date: bookingForm.appointmentDate
          }
        });
        const booked = res.data;

        // Calculate available slots
        const isToday = bookingForm.appointmentDate === new Date().toISOString().split('T')[0];

        const filtered = ALL_TIME_SLOTS.filter(slot => {
          if (booked.includes(slot)) return false;

          if (isToday) {
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            let slotHour = 0;
            let slotMin = 0;

            if (slot.startsWith("09:00 AM")) { slotHour = 9; slotMin = 0; }
            else if (slot.startsWith("10:00 AM")) { slotHour = 10; slotMin = 0; }
            else if (slot.startsWith("11:30 AM")) { slotHour = 11; slotMin = 30; }
            else if (slot.startsWith("02:00 PM")) { slotHour = 14; slotMin = 0; }
            else if (slot.startsWith("03:30 PM")) { slotHour = 15; slotMin = 30; }

            if (currentHours > slotHour || (currentHours === slotHour && currentMinutes > slotMin)) {
              return false;
            }
          }
          return true;
        });

        setAvailableSlots(filtered);

        if (filtered.length > 0) {
          if (!filtered.includes(bookingForm.timeSlot)) {
            setBookingForm(prev => ({ ...prev, timeSlot: filtered[0] }));
          }
        } else {
          setBookingForm(prev => ({ ...prev, timeSlot: '' }));
          setSlotError('No time slots available for this doctor on the selected date. Please choose another date or doctor.');
        }

      } catch (err) {
        console.error("Error fetching booked slots", err);
      }
    };

    fetchBookedSlots();
  }, [bookingForm.doctorId, bookingForm.appointmentDate, doctors]);

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
      const [appRes, billRes, prescRes, repRes, payRes, hrRes] = await Promise.all([
        api.get('/api/appointments/patient'),
        api.get('/api/billing/patient'),
        api.get(`/api/patients/${patientId}/prescriptions`),
        api.get(`/api/patients/${patientId}/reports`),
        api.get('/api/billing/payments'),
        api.get('/api/patients/health-report'),
      ]);

      setAppointments(appRes.data);
      setBills(billRes.data);
      setPrescriptions(prescRes.data);
      setReports(repRes.data);
      setPayments(payRes.data);
      setHealthReports(hrRes.data);

      try {
        const insRes = await api.get(`/api/insurance/patient/${patientId}`);
        setInsurances(insRes.data || []);
      } catch (insErr) {
        setInsurances([]);
      }
    } catch (err) { console.error("Error loading patient data:", err); }
  };

  const reloadHealthReports = async () => {
    try {
      const res = await api.get('/api/patients/health-report');
      setHealthReports(res.data);
    } catch (err) {
      console.error("Error reloading health reports:", err);
    }
  };

  const handleSaveHealthReport = async (e) => {
    e.preventDefault();
    if (!healthReportForm.weight || !healthReportForm.bp) {
      showAlert("Weight and Blood Pressure are required!");
      return;
    }
    try {
      const payload = {
        weight: parseFloat(healthReportForm.weight),
        bp: healthReportForm.bp,
        height: healthReportForm.height ? parseFloat(healthReportForm.height) : null,
        temperature: healthReportForm.temperature ? parseFloat(healthReportForm.temperature) : null,
        heartRate: healthReportForm.heartRate ? parseInt(healthReportForm.heartRate) : null,
        sugarLevel: healthReportForm.sugarLevel ? parseFloat(healthReportForm.sugarLevel) : null,
        notes: healthReportForm.notes
      };
      await api.post('/api/patients/health-report', payload);
      showAlert("Health report logged successfully!", "success");
      setHealthReportForm({
        weight: '',
        bp: '',
        height: '',
        temperature: '',
        heartRate: '',
        sugarLevel: '',
        notes: ''
      });
      reloadHealthReports();
    } catch (err) {
      console.error("Error saving health report:", err);
      showAlert("Error saving health report: " + (err.response?.data || err.message));
    }
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
      showAlert("Please select a doctor and date");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (bookingForm.appointmentDate < todayStr) {
      showAlert("Appointment date cannot be in the past.");
      return;
    }

    if (slotError) {
      showAlert(slotError);
      return;
    }

    if (!bookingForm.timeSlot) {
      showAlert("Please select a valid preferred time slot.");
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
      showAlert(err.response?.data || 'Error processing payment');
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubmitClaim = async (billId) => {
    try {
      await api.post(`/api/insurance/claim?billingId=${billId}`);
      showAlert('Insurance claim submitted successfully! Awaiting provider approval.', 'success');
      fetchProfileData();
    } catch (err) {
      showAlert('Claim failed. Please verify you have an active verified insurance policy on file.');
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

  const hasUnpaidBills = bills.some(bill => bill.status === 'UNPAID');

  // BP Classification
  const classifyBP = (bpStr) => {
    if (!bpStr || !bpStr.includes('/')) return { category: 'Normal', color: 'success', status: 'normal', description: 'Optimal reading.' };
    const [sysStr, diaStr] = bpStr.split('/');
    const sys = parseInt(sysStr);
    const dia = parseInt(diaStr);
    if (isNaN(sys) || isNaN(dia)) return { category: 'Normal', color: 'success', status: 'normal', description: 'Optimal reading.' };
    
    if (sys >= 140 || dia >= 90) {
      return { category: 'High BP', color: 'danger', status: 'high', description: 'Hypertension - consult your physician.' };
    } else if (sys < 90 || dia < 60) {
      return { category: 'Low BP', color: 'primary', status: 'low', description: 'Hypotension - ensure adequate hydration.' };
    } else {
      return { category: 'Normal BP', color: 'success', status: 'normal', description: 'Optimal reading.' };
    }
  };

  // Sugar Classification
  const classifySugar = (sugarVal) => {
    if (!sugarVal) return { category: 'Normal', color: 'success', status: 'normal', description: 'Normal glucose levels.' };
    const sugar = parseFloat(sugarVal);
    if (isNaN(sugar)) return { category: 'Normal', color: 'success', status: 'normal', description: 'Normal glucose levels.' };

    if (sugar > 140) {
      return { category: 'High Sugar', color: 'danger', status: 'high', description: 'Hyperglycemia - limit sugar intake.' };
    } else if (sugar < 70) {
      return { category: 'Low Sugar', color: 'primary', status: 'low', description: 'Hypoglycemia - consume quick sugar sources.' };
    } else {
      return { category: 'Normal Sugar', color: 'success', status: 'normal', description: 'Normal glucose levels.' };
    }
  };

  const bpStats = (() => {
    let normal = 0, high = 0, low = 0;
    const reports = healthReports || [];
    reports.forEach(r => {
      const cls = classifyBP(r.bp);
      if (cls.status === 'high') high++;
      else if (cls.status === 'low') low++;
      else normal++;
    });
    const total = reports.length || 1;
    return {
      normalPercent: Math.round((normal / total) * 100),
      highPercent: Math.round((high / total) * 100),
      lowPercent: Math.round((low / total) * 100),
      normal, high, low, total: reports.length
    };
  })();

  const sugarStats = (() => {
    let normal = 0, high = 0, low = 0;
    const reports = healthReports || [];
    let countWithSugar = 0;
    reports.forEach(r => {
      if (r.sugarLevel) {
        countWithSugar++;
        const cls = classifySugar(r.sugarLevel);
        if (cls.status === 'high') high++;
        else if (cls.status === 'low') low++;
        else normal++;
      }
    });
    const total = countWithSugar || 1;
    return {
      normalPercent: Math.round((normal / total) * 100),
      highPercent: Math.round((high / total) * 100),
      lowPercent: Math.round((low / total) * 100),
      normal, high, low, total: countWithSugar
    };
  })();

  return (
    <>
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
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'lab-reports' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('lab-reports')}><i className="bi bi-file-earmark-bar-graph me-2"></i>Lab Reports</button></li>
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'ai-tools' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('ai-tools')}><i className="bi bi-robot me-2"></i>AI Healthcare</button></li>
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'health-reports' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('health-reports')}><i className="bi bi-heart-pulse me-2"></i>Health Tracker</button></li>
        <li><button className={`nav-link rounded-3 fw-semibold ${activeSection === 'insurance' ? 'active btn-premium-primary text-white' : 'text-dark'}`} onClick={() => setActiveSection('insurance')}><i className="bi bi-shield-fill-check me-2"></i>My Insurance</button></li>
      </ul>

      <div className="row g-4">
        {/* Main Content Area */}
        <div className="col-lg-12">
          {/* Profile Section */}
          {activeSection === 'profile' && profile && (
            <div className="glass-card p-4 text-start animate-fade-in">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 border-bottom pb-4 mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="gradient-bg text-white rounded-circle d-flex align-items-center justify-content-center fw-extrabold shadow-md" style={{ width: '80px', height: '80px', fontSize: '2rem', minWidth: '80px' }}>
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1 text-dark">{profile.name}</h3>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1.5 rounded-pill fw-semibold">
                      <i className="bi bi-shield-check text-success me-1"></i>Patient Portal Account Active
                    </span>
                  </div>
                </div>
                <div className="text-md-end">
                  <span className="text-muted small d-block">Patient Reference ID</span>
                  <span className="fs-5 fw-bold text-dark font-monospace">#SHMS-PAT-00{profile.id}</span>
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-3"><i className="bi bi-person-lines-fill text-primary me-2"></i>Demographics & Contact Information</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 p-3 border-light-subtle rounded-3 bg-white hover-up" style={{ transition: 'all 0.3s' }}>
                    <span className="text-muted small d-block mb-1"><i className="bi bi-calendar3 text-primary me-1"></i>Age / Gender</span>
                    <span className="fw-bold text-dark fs-6">{profile.age} Years / {profile.gender}</span>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 p-3 border-light-subtle rounded-3 bg-white hover-up" style={{ transition: 'all 0.3s' }}>
                    <span className="text-muted small d-block mb-1"><i className="bi bi-droplet-fill text-danger me-1"></i>Blood Group</span>
                    <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2.5 py-1.5 fw-bold fs-6 align-self-start mt-1 d-inline-block">
                      {profile.bloodGroup || 'O+'}
                    </span>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 p-3 border-light-subtle rounded-3 bg-white hover-up" style={{ transition: 'all 0.3s' }}>
                    <span className="text-muted small d-block mb-1"><i className="bi bi-telephone text-primary me-1"></i>Registered Phone</span>
                    <span className="fw-bold text-dark fs-6">{profile.phone}</span>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card h-100 p-3 border-light-subtle rounded-3 bg-white hover-up" style={{ transition: 'all 0.3s' }}>
                    <span className="text-muted small d-block mb-1"><i className="bi bi-geo-alt text-primary me-1"></i>Home Address</span>
                    <span className="fw-semibold text-dark fs-7" style={{ wordBreak: 'break-word' }}>{profile.address}</span>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card p-4 border-danger-subtle bg-danger bg-opacity-10 rounded-4 shadow-sm h-100">
                    <h6 className="text-danger fw-bold fs-5 mb-3"><i className="bi bi-shield-slash-fill me-2"></i>Critical Drug Allergies</h6>
                    <div className="p-3 bg-white rounded-3 border border-danger-subtle text-start">
                      <p className="mb-0 text-dark small" style={{ lineHeight: '1.5' }}>
                        {profile.allergies || 'No allergies reported to date. Always notify clinical staff of any drug sensitivities.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card p-4 border-primary-subtle bg-primary bg-opacity-10 rounded-4 shadow-sm h-100">
                    <h6 className="text-primary fw-bold fs-5 mb-3"><i className="bi bi-clock-history me-2"></i>Clinical Medical History</h6>
                    <div className="p-3 bg-white rounded-3 border border-primary-subtle text-start mb-3">
                      <p className="mb-0 text-dark small " style={{ lineHeight: '1.5' }}>
                        {profile.medicalHistory || 'No previous major diagnoses or surgical procedures reported on file.'}
                      </p>
                    </div>

                    {/* Real-time Hospital Prescription & Diagnoses History */}
                    {prescriptions.length > 0 && (
                      <div className="text-start">
                        <span className="small text-muted fw-bold d-block mb-2">Hospital Consultations Ledger ({prescriptions.length})</span>
                        <div className="overflow-y-auto" style={{ maxHeight: '180px' }}>
                          {prescriptions.map((presc) => (
                            <div key={presc.id} className="p-3 bg-white rounded-3 border border-light-subtle mb-2 small shadow-sm">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-primary">{presc.diagnosis}</span>
                                <span className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>{presc.appointment?.appointmentDate || 'Prior Visit'}</span>
                              </div>
                              <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                <strong>Doctor:</strong> {presc.doctor?.name} ({presc.doctor?.specialization})
                              </div>
                              <div className="text-dark small mt-1">
                                <strong>Meds:</strong> {presc.medicines}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  {profile?.medicalHistory?.toLowerCase().match(/heart|cardio|cardiac/) && (
                    <div className="alert alert-info py-2 px-3 rounded-3 small mb-2 border border-info-subtle animate-scale-up">
                      <i className="bi bi-info-circle-fill me-1"></i> As a registered <strong>Heart Patient</strong>, your consult options are tailored to cardiologists you have previously consulted.
                    </div>
                  )}
                  <select className="form-select rounded-3" value={bookingForm.doctorId} onChange={e => setBookingForm({...bookingForm, doctorId: e.target.value})} required>
                    <option value="">-- Choose Doctor --</option>
                    {doctors
                      .filter(doc => {
                        const isHeartPatient = profile?.medicalHistory?.toLowerCase().match(/heart|cardio|cardiac/);
                        if (isHeartPatient) {
                          const isCardioDoc = doc.specialization?.toLowerCase().match(/cardio|cardiac/) || 
                                              doc.department?.name?.toLowerCase().match(/cardio|cardiac/);
                          if (isCardioDoc) {
                            // Find if the patient has consulted ANY cardio doctor previously
                            const consultedCardioIds = appointments
                              .filter(app => app.doctor?.specialization?.toLowerCase().match(/cardio|cardiac/) ||
                                             app.doctor?.department?.name?.toLowerCase().match(/cardio|cardiac/))
                              .map(app => app.doctor?.id);

                            if (consultedCardioIds.length > 0) {
                              // If they have consulted cardiologists before, show ONLY those specific doctors
                              return consultedCardioIds.includes(doc.id);
                            }
                            // Otherwise allow choosing any cardiologist for their first visit
                            return true;
                          }
                          // Allow other departments if specifically selected in the filter
                          return !selectedDeptId || (doc.department && doc.department.id === parseInt(selectedDeptId));
                        }
                        return !selectedDeptId || (doc.department && doc.department.id === parseInt(selectedDeptId));
                      })
                      .map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization}) - Availability: {doc.schedule}</option>
                      ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Appointment Date</label>
                  <input 
                    type="date" 
                    className="form-control rounded-3" 
                    value={bookingForm.appointmentDate} 
                    onChange={e => setBookingForm({...bookingForm, appointmentDate: e.target.value})} 
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Preferred Time Slot</label>
                  {slotError ? (
                    <div className="alert alert-warning py-2 px-3 rounded-3 small mb-0 border border-warning-subtle animate-scale-up">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i> {slotError}
                    </div>
                  ) : (
                    <select 
                      className="form-select rounded-3" 
                      value={bookingForm.timeSlot} 
                      onChange={e => setBookingForm({...bookingForm, timeSlot: e.target.value})}
                      required
                    >
                      {availableSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  )}
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

              {/* Insurance Premium Payments Ledger */}
              <div className="mt-5 animate-scale-up">
                <h5 className="fw-bold mb-3"><i className="bi bi-shield-lock-fill text-success me-2"></i>Insurance Policies & Premium Payment Ledger</h5>
                {insurances.length === 0 ? (
                  <p className="text-muted small">No insurance policy purchases recorded.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle bg-white rounded-3 shadow-sm border border-light-subtle">
                      <thead className="table-light">
                        <tr style={{ fontSize: '0.85rem' }} className="text-muted">
                          <th>Policy ID</th>
                          <th>Insurance Provider</th>
                          <th>Policy Number</th>
                          <th>Premium Amount</th>
                          <th>Payment Status</th>
                          <th>Policy Verification Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {insurances.map(ins => (
                          <tr key={ins.id} style={{ fontSize: '0.88rem' }}>
                            <td className="fw-bold text-dark">POL-00{ins.id}</td>
                            <td>{ins.provider}</td>
                            <td><code className="text-primary font-monospace">{ins.policyNumber}</code></td>
                            <td className="fw-bold text-success">₹{ins.premium?.toFixed(2) || '0.00'}</td>
                            <td>
                              <span className={`badge ${
                                ins.paymentStatus === 'PAID' ? 'bg-success' : 'bg-danger'
                              }`}>{ins.paymentStatus || 'PAID'}</span>
                            </td>
                            <td>
                              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2.5 py-1">
                                <i className="bi bi-shield-check me-1"></i>{ins.status}
                              </span>
                            </td>
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
                        <button type="button" className="btn-close btn-close-white" onClick={() => { setPayingBill(null); setBillUpiVerifyState(''); setBillUpiTxnId(''); }}></button>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        setIsPaying(true);
                        
                        if (paymentMethod === 'UPI') {
                          setBillUpiVerifyState('verifying');
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          setBillUpiVerifyState('success');
                          await new Promise(resolve => setTimeout(resolve, 1000));
                        } else {
                          // Card simulation
                          setBillUpiVerifyState('verifying_card');
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          setBillUpiVerifyState('success_card');
                          await new Promise(resolve => setTimeout(resolve, 1000));
                        }

                        try {
                          await api.post(`/api/billing/${payingBill.id}/pay?paymentMethod=${paymentMethod}`);
                          setPaymentSuccess(true);
                        } catch (err) {
                          showAlert(err.response?.data || 'Error processing payment');
                        } finally {
                          setIsPaying(false);
                          setBillUpiVerifyState('');
                          setBillUpiTxnId('');
                        }
                      }}>
                        <div className="modal-body p-4 bg-light bg-opacity-50">
                          {billUpiVerifyState === 'verifying' && (
                            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center animate-scale-up">
                              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Verifying...</span>
                              </div>
                              <h5 className="fw-bold text-dark mb-1">Verifying Transaction Ref...</h5>
                              <p className="text-muted small">Checking merchant account for UPI payment transfer status</p>
                            </div>
                          )}

                          {billUpiVerifyState === 'verifying_card' && (
                            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center animate-scale-up">
                              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Authorizing...</span>
                              </div>
                              <h5 className="fw-bold text-dark mb-1">Authorizing Card...</h5>
                              <p className="text-muted small">Contacting issuing bank secure gateway</p>
                            </div>
                          )}

                          {billUpiVerifyState === 'success' && (
                            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center animate-scale-up">
                              <div className="mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style={{ width: '70px', height: '70px' }}>
                                <i className="bi bi-check2-circle text-success" style={{ fontSize: '2.5rem' }}></i>
                              </div>
                              <h5 className="fw-bold text-success mb-1">UPI Payment Confirmed!</h5>
                              <p className="text-muted small">Settle request submitted</p>
                            </div>
                          )}

                          {billUpiVerifyState === 'success_card' && (
                            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center animate-scale-up">
                              <div className="mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style={{ width: '70px', height: '70px' }}>
                                <i className="bi bi-check2-circle text-success" style={{ fontSize: '2.5rem' }}></i>
                              </div>
                              <h5 className="fw-bold text-success mb-1">Card Payment Authorized!</h5>
                              <p className="text-muted small">Settle request submitted</p>
                            </div>
                          )}

                          {billUpiVerifyState === '' && (
                            <>
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
                                  <div className="p-2 bg-white rounded-3 shadow-sm border border-light-subtle mb-3" style={{ width: '180px', height: '180px' }}>
                                    <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=164x164&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${payingBill.totalAmount}&cu=INR`)}`} 
                                      className="img-fluid rounded-2" 
                                      alt="UPI QR Code" 
                                    />
                                  </div>
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle mb-2 px-2.5 py-1">UPI Merchant Account</span>
                                  <h6 className="fw-bold text-dark mb-1">{PAYEE_NAME}</h6>
                                  <p className="small text-muted mb-0">Phone: {PAYEE_PHONE}</p>
                                  <p className="small text-muted mb-0">UPI ID: {UPI_ID}</p>
                                  <p className="small text-muted mt-2 mb-3">Scan to pay with any UPI app</p>
                                  
                                  <div className="mb-1 w-100 text-start">
                                    <label className="form-label small fw-semibold text-dark">Enter UPI Transaction ID / Ref No.</label>
                                    <input 
                                      type="text" 
                                      className="form-control rounded-3 text-center font-monospace" 
                                      placeholder="12-digit reference number" 
                                      maxLength="12" 
                                      minLength="12" 
                                      pattern="\d{12}" 
                                      title="UPI transaction reference number must be exactly 12 digits" 
                                      value={billUpiTxnId}
                                      onChange={e => setBillUpiTxnId(e.target.value)}
                                      required 
                                    />
                                  </div>
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
                                <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={() => { setPayingBill(null); setBillUpiTxnId(''); }}>Cancel</button>
                                <button
                                  type="submit"
                                  className="btn btn-premium-primary rounded-3 px-4"
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
                            </>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}


            </div>
          )}

          {/* Clinical Records */}
          {activeSection === 'records' && (
            hasUnpaidBills ? (
              <div className="glass-card p-5 text-center my-2 animate-fade-in border-danger border bg-danger bg-opacity-10 rounded-4 shadow-sm">
                <div className="mb-4 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle mx-auto" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-lock-fill fs-2"></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">Prescriptions & Records Locked</h4>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '480px' }}>
                  To view your clinical prescriptions, treatment history, and diagnostics, please settle your outstanding unpaid hospital invoices in the settlements ledger.
                </p>
                <button 
                  type="button" 
                  className="btn btn-premium-primary rounded-3 px-4 py-2.5 fw-semibold text-white animate-pulse"
                  onClick={() => setActiveSection('billing')}
                >
                  <i className="bi bi-credit-card me-2"></i>Go to Settlements & Billing
                </button>
              </div>
            ) : (
              <div className="row g-4 animate-fade-in">
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
                              <span className="small text-muted d-block mb-1"><i className="bi bi-person me-1"></i>Uploaded By: {r.uploadedBy} • {r.testDate}</span>
                              <span className={`badge ${r.status === 'COMPLETED' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning-emphasis'}`} style={{ fontSize: '0.75rem' }}>
                                {r.status === 'COMPLETED' ? 'Finalized' : r.status || 'Pending'}
                              </span>
                            </div>
                            <div className="d-flex gap-2">
                              {r.status === 'COMPLETED' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-premium-primary text-white rounded-2"
                                    onClick={() => {
                                      setSelectedReportForView(r);
                                      setActiveSection('lab-reports');
                                    }}
                                  >
                                    <i className="bi bi-eye-fill me-1"></i> View Visual
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-success rounded-2"
                                    onClick={() => {
                                      setSelectedReportForView(r);
                                      setActiveSection('lab-reports');
                                      setTimeout(() => {
                                        window.print();
                                      }, 300);
                                    }}
                                  >
                                    <i className="bi bi-file-pdf me-1"></i> PDF
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Lab Reports Section */}
          {activeSection === 'lab-reports' && (
            hasUnpaidBills ? (
              <div className="glass-card p-5 text-center my-2 animate-fade-in border-danger border bg-danger bg-opacity-10 rounded-4 shadow-sm">
                <div className="mb-4 d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle mx-auto" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-lock-fill fs-2"></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">Laboratory Diagnostics Locked</h4>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '480px' }}>
                  To inspect your laboratory physiological graphs, biological indicators, and visual reports, please settle your outstanding unpaid hospital invoices in the settlements ledger.
                </p>
                <button 
                  type="button" 
                  className="btn btn-premium-primary rounded-3 px-4 py-2.5 fw-semibold text-white animate-pulse"
                  onClick={() => setActiveSection('billing')}
                >
                  <i className="bi bi-credit-card me-2"></i>Go to Settlements & Billing
                </button>
              </div>
            ) : (
              <div className={`glass-card p-4 ${selectedReportForView ? 'visual-report-wrapper' : ''}`}>
                {selectedReportForView ? (
                  <VisualReport
                    report={selectedReportForView}
                    onBack={() => setSelectedReportForView(null)}
                  />
                ) : (
                  <div>
                    <h4 className="fw-bold mb-4"><i className="bi bi-file-earmark-bar-graph text-success me-2"></i>My Laboratory Reports Analysis</h4>
                    {reports.filter(r => r.status === 'COMPLETED' || r.status === 'PENDING' || r.status === 'SAMPLE_COLLECTED').length === 0 ? (
                      <p className="text-muted">No laboratory reports uploaded yet.</p>
                    ) : (
                      <div className="row g-4">
                        {reports
                          .filter(r => r.status === 'COMPLETED' || r.status === 'PENDING' || r.status === 'SAMPLE_COLLECTED')
                          .map(r => {
                            const isCompleted = r.status === 'COMPLETED';
                            return (
                              <div key={r.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 border-light-subtle rounded-3 shadow-sm bg-white hover-up text-start p-3 d-flex flex-column justify-content-between" style={{ transition: 'all 0.3s' }}>
                                  <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <span className={`badge ${isCompleted ? 'bg-success' : 'bg-warning text-dark'}`}>
                                        {isCompleted ? 'Finalized' : r.status || 'Pending'}
                                      </span>
                                      <span className="small text-muted font-monospace">#{r.id}</span>
                                    </div>
                                    <h5 className="fw-bold text-dark mb-1">{r.testName}</h5>
                                    <p className="small text-muted mb-2">
                                      <i className="bi bi-calendar3 me-1"></i> {r.testDate || 'Date pending'}
                                    </p>
                                    <p className="small text-muted mb-3">
                                      <i className="bi bi-person me-1"></i> {r.uploadedBy ? `By ${r.uploadedBy}` : 'Awaiting clinical review'}
                                    </p>
                                  </div>
                                  <div className="d-flex gap-2 mt-2">
                                    {isCompleted ? (
                                      <>
                                        <button
                                          className="btn btn-sm btn-premium-primary text-white flex-grow-1 rounded-2"
                                          onClick={() => setSelectedReportForView(r)}
                                        >
                                          <i className="bi bi-bar-chart-fill me-1"></i> View Visual
                                        </button>
                                        <button
                                          className="btn btn-sm btn-outline-success rounded-2"
                                          title="Download Plain Text Report"
                                          onClick={() => {
                                            const fileContent = `SMART HOSPITAL DIAGNOSTICS LABORATORY\n====================================================\nTest Name:    ${r.testName}\nTest Date:    ${r.testDate}\nDiagnosed By: ${r.uploadedBy}\n====================================================\n\n${r.resultSummary}\n====================================================`;
                                            const element = document.createElement("a");
                                            const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
                                            element.href = URL.createObjectURL(file);
                                            element.download = `${r.testName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.txt`;
                                            document.body.appendChild(element);
                                            element.click();
                                            document.body.removeChild(element);
                                          }}
                                        >
                                          <i className="bi bi-download"></i>
                                        </button>
                                      </>
                                    ) : (
                                      <div className="alert alert-warning py-1.5 px-3 rounded-2 small mb-0 w-100 text-center">
                                        <i className="bi bi-clock-history me-1 animate-pulse"></i> Processing sample...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
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

          {/* Health Tracker Tab */}
          {activeSection === 'health-reports' && (
            <div className="row g-4 text-start animate-fade-in">
              <div className="col-lg-12">
                <div className="glass-card p-4 bg-white shadow-sm border border-light-subtle rounded-3 h-100">
                  <h4 className="fw-bold mb-4"><i className="bi bi-clock-history text-primary me-2"></i>Physiological Vitals History</h4>
                  
                  {healthReports.length === 0 ? (
                    <div className="p-5 text-center text-muted border border-dashed rounded-3 small">
                      <i className="bi bi-activity fs-1 mb-2 d-block text-muted"></i>
                      No health reports logged yet. Vitals logged by clinicians will appear here.
                    </div>
                  ) : (
                    <>
                      {/* Charts and Diagnostic Summary Row */}
                      <div className="row g-4 mb-4">
                        {/* Diagnostic Check Result Card */}
                        <div className="col-lg-6 animate-scale-up">
                          <div className="card border border-light-subtle rounded-3 p-4 bg-light bg-opacity-25 shadow-sm h-100">
                            <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-heart-pulse-fill text-danger me-2"></i>Latest Check-up Diagnostics</h5>
                            <div className="row g-3">
                              {/* BP Result */}
                              <div className="col-12">
                                <div className="p-3 rounded bg-white border border-light shadow-sm">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="fw-bold text-muted" style={{ fontSize: '0.85rem' }}>Latest Blood Pressure</span>
                                    <span className={`badge bg-${classifyBP(healthReports[0].bp).color}-subtle text-${classifyBP(healthReports[0].bp).color} border border-${classifyBP(healthReports[0].bp).color}-subtle rounded-pill px-3 py-1`}>
                                      {classifyBP(healthReports[0].bp).category}
                                    </span>
                                  </div>
                                  <div className="fs-3 fw-extrabold text-dark mb-1">{healthReports[0].bp} <span className="fs-6 text-muted font-normal">mmHg</span></div>
                                  <div className="text-muted small"><i className="bi bi-info-circle me-1"></i>{classifyBP(healthReports[0].bp).description}</div>
                                </div>
                              </div>
                              
                              {/* Sugar Result */}
                              {healthReports[0].sugarLevel && (
                                <div className="col-12">
                                  <div className="p-3 rounded bg-white border border-light shadow-sm">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                      <span className="fw-bold text-muted" style={{ fontSize: '0.85rem' }}>Latest Glucose Level</span>
                                      <span className={`badge bg-${classifySugar(healthReports[0].sugarLevel).color}-subtle text-${classifySugar(healthReports[0].sugarLevel).color} border border-${classifySugar(healthReports[0].sugarLevel).color}-subtle rounded-pill px-3 py-1`}>
                                        {classifySugar(healthReports[0].sugarLevel).category}
                                      </span>
                                    </div>
                                    <div className="fs-3 fw-extrabold text-dark mb-1">{healthReports[0].sugarLevel} <span className="fs-6 text-muted font-normal">mg/dL</span></div>
                                    <div className="text-muted small"><i className="bi bi-info-circle me-1"></i>{classifySugar(healthReports[0].sugarLevel).description}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pie Charts Card */}
                        <div className="col-lg-6 animate-scale-up">
                          <div className="card border border-light-subtle rounded-3 p-4 bg-light bg-opacity-25 shadow-sm h-100">
                            <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-pie-chart-fill text-primary me-2"></i>Status Distribution History</h5>
                            <div className="row h-100 align-items-center py-2">
                              
                              {/* BP Pie Chart */}
                              <div className="col-6 text-center">
                                <div className="position-relative d-inline-block shadow-sm rounded-circle p-1 bg-white mb-2" style={{ width: '120px', height: '120px' }}>
                                  <div className="w-100 h-100 rounded-circle" style={{
                                    background: `conic-gradient(
                                      #10b981 0% ${bpStats.normalPercent}%, 
                                      #ef4444 ${bpStats.normalPercent}% ${bpStats.normalPercent + bpStats.highPercent}%, 
                                      #3b82f6 ${bpStats.normalPercent + bpStats.highPercent}% 100%
                                    )`
                                  }}></div>
                                  <div className="position-absolute bg-white rounded-circle d-flex flex-column align-items-center justify-content-center" style={{
                                    top: '15px', left: '15px', right: '15px', bottom: '15px', border: '1px solid #f3f4f6'
                                  }}>
                                    <span className="fw-bold text-dark fs-6" style={{ fontSize: '0.9rem' }}>BP</span>
                                    <span className="text-muted" style={{ fontSize: '0.6rem' }}>{bpStats.total} checks</span>
                                  </div>
                                </div>
                                <div className="d-flex flex-column gap-1 small align-items-center" style={{ fontSize: '0.75rem' }}>
                                  <div className="d-flex align-items-center gap-1"><span className="rounded-circle d-inline-block" style={{ width: '6px', height: '6px', backgroundColor: '#10b981' }}></span>Normal: {bpStats.normalPercent}%</div>
                                  <div className="d-flex align-items-center gap-1"><span className="rounded-circle d-inline-block" style={{ width: '6px', height: '6px', backgroundColor: '#ef4444' }}></span>High: {bpStats.highPercent}%</div>
                                  <div className="d-flex align-items-center gap-1"><span className="rounded-circle d-inline-block" style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6' }}></span>Low: {bpStats.lowPercent}%</div>
                                </div>
                              </div>

                              {/* Sugar Pie Chart */}
                              {sugarStats.total > 0 && (
                                <div className="col-6 text-center">
                                  <div className="position-relative d-inline-block shadow-sm rounded-circle p-1 bg-white mb-2" style={{ width: '120px', height: '120px' }}>
                                    <div className="w-100 h-100 rounded-circle" style={{
                                      background: `conic-gradient(
                                        #10b981 0% ${sugarStats.normalPercent}%, 
                                        #ef4444 ${sugarStats.normalPercent}% ${sugarStats.normalPercent + sugarStats.highPercent}%, 
                                        #3b82f6 ${sugarStats.normalPercent + sugarStats.highPercent}% 100%
                                      )`
                                    }}></div>
                                    <div className="position-absolute bg-white rounded-circle d-flex flex-column align-items-center justify-content-center" style={{
                                      top: '15px', left: '15px', right: '15px', bottom: '15px', border: '1px solid #f3f4f6'
                                    }}>
                                      <span className="fw-bold text-dark fs-6" style={{ fontSize: '0.9rem' }}>Sugar</span>
                                      <span className="text-muted" style={{ fontSize: '0.6rem' }}>{sugarStats.total} checks</span>
                                    </div>
                                  </div>
                                  <div className="d-flex flex-column gap-1 small align-items-center" style={{ fontSize: '0.75rem' }}>
                                    <div className="d-flex align-items-center gap-1"><span className="rounded-circle d-inline-block" style={{ width: '6px', height: '6px', backgroundColor: '#10b981' }}></span>Normal: {sugarStats.normalPercent}%</div>
                                    <div className="d-flex align-items-center gap-1"><span className="rounded-circle d-inline-block" style={{ width: '6px', height: '6px', backgroundColor: '#ef4444' }}></span>High: {sugarStats.highPercent}%</div>
                                    <div className="d-flex align-items-center gap-1"><span className="rounded-circle d-inline-block" style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6' }}></span>Low: {sugarStats.lowPercent}%</div>
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-hover align-middle bg-white border rounded-3 overflow-hidden">
                          <thead className="table-light">
                            <tr style={{ fontSize: '0.85rem' }} className="text-muted text-start">
                              <th>Date / Time</th>
                              <th>Weight</th>
                              <th>Blood Pressure</th>
                              <th>Temp (°C)</th>
                              <th>Pulse (bpm)</th>
                              <th>Sugar (mg/dL)</th>
                              <th>Clinician Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {healthReports.map(rpt => (
                              <tr key={rpt.id} style={{ fontSize: '0.88rem' }} className="text-start">
                                <td className="fw-bold text-dark font-monospace" style={{ fontSize: '0.8rem' }}>
                                  {new Date(rpt.dateRecorded).toLocaleString()}
                                </td>
                                <td className="text-primary fw-bold">{rpt.weight} kg</td>
                                <td className="text-danger fw-bold">{rpt.bp} mmHg</td>
                                <td>{rpt.temperature ? `${rpt.temperature} °C` : '-'}</td>
                                <td>{rpt.heartRate ? `${rpt.heartRate} bpm` : '-'}</td>
                                <td>{rpt.sugarLevel ? `${rpt.sugarLevel} mg/dL` : '-'}</td>
                                <td className="text-muted small" style={{ maxWidth: '250px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                  {rpt.notes || '-'}
                                </td>
                              </tr>
                            ))}
                  </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Insurance Section */}
          {activeSection === 'insurance' && (
            <div className="glass-card p-4 text-start animate-fade-in">
              <h4 className="fw-bold text-dark mb-4"><i className="bi bi-shield-fill-check text-primary me-2"></i>My Insurance Policies</h4>
              
              {/* Active Coverages list */}
              {insurances.length > 0 && (
                <div className="mb-5 animate-fade-in">
                  <h5 className="fw-bold text-success mb-3"><i className="bi bi-patch-check-fill me-2"></i>My Active Coverages</h5>
                  <div className="row g-3">
                    {insurances.map(ins => (
                      <div key={ins.id} className="col-md-6">
                        <div className="card p-3 border-success-subtle bg-success bg-opacity-10 rounded-4 shadow-sm h-100">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <span className="text-muted small d-block">Insurance Provider</span>
                              <strong className="text-dark fs-5">{ins.provider}</strong>
                            </div>
                            <span className="badge bg-success">{ins.status}</span>
                          </div>
                          <div className="p-3 bg-white rounded-3 border border-success-subtle mb-2">
                            <div className="mb-2">
                              <span className="text-muted small d-block">Policy Number</span>
                              <code className="fs-6 text-primary">{ins.policyNumber}</code>
                            </div>
                            <div>
                              <span className="text-muted small d-block">Coverage details & terms</span>
                              <p className="mb-0 text-muted small" style={{ lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                {ins.coverageDetails || 'No details specified.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Insurance plans directory */}
              <div>
                <h5 className="fw-bold text-dark mb-3"><i className="bi bi-cart-plus-fill text-primary me-2"></i>Browse & Purchase Coverage Plans</h5>
                <div className="alert alert-info border-0 rounded-3 p-3 text-start small mb-4 d-flex gap-2 animate-scale-up">
                  <i className="bi bi-info-circle-fill text-info fs-5"></i>
                  <div>
                    <strong>Hold Multiple Policies</strong>
                    <p className="mb-0 text-muted">You can hold and activate more than one insurance policy under your account. Select any policy from our 25 premium plans below to purchase and activate it instantly.</p>
                  </div>
                </div>

                {/* Filter and Search controls */}
                <div className="row g-3 mb-4 animate-scale-up">
                  <div className="col-md-7">
                    <div className="input-group shadow-sm rounded-3">
                      <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                      <input 
                        type="text" 
                        className="form-control border-start-0" 
                        placeholder="Search plans by name or coverage..." 
                        value={insSearchText}
                        onChange={e => setInsSearchText(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-5">
                    <select 
                      className="form-select shadow-sm rounded-3" 
                      value={insFilterProvider}
                      onChange={e => setInsFilterProvider(e.target.value)}
                    >
                      <option value="">-- All Providers --</option>
                      <option value="Star Health">Star Health</option>
                      <option value="HDFC Ergo">HDFC Ergo</option>
                      <option value="Niva Bupa">Niva Bupa</option>
                      <option value="ICICI Lombard">ICICI Lombard</option>
                      <option value="Care Health">Care Health</option>
                    </select>
                  </div>
                </div>

                {/* Available plans grid */}
                <div className="row g-3 animate-scale-up">
                  {AVAILABLE_POLICIES.filter(plan => {
                    const matchesSearch = plan.name.toLowerCase().includes(insSearchText.toLowerCase()) || plan.coverage.toLowerCase().includes(insSearchText.toLowerCase());
                    const matchesProvider = insFilterProvider === '' || plan.provider === insFilterProvider;
                    return matchesSearch && matchesProvider;
                  }).map(plan => (
                    <div key={plan.id} className="col-md-6 col-lg-4">
                      <div className="card h-100 p-3 border-light-subtle rounded-3 bg-white shadow-sm hover-up d-flex flex-column justify-content-between" style={{ transition: 'all 0.3s' }}>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">{plan.provider}</span>
                            <span className="text-success fw-bold font-monospace">₹{plan.premium}</span>
                          </div>
                          <h6 className="fw-bold text-dark mb-2">{plan.name}</h6>
                          <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{plan.coverage}</p>
                        </div>
                        <button 
                          className="btn btn-sm btn-premium-primary w-100 rounded-2"
                          onClick={() => {
                            setSelectedPlanForPurchase(plan);
                            setPurchasePaymentMethod('');
                          }}
                        >
                          <i className="bi bi-wallet2 me-1"></i>Purchase & Activate
                        </button>
                      </div>
                    </div>
                  ))}
                  {AVAILABLE_POLICIES.filter(plan => {
                    const matchesSearch = plan.name.toLowerCase().includes(insSearchText.toLowerCase()) || plan.coverage.toLowerCase().includes(insSearchText.toLowerCase());
                    const matchesProvider = insFilterProvider === '' || plan.provider === insFilterProvider;
                    return matchesSearch && matchesProvider;
                  }).length === 0 && (
                    <div className="text-center py-5 text-muted col-12">
                      No insurance plans match your search filter.
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

    {/* Centered Payment Success Modal - Rendered outside d-print-none container */}
    {paymentSuccess && payingBill && (
      <div className="modal show d-block bg-dark bg-opacity-50 animate-fade-in text-center modal-receipt-wrapper" style={{ zIndex: 1050 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden animate-scale-up">
            <div className="modal-header bg-success text-white border-0 py-3 d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-shield-check fs-4"></i>
              <h5 className="modal-title fw-bold mb-0">Invoice Settled Successfully</h5>
            </div>
            <div className="modal-body p-4 bg-light bg-opacity-50">
              <div className="mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mx-auto animate-bounce" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-shield-check text-success animate-scale-up" style={{ fontSize: '2.5rem' }}></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Payment Confirmed!</h4>
              <p className="text-muted small mb-4">Hospital Invoice <strong>INV-00{payingBill.id}</strong> has been fully paid.</p>
              
              <div className="bg-white p-3.5 rounded-3 mb-4 text-start small border border-light-subtle shadow-sm">
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
                  <span className="fw-bold text-success fs-5">₹{payingBill.totalAmount?.toFixed(2)}</span>
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
                <button className="btn btn-outline-secondary px-4 py-2.5 rounded-3 fw-semibold flex-grow-1" onClick={() => window.print()}>
                  <i className="bi bi-printer me-2"></i>Print Receipt
                </button>
                <button className="btn btn-premium-primary px-4 py-2.5 rounded-3 fw-semibold flex-grow-1 animate-pulse" onClick={() => {
                  setPaymentSuccess(false);
                  setPayingBill(null);
                  fetchProfileData();
                }}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Insurance Purchase Checkout Modal */}
    {selectedPlanForPurchase && (
      <div className="modal show d-block bg-dark bg-opacity-50 animate-fade-in text-center" style={{ zIndex: 1050 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden animate-scale-up">
            <div className="modal-header bg-premium-primary text-white border-0 py-3">
              <h5 className="modal-title fw-bold mb-0"><i className="bi bi-credit-card-2-front me-2"></i>Insurance Checkout</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => { setSelectedPlanForPurchase(null); setPurchasePaymentMethod(''); }}></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!purchasePaymentMethod) {
                showAlert("Please select a payment method");
                return;
              }
              setIsPurchasing(true);
              
              if (purchasePaymentMethod === 'UPI') {
                setUpiVerifyState('verifying');
                await new Promise(resolve => setTimeout(resolve, 1500));
                setUpiVerifyState('success');
                await new Promise(resolve => setTimeout(resolve, 1500));
              }

              try {
                const res = await api.post('/api/insurance/verify', null, {
                  params: {
                    patientId: profile.id,
                    policyNumber: selectedPlanForPurchase.policyNo,
                    provider: selectedPlanForPurchase.provider,
                    coverageDetails: selectedPlanForPurchase.coverage,
                    premium: selectedPlanForPurchase.premium,
                    paymentMethod: purchasePaymentMethod
                  }
                });
                setInsurances(prev => [...prev, res.data]);
                setPurchaseSuccess(true);
              } catch (err) {
                showAlert("Error processing insurance purchase payment.");
              } finally {
                setIsPurchasing(false);
                setUpiVerifyState('');
              }
            }}>
              <div className="modal-body p-4 bg-white text-start">
                {upiVerifyState === 'verifying' && (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center animate-scale-up">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                      <span className="visually-hidden">Verifying...</span>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">Verifying Transaction Ref...</h5>
                    <p className="text-muted small">Checking merchant account for UPI payment transfer status</p>
                  </div>
                )}

                {upiVerifyState === 'success' && (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center animate-scale-up">
                    <div className="mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle" style={{ width: '70px', height: '70px' }}>
                      <i className="bi bi-check2-circle text-success" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold text-success mb-1">UPI Payment Confirmed!</h5>
                    <p className="text-muted small">₹{selectedPlanForPurchase.premium} credited to Charumathi Dhanasekaran.</p>
                  </div>
                )}

                {upiVerifyState === '' && (
                  <>
                    <div className="mb-4 p-3 bg-light rounded-3 border">
                      <span className="text-muted small d-block">Selected Insurance Plan</span>
                      <h5 className="fw-bold text-dark mb-1">{selectedPlanForPurchase.name}</h5>
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1 mb-2">{selectedPlanForPurchase.provider}</span>
                      <p className="mb-0 text-muted small">{selectedPlanForPurchase.coverage}</p>
                      <div className="mt-3 border-top pt-2 d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-dark">One-Time Premium</span>
                        <span className="fw-bold text-success fs-4">₹{selectedPlanForPurchase.premium}</span>
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark mb-2">Select Payment Method</h6>
                    <div className="d-flex gap-2 mb-4">
                      <button 
                        type="button" 
                        className={`btn flex-grow-1 py-2.5 rounded-3 fw-semibold border ${purchasePaymentMethod === 'Card' ? 'btn-premium-primary border-0 text-white' : 'btn-light text-muted'}`}
                        onClick={() => setPurchasePaymentMethod('Card')}
                      >
                        <i className="bi bi-credit-card me-2"></i>Credit / Debit Card
                      </button>
                      <button 
                        type="button" 
                        className={`btn flex-grow-1 py-2.5 rounded-3 fw-semibold border ${purchasePaymentMethod === 'UPI' ? 'btn-premium-primary border-0 text-white' : 'btn-light text-muted'}`}
                        onClick={() => setPurchasePaymentMethod('UPI')}
                      >
                        <i className="bi bi-qr-code me-2"></i>UPI / QR Code
                      </button>
                    </div>

                    {purchasePaymentMethod === 'UPI' && (
                      <div className="mb-4 animate-scale-up">
                        <div className="d-flex flex-column align-items-center mb-3 text-center p-3 bg-light rounded-3 border">
                          <div className="p-2 bg-white rounded-3 shadow-sm border border-light-subtle mb-3" style={{ width: '180px', height: '180px' }}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=164x164&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${selectedPlanForPurchase.premium}&cu=INR`)}`} 
                              className="img-fluid rounded-2" 
                              alt="UPI QR Code" 
                            />
                          </div>
                          <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle mb-2 px-2.5 py-1">UPI Merchant Account</span>
                          <h6 className="fw-bold text-dark mb-1">{PAYEE_NAME}</h6>
                          <p className="small text-muted mb-0">Phone: {PAYEE_PHONE}</p>
                          <p className="small text-muted mb-0">UPI ID: {UPI_ID}</p>
                          <p className="small text-muted mt-2">Scan to pay with GPay, PhonePe, Paytm, or any UPI app</p>
                        </div>

                        <div className="mb-1">
                          <label className="form-label small fw-semibold text-dark">Enter UPI Transaction ID / Ref No.</label>
                          <input 
                            type="text" 
                            className="form-control rounded-3 text-center font-monospace" 
                            placeholder="12-digit reference number" 
                            maxLength="12" 
                            minLength="12" 
                            pattern="\d{12}" 
                            title="UPI transaction reference number must be exactly 12 digits" 
                            required 
                          />
                        </div>
                      </div>
                    )}

                    {purchasePaymentMethod === 'Card' && (
                      <div className="p-3 bg-light rounded-3 border mb-4 animate-scale-up">
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

                    {isPurchasing ? (
                      <button className="btn btn-premium-primary w-100 py-3 rounded-3 fs-5 fw-bold" disabled>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing Secure Payment...
                      </button>
                    ) : (
                      <button 
                        type="submit"
                        className="btn btn-premium-primary w-100 py-3 rounded-3 fs-5 fw-bold" 
                      >
                        Pay & Activate Policy
                      </button>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* Insurance Purchase Success Modal */}
    {purchaseSuccess && selectedPlanForPurchase && (
      <div className="modal show d-block bg-dark bg-opacity-50 animate-fade-in text-center" style={{ zIndex: 1060 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden animate-scale-up">
            <div className="modal-header bg-success text-white border-0 py-3 d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-shield-fill-check fs-4"></i>
              <h5 className="modal-title fw-bold mb-0">Policy Activated Successfully</h5>
            </div>
            <div className="modal-body p-4 bg-light bg-opacity-50 text-center">
              <div className="mb-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success rounded-circle mx-auto animate-bounce" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-shield-check text-success" style={{ fontSize: '2.5rem' }}></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Payment Credited Successfully!</h4>
              <p className="text-muted small mb-4">The premium of <strong>₹{selectedPlanForPurchase.premium}</strong> has been credited to the account. Your policy <strong>{selectedPlanForPurchase.name}</strong> is now active.</p>

              <div className="bg-white p-3.5 rounded-3 mb-4 text-start small border shadow-sm">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Policy Number</span>
                  <code className="fw-bold text-primary">{selectedPlanForPurchase.policyNo}</code>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Premium Paid</span>
                  <span className="fw-bold text-success">₹{selectedPlanForPurchase.premium}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Verification Status</span>
                  <span className="badge bg-success">VERIFIED</span>
                </div>
              </div>

              <button 
                className="btn btn-success w-100 py-2.5 rounded-3 fw-semibold text-white" 
                onClick={() => {
                  setPurchaseSuccess(false);
                  setSelectedPlanForPurchase(null);
                  setPurchasePaymentMethod('');
                  fetchProfileData();
                  setActiveSection('insurance');
                }}
              >
                Go to My Insurance
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Custom Premium Alert Modal */}
    {customAlert && (
      <div className="modal show d-block bg-dark bg-opacity-50 animate-fade-in text-center" style={{ zIndex: 1100 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
          <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden animate-scale-up">
            <div className={`modal-header border-0 py-3 d-flex align-items-center justify-content-center gap-2 ${customAlert.type === 'success' ? 'bg-success text-white' : customAlert.type === 'info' ? 'bg-info text-white' : 'bg-danger text-white'}`}>
              <i className={`bi ${customAlert.type === 'success' ? 'bi-check-circle-fill' : customAlert.type === 'info' ? 'bi-info-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
              <h5 className="modal-title fw-bold mb-0">
                {customAlert.type === 'success' ? 'Success' : customAlert.type === 'info' ? 'Information' : 'Alert / Error'}
              </h5>
            </div>
            <div className="modal-body p-4 bg-white">
              <p className="text-muted mb-4 small fw-semibold text-center">{customAlert.message}</p>
              <button 
                type="button" 
                className={`btn w-100 py-2 rounded-3 fw-bold ${customAlert.type === 'success' ? 'btn-success text-white' : customAlert.type === 'info' ? 'btn-info text-white' : 'btn-danger text-white'}`}
                onClick={() => setCustomAlert(null)}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    </>
  );
}
