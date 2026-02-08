package com.agrilinker.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.agrilinker.backend.dto.AdminDashboardResponse;
import com.agrilinker.backend.dto.AdminFertilizerResponse;
import com.agrilinker.backend.dto.AdminOrderResponse;
import com.agrilinker.backend.dto.AdminProductResponse;
import com.agrilinker.backend.dto.AdminUserResponse;
import com.agrilinker.backend.dto.ChangePasswordRequest;
import com.agrilinker.backend.model.Fertilizer;
import com.agrilinker.backend.model.Order;
import com.agrilinker.backend.model.Product;
import com.agrilinker.backend.model.User;
import com.agrilinker.backend.repository.FertilizerRepository;
import com.agrilinker.backend.repository.OrderRepository;
import com.agrilinker.backend.repository.ProductRepository;
import com.agrilinker.backend.repository.UserRepository;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private FertilizerRepository fertilizerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AdminDashboardResponse getDashboard() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long totalFarmers = countRole(users, User.UserRole.FARMER);
        long totalBuyers = countRole(users, User.UserRole.BUYER);
        long totalSuppliers = countRole(users, User.UserRole.FERTILIZERSUPPLIER);
        long totalAdmins = countRole(users, User.UserRole.ADMIN);

        return new AdminDashboardResponse(
                totalUsers,
                totalFarmers,
                totalBuyers,
                totalSuppliers,
                totalAdmins,
                productRepository.count(),
                orderRepository.count(),
                fertilizerRepository.count());
    }

    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRoles(),
                        user.getTelephone(),
                        user.getAddress(),
                        user.getCreatedAt(),
                        user.getUpdatedAt()))
                .toList();
    }

    public List<AdminOrderResponse> getOrders() {
        return orderRepository.findAll().stream()
                .map(order -> new AdminOrderResponse(
                        order.getId(),
                        order.getCustomer() != null ? order.getCustomer().getName() : "Unknown",
                        order.getCustomer() != null ? order.getCustomer().getEmail() : "Unknown",
                        order.getTotalAmount(),
                        order.getPaymentMethod(),
                        order.getItems() != null ? order.getItems().size() : 0,
                        order.getOrderDate()))
                .toList();
    }

    public List<AdminProductResponse> getProducts() {
        return productRepository.findAll().stream()
                .map(this::mapProduct)
                .toList();
    }

    public List<AdminFertilizerResponse> getFertilizers() {
        return fertilizerRepository.findAll().stream()
                .map(this::mapFertilizer)
                .toList();
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }

    private long countRole(List<User> users, User.UserRole role) {
        return users.stream()
                .map(User::getRoles)
                .filter(roles -> roles != null && roles.contains(role))
                .count();
    }

    private AdminProductResponse mapProduct(Product product) {
        return new AdminProductResponse(
                product.getid(),
                product.getName(),
                product.getCategory(),
                product.getPrice(),
                product.getQuantity(),
                product.getUnit(),
                product.getStatus(),
                product.getFarmerId(),
                product.getLocation(),
                product.getDateAdded());
    }

    private AdminFertilizerResponse mapFertilizer(Fertilizer fertilizer) {
        return new AdminFertilizerResponse(
                fertilizer.getId(),
                fertilizer.getName(),
                fertilizer.getType(),
                fertilizer.getCategory(),
                fertilizer.getPrice(),
                fertilizer.getUnit(),
                fertilizer.getStock(),
                fertilizer.getDistrict());
    }
}
