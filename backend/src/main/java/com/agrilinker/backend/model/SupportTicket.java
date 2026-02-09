package com.agrilinker.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "supportTickets")
public class SupportTicket {

    @Id
    private String id;

    private String orderId;
    private String complaintType;
    private String resolutionPreference;
    private String contactMethod;
    private String contactValue;
    private String buyerId;
    private String buyerEmail;
    private String description;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SupportMessage> messages = new ArrayList<>();

    public enum Status {
        OPEN,
        IN_PROGRESS,
        RESOLVED
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupportMessage {
        private String id;
        private String senderRole;
        private String recipientRole;
        private String message;
        private LocalDateTime createdAt;
    }
}
