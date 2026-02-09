package com.agrilinker.backend.controller;

import com.agrilinker.backend.model.SupportTicket;
import com.agrilinker.backend.service.SupportTicketService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support-tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class SupportTicketController {

    @Autowired
    private SupportTicketService supportTicketService;

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket ticket) {
        SupportTicket savedTicket = supportTicketService.createTicket(ticket);
        return new ResponseEntity<>(savedTicket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportTicketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicket> getTicketById(@PathVariable String id) {
        SupportTicket ticket = supportTicketService.getTicketById(id);
        return ticket != null ? ResponseEntity.ok(ticket) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SupportTicket> updateStatus(
            @PathVariable String id,
            @RequestBody SupportTicketStatusRequest request
    ) {
        if (request == null || request.getStatus() == null) {
            return ResponseEntity.badRequest().build();
        }
        SupportTicket.Status status;
        try {
            status = SupportTicket.Status.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
        SupportTicket updatedTicket = supportTicketService.updateStatus(id, status);
        return updatedTicket != null
                ? ResponseEntity.ok(updatedTicket)
                : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<SupportTicket> addMessage(
            @PathVariable String id,
            @RequestBody SupportTicketMessageRequest request
    ) {
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        SupportTicket.SupportMessage message = new SupportTicket.SupportMessage(
                null,
                request.getSenderRole(),
                request.getRecipientRole(),
                request.getMessage(),
                null
        );
        SupportTicket updatedTicket = supportTicketService.addMessage(id, message);
        return updatedTicket != null
                ? ResponseEntity.ok(updatedTicket)
                : ResponseEntity.notFound().build();
    }

    public static class SupportTicketStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class SupportTicketMessageRequest {
        private String senderRole;
        private String recipientRole;
        private String message;

        public String getSenderRole() {
            return senderRole;
        }

        public void setSenderRole(String senderRole) {
            this.senderRole = senderRole;
        }

        public String getRecipientRole() {
            return recipientRole;
        }

        public void setRecipientRole(String recipientRole) {
            this.recipientRole = recipientRole;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

}
