package com.agrilinker.backend.service;

import java.util.List;

import com.agrilinker.backend.model.ContactInquiry;

public interface ContactInquiryService {
    ContactInquiry createInquiry(ContactInquiry inquiry);

    List<ContactInquiry> getInquiriesBySender(String senderEmail);
}
