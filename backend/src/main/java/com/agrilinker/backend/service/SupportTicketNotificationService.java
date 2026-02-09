package com.agrilinker.backend.service;

import com.agrilinker.backend.model.SupportTicketNotification;
import java.util.List;

public interface SupportTicketNotificationService {
    SupportTicketNotification createNotification(SupportTicketNotification notification);
    List<SupportTicketNotification> getNotificationsByTicketId(String ticketId);
}
