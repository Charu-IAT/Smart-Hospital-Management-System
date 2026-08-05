package com.smarthospital.app.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("smartadmin123 hash: " + encoder.encode("smartadmin123"));
    }
}
