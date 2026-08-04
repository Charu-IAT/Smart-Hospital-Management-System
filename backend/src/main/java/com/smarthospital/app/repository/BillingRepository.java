package com.smarthospital.app.repository;

import com.smarthospital.app.model.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BillingRepository extends JpaRepository<Billing, Long> {
    List<Billing> findByPatientId(Long patientId);
    List<Billing> findByStatus(String status);
}
