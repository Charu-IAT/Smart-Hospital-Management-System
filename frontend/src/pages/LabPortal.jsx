import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VisualReport from '../components/VisualReport';

const TEST_TEMPLATES = {
  cbc: {
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    markers: [
      { name: 'White Blood Cells (WBC)', val: '', unit: 'x10³/µL', min: 4.5, max: 11.0 },
      { name: 'Red Blood Cells (RBC)', val: '', unit: 'x10⁶/µL', min: 4.0, max: 5.9 },
      { name: 'Hemoglobin (Hb)', val: '', unit: 'g/dL', min: 12.0, max: 17.5 },
      { name: 'Hematocrit (HCT)', val: '', unit: '%', min: 35.0, max: 50.0 },
      { name: 'Platelets', val: '', unit: 'x10³/µL', min: 150, max: 450 }
    ]
  },
  lipid: {
    name: 'Lipid Profile',
    category: 'Cardiology',
    markers: [
      { name: 'Total Cholesterol', val: '', unit: 'mg/dL', min: 100, max: 199 },
      { name: 'HDL Cholesterol (Good)', val: '', unit: 'mg/dL', min: 40, max: 60 },
      { name: 'LDL Cholesterol (Bad)', val: '', unit: 'mg/dL', min: 50, max: 99 },
      { name: 'Triglycerides', val: '', unit: 'mg/dL', min: 50, max: 149 }
    ]
  },
  cardiac_enzymes: {
    name: 'Cardiac Biomarkers Panel',
    category: 'Cardiology',
    markers: [
      { name: 'Troponin T', val: '', unit: 'ng/mL', min: 0.0, max: 0.01 },
      { name: 'Troponin I', val: '', unit: 'ng/mL', min: 0.0, max: 0.04 },
      { name: 'CK-MB', val: '', unit: 'ng/mL', min: 0.0, max: 5.0 },
      { name: 'NT-proBNP', val: '', unit: 'pg/mL', min: 0, max: 125 }
    ]
  },
  coagulation: {
    name: 'Coagulation Profile',
    category: 'Cardiology',
    markers: [
      { name: 'Prothrombin Time (PT)', val: '', unit: 'sec', min: 11.0, max: 13.5 },
      { name: 'INR', val: '', unit: '', min: 0.8, max: 1.2 },
      { name: 'aPTT', val: '', unit: 'sec', min: 25.0, max: 35.0 },
      { name: 'Fibrinogen', val: '', unit: 'mg/dL', min: 200, max: 400 }
    ]
  },
  neuro_metabolic: {
    name: 'Neuro-Metabolic Screen',
    category: 'Neurology',
    markers: [
      { name: 'Vitamin B12', val: '', unit: 'pg/mL', min: 200, max: 900 },
      { name: 'Folate', val: '', unit: 'ng/mL', min: 4.6, max: 20.0 },
      { name: 'Homocysteine', val: '', unit: 'µmol/L', min: 5.0, max: 15.0 },
      { name: 'Vitamin D3 (25-OH)', val: '', unit: 'ng/mL', min: 30.0, max: 100.0 }
    ]
  },
  csf_panel: {
    name: 'Cerebrospinal Fluid (CSF) Panel',
    category: 'Neurology',
    markers: [
      { name: 'CSF Glucose', val: '', unit: 'mg/dL', min: 40, max: 70 },
      { name: 'CSF Protein', val: '', unit: 'mg/dL', min: 15, max: 45 },
      { name: 'CSF White Blood Cells', val: '', unit: '/µL', min: 0, max: 5 },
      { name: 'CSF Opening Pressure', val: '', unit: 'mm H2O', min: 90, max: 180 }
    ]
  },
  neuro_autoimmune: {
    name: 'Neuro-Autoimmune Panel',
    category: 'Neurology',
    markers: [
      { name: 'Anti-NMDAR Antibody', val: '', unit: 'titer', min: 0, max: 1 },
      { name: 'Anti-LGI1 Antibody', val: '', unit: 'titer', min: 0, max: 1 },
      { name: 'Anti-CASPR2 Antibody', val: '', unit: 'titer', min: 0, max: 1 }
    ]
  },
  thyroid: {
    name: 'Thyroid Panel',
    category: 'Endocrinology',
    markers: [
      { name: 'TSH', val: '', unit: 'µIU/mL', min: 0.4, max: 4.0 },
      { name: 'Free T4', val: '', unit: 'ng/dL', min: 0.8, max: 1.8 },
      { name: 'Free T3', val: '', unit: 'pg/mL', min: 2.3, max: 4.2 }
    ]
  },
  diabetic: {
    name: 'Diabetic Monitoring Panel',
    category: 'Endocrinology',
    markers: [
      { name: 'HbA1c', val: '', unit: '%', min: 4.0, max: 5.6 },
      { name: 'Fasting Blood Sugar', val: '', unit: 'mg/dL', min: 70, max: 99 },
      { name: 'Post-Prandial Glucose', val: '', unit: 'mg/dL', min: 80, max: 139 },
      { name: 'Fasting Insulin', val: '', unit: 'µIU/mL', min: 2.6, max: 24.9 }
    ]
  },
  renal: {
    name: 'Renal Function Panel',
    category: 'Nephrology',
    markers: [
      { name: 'BUN (Blood Urea Nitrogen)', val: '', unit: 'mg/dL', min: 7, max: 20 },
      { name: 'Creatinine', val: '', unit: 'mg/dL', min: 0.6, max: 1.2 },
      { name: 'eGFR', val: '', unit: 'mL/min/1.73m²', min: 90, max: 150 }
    ]
  },
  electrolyte: {
    name: 'Electrolyte Panel',
    category: 'Nephrology',
    markers: [
      { name: 'Sodium', val: '', unit: 'mmol/L', min: 135, max: 145 },
      { name: 'Potassium', val: '', unit: 'mmol/L', min: 3.5, max: 5.1 },
      { name: 'Chloride', val: '', unit: 'mmol/L', min: 96, max: 106 },
      { name: 'Calcium', val: '', unit: 'mg/dL', min: 8.5, max: 10.2 }
    ]
  },
  anemia: {
    name: 'Anemia Workup Panel',
    category: 'Hematology',
    markers: [
      { name: 'Serum Iron', val: '', unit: 'µg/dL', min: 50, max: 170 },
      { name: 'Total Iron Binding Capacity (TIBC)', val: '', unit: 'µg/dL', min: 250, max: 450 },
      { name: 'Ferritin', val: '', unit: 'ng/mL', min: 30, max: 400 },
      { name: 'Transferrin Saturation', val: '', unit: '%', min: 20, max: 50 }
    ]
  },
  liver_function: {
    name: 'Liver Function Test (LFT)',
    category: 'Hepatology',
    markers: [
      { name: 'Total Bilirubin', val: '', unit: 'mg/dL', min: 0.2, max: 1.2 },
      { name: 'SGOT (AST)', val: '', unit: 'U/L', min: 8, max: 48 },
      { name: 'SGPT (ALT)', val: '', unit: 'U/L', min: 7, max: 55 },
      { name: 'Alkaline Phosphatase', val: '', unit: 'U/L', min: 40, max: 129 },
      { name: 'Total Protein', val: '', unit: 'g/dL', min: 6.3, max: 7.9 },
      { name: 'Albumin', val: '', unit: 'g/dL', min: 3.5, max: 5.0 }
    ]
  },
  urine: {
    name: 'Urine Analysis',
    category: 'General',
    markers: [
      { name: 'Specific Gravity', val: '', unit: '', min: 1.005, max: 1.030 },
      { name: 'pH', val: '', unit: '', min: 4.5, max: 8.0 },
      { name: 'Protein', val: '', unit: 'g/L', min: 0, max: 0.15 },
      { name: 'Glucose', val: '', unit: 'mmol/L', min: 0, max: 0.8 }
    ]
  }
};

