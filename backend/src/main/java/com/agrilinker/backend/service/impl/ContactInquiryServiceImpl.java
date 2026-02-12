package com.agrilinker.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.agrilinker.backend.model.ContactInquiry;
import com.agrilinker.backend.repository.ContactInquiryRepository;
import com.agrilinker.backend.service.ContactInquiryService;

@Service
public class ContactInquiryServiceImpl implements ContactInquiryService {

    @Autowired
    private ContactInquiryRepository contactInquiryRepository;

    @Override
    public ContactInquiry createInquiry(ContactInquiry inquiry) {
        ContactInquiry inquiryToSave = inquiry;

        if (inquiryToSave.getStatus() == null) {
            inquiryToSave.setStatus(ContactInquiry.InquiryStatus.NEW);
        }

        inquiryToSave.setCreatedAt(LocalDateTime.now());
        inquiryToSave.setUpdatedAt(LocalDateTime.now());

        return contactInquiryRepository.save(inquiryToSave);
    }

    @Override
    public List<ContactInquiry> getInquiriesBySender(String senderEmail) {
        return contactInquiryRepository.findBySenderEmailOrderByCreatedAtDesc(senderEmail);
    }
}
