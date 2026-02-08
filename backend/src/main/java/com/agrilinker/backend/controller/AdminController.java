package com.agrilinker.backend.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agrilinker.backend.dto.AdminDashboardResponse;
import com.agrilinker.backend.dto.AdminFertilizerResponse;
import com.agrilinker.backend.dto.AdminOrderResponse;
import com.agrilinker.backend.dto.AdminProductResponse;
import com.agrilinker.backend.dto.AdminUserResponse;
import com.agrilinker.backend.dto.ChangePasswordRequest;
import com.agrilinker.backend.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {
        return adminService.getDashboard();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers() {
        return adminService.getUsers();
    }

    @GetMapping("/orders")
    public List<AdminOrderResponse> getOrders() {
        return adminService.getOrders();
    }

    @GetMapping("/products")
    public List<AdminProductResponse> getProducts() {
        return adminService.getProducts();
    }

    @GetMapping("/fertilizers")
    public List<AdminFertilizerResponse> getFertilizers() {
        return adminService.getFertilizers();
    }

    @PostMapping("/change-password")
    public void changePassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        adminService.changePassword(principal.getName(), request);
    }
}
