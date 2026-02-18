package com.agrilinker.backend.dto;

import com.agrilinker.backend.model.User.UserRole;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddRoleRequest {

    @NotNull(message = "Role is required")
    private UserRole role;
}
