package com.agrilinker.backend.controller;

import com.agrilinker.backend.service.AdminSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminSettingsController {

    @Autowired
    private AdminSettingsService adminSettingsService;

    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(@RequestBody PasswordUpdateRequest request) {
        if (request == null
                || request.getCurrentPassword() == null
                || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().build();
        }
        boolean updated = adminSettingsService.updatePassword(
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return updated ? ResponseEntity.ok().build() : ResponseEntity.status(403).build();
    }

    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
