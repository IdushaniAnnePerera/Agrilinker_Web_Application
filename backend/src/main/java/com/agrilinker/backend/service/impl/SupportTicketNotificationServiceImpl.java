package com.agrilinker.backend.service.impl;

import com.agrilinker.backend.model.SupportTicketNotification;
import com.agrilinker.backend.repository.SupportTicketNotificationRepository;
import com.agrilinker.backend.service.SupportTicketNotificationService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SupportTicketNotificationServiceImpl implements SupportTicketNotificationService {

    @Autowired
    private SupportTicketNotificationRepository notificationRepository;

    @Override
    public SupportTicketNotification createNotification(SupportTicketNotification notification) {
        SupportTicketNotification notificationToSave = notification;
        notificationToSave.setCreatedAt(LocalDateTime.now());
        if (notificationToSave.getStatus() == null) {
            notificationToSave.setStatus(SupportTicketNotification.NotificationStatus.QUEUED);
        }
        return notificationRepository.save(notificationToSave);
    }

    @Override
    public List<SupportTicketNotification> getNotificationsByTicketId(String ticketId) {
        return notificationRepository.findByTicketId(ticketId);
    }
}
