package com.smarthospital.app.controller;

import com.smarthospital.app.model.*;
import com.smarthospital.app.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;

    public DoctorController(DoctorRepository doctorRepository, UserRepository userRepository,
                            AppointmentRepository appointmentRepository, PrescriptionRepository prescriptionRepository,
                            MedicalHistoryRepository medicalHistoryRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
    }

    private Doctor getAuthenticatedDoctor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
    }

    @GetMapping("/profile")
    public ResponseEntity<Doctor> getProfile() {
        return ResponseEntity.ok(getAuthenticatedDoctor());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @GetMapping("/all-by-dept/{deptId}")
    public ResponseEntity<List<Doctor>> getDoctorsByDept(@PathVariable Long deptId) {
        return ResponseEntity.ok(doctorRepository.findByDepartmentId(deptId));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments() {
        Doctor doctor = getAuthenticatedDoctor();
        return ResponseEntity.ok(appointmentRepository.findByDoctorId(doctor.getId()));
    }

    @PutMapping("/availability")
    public ResponseEntity<Doctor> toggleAvailability(@RequestParam Boolean availability) {
        Doctor doctor = getAuthenticatedDoctor();
        doctor.setAvailability(availability);
        return ResponseEntity.ok(doctorRepository.save(doctor));
    }

    @PostMapping("/prescribe")
    public ResponseEntity<Prescription> writePrescription(@RequestBody Prescription prescription) {
        Appointment appointment = appointmentRepository.findById(prescription.getAppointment().getId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus("COMPLETED");
        appointmentRepository.save(appointment);

        prescription.setAppointment(appointment);
        prescription.setDoctor(appointment.getDoctor());
        prescription.setPatient(appointment.getPatient());
        Prescription saved = prescriptionRepository.save(prescription);

        MedicalHistory history = new MedicalHistory();
        history.setPatient(appointment.getPatient());
        history.setDiagnosis(prescription.getDiagnosis());
        history.setTreatment("Prescribed: " + prescription.getMedicines() + ". Instructions: " + prescription.getInstructions());
        medicalHistoryRepository.save(history);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Prescription>> getDoctorPrescriptions() {
        Doctor doctor = getAuthenticatedDoctor();
        return ResponseEntity.ok(prescriptionRepository.findByDoctorId(doctor.getId()));
    }
}
