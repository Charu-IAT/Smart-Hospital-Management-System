import React from 'react';

// Parser to turn text result summary into JSON objects
export const parseReportSummary = (summary) => {
  if (!summary) return null;
  const lines = summary.split('\n');
  const parameters = [];
  let conclusion = '';
  let isParsingParams = false;

  for (let line of lines) {
    if (line.includes('Parameter') && line.includes('Value')) {
      isParsingParams = true;
      continue;
    }
    if (line.includes('====') && isParsingParams) {
      isParsingParams = false;
      continue;
    }
    if (isParsingParams && line.trim() && !line.includes('----')) {
      const parts = line.split('|');
      if (parts.length >= 4) {
        const name = parts[0].trim();
        const valueRaw = parts[1].trim();
        const status = parts[2].trim();
        const range = parts[3].trim();

        // Extract numeric value if present
        const valMatch = valueRaw.match(/^([0-9.-]+)/);
        const valNum = valMatch ? parseFloat(valMatch[1]) : null;

        // Extract min and max range bounds
        // Remove units or brackets to avoid messing up floats
        const rangeClean = range.replace(/[a-zA-Z³/µL%²<>]/g, '').trim();
        const rangeParts = rangeClean.split('-');
        let minVal = null;
        let maxVal = null;

        if (rangeParts.length >= 2) {
          minVal = parseFloat(rangeParts[0].trim());
          maxVal = parseFloat(rangeParts[1].trim());
        } else if (rangeParts.length === 1 && rangeParts[0].trim() !== '') {
          // Single value limit like < 200 or < 0.15
          if (range.includes('<')) {
            minVal = 0;
            maxVal = parseFloat(rangeParts[0].trim());
          } else if (range.includes('>')) {
            minVal = parseFloat(rangeParts[0].trim());
            maxVal = 99999;
          }
        }

        parameters.push({
          name,
          valueStr: valueRaw,
          valueNum: isNaN(valNum) || valNum === null ? null : valNum,
          status,
          rangeStr: range,
          min: isNaN(minVal) || minVal === null ? null : minVal,
          max: isNaN(maxVal) || maxVal === null ? null : maxVal,
        });
      }
    }
    if (line.includes('CONCLUSION:')) {
      conclusion = line.split('CONCLUSION:')[1].trim();
    } else if (conclusion && line.trim() && !line.includes('Thank you') && !line.includes('Disclaimer')) {
      conclusion += '\n' + line.trim();
    }
  }

  return { parameters, conclusion };
};

// Calculates needle position (0-100%) on the range slider
const getPointerPosition = (val, min, max) => {
  if (val === null || min === null || max === null) return 50;
  if (min === max) return 50;

  if (val < min) {
    const lowBound = min - (max - min) * 0.5;
    if (val <= lowBound) return 5;
    return 5 + 20 * (val - lowBound) / (min - lowBound);
  } else if (val > max) {
    const highBound = max + (max - min) * 0.5;
    if (val >= highBound) return 95;
    return 75 + 20 * (val - max) / (highBound - max);
  } else {
    // Normal range falls between 25% and 75%
    return 25 + 50 * (val - min) / (max - min);
  }
};

