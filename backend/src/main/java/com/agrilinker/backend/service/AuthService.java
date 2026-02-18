package com.agrilinker.backend.service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.agrilinker.backend.dto.AddRoleRequest;
import com.agrilinker.backend.dto.AuthResponse;
import com.agrilinker.backend.dto.ChangePasswordRequest;
import com.agrilinker.backend.dto.LoginRequest;
import com.agrilinker.backend.dto.RegisterRequest;
import com.agrilinker.backend.dto.UserProfileResponse;
import com.agrilinker.backend.model.User;
import com.agrilinker.backend.repository.UserRepository;
import com.agrilinker.backend.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Validate roles (must be subset of allowed roles)
        Set<User.UserRole> requestedRoles = request.getRoles();
        if (requestedRoles == null || requestedRoles.isEmpty()) {
            throw new RuntimeException("At least one role is required");
        }

        // Optionally validate each role explicitly (not necessary if using enum)
        // Create new user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(request.getRoles());
        user.setTelephone(request.getTelephone());
        user.setAddress(request.getAddress());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        // Generate JWT token with roles as comma separated string
        String rolesString = user.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));
        String token = jwtUtil.generateToken(user.getEmail(), rolesString);

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRoles());
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String rolesString = user.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));
        String token = jwtUtil.generateToken(user.getEmail(), rolesString);

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRoles());
    }

    public AuthResponse addRole(String email, AddRoleRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<User.UserRole> roles = user.getRoles();
        if (roles.contains(request.getRole())) {
            throw new RuntimeException("You are already registered for this role");
        }

        roles.add(request.getRole());
        user.setRoles(roles);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        String rolesString = user.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));
        String token = jwtUtil.generateToken(user.getEmail(), rolesString);

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRoles(),
                "Role added successfully");
    }

    public void changePassword(String email, ChangePasswordRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public UserProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRoles(),
                user.getCreatedAt().toString(),
                user.getTelephone(),
                user.getAddress());
    }
}
