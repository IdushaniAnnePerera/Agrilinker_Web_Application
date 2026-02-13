package com.agrilinker.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.agrilinker.backend.model.ContactInquiry;

@Repository
public interface ContactInquiryRepository extends MongoRepository<ContactInquiry, String> {

    List<ContactInquiry> findBySenderEmailOrderByCreatedAtDesc(String senderEmail);

    // ✅ admin list
    List<ContactInquiry> findAllByOrderByCreatedAtDesc();
}
