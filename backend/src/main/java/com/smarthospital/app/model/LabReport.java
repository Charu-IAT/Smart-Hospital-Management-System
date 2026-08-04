package com.smarthospital.app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "laboratory_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "test_name", nullable = false, length = 100)
    private String testName;

    @Column(name = "test_date", nullable = false)
    private LocalDate testDate;

    @Column(name = "result_summary", columnDefinition = "TEXT")
    private String resultSummary;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "uploaded_by", length = 50)
    private String uploadedBy;

    @Column(length = 20)
    private String status = "PENDING"; // PENDING, COMPLETED
}
