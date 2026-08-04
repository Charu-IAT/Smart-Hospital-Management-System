package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/insurance")
public class InsuranceController {

    private final InsuranceRepository insuranceRepository;
    private final PatientRepository patientRepository;
    private final BillingRepository billingRepository;

    public InsuranceController(InsuranceRepository insuranceRepository, PatientRepository patientRepository,
                               BillingRepository billingRepository) {
        this.insuranceRepository = insuranceRepository;
        this.patientRepository = patientRepository;
        this.billingRepository = billingRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Insurance>> getAllInsurance() {
        return ResponseEntity.ok(insuranceRepository.findAll());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getInsuranceByPatient(@PathVariable Long patientId) {
        Optional<Insurance> ins = insuranceRepository.findByPatientId(patientId);
        if (ins.isPresent()) {
            return ResponseEntity.ok(ins.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Insurance> verifyInsurance(@RequestParam Long patientId,
                                                     @RequestParam String policyNumber,
                                                     @RequestParam String provider,
                                                     @RequestParam String coverageDetails) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Insurance ins = insuranceRepository.findByPatientId(patientId).orElse(new Insurance());
        ins.setPatient(patient);
        ins.setPolicyNumber(policyNumber);
        ins.setProvider(provider);
        ins.setCoverageDetails(coverageDetails);
        ins.setStatus("VERIFIED");

        return ResponseEntity.ok(insuranceRepository.save(ins));
    }

    @PostMapping("/claim")
    public ResponseEntity<Billing> processClaim(@RequestParam Long billingId) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (!billing.getStatus().equals("UNPAID")) {
            throw new RuntimeException("Bill status is: " + billing.getStatus() + ". Claim cannot be submitted.");
        }

        // Verify patient has insurance
        Insurance ins = insuranceRepository.findByPatientId(billing.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("No active insurance found for patient"));

        if (!ins.getStatus().equals("VERIFIED")) {
            throw new RuntimeException("Insurance policy is not verified");
        }

        // Apply insurance coverage
        billing.setStatus("CLAIMED");
        Billing updatedBill = billingRepository.save(billing);

        return ResponseEntity.ok(updatedBill);
    }

    @PutMapping("/claim/{billingId}/approve")
    public ResponseEntity<Billing> approveClaim(@PathVariable Long billingId, @RequestParam Boolean approve) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (!billing.getStatus().equals("CLAIMED")) {
            throw new RuntimeException("Billing is not pending claim approval");
        }

        if (approve) {
            billing.setStatus("PAID");
        } else {
            billing.setStatus("UNPAID");
        }

        return ResponseEntity.ok(billingRepository.save(billing));
    }
}
