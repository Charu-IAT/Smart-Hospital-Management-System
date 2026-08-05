package com.smarthospital.app.repository;

import com.smarthospital.app.model.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
    java.util.List<Insurance> findByPatientId(Long patientId);
    Optional<Insurance> findByPolicyNumber(String policyNumber);
}
