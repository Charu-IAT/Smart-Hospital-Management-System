package com.smarthospital.app.repository;

import com.smarthospital.app.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBillingId(Long billingId);
}
