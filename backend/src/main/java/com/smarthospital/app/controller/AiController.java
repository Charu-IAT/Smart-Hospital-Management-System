package com.smarthospital.app.controller;

import com.smarthospital.app.model.Doctor;
import com.smarthospital.app.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final DoctorRepository doctorRepository;

    public AiController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // Helper structures for Disease Prediction
    private static final Map<String, List<String>> DISEASE_SYMPTOMS = new LinkedHashMap<>();
    private static final Map<String, String> DISEASE_DESCRIPTIONS = new HashMap<>();

    static {
        DISEASE_SYMPTOMS.put("COVID-19", List.of("fever", "cough", "fatigue", "loss of taste", "loss of smell", "shortness of breath"));
        DISEASE_SYMPTOMS.put("Influenza (Flu)", List.of("fever", "cough", "sore throat", "runny nose", "muscle aches", "fatigue"));
        DISEASE_SYMPTOMS.put("Migraine", List.of("headache", "nausea", "sensitivity to light", "sensitivity to sound", "dizziness"));
        DISEASE_SYMPTOMS.put("Gastroenteritis (Food Poisoning)", List.of("nausea", "vomiting", "diarrhea", "abdominal pain", "fever"));
        DISEASE_SYMPTOMS.put("Allergic Rhinitis", List.of("sneezing", "runny nose", "itchy eyes", "congestion"));
        DISEASE_SYMPTOMS.put("Streptococcal Pharyngitis (Strep Throat)", List.of("sore throat", "difficulty swallowing", "fever", "headache"));

        DISEASE_DESCRIPTIONS.put("COVID-19", "A highly contagious viral respiratory infection. Rest, isolate, and consult a physician if oxygen levels drop.");
        DISEASE_DESCRIPTIONS.put("Influenza (Flu)", "A common viral infection. Take plenty of fluids, rest, and consider antivirals if caught early.");
        DISEASE_DESCRIPTIONS.put("Migraine", "A neurological condition causing severe headaches. Keep in a dark, quiet room and take pain relievers.");
        DISEASE_DESCRIPTIONS.put("Gastroenteritis (Food Poisoning)", "Inflammation of the stomach and intestines. Stay hydrated with electrolytes and eat bland foods.");
        DISEASE_DESCRIPTIONS.put("Allergic Rhinitis", "Allergic reaction to airborne particles. Avoid allergens and use antihistamines.");
        DISEASE_DESCRIPTIONS.put("Streptococcal Pharyngitis (Strep Throat)", "A bacterial infection of the throat. Requires professional diagnosis and antibiotic treatment.");
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predictDisease(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> symptoms = (List<String>) request.get("symptoms");
        if (symptoms == null || symptoms.isEmpty()) {
            return ResponseEntity.badRequest().body("Symptoms list cannot be empty");
        }

        String bestMatch = "Unknown / General Consultation recommended";
        double highestScore = 0.0;
        List<String> matchedSymptoms = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : DISEASE_SYMPTOMS.entrySet()) {
            String disease = entry.getKey();
            List<String> diseaseSymptoms = entry.getValue();
            
            long matchCount = symptoms.stream()
                    .map(String::toLowerCase)
                    .map(String::trim)
                    .filter(diseaseSymptoms::contains)
                    .count();

            double score = (double) matchCount / diseaseSymptoms.size();
            if (score > highestScore && score >= 0.25) { // Threshold of 25% match
                highestScore = score;
                bestMatch = disease;
                matchedSymptoms.clear();
                symptoms.stream()
                        .map(String::toLowerCase)
                        .map(String::trim)
                        .filter(diseaseSymptoms::contains)
                        .forEach(matchedSymptoms::add);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("predictedDisease", bestMatch);
        response.put("confidence", String.format("%.0f%%", highestScore * 100));
        response.put("description", DISEASE_DESCRIPTIONS.getOrDefault(bestMatch, "Please consult a healthcare professional for a precise diagnosis."));
        response.put("matchedSymptoms", matchedSymptoms);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/recommend")
    public ResponseEntity<?> recommendMedicines(@RequestBody Map<String, Object> request) {
        String diagnosis = (String) request.get("diagnosis");
        String allergies = (String) request.get("allergies");

        if (diagnosis == null || diagnosis.isEmpty()) {
            return ResponseEntity.badRequest().body("Diagnosis is required");
        }

        List<String> recommendations = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        String diagLower = diagnosis.toLowerCase();
        String allergyLower = allergies != null ? allergies.toLowerCase() : "";

        if (diagLower.contains("covid") || diagLower.contains("flu") || diagLower.contains("influenza")) {
            if (allergyLower.contains("paracetamol") || allergyLower.contains("acetaminophen")) {
                warnings.add("CRITICAL: Patient is allergic to Paracetamol/Acetaminophen. Suggesting Ibuprofen instead.");
                recommendations.add("Ibuprofen 400mg - 1 tablet every 8 hours as needed for fever/pain");
            } else {
                recommendations.add("Paracetamol 650mg - 1 tablet every 6 hours as needed for fever");
            }
            
            if (diagLower.contains("flu")) {
                recommendations.add("Cetirizine 10mg - 1 tablet at night for runny nose/sneezing");
            }
        } else if (diagLower.contains("migraine") || diagLower.contains("headache")) {
            if (allergyLower.contains("ibuprofen") || allergyLower.contains("advil") || allergyLower.contains("nsaid")) {
                warnings.add("WARNING: Patient allergic to NSAIDs. Recommending Acetaminophen.");
                recommendations.add("Paracetamol 650mg - 1 tablet for headache relief");
            } else {
                recommendations.add("Ibuprofen 400mg - 1 tablet for headache relief");
            }
        } else if (diagLower.contains("strep") || diagLower.contains("throat") || diagLower.contains("infection")) {
            if (allergyLower.contains("penicillin") || allergyLower.contains("amoxicillin")) {
                warnings.add("CRITICAL: Patient is allergic to Penicillin. DO NOT administer Amoxicillin. Suggesting alternative Macrolide.");
                recommendations.add("Azithromycin 500mg - 1 tablet daily for 3 days");
            } else {
                recommendations.add("Amoxicillin 500mg - 1 capsule every 8 hours for 5 days");
            }
            recommendations.add("Warm saline gargle 3-4 times a day");
        } else if (diagLower.contains("rhinitis") || diagLower.contains("allergy")) {
            if (allergyLower.contains("cetirizine") || allergyLower.contains("zyrtec")) {
                warnings.add("WARNING: Allergy to Cetirizine. Recommending Loratadine.");
                recommendations.add("Loratadine 10mg - 1 tablet daily");
            } else {
                recommendations.add("Cetirizine 10mg - 1 tablet daily");
            }
        } else {
            recommendations.add("General wellness rest, hydration, and regular temperature monitoring");
            recommendations.add("Please schedule an appointment with a specialist for targeted medication");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("diagnosis", diagnosis);
        response.put("recommendedMedicines", recommendations);
        response.put("warnings", warnings);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/chatbot")
    public ResponseEntity<?> chatbotAnswer(@RequestBody Map<String, String> request) {
        String msg = request.get("message");
        if (msg == null || msg.isEmpty()) {
            return ResponseEntity.badRequest().body("Message cannot be empty");
        }

        String msgLower = msg.toLowerCase();
        String response;

        if (msgLower.contains("appointment") || msgLower.contains("book")) {
            response = "You can book appointments easily! Simply navigate to the **Appointment Booking** page, choose your preferred doctor, select a date and time slot, and submit. You can also pay your consultation fee online.";
        } else if (msgLower.contains("doctor") || msgLower.contains("availability") || msgLower.contains("schedule")) {
            List<Doctor> doctors = doctorRepository.findAll();
            if (doctors.isEmpty()) {
                response = "Currently, there are no doctors registered in our clinic database. Please contact the administrator.";
            } else {
                StringBuilder sb = new StringBuilder("Our clinic has the following specialists available:\n\n");
                for (Doctor doc : doctors) {
                    String deptName = doc.getDepartment() != null ? doc.getDepartment().getName() : doc.getSpecialization();
                    sb.append("• ").append(doc.getName())
                      .append(" (").append(deptName).append(") - Available: ")
                      .append(doc.getSchedule()).append("\n");
                }
                sb.append("\nYou can book a consultation directly from the Booking screen.");
                response = sb.toString();
            }
        } else if (msgLower.contains("timing") || msgLower.contains("hours") || msgLower.contains("open")) {
            response = "The Smart Hospital is open 24/7 for emergency services. General OPD and Consultation services run daily from 8:00 AM to 8:00 PM.";
        } else if (msgLower.contains("billing") || msgLower.contains("pay") || msgLower.contains("insurance")) {
            response = "We support multiple billing methods. You can pay your consultation fees, pharmacy orders, or lab test fees via credit/debit card, or submit a claim directly under our Insurance claims section.";
        } else if (msgLower.contains("medicine") || msgLower.contains("prescription")) {
            response = "Once your doctor writes a prescription during a consultation, you can view and download it instantly in your Patient Dashboard. You can also purchase prescribed medicines through the Pharmacy portal.";
        } else if (msgLower.contains("hello") || msgLower.contains("hi") || msgLower.contains("hey")) {
            response = "Hello! I am your SHMS AI Assistant. How can I help you today? You can ask me about appointments, timings, doctors, or billing.";
        } else {
            response = "Thank you for reaching out! For specific medical advice, please schedule a consultation with one of our certified doctors. For navigation assistance, you can query me about 'how to book an appointment', 'hospital timings', or 'billing services'.";
        }

        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("reply", response);

        return ResponseEntity.ok(responseMap);
    }
}
