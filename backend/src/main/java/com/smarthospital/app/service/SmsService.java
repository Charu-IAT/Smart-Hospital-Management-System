package com.smarthospital.app.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromNumber;

    /**
     * Sends an SMS message to a specific phone number using Twilio.
     * Fallbacks to simulator logging if credentials are not configured.
     *
     * @param toPhone     Target phone number
     * @param messageText SMS content
     * @return true if sent via Twilio, false otherwise
     */
    public boolean sendSms(String toPhone, String messageText) {
        if (accountSid == null || accountSid.trim().isEmpty() || 
            authToken == null || authToken.trim().isEmpty() || 
            fromNumber == null || fromNumber.trim().isEmpty()) {
            System.out.println("\n=======================================================");
            System.out.println("[SMS GATEWAY SIMULATOR] (Twilio keys not set) OTP text: ");
            System.out.println(messageText);
            System.out.println("sent to mobile number: " + toPhone);
            System.out.println("=======================================================\n");
            return false;
        }

        try {
            Twilio.init(accountSid, authToken);
            Message message = Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(fromNumber),
                    messageText
            ).create();
            System.out.println("[SMS SENT SUCCESS] Twilio Message SID: " + message.getSid() + " sent to: " + toPhone);
            return true;
        } catch (Exception e) {
            System.err.println("[SMS SENT ERROR] Failed to send SMS via Twilio to " + toPhone + ": " + e.getMessage());
            System.out.println("\n=======================================================");
            System.out.println("[SMS GATEWAY FALLBACK] (Error sending via Twilio) OTP text: ");
            System.out.println(messageText);
            System.out.println("sent to mobile number: " + toPhone);
            System.out.println("=======================================================\n");
            return false;
        }
    }
}
