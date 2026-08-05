package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lab")
public class LabController {

    private final LabReportRepository labReportRepository;
    private final PatientRepository patientRepository;
    private final BillingRepository billingRepository;

    public LabController(LabReportRepository labReportRepository, PatientRepository patientRepository,
                         BillingRepository billingRepository) {
        this.labReportRepository = labReportRepository;
        this.patientRepository = patientRepository;
        this.billingRepository = billingRepository;
    }

    @GetMapping("/reports")
    public ResponseEntity<List<LabReport>> getAllReports() {
        return ResponseEntity.ok(labReportRepository.findAll());
    }

    @PostMapping("/upload")
    public ResponseEntity<LabReport> uploadReport(@RequestParam Long patientId,
                                                  @RequestParam String testName,
                                                  @RequestParam String resultSummary,
                                                  @RequestParam(required = false) String fileUrl,
                                                  @RequestParam(required = false) Long reportId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String uploader = auth.getName();

        LabReport report = null;
        if (reportId != null) {
            report = labReportRepository.findById(reportId).orElse(null);
        }

        if (report == null) {
            // Fallback to name search
            java.util.List<LabReport> pendingOrders = labReportRepository.findByPatientId(patientId).stream()
                    .filter(r -> (r.getStatus().equals("PENDING") || r.getStatus().equals("SAMPLE_COLLECTED")) && r.getTestName().equalsIgnoreCase(testName))
                    .collect(java.util.stream.Collectors.toList());
            if (!pendingOrders.isEmpty()) {
                report = pendingOrders.get(0);
            }
        }

        if (report == null) {
            report = new LabReport();
            report.setPatient(patient);
            report.setTestName(testName);
        }

        report.setTestDate(LocalDate.now());
        report.setResultSummary(resultSummary);
        report.setFileUrl(fileUrl != null ? fileUrl : "/reports/sample-lab-report.pdf");
        report.setUploadedBy(uploader);
        report.setStatus("COMPLETED");

        LabReport savedReport = labReportRepository.save(report);

        return ResponseEntity.ok(savedReport);
    }

    @PostMapping("/order")
    public ResponseEntity<LabReport> orderTest(@RequestParam Long patientId,
                                               @RequestParam String testName,
                                               @RequestParam(required = false) Double price) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        org.springframework.security.core.Authentication auth = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String doctorName = auth != null ? auth.getName() : "DOCTOR";

        LabReport report = new LabReport();
        report.setPatient(patient);
        report.setTestName(testName);
        report.setTestDate(LocalDate.now());
        report.setResultSummary("Awaiting clinical collection & lab analysis.");
        report.setFileUrl("");
        report.setUploadedBy(doctorName);
        report.setStatus("PENDING");

        LabReport savedReport = labReportRepository.save(report);

        double testPrice = price != null ? price : 30.00;

        // Consolidate laboratory fee into patient's existing unpaid invoice
        List<Billing> patientBills = billingRepository.findByPatientId(patient.getId());
        Billing billing = patientBills.stream()
                .filter(b -> b.getStatus().equals("UNPAID"))
                .reduce((first, second) -> second)
                .orElse(null);

        if (billing != null) {
            BigDecimal currentLabFee = billing.getLabFee() != null ? billing.getLabFee() : BigDecimal.ZERO;
            billing.setLabFee(currentLabFee.add(BigDecimal.valueOf(testPrice)));
            BigDecimal consultation = billing.getConsultationFee() != null ? billing.getConsultationFee() : BigDecimal.ZERO;
            BigDecimal pharmacy = billing.getPharmacyFee() != null ? billing.getPharmacyFee() : BigDecimal.ZERO;
            billing.setTotalAmount(consultation.add(billing.getLabFee()).add(pharmacy));
            billingRepository.save(billing);
        } else {
            billing = new Billing();
            billing.setPatient(patient);
            billing.setLabFee(BigDecimal.valueOf(testPrice));
            billing.setTotalAmount(BigDecimal.valueOf(testPrice));
            billing.setStatus("UNPAID");
            billing.setBillingDate(LocalDate.now());
            billingRepository.save(billing);
        }

        return ResponseEntity.ok(savedReport);
    }

    @PutMapping("/reports/{id}/sample")
    public ResponseEntity<LabReport> collectSample(@PathVariable Long id) {
        LabReport report = labReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab report not found"));
        report.setStatus("SAMPLE_COLLECTED");
        return ResponseEntity.ok(labReportRepository.save(report));
    }
}
