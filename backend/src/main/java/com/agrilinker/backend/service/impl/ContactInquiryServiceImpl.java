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
        if (inquiry.getStatus() == null) {
            inquiry.setStatus(ContactInquiry.InquiryStatus.NEW);
        }

        inquiry.setCreatedAt(LocalDateTime.now());
        inquiry.setUpdatedAt(LocalDateTime.now());

        return contactInquiryRepository.save(inquiry);
    }

    @Override
    public List<ContactInquiry> getInquiriesBySender(String senderEmail) {
        return contactInquiryRepository.findBySenderEmailOrderByCreatedAtDesc(senderEmail);
    }

    @Override
    public List<ContactInquiry> getAllInquiries() {
        return contactInquiryRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public ContactInquiry replyToInquiry(String inquiryId, String adminEmail, String replyMessage, String method) {
        ContactInquiry inquiry = contactInquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        inquiry.setReplyMessage(replyMessage);
        inquiry.setReplyMethod(method);
        inquiry.setRepliedBy(adminEmail);
        inquiry.setRepliedAt(LocalDateTime.now());
        inquiry.setUpdatedAt(LocalDateTime.now());

        // ✅ rule: once replied, set IN_PROGRESS (or RESOLVED if you prefer)
        if (inquiry.getStatus() == null || inquiry.getStatus() == ContactInquiry.InquiryStatus.NEW) {
            inquiry.setStatus(ContactInquiry.InquiryStatus.IN_PROGRESS);
        }

        return contactInquiryRepository.save(inquiry);
    }
}
