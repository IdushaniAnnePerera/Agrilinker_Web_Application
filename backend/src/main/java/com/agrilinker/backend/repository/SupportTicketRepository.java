package com.agrilinker.backend.repository;

import com.agrilinker.backend.model.SupportTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportTicketRepository extends MongoRepository<SupportTicket, String> {
}
