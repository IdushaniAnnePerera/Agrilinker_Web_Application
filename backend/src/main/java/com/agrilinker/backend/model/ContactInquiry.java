package com.agrilinker.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "contactInquiries")
public class ContactInquiry {

    @Id
    private String id;

    private String senderEmail;
    private String fullName;
    private String phoneNumber;
    private String subject;

    // store: EMAIL / PHONE / WHATSAPP
    private String preferredContactMethod;

    private String message;

    private InquiryStatus status;

    // ✅ reply fields (admin)
    private String replyMessage;
    private String replyMethod; // EMAIL / PHONE / WHATSAPP
    private String repliedBy; // admin email
    private LocalDateTime repliedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum InquiryStatus {
        NEW,
        IN_PROGRESS,
        RESOLVED
    }
}
