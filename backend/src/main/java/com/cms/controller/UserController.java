package com.cms.controller;

import com.cms.dto.CreateUserRequest;
import com.cms.dto.UpdateUserRequest;
import com.cms.dto.UserResponse;
import com.cms.entity.Role;
import com.cms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "User Management", description = "Admin endpoints for user management")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "List and search all users with pagination (Admin only)")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(value = "role", required = false) Role role,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserResponse> users = userService.getAllUsers(role, search, pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/employees")
    @Operation(summary = "List all active employees for complaint assignment dropdown (Admin only)")
    public ResponseEntity<List<UserResponse>> getEmployees() {
        List<UserResponse> employees = userService.getEmployees();
        return ResponseEntity.ok(employees);
    }

    @PostMapping
    @Operation(summary = "Create a new Employee or Administrator user (Admin only)")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID (Admin only)")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user details by ID (Admin only)")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete or deactivate a user by ID (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
