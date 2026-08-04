package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
public class PharmacyController {

    private final MedicineRepository medicineRepository;
    private final BillingRepository billingRepository;
    private final PatientRepository patientRepository;

    public PharmacyController(MedicineRepository medicineRepository, BillingRepository billingRepository,
                              PatientRepository patientRepository) {
        this.medicineRepository = medicineRepository;
        this.billingRepository = billingRepository;
        this.patientRepository = patientRepository;
    }

    @GetMapping("/medicines")
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        return ResponseEntity.ok(medicineRepository.findAll());
    }

    @PostMapping("/medicines")
    public ResponseEntity<Medicine> addMedicine(@RequestBody Medicine medicine) {
        return ResponseEntity.ok(medicineRepository.save(medicine));
    }

    @PutMapping("/medicines/{id}/stock")
    public ResponseEntity<Medicine> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
        medicine.setStockQuantity(quantity);
        return ResponseEntity.ok(medicineRepository.save(medicine));
    }

    @PostMapping("/purchase")
    public ResponseEntity<Billing> purchaseMedicines(@RequestParam Long patientId,
                                                     @RequestParam Long medicineId,
                                                     @RequestParam Integer quantity) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        if (medicine.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock for: " + medicine.getName());
        }

        // Deduct stock
        medicine.setStockQuantity(medicine.getStockQuantity() - quantity);
        medicineRepository.save(medicine);

        BigDecimal fee = medicine.getPrice().multiply(BigDecimal.valueOf(quantity));

        // Consolidate pharmacy fee into patient's existing unpaid invoice
        List<Billing> patientBills = billingRepository.findByPatientId(patient.getId());
        Billing billing = patientBills.stream()
                .filter(b -> b.getStatus().equals("UNPAID"))
                .reduce((first, second) -> second)
                .orElse(null);

        if (billing != null) {
            BigDecimal currentPharmacyFee = billing.getPharmacyFee() != null ? billing.getPharmacyFee() : BigDecimal.ZERO;
            billing.setPharmacyFee(currentPharmacyFee.add(fee));
            BigDecimal consultation = billing.getConsultationFee() != null ? billing.getConsultationFee() : BigDecimal.ZERO;
            BigDecimal lab = billing.getLabFee() != null ? billing.getLabFee() : BigDecimal.ZERO;
            billing.setTotalAmount(consultation.add(lab).add(billing.getPharmacyFee()));
            return ResponseEntity.ok(billingRepository.save(billing));
        } else {
            billing = new Billing();
            billing.setPatient(patient);
            billing.setPharmacyFee(fee);
            billing.setTotalAmount(fee);
            billing.setStatus("UNPAID");
            billing.setBillingDate(LocalDate.now());
            return ResponseEntity.ok(billingRepository.save(billing));
        }
    }
}
