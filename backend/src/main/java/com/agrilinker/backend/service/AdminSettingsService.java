package com.agrilinker.backend.service;

public interface AdminSettingsService {
    boolean updatePassword(String currentPassword, String newPassword);
}
