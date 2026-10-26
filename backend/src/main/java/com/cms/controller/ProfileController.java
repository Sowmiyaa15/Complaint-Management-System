package com.cms.controller;

import com.cms.dto.ProfileUpdateRequest;
import com.cms.dto.UserResponse;
import com.cms.entity.User;
import com.cms.service.AuthService;
import com.cms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "Endpoints for managing user profile details")
public class ProfileController {

    private final AuthService authService;
    private final UserService userService;

    public ProfileController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserResponse> getProfile() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping
    @Operation(summary = "Update current user profile (name, email, phone)")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User user = authService.getCurrentUser();
        UserResponse response = userService.updateProfile(user, request);
        return ResponseEntity.ok(response);
    }
}
