package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabReportRepository labReportRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;
    private final HealthReportRepository healthReportRepository;

    public PatientController(PatientRepository patientRepository, UserRepository userRepository,
                             PrescriptionRepository prescriptionRepository, LabReportRepository labReportRepository,
                             MedicalHistoryRepository medicalHistoryRepository, HealthReportRepository healthReportRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.labReportRepository = labReportRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.healthReportRepository = healthReportRepository;
    }

    private Patient getAuthenticatedPatient() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Patient profile not found for user: " + username));
    }

    @GetMapping("/profile")
    public ResponseEntity<Patient> getProfile() {
        return ResponseEntity.ok(getAuthenticatedPatient());
    }

    @PutMapping("/profile")
    public ResponseEntity<Patient> updateProfile(@RequestBody Patient updatedPatient) {
        Patient current = getAuthenticatedPatient();
        current.setName(updatedPatient.getName());
        current.setAge(updatedPatient.getAge());
        current.setGender(updatedPatient.getGender());
        current.setBloodGroup(updatedPatient.getBloodGroup());
        current.setPhone(updatedPatient.getPhone());
        current.setAddress(updatedPatient.getAddress());
        current.setAllergies(updatedPatient.getAllergies());
        current.setMedicalHistory(updatedPatient.getMedicalHistory());
        
        return ResponseEntity.ok(patientRepository.save(current));
    }

    @GetMapping("/{id}/prescriptions")
    public ResponseEntity<List<Prescription>> getPrescriptions(@PathVariable Long id) {
        return ResponseEntity.ok(prescriptionRepository.findByPatientId(id));
    }

    @GetMapping("/{id}/reports")
    public ResponseEntity<List<LabReport>> getReports(@PathVariable Long id) {
        return ResponseEntity.ok(labReportRepository.findByPatientId(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<MedicalHistory>> getMedicalHistory(@PathVariable Long id) {
        return ResponseEntity.ok(medicalHistoryRepository.findByPatientId(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @PostMapping("/health-report")
    public ResponseEntity<?> createHealthReport(@RequestBody HealthReport report) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        System.out.println("DEBUG: createHealthReport endpoint hit. Authenticated Username: " + username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        System.out.println("DEBUG: User Role from DB: " + user.getRole());
        
        Patient patient;
        if (user.getRole() == Role.ROLE_PATIENT) {
            patient = patientRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Patient profile not found for user: " + username));
            report.setPatient(patient);
        } else if (user.getRole() == Role.ROLE_ADMIN || user.getRole() == Role.ROLE_DOCTOR) {
            if (report.getPatient() == null || report.getPatient().getId() == null) {
                return ResponseEntity.badRequest().body("Error: Patient ID is required for administrative vital entries.");
            }
            patient = patientRepository.findById(report.getPatient().getId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + report.getPatient().getId()));
            report.setPatient(patient);
        } else {
            String errMsg = "Error: Unauthorized to log patient health reports. Your username: " + username + ", Your Role: " + (user.getRole() != null ? user.getRole().name() : "null");
            System.out.println("DEBUG: " + errMsg);
            return ResponseEntity.status(403).body(errMsg);
        }

        if (report.getDateRecorded() == null) {
            report.setDateRecorded(java.time.LocalDateTime.now());
        }
        HealthReport saved = healthReportRepository.save(report);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/health-report")
    public ResponseEntity<List<HealthReport>> getMyHealthReports() {
        Patient patient = getAuthenticatedPatient();
        return ResponseEntity.ok(healthReportRepository.findByPatientIdOrderByDateRecordedDesc(patient.getId()));
    }

    @GetMapping("/{id}/health-report")
    public ResponseEntity<List<HealthReport>> getPatientHealthReports(@PathVariable Long id) {
        return ResponseEntity.ok(healthReportRepository.findByPatientIdOrderByDateRecordedDesc(id));
    }
}
