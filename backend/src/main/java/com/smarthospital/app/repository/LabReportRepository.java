package com.smarthospital.app.repository;

import com.smarthospital.app.model.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabReportRepository extends JpaRepository<LabReport, Long> {
    List<LabReport> findByPatientId(Long patientId);
}
