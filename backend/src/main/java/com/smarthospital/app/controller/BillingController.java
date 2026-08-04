package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingRepository billingRepository;
    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public BillingController(BillingRepository billingRepository, PaymentRepository paymentRepository,
                             AppointmentRepository appointmentRepository, PatientRepository patientRepository,
                             UserRepository userRepository) {
        this.billingRepository = billingRepository;
        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    private Patient getAuthenticatedPatient() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));
    }

    @GetMapping("/patient")
    public ResponseEntity<List<Billing>> getPatientBills() {
        Patient patient = getAuthenticatedPatient();
        return ResponseEntity.ok(billingRepository.findByPatientId(patient.getId()));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Payment> payBill(@PathVariable Long id, @RequestParam String paymentMethod) {
        Billing billing = billingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Billing record not found"));

        if (billing.getStatus().equals("PAID")) {
            throw new RuntimeException("Bill is already paid");
        }

        billing.setStatus("PAID");
        billingRepository.save(billing);

        // Update appointment payment status if linked
        if (billing.getAppointment() != null) {
            Appointment appointment = billing.getAppointment();
            appointment.setPaymentStatus("PAID");
            appointmentRepository.save(appointment);
        }

        Payment payment = new Payment();
        payment.setBilling(billing);
        payment.setAmountPaid(billing.getTotalAmount());
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setStatus("SUCCESS");

        return ResponseEntity.ok(paymentRepository.save(payment));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Billing>> getAllBills() {
        return ResponseEntity.ok(billingRepository.findAll());
    }

    @PostMapping("/create")
    public ResponseEntity<Billing> createBill(@RequestBody Billing billing) {
        Patient patient = patientRepository.findById(billing.getPatient().getId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        BigDecimal total = BigDecimal.ZERO;
        if (billing.getConsultationFee() != null) total = total.add(billing.getConsultationFee());
        if (billing.getLabFee() != null) total = total.add(billing.getLabFee());
        if (billing.getPharmacyFee() != null) total = total.add(billing.getPharmacyFee());
        
        billing.setPatient(patient);
        billing.setTotalAmount(total);
        billing.setStatus("UNPAID");
        
        return ResponseEntity.ok(billingRepository.save(billing));
    }
}
