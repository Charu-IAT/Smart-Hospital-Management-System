package com.smarthospital.app.repository;

import com.smarthospital.app.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientId(Long patientId);
    List<Prescription> findByDoctorId(Long doctorId);
    Optional<Prescription> findByAppointmentId(Long appointmentId);
}
