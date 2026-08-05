package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/insurance")
public class InsuranceController {

    private final InsuranceRepository insuranceRepository;
    private final PatientRepository patientRepository;
    private final BillingRepository billingRepository;
    private final PaymentRepository paymentRepository;

    public InsuranceController(InsuranceRepository insuranceRepository, PatientRepository patientRepository,
                               BillingRepository billingRepository, PaymentRepository paymentRepository) {
        this.insuranceRepository = insuranceRepository;
        this.patientRepository = patientRepository;
        this.billingRepository = billingRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Insurance>> getAllInsurance() {
        return ResponseEntity.ok(insuranceRepository.findAll());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Insurance>> getInsuranceByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(insuranceRepository.findByPatientId(patientId));
    }

    @PostMapping("/verify")
    public ResponseEntity<Insurance> verifyInsurance(@RequestParam Long patientId,
                                                     @RequestParam String policyNumber,
                                                     @RequestParam String provider,
                                                     @RequestParam String coverageDetails,
                                                     @RequestParam(required = false) java.math.BigDecimal premium,
                                                     @RequestParam(required = false) String paymentMethod) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Insurance ins = new Insurance();
        ins.setPatient(patient);
        ins.setPolicyNumber(policyNumber);
        ins.setProvider(provider);
        ins.setCoverageDetails(coverageDetails);
        ins.setStatus("VERIFIED");
        
        if (premium != null) {
            ins.setPremium(premium);
            ins.setPaymentStatus("PAID");
        } else {
            ins.setPremium(java.math.BigDecimal.ZERO);
            ins.setPaymentStatus("UNPAID");
        }

        Insurance saved = insuranceRepository.save(ins);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/claim")
    public ResponseEntity<Billing> processClaim(@RequestParam Long billingId) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (!billing.getStatus().equals("UNPAID")) {
            throw new RuntimeException("Bill status is: " + billing.getStatus() + ". Claim cannot be submitted.");
        }

        // Verify patient has at least one active verified insurance policy
        List<Insurance> insurances = insuranceRepository.findByPatientId(billing.getPatient().getId());
        boolean hasVerified = insurances.stream().anyMatch(i -> i.getStatus().equals("VERIFIED"));
        if (!hasVerified) {
            throw new RuntimeException("No active verified insurance found for patient");
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
