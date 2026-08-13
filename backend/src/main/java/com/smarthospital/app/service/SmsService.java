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
     * Normalizes a phone number to E.164 format.
     *
     * @param phone Raw phone number
     * @return Formatted phone number starting with + and country code
     */
    private String formatToE164(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }

        // Remove all non-digit and non-plus characters
        String cleaned = phone.replaceAll("[^0-9+]", "");

        if (cleaned.startsWith("+")) {
            return cleaned;
        }

        // Handle common national formats:
        // 1. If it's a 10-digit number, default to India (+91) since UPI merchant is in India
        if (cleaned.length() == 10) {
            return "+91" + cleaned;
        }

        // 2. If it starts with "0" and has 11 characters total, replace "0" with "+91"
        if (cleaned.startsWith("0") && cleaned.length() == 11) {
            return "+91" + cleaned.substring(1);
        }

        // 3. If it starts with "91" (country code) and has 12 digits, prepend "+"
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            return "+" + cleaned;
        }

        // 4. If it starts with "1" (US country code) and has 11 digits, prepend "+"
        if (cleaned.startsWith("1") && cleaned.length() == 11) {
            return "+" + cleaned;
        }

        // Fallback: prepend "+"
        return "+" + cleaned;
    }

    /**
     * Sends an SMS message to a specific phone number using Twilio.
     * Fallbacks to simulator logging if credentials are not configured.
     *
     * @param toPhone     Target phone number
     * @param messageText SMS content
     * @return true if sent via Twilio, false otherwise
     */
    public boolean sendSms(String toPhone, String messageText) {
        String formattedTo = formatToE164(toPhone);
        String formattedFrom = formatToE164(fromNumber);

        if (accountSid == null || accountSid.trim().isEmpty() || 
            authToken == null || authToken.trim().isEmpty() || 
            fromNumber == null || fromNumber.trim().isEmpty()) {
            System.out.println("\n=======================================================");
            System.out.println("[SMS GATEWAY SIMULATOR] (Twilio keys not set) OTP text: ");
            System.out.println(messageText);
            System.out.println("sent to mobile number (formatted): " + formattedTo + " (original: " + toPhone + ")");
            System.out.println("=======================================================\n");
            return false;
        }

        try {
            Twilio.init(accountSid, authToken);
            Message message = Message.creator(
                    new PhoneNumber(formattedTo),
                    new PhoneNumber(formattedFrom),
                    messageText
            ).create();
            System.out.println("[SMS SENT SUCCESS] Twilio Message SID: " + message.getSid() + " sent to: " + formattedTo);
            return true;
        } catch (Exception e) {
            System.err.println("[SMS SENT ERROR] Failed to send SMS via Twilio to " + formattedTo + " (original: " + toPhone + "): " + e.getMessage());
            e.printStackTrace();
            System.out.println("\n=======================================================");
            System.out.println("[SMS GATEWAY FALLBACK] (Error sending via Twilio) OTP text: ");
            System.out.println(messageText);
            System.out.println("sent to mobile number (formatted): " + formattedTo + " (original: " + toPhone + ")");
            System.out.println("=======================================================\n");
            return false;
        }
    }
}
