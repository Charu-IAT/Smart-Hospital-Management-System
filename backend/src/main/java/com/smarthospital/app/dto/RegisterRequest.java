package com.smarthospital.app.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String role; // e.g. ROLE_PATIENT, ROLE_DOCTOR, etc.

    // Patient specific fields
    private String name;
    private Integer age;
    private String gender;
    private String bloodGroup;
    private String address;
    private String phone;

    // Doctor specific fields
    private String specialization;
    private Long departmentId;
    private String schedule;
}