export default function VisualReport({ report, onBack }) {
  if (!report) return null;

  const parsed = parseReportSummary(report.resultSummary);
  const parameters = parsed ? parsed.parameters : [];
  const conclusion = parsed ? parsed.conclusion : '';

  // Compute metrics for the Optimal Ring Chart
  const totalCount = parameters.length;
  const normalCount = parameters.filter(
    (p) => p.status.toLowerCase().includes('normal') || (!p.status.toLowerCase().includes('low') && !p.status.toLowerCase().includes('high'))
  ).length;
  const abnormalCount = totalCount - normalCount;
  const optimalPercentage = totalCount > 0 ? Math.round((normalCount / totalCount) * 100) : 100;

  // Circle SVG properties
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (optimalPercentage / 100) * circumference;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="visual-report-container animate-fade-in text-start">
      {/* Action Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 d-print-none">
        {onBack ? (
          <button className="btn btn-outline-secondary btn-sm rounded-3 px-3" onClick={onBack}>
            <i className="bi bi-arrow-left-short fs-5 align-middle"></i> Back to List
          </button>
        ) : (
          <div />
        )}
        <button className="btn btn-premium-primary btn-sm rounded-3 px-3" onClick={handlePrint}>
          <i className="bi bi-printer me-2"></i> Print Visual Report
        </button>
      </div>

      {/* Main Clinical Report Document */}
      <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white p-4 p-md-5 medical-report-print">
        
        {/* Document Header */}
        <div className="row align-items-center mb-4 border-bottom pb-4">
          <div className="col-md-7 text-start">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-activity text-primary fs-3"></i>
              <span className="fs-4 fw-extrabold text-dark tracking-tight">SMART DIAGNOSTICS LAB</span>
            </div>
            <p className="text-muted small mb-0">Smart Hospital Road, Suite 400 • Phone: +91 9524980991</p>
            <p className="text-muted small mb-0">NABL Accredited Diagnostics Lab Facility</p>
          </div>
          <div className="col-md-5 text-md-end mt-3 mt-md-0">
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 fs-6 rounded-pill fw-bold">
              OFFICIAL LABORATORY REPORT
            </span>
            <p className="text-muted small mt-2 mb-0"><strong>Report ID:</strong> LAB-RPT-00{report.id}</p>
          </div>
        </div>

        {/* Patient Demographics Card */}
        <div className="row g-3 p-4 bg-light bg-opacity-50 rounded-4 border mb-4">
          <div className="col-md-4 col-sm-6">
            <span className="text-muted small d-block">Patient Name</span>
            <span className="fw-bold text-dark fs-5">{report.patient?.name || 'N/A'}</span>
          </div>
          <div className="col-md-2 col-sm-6">
            <span className="text-muted small d-block">Patient ID</span>
            <span className="fw-semibold text-dark font-monospace">#{report.patient?.id || 'N/A'}</span>
          </div>
          <div className="col-md-3 col-sm-6">
            <span className="text-muted small d-block">Age / Gender</span>
            <span className="fw-semibold text-dark">{report.patient?.age || 'N/A'} Yrs / {report.patient?.gender || 'N/A'}</span>
          </div>
          <div className="col-md-3 col-sm-6">
            <span className="text-muted small d-block">Blood Group</span>
            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2.5 py-1 fw-bold">
              {report.patient?.bloodGroup || 'O+'}
            </span>
          </div>

          <div className="col-12"><hr className="my-1 border-light-subtle" /></div>

          <div className="col-md-4 col-sm-6">
            <span className="text-muted small d-block">Requested Diagnostic Test</span>
            <span className="fw-bold text-primary">{report.testName}</span>
          </div>
          <div className="col-md-4 col-sm-6">
            <span className="text-muted small d-block">Test Date / Finalized</span>
            <span className="fw-semibold text-dark">{report.testDate}</span>
          </div>
        </div>

        {/* If we have parameters, render the standard visual charts/sliders */}
        {parameters.length > 0 ? (
          <>
            {/* Health Score and conclusion banner */}
            <div className="row g-4 mb-4">
              {/* Circular Score Gauge */}
              <div className="col-lg-4 text-center">
                <div className="card border-light-subtle rounded-4 p-4 shadow-sm h-100 bg-white d-flex flex-column align-items-center justify-content-center">
                  <h6 className="fw-bold text-muted mb-3">Diagnostic Summary</h6>
                  <div className="position-relative d-inline-flex mb-2">
                    <svg width="120" height="120" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#e6e6e6"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={optimalPercentage >= 80 ? '#10b981' : optimalPercentage >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.8s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                      />
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <span className="fs-3 fw-extrabold text-dark block">{optimalPercentage}%</span>
                      <span className="small text-muted block" style={{ fontSize: '0.65rem' }}>Optimal</span>
                    </div>
                  </div>
                  <div className="small text-muted mt-2">
                    <strong>{normalCount}</strong> / {totalCount} Parameters Normal
                  </div>
                </div>
              </div>

              {/* Clinical Conclusion Text Card */}
              <div className="col-lg-8">
                <div className={`card rounded-4 p-4 shadow-sm h-100 text-start border ${
                  abnormalCount > 0 
                    ? 'bg-danger bg-opacity-10 border-danger-subtle text-danger-emphasis' 
                    : 'bg-success bg-opacity-10 border-success-subtle text-success-emphasis'
                }`}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className={`bi ${abnormalCount > 0 ? 'bi-exclamation-triangle-fill text-danger' : 'bi-check-circle-fill text-success'} fs-4`}></i>
                    <h5 className="fw-bold mb-0">Clinical Conclusion</h5>
                  </div>
                  <p className="small mb-3 text-muted-emphasis" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {conclusion || 'All clinical markers evaluated are in stable, physiological ranges.'}
                  </p>
                  {abnormalCount > 0 ? (
                    <div className="alert alert-danger bg-white border border-danger-subtle py-2 px-3 rounded-3 mb-0 small">
                      <strong>⚠️ Warning:</strong> {abnormalCount} markers deviate from baseline healthy parameters. Please schedule a clinical consultation with your primary physician for standard medical evaluation.
                    </div>
                  ) : (
                    <div className="alert alert-success bg-white border border-success-subtle py-2 px-3 rounded-3 mb-0 small">
                      <strong>✅ Optimal health:</strong> All markers are successfully within their respective physiological bounds. No clinical action needed.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Parameter Ranges Section */}
            <h5 className="fw-bold text-dark mb-3"><i className="bi bi-graph-up-arrow text-primary me-2"></i>Biological Markers Visual Ranges</h5>
            <div className="row g-3">
              {parameters.map((p, idx) => {
                const isHigh = p.status.toLowerCase().includes('high') || p.status.includes('📈');
                const isLow = p.status.toLowerCase().includes('low') || p.status.includes('📉');
                const hasRange = p.min !== null && p.max !== null;

                // Needle percentage on slider
                const needlePct = hasRange ? getPointerPosition(p.valueNum, p.min, p.max) : 50;

                return (
                  <div key={idx} className="col-12">
                    <div className="card p-3 border-light-subtle rounded-3 shadow-sm bg-white hover-up text-start">
                      <div className="row align-items-center">
                        
                        {/* Marker Metadata */}
                        <div className="col-lg-4 col-md-5 mb-2 mb-md-0">
                          <div className="d-flex align-items-center justify-content-between">
                            <span className="fw-bold text-dark block fs-6">{p.name}</span>
                            <span className={`badge rounded-pill px-2.5 py-1 small ${
                              isHigh ? 'bg-danger bg-opacity-10 text-danger border border-danger-subtle' :
                              isLow ? 'bg-warning bg-opacity-10 text-warning border border-warning-subtle' :
                              'bg-success bg-opacity-10 text-success border border-success-subtle'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                          <div className="mt-1 d-flex align-items-baseline gap-2">
                            <span className="fs-4 fw-extrabold text-primary">{p.valueStr}</span>
                          </div>
                        </div>

                        {/* Visual slider gauge representation */}
                        <div className="col-lg-5 col-md-7 mb-2 mb-md-0">
                          {hasRange ? (
                            <div className="px-2 py-1">
                              {/* Label values above gauge */}
                              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.7rem' }}>
                                <span>Low</span>
                                <span className="text-success fw-bold">Normal Range</span>
                                <span>High</span>
                              </div>
                              
                              {/* Gauge Slider Track */}
                              <div className="position-relative my-2" style={{ height: '10px' }}>
                                {/* Track bar segments */}
                                <div 
                                  className="w-100 h-100 rounded-pill overflow-hidden d-flex"
                                  style={{ 
                                    background: 'linear-gradient(to right, #ffc107 0%, #ffc107 25%, #10b981 25%, #10b981 75%, #ef4444 75%, #ef4444 100%)'
                                  }}
                                />
                                
                                {/* Marker Pin Needle */}
                                <div 
                                  className="position-absolute"
                                  style={{
                                    left: `${needlePct}%`,
                                    top: '-4px',
                                    transform: 'translateX(-50%)',
                                    transition: 'left 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                    zIndex: 10
                                  }}
                                >
                                  <div className="bg-dark rounded-circle shadow-sm border border-white" style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="bg-white rounded-circle" style={{ width: '6px', height: '6px' }} />
                                  </div>
                                </div>
                              </div>

                              {/* Reference Limits underneath */}
                              <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                                <span>&lt; {p.min}</span>
                                <span className="text-dark font-monospace">{p.min} - {p.max}</span>
                                <span>&gt; {p.max}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center bg-light p-2 rounded-3 text-muted small border">
                              <i className="bi bi-info-circle me-1"></i> Qualitatively assessed marker. No numerical slider scale available.
                            </div>
                          )}
                        </div>

                        {/* Numeric Ref Range Text block */}
                        <div className="col-lg-3 col-md-12 text-md-start text-lg-end">
                          <span className="text-muted small block">Physiological Range</span>
                          <strong className="text-dark font-monospace block">{p.rangeStr}</strong>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* If formatting is freeform text, display the qualitative records with a beautiful check/exclamation visual layout */
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="card rounded-4 p-4 shadow-sm border border-light-subtle bg-light bg-opacity-40 text-start">
                <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
                  <i className="bi bi-file-earmark-medical-fill text-primary fs-4"></i>
                  <h5 className="fw-bold mb-0 text-dark">Clinical Diagnostic Summary & Findings</h5>
                </div>
                <div className="list-group list-group-flush bg-transparent">
                  {report.resultSummary
                    .split('\n')
                    .filter(line => line.trim())
                    .map((line, idx) => {
                      const isAlert = line.toLowerCase().includes('elevated') || 
                                      line.toLowerCase().includes('abnormal') || 
                                      line.toLowerCase().includes('high') || 
                                      line.toLowerCase().includes('low') || 
                                      line.includes('⚠️') || 
                                      line.includes('warning') ||
                                      line.toLowerCase().includes('injury') ||
                                      line.toLowerCase().includes('damage');
                      
                      return (
                        <div key={idx} className="list-group-item bg-transparent px-0 py-2.5 border-light-subtle d-flex gap-3 align-items-start">
                          <div className="rounded-circle d-flex align-items-center justify-content-center bg-opacity-10 mt-1" style={{
                            width: '28px',
                            height: '28px',
                            minWidth: '28px',
                            backgroundColor: isAlert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: isAlert ? '#ef4444' : '#10b981'
                          }}>
                            <i className={`bi ${isAlert ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} fs-6`}></i>
                          </div>
                          <div>
                            <p className="mb-0 text-dark fw-semibold" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
                              {line}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Laboratory Footnote */}
        <div className="mt-5 pt-4 border-top text-center text-muted small">
          <p className="mb-1"><strong>Disclaimer:</strong> This visual diagnostics report is generated for standard clinical presentation. Findings should be interpreted by a certified medical practitioner.</p>
          <p className="mb-0">© {new Date().getFullYear()} Smart Hospital Diagnostics. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
