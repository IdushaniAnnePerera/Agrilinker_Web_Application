package com.agrilinker.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.agrilinker.backend.model.ContactInquiry;
import com.agrilinker.backend.service.ContactInquiryService;

@RestController
@RequestMapping("/api/contact-us")
@CrossOrigin(origins = "http://localhost:3000")
public class ContactInquiryController {

    private static final Set<String> ALLOWED_CONTACT_METHODS = Set.of("EMAIL", "PHONE", "WHATSAPP");

    @Autowired
    private ContactInquiryService contactInquiryService;

    // BUYER: create inquiry
    @PostMapping
    public ResponseEntity<?> createInquiry(@RequestBody ContactInquiry inquiry) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;

        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (inquiry != null && inquiry.getPreferredContactMethod() != null) {
            inquiry.setPreferredContactMethod(normalizeMethod(inquiry.getPreferredContactMethod()));
        }

        String validationError = validateInquiry(inquiry);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("message", validationError));
        }

        inquiry.setSenderEmail(email);
        inquiry.setFullName(inquiry.getFullName().trim());
        inquiry.setPhoneNumber(inquiry.getPhoneNumber().trim());
        inquiry.setSubject(inquiry.getSubject().trim());
        inquiry.setPreferredContactMethod(inquiry.getPreferredContactMethod().trim().toUpperCase());
        inquiry.setMessage(inquiry.getMessage().trim());

        ContactInquiry saved = contactInquiryService.createInquiry(inquiry);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // BUYER: my inquiries
    @GetMapping("/my")
    public ResponseEntity<List<ContactInquiry>> getMyInquiries() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;

        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(contactInquiryService.getInquiriesBySender(email));
    }

    // ADMIN: all inquiries
    @GetMapping
    public ResponseEntity<?> getAllInquiries() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // If you already protect /api/contact-us in SecurityConfig for ROLE_ADMIN, keep
        // it there.
        return ResponseEntity.ok(contactInquiryService.getAllInquiries());
    }

    // ADMIN: reply
    @PostMapping("/{id}/reply")
    public ResponseEntity<?> replyToInquiry(@PathVariable("id") String id, @RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = auth != null ? auth.getName() : null;

        if (adminEmail == null || adminEmail.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String replyMessage = safeTrim(body.get("message"));
        String method = normalizeMethod(body.get("method"));

        if (replyMessage.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reply message is required."));
        }
        if (replyMessage.length() < 5 || replyMessage.length() > 2000) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reply must be 5 to 2000 characters."));
        }
        if (!ALLOWED_CONTACT_METHODS.contains(method)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Method must be EMAIL, PHONE, or WHATSAPP."));
        }

        try {
            ContactInquiry updated = contactInquiryService.replyToInquiry(id, adminEmail, replyMessage, method);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
    }

    private String validateInquiry(ContactInquiry inquiry) {
        if (inquiry == null)
            return "Request body is required.";

        String fullName = safeTrim(inquiry.getFullName());
        if (fullName.isBlank())
            return "Full name is required.";
        if (fullName.length() < 3 || fullName.length() > 80)
            return "Full name must be between 3 and 80 characters.";
        if (!fullName.matches("^[a-zA-Z\\s.'-]+$"))
            return "Full name contains invalid characters.";

        String phoneNumber = safeTrim(inquiry.getPhoneNumber());
        if (phoneNumber.isBlank())
            return "Phone number is required.";
        if (!phoneNumber.matches("^\\+?[0-9\\s-]{9,20}$"))
            return "Phone number format is invalid.";

        String subject = safeTrim(inquiry.getSubject());
        if (subject.isBlank())
            return "Subject is required.";
        if (subject.length() < 5 || subject.length() > 120)
            return "Subject must be between 5 and 120 characters.";

        String method = normalizeMethod(inquiry.getPreferredContactMethod());
        if (method.isBlank())
            return "Preferred contact method is required.";
        if (!ALLOWED_CONTACT_METHODS.contains(method))
            return "Preferred contact method must be Email, Phone, or WhatsApp.";

        String message = safeTrim(inquiry.getMessage());
        if (message.isBlank())
            return "Message is required.";
        if (message.length() < 20 || message.length() > 1000)
            return "Message must be between 20 and 1000 characters.";

        return null;
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeMethod(String value) {
        String v = safeTrim(value).toUpperCase();
        if (v.equals("E-MAIL"))
            return "EMAIL";
        if (v.equals("MAIL"))
            return "EMAIL";
        if (v.equals("WHATS APP"))
            return "WHATSAPP";
        return v;
    }
}
