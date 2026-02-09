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
@Document(collection = "supportTicketNotifications")
public class SupportTicketNotification {

    @Id
    private String id;

    private String ticketId;
    private NotificationType type;
    private String recipient;
    private String subject;
    private String body;
    private LocalDateTime createdAt;
    private NotificationStatus status;

    public enum NotificationType {
        EMAIL,
        SMS
    }

    public enum NotificationStatus {
        QUEUED,
        SENT,
        FAILED
    }
}
