package com.agrilinker.backend.service;

import java.util.List;

import com.agrilinker.backend.model.ContactInquiry;

public interface ContactInquiryService {

    ContactInquiry createInquiry(ContactInquiry inquiry);

    List<ContactInquiry> getInquiriesBySender(String senderEmail);

    // ✅ admin
    List<ContactInquiry> getAllInquiries();

    // ✅ admin reply
    ContactInquiry replyToInquiry(String inquiryId, String adminEmail, String replyMessage, String method);
}
