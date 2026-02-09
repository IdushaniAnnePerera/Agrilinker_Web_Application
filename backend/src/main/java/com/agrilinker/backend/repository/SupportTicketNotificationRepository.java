package com.agrilinker.backend.repository;

import com.agrilinker.backend.model.SupportTicketNotification;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportTicketNotificationRepository
        extends MongoRepository<SupportTicketNotification, String> {
    List<SupportTicketNotification> findByTicketId(String ticketId);
}
