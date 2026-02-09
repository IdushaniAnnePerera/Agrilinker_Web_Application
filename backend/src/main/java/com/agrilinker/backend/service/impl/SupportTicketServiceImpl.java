package com.agrilinker.backend.service.impl;

import com.agrilinker.backend.model.SupportTicket;
import com.agrilinker.backend.repository.SupportTicketRepository;
import com.agrilinker.backend.service.SupportTicketService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SupportTicketServiceImpl implements SupportTicketService {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Override
    public SupportTicket createTicket(SupportTicket ticket) {
        SupportTicket ticketToSave = ticket;
        if (ticketToSave.getStatus() == null) {
            ticketToSave.setStatus(SupportTicket.Status.OPEN);
        }
        ticketToSave.setCreatedAt(LocalDateTime.now());
        ticketToSave.setUpdatedAt(LocalDateTime.now());
        if (ticketToSave.getMessages() == null) {
            ticketToSave.setMessages(new java.util.ArrayList<>());
        }
        return supportTicketRepository.save(ticketToSave);
    }

    @Override
    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAll();
    }

    @Override
    public SupportTicket getTicketById(String id) {
        Optional<SupportTicket> optionalTicket = supportTicketRepository.findById(id);
        return optionalTicket.orElse(null);
    }

    @Override
    public List<SupportTicket> getTicketsByBuyerId(String buyerId) {
        return supportTicketRepository.findByBuyerId(buyerId);
    }

    @Override
    public SupportTicket updateStatus(String id, SupportTicket.Status status) {
        SupportTicket existingTicket = getTicketById(id);
        if (existingTicket == null) {
            return null;
        }
        existingTicket.setStatus(status);
        existingTicket.setUpdatedAt(LocalDateTime.now());
        return supportTicketRepository.save(existingTicket);
    }

    @Override
    public SupportTicket addMessage(String id, SupportTicket.SupportMessage message) {
        SupportTicket existingTicket = getTicketById(id);
        if (existingTicket == null) {
            return null;
        }
        SupportTicket.SupportMessage newMessage = message;
        newMessage.setId(UUID.randomUUID().toString());
        newMessage.setCreatedAt(LocalDateTime.now());
        existingTicket.getMessages().add(newMessage);
        existingTicket.setUpdatedAt(LocalDateTime.now());
        return supportTicketRepository.save(existingTicket);
    }
}
