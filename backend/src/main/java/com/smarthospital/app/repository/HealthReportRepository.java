package com.smarthospital.app.repository;

import com.smarthospital.app.model.HealthReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HealthReportRepository extends JpaRepository<HealthReport, Long> {
    List<HealthReport> findByPatientIdOrderByDateRecordedDesc(Long patientId);
}
