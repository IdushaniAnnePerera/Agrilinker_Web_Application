package com.agrilinker.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrilinker.backend.model.ContactInquiry;
import com.agrilinker.backend.service.ContactInquiryService;

@RestController
@RequestMapping("/api/contact-us")
@CrossOrigin(origins = "http://localhost:3000")
public class ContactInquiryController {

    private static final Set<String> ALLOWED_CONTACT_METHODS = Set.of("EMAIL", "PHONE", "WHATSAPP");

    @Autowired
    private ContactInquiryService contactInquiryService;

    @PostMapping
    public ResponseEntity<?> createInquiry(@RequestBody ContactInquiry inquiry) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;

        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String validationError = validateInquiry(inquiry);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("message", validationError));
        }

        inquiry.setSenderEmail(email);
        inquiry.setFullName(inquiry.getFullName().trim());
        inquiry.setPhoneNumber(inquiry.getPhoneNumber().trim());
        inquiry.setSubject(inquiry.getSubject().trim());
        inquiry.setPreferredContactMethod(inquiry.getPreferredContactMethod().trim());
        inquiry.setMessage(inquiry.getMessage().trim());

        ContactInquiry saved = contactInquiryService.createInquiry(inquiry);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ContactInquiry>> getMyInquiries() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;

        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(contactInquiryService.getInquiriesBySender(email));
    }

    private String validateInquiry(ContactInquiry inquiry) {
        if (inquiry == null) {
            return "Request body is required.";
        }

        String fullName = safeTrim(inquiry.getFullName());
        if (fullName.isBlank()) {
            return "Full name is required.";
        }
        if (fullName.length() < 3 || fullName.length() > 80) {
            return "Full name must be between 3 and 80 characters.";
        }
        if (!fullName.matches("^[a-zA-Z\\s.'-]+$")) {
            return "Full name contains invalid characters.";
        }

        String phoneNumber = safeTrim(inquiry.getPhoneNumber());
        if (phoneNumber.isBlank()) {
            return "Phone number is required.";
        }
        if (!phoneNumber.matches("^\\+?[0-9\\s-]{10,20}$")) {
            return "Phone number format is invalid.";
        }

        String subject = safeTrim(inquiry.getSubject());
        if (subject.isBlank()) {
            return "Subject is required.";
        }
        if (subject.length() < 5 || subject.length() > 120) {
            return "Subject must be between 5 and 120 characters.";
        }

        String method = safeTrim(inquiry.getPreferredContactMethod());
        if (method.isBlank()) {
            return "Preferred contact method is required.";
        }
        if (!ALLOWED_CONTACT_METHODS.contains(method.toUpperCase())) {
            return "Preferred contact method must be Email, Phone, or WhatsApp.";
        }

        String message = safeTrim(inquiry.getMessage());
        if (message.isBlank()) {
            return "Message is required.";
        }
        if (message.length() < 20 || message.length() > 1000) {
            return "Message must be between 20 and 1000 characters.";
        }

        return null;
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }
}
