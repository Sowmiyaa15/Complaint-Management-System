package com.cms.dto;

import com.cms.entity.Role;
import com.cms.entity.User;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private Role role;
    private String phoneNumber;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    public UserResponse(Long id, String email, String name, Role role, String phoneNumber, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.phoneNumber = phoneNumber;
        this.createdAt = createdAt;
    }

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