export default function LabPortal() {
  const [reports, setReports] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    patientId: '',
    testName: '',
    resultSummary: '',
    fileUrl: '',
  });

  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [markers, setMarkers] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterLogsByPatient, setFilterLogsByPatient] = useState(true);
  const [patientsList, setPatientsList] = useState([]);

  useEffect(() => {
    fetchReports();
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/api/patients/all');
      setPatientsList(res.data);
    } catch (err) {
      console.error("Error loading patients directory:", err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/api/lab/reports');
      setReports(res.data);
    } catch (err) { console.error("Error loading lab reports:", err); }
  };

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (templateKey && TEST_TEMPLATES[templateKey]) {
      setMarkers(TEST_TEMPLATES[templateKey].markers.map(m => ({ ...m })));
      setUploadForm(prev => ({ ...prev, testName: TEST_TEMPLATES[templateKey].name }));
    } else {
      setMarkers([]);
      if (templateKey === 'custom') {
        setUploadForm(prev => ({ ...prev, testName: 'Custom Diagnostics Panel' }));
      }
    }
  };

  const handleAddMarker = () => {
    setMarkers(prev => [...prev, { name: '', val: '', unit: '', min: 0, max: 100 }]);
  };

  const handleRemoveMarker = (index) => {
    setMarkers(prev => prev.filter((_, i) => i !== index));
  };

  const handleMarkerChange = (index, field, value) => {
    const updated = [...markers];
    updated[index][field] = value;
    setMarkers(updated);
  };

  const processOrder = (order) => {
    setSelectedOrder(order);
    setUploadForm({
      patientId: order.patient?.id || '',
      testName: order.testName,
      resultSummary: '',
      fileUrl: ''
    });

    const nameLower = order.testName.toLowerCase();
    if (nameLower.includes('cbc') || nameLower.includes('blood') || nameLower.includes('count')) {
      handleTemplateChange('cbc');
    } else if (nameLower.includes('lipid') || nameLower.includes('cholesterol') || nameLower.includes('fat')) {
      handleTemplateChange('lipid');
    } else if (nameLower.includes('cardiac') || nameLower.includes('biomarker') || nameLower.includes('troponin')) {
      handleTemplateChange('cardiac_enzymes');
    } else if (nameLower.includes('coagulation') || nameLower.includes('prothrombin') || nameLower.includes('inr')) {
      handleTemplateChange('coagulation');
    } else if (nameLower.includes('neuro-metabolic') || nameLower.includes('metabolic screen') || nameLower.includes('vitamin b12')) {
      handleTemplateChange('neuro_metabolic');
    } else if (nameLower.includes('csf') || nameLower.includes('cerebrospinal') || nameLower.includes('spinal fluid')) {
      handleTemplateChange('csf_panel');
    } else if (nameLower.includes('autoimmune') || nameLower.includes('nmdar')) {
      handleTemplateChange('neuro_autoimmune');
    } else if (nameLower.includes('diabetic') || nameLower.includes('hba1c') || nameLower.includes('insulin')) {
      handleTemplateChange('diabetic');
    } else if (nameLower.includes('renal') || nameLower.includes('kidney') || nameLower.includes('creatinine')) {
      handleTemplateChange('renal');
    } else if (nameLower.includes('electrolyte') || nameLower.includes('sodium') || nameLower.includes('potassium')) {
      handleTemplateChange('electrolyte');
    } else if (nameLower.includes('anemia') || nameLower.includes('iron') || nameLower.includes('ferritin')) {
      handleTemplateChange('anemia');
    } else if (nameLower.includes('liver') || nameLower.includes('lft') || nameLower.includes('bilirubin') || nameLower.includes('hepatology')) {
      handleTemplateChange('liver_function');
    } else if (nameLower.includes('urine')) {
      handleTemplateChange('urine');
    } else if (nameLower.includes('thyroid') || nameLower.includes('tsh')) {
      handleTemplateChange('thyroid');
    } else {
      handleTemplateChange('custom');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMessage(`Loaded ordered test "${order.testName}" for patient ID ${order.patient?.id || order.patient}. Fill in parameters below.`);
  };

  const downloadReportText = (report) => {
    if (!report) return;
    const fileContent = `SMART HOSPITAL DIAGNOSTICS LABORATORY
====================================================
Patient Name: ${report.patient?.name || 'N/A'} (ID: ${report.patient?.id || 'N/A'})
Test Name:    ${report.testName}
Test Date:    ${report.testDate}
Diagnosed By: ${report.uploadedBy}
Status:       ${report.status}
====================================================

${report.resultSummary}

====================================================
Thank you for choosing Smart Hospital.
Disclaimer: Please consult with your physician for clinical interpretation.
`;

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.testName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report_patient_${report.patient?.id || 'unknown'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const calculateResultSummary = () => {
    if (markers.length === 0) {
      alert("Please select a test template or add custom markers first.");
      return;
    }

    let summaryText = `📋 DIAGNOSTICS REPORT: ${uploadForm.testName || 'Lab Panel'}\n`;
    summaryText += `Generated: ${new Date().toLocaleString()}\n`;
    summaryText += `====================================================\n`;
    summaryText += `${'Parameter'.padEnd(28)} | ${'Value'.padEnd(10)} | ${'Status'.padEnd(8)} | Ref Range\n`;
    summaryText += `----------------------------------------------------\n`;

    let highMarkers = [];
    let lowMarkers = [];
    let unfilledCount = 0;

    markers.forEach(m => {
      if (m.val === '') {
        unfilledCount++;
        summaryText += `${m.name.substring(0, 28).padEnd(28)} | ${'N/A'.padEnd(10)} | ${'Pending'.padEnd(8)} | ${m.min}-${m.max} ${m.unit}\n`;
        return;
      }

      const numVal = parseFloat(m.val);
      const minVal = parseFloat(m.min);
      const maxVal = parseFloat(m.max);

      let status = 'Normal';
      if (!isNaN(numVal) && !isNaN(minVal) && !isNaN(maxVal)) {
        if (numVal < minVal) {
          status = 'LOW 📉';
          lowMarkers.push(`${m.name} (${m.val} ${m.unit} < min: ${m.min})`);
        } else if (numVal > maxVal) {
          status = 'HIGH 📈';
          highMarkers.push(`${m.name} (${m.val} ${m.unit} > max: ${m.max})`);
        }
      }

      const valStr = `${m.val} ${m.unit}`.trim();
      summaryText += `${m.name.substring(0, 28).padEnd(28)} | ${valStr.substring(0, 10).padEnd(10)} | ${status.padEnd(8)} | ${m.min}-${m.max} ${m.unit}\n`;
    });

    summaryText += `====================================================\n`;
    
    if (highMarkers.length === 0 && lowMarkers.length === 0) {
      summaryText += `✅ CONCLUSION: All tested parameters are within normal reference ranges.\n`;
    } else {
      summaryText += `⚠️ CONCLUSION: ABNORMAL CLINICAL FINDINGS DETECTED.\n`;
      if (highMarkers.length > 0) {
        summaryText += `📈 Elevated:\n` + highMarkers.map(item => `  - ${item}`).join('\n') + '\n';
      }
      if (lowMarkers.length > 0) {
        summaryText += `📉 Decreased:\n` + lowMarkers.map(item => `  - ${item}`).join('\n') + '\n';
      }
      summaryText += `Please consult with your physician for diagnostic review.`;
    }

    setUploadForm(prev => ({
      ...prev,
      resultSummary: summaryText
    }));

    if (unfilledCount > 0) {
      setMessage(`Results compiled with ${unfilledCount} unfilled parameter(s).`);
    } else {
      setMessage('Diagnostic calculations complete! Summary auto-generated.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.patientId || !uploadForm.testName || !uploadForm.resultSummary) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await api.post('/api/lab/upload', null, {
        params: {
          patientId: uploadForm.patientId,
          testName: uploadForm.testName,
          resultSummary: uploadForm.resultSummary,
          fileUrl: uploadForm.fileUrl || undefined,
          reportId: selectedOrder ? selectedOrder.id : undefined
        }
      });
      setMessage('Lab report finalized and saved! Laboratory test fee (₹30) issued to patient.');
      setUploadForm({ patientId: '', testName: '', resultSummary: '', fileUrl: '' });
      setSelectedTemplate('');
      setMarkers([]);
      setSelectedOrder(null);
      fetchReports();
    } catch (err) {
      setMessage('Error uploading report. Verify Patient ID is valid.');
    }
  };

  const pendingOrders = reports.filter(r => r.status === 'PENDING' || r.status === 'SAMPLE_COLLECTED');
  
  // Filter completed reports by active Patient ID if toggle is enabled
  const completedReports = reports.filter(r => {
    if (r.status !== 'COMPLETED') return false;
    if (filterLogsByPatient && uploadForm.patientId) {
      return r.patient?.id?.toString() === uploadForm.patientId.toString();
    }
    return true;
  });

  return (
    <div className="container py-4 animate-fade-in">
      <h2 className="fw-bold mb-4">Laboratory <span className="gradient-text">Diagnostics Portal</span></h2>

      {message && (
        <div className="alert alert-info alert-dismissible fade show rounded-3" role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row g-4">
        {/* Upload and Calculator Form */}
        <div className="col-lg-5">
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-3"><i className="bi bi-file-earmark-medical-fill text-primary me-2"></i>Diagnostics Calculator</h4>
            <form onSubmit={handleUpload}>
              {selectedOrder && (
                <div className="alert alert-info border border-info-subtle rounded-3 p-3 mb-3 text-start small d-flex flex-column gap-1 animate-scale-up">
                  <div className="fw-bold text-info-emphasis mb-1"><i className="bi bi-person-fill me-1"></i>Active Processing Order Details:</div>
                  <div><strong>Patient Name:</strong> <span className="fw-semibold text-dark">{selectedOrder.patient?.name || 'N/A'}</span></div>
                  <div><strong>Patient ID:</strong> <span className="fw-semibold text-dark">{selectedOrder.patient?.id}</span></div>
                  <div><strong>Ordered Test:</strong> <span className="fw-semibold text-dark">{selectedOrder.testName}</span></div>
                  <div className="mt-1">
                    <strong>Sample Status:</strong>{" "}
                    <span className={`badge ${selectedOrder.status === 'SAMPLE_COLLECTED' ? 'bg-success text-white' : 'bg-warning text-dark'} border`}>
                      {selectedOrder.status === 'SAMPLE_COLLECTED' ? 'Sample Received' : 'Awaiting Sample'}
                    </span>
                  </div>
                </div>
              )}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Patient ID</label>
                <input type="number" className="form-control rounded-3" placeholder="Enter Patient ID (e.g. 1)" value={uploadForm.patientId} onChange={e => setUploadForm({...uploadForm, patientId: e.target.value})} required />
                {patientsList.find(p => p.id?.toString() === uploadForm.patientId?.toString()) && (
                  <div className="mt-1.5 small text-success fw-bold animate-fade-in d-flex align-items-center gap-1">
                    <i className="bi bi-person-check-fill fs-6"></i>
                    <span>Verified Patient: <span className="text-dark fw-extrabold">{patientsList.find(p => p.id?.toString() === uploadForm.patientId?.toString())?.name}</span></span>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Select Test Template</label>
                <select className="form-select rounded-3" value={selectedTemplate} onChange={e => handleTemplateChange(e.target.value)}>
                  <option value="">-- Choose Standard Panel --</option>
                  <optgroup label="Cardiology (Cardio) Panel">
                    <option value="lipid">Lipid Profile</option>
                    <option value="cardiac_enzymes">Cardiac Biomarkers Panel</option>
                    <option value="coagulation">Coagulation Profile</option>
                  </optgroup>
                  <optgroup label="Neurology (Neuro) Panel">
                    <option value="neuro_metabolic">Neuro-Metabolic Screen</option>
                    <option value="csf_panel">Cerebrospinal Fluid (CSF) Panel</option>
                    <option value="neuro_autoimmune">Neuro-Autoimmune Panel</option>
                  </optgroup>
                  <optgroup label="Endocrinology Panel">
                    <option value="thyroid">Thyroid Panel</option>
                    <option value="diabetic">Diabetic Monitoring Panel</option>
                  </optgroup>
                  <optgroup label="Nephrology & Electrolytes">
                    <option value="renal">Renal Function Panel</option>
                    <option value="electrolyte">Electrolyte Panel</option>
                  </optgroup>
                  <optgroup label="Hematology & Hepatology">
                    <option value="cbc">Complete Blood Count (CBC)</option>
                    <option value="anemia">Anemia Workup Panel</option>
                    <option value="liver_function">Liver Function Test (LFT)</option>
                  </optgroup>
                  <optgroup label="General Diagnostics">
                    <option value="urine">Urine Analysis</option>
                    <option value="custom">Custom Panel (Add Markers)</option>
                  </optgroup>
                </select>
              </div>

              {/* Dynamic Markers Inputs list */}
              {markers.length > 0 && (
                <div className="card p-3 mb-3 bg-white border border-light-subtle rounded-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-dark small">Marker Fields</span>
                    {selectedTemplate === 'custom' && (
                      <button type="button" className="btn btn-xs btn-outline-primary rounded-2 py-0.5 px-2 small" onClick={handleAddMarker}>
                        <i className="bi bi-plus-lg me-1"></i>Add
                      </button>
                    )}
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="table table-sm table-borderless align-middle mb-0" style={{ minWidth: '380px' }}>
                      <thead>
                        <tr className="small text-muted border-bottom" style={{ fontSize: '0.75rem' }}>
                          <th>Name</th>
                          <th style={{ width: '90px' }}>Value</th>
                          <th style={{ width: '65px' }}>Unit</th>
                          <th style={{ width: '55px' }}>Min</th>
                          <th style={{ width: '55px' }}>Max</th>
                          {selectedTemplate === 'custom' && <th style={{ width: '35px' }}></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {markers.map((m, idx) => (
                          <tr key={idx}>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm rounded-2 text-dark"
                                style={{ fontSize: '0.8rem' }}
                                placeholder="Marker"
                                value={m.name}
                                onChange={e => handleMarkerChange(idx, 'name', e.target.value)}
                                disabled={selectedTemplate !== 'custom'}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="any"
                                className="form-control form-control-sm rounded-2 text-dark"
                                style={{ fontSize: '0.8rem' }}
                                placeholder="Val"
                                value={m.val}
                                onChange={e => handleMarkerChange(idx, 'val', e.target.value)}
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm rounded-2 text-muted"
                                style={{ fontSize: '0.8rem' }}
                                placeholder="Unit"
                                value={m.unit}
                                onChange={e => handleMarkerChange(idx, 'unit', e.target.value)}
                                disabled={selectedTemplate !== 'custom'}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="any"
                                className="form-control form-control-sm rounded-2 text-muted"
                                style={{ fontSize: '0.8rem' }}
                                placeholder="Min"
                                value={m.min}
                                onChange={e => handleMarkerChange(idx, 'min', e.target.value)}
                                disabled={selectedTemplate !== 'custom'}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="any"
                                className="form-control form-control-sm rounded-2 text-muted"
                                style={{ fontSize: '0.8rem' }}
                                placeholder="Max"
                                value={m.max}
                                onChange={e => handleMarkerChange(idx, 'max', e.target.value)}
                                disabled={selectedTemplate !== 'custom'}
                              />
                            </td>
                            {selectedTemplate === 'custom' && (
                              <td>
                                <button type="button" className="btn btn-sm btn-outline-danger border-0 p-1" onClick={() => handleRemoveMarker(idx)}>
                                  <i className="bi bi-trash-fill"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-secondary w-100 mt-2 rounded-3" onClick={calculateResultSummary}>
                    <i className="bi bi-calculator me-2"></i>Calculate & Generate Findings
                  </button>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Test / Lab Panel Name</label>
                <input type="text" className="form-control rounded-3" placeholder="e.g. Complete Blood Count" value={uploadForm.testName} onChange={e => setUploadForm({...uploadForm, testName: e.target.value})} required />
              </div>
              
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Diagnostics Findings (Summary)</label>
                <textarea className="form-control rounded-3 font-monospace small bg-white text-dark" rows="5" placeholder="Click 'Calculate & Generate Findings' or enter findings summary text details" value={uploadForm.resultSummary} onChange={e => setUploadForm({...uploadForm, resultSummary: e.target.value})} required></textarea>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Report File Link (PDF)</label>
                <input type="text" className="form-control rounded-3" placeholder="e.g. /reports/cbc-result.pdf" value={uploadForm.fileUrl} onChange={e => setUploadForm({...uploadForm, fileUrl: e.target.value})} />
              </div>

              <button type="submit" className="btn btn-premium-primary w-100 rounded-3">Upload & Finalize Lab Test</button>
            </form>
          </div>
        </div>

        {/* Orders Queue and Reports Log */}
        <div className="col-lg-7">
          {/* Doctor Orders Queue Card */}
          <div className="glass-card p-4 mb-4 border-warning bg-warning bg-opacity-10">
            <h4 className="fw-bold mb-3 text-warning-emphasis"><i className="bi bi-collection-play-fill me-2"></i>Prescribed Lab Orders Queue</h4>
            {pendingOrders.length === 0 ? (
              <p className="text-muted small mb-0">No pending test prescriptions ordered by doctors.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle bg-white rounded-3 overflow-hidden shadow-sm border border-warning-subtle">
                  <thead className="table-warning">
                    <tr style={{ fontSize: '0.85rem' }}>
                      <th>Patient</th>
                      <th>Test Name</th>
                      <th>Sample Status</th>
                      <th>Ordered By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <span className="fw-bold text-dark">{order.patient?.name}</span>
                          <span className="text-muted small block">ID: {order.patient?.id}</span>
                        </td>
                        <td><span className="badge bg-secondary-subtle text-secondary-emphasis">{order.testName}</span></td>
                        <td>
                          <span className={`badge ${order.status === 'SAMPLE_COLLECTED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} border`}>
                            {order.status === 'SAMPLE_COLLECTED' ? 'Sample Received' : 'Awaiting Sample'}
                          </span>
                        </td>
                        <td><span className="small text-muted font-monospace">{order.uploadedBy}</span></td>
                        <td>
                          <button className="btn btn-sm btn-warning rounded-2 fw-semibold px-3 py-1" onClick={() => processOrder(order)}>
                            <i className="bi bi-gear-fill me-1"></i>Process
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Completed Reports Logs */}
          <div className="glass-card p-4 table-responsive border-success">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3">
              <h4 className="fw-bold mb-0 text-success-emphasis"><i className="bi bi-journal-medical me-2"></i>Completed Diagnostics Logs</h4>
              {uploadForm.patientId && (
                <div className="form-check form-switch mt-2 mt-sm-0 bg-success bg-opacity-10 px-4 py-1.5 rounded-3 border border-success-subtle d-flex align-items-center gap-2">
                  <input 
                    className="form-check-input ms-0" 
                    type="checkbox" 
                    id="filterPatientSwitch" 
                    checked={filterLogsByPatient} 
                    onChange={e => setFilterLogsByPatient(e.target.checked)} 
                    style={{ cursor: 'pointer' }}
                  />
                  <label className="form-check-label small text-success-emphasis fw-semibold" htmlFor="filterPatientSwitch" style={{ cursor: 'pointer' }}>
                    Show only Patient ID #{uploadForm.patientId}
                  </label>
                </div>
              )}
            </div>
            {completedReports.length === 0 ? (
              <p className="text-muted small mb-0">No finalized diagnostic reports found for the current query.</p>
            ) : (
              <table className="table table-hover align-middle">
                <thead>
                  <tr style={{ fontSize: '0.85rem' }}>
                    <th>Patient Name</th>
                    <th>Test Panel</th>
                    <th>Date</th>
                    <th>Diagnosed By</th>
                    <th style={{ width: '135px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedReports.map(rep => (
                    <tr key={rep.id}>
                      <td className="fw-semibold text-primary">{rep.patient?.name} <span className="text-muted small block">ID: {rep.patient?.id}</span></td>
                      <td>{rep.testName}</td>
                      <td className="small">{rep.testDate}</td>
                      <td><span className="badge bg-success bg-opacity-10 text-success border border-success-subtle font-monospace px-2 py-1">{rep.uploadedBy}</span></td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary rounded-2 py-1 px-2" onClick={() => setSelectedReport(rep)}>
                            <i className="bi bi-eye"></i> View
                          </button>
                          <button className="btn btn-sm btn-outline-success rounded-2 py-1 px-2" onClick={() => downloadReportText(rep)}>
                            <i className="bi bi-download"></i> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Selected Report Detailed Popup Modal */}
      {selectedReport && (
        <div className="modal fade show d-block animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-premium-primary text-white border-0 p-3">
                <h5 className="modal-title fw-bold"><i className="bi bi-file-earmark-medical me-2"></i>Lab Diagnostic Visual Findings Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReport(null)}></button>
              </div>
              <div className="modal-body p-4 bg-light" style={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}>
                <VisualReport report={selectedReport} />
              </div>
              <div className="modal-footer border-0 p-3 bg-light d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-premium-primary rounded-3 px-4" onClick={() => setSelectedReport(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
