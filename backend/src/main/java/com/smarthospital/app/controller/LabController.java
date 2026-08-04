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
                                                  @RequestParam(required = false) String fileUrl) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String uploader = auth.getName();

        LabReport report = new LabReport();
        report.setPatient(patient);
        report.setTestName(testName);
        report.setTestDate(LocalDate.now());
        report.setResultSummary(resultSummary);
        report.setFileUrl(fileUrl != null ? fileUrl : "/reports/sample-lab-report.pdf");
        report.setUploadedBy(uploader);
        report.setStatus("COMPLETED");

        LabReport savedReport = labReportRepository.save(report);

        // Generate laboratory fee billing
        Billing billing = new Billing();
        billing.setPatient(patient);
        billing.setLabFee(BigDecimal.valueOf(30.00));
        billing.setTotalAmount(BigDecimal.valueOf(30.00));
        billing.setStatus("UNPAID");
        billing.setBillingDate(LocalDate.now());
        billingRepository.save(billing);

        return ResponseEntity.ok(savedReport);
    }
}
