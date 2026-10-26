package com.cms.service;

import com.cms.dto.CreateUserRequest;
import com.cms.dto.ProfileUpdateRequest;
import com.cms.dto.UpdateUserRequest;
import com.cms.dto.UserResponse;
import com.cms.entity.Role;
import com.cms.entity.User;
import com.cms.exception.BadRequestException;
import com.cms.exception.ConflictException;
import com.cms.exception.ResourceNotFoundException;
import com.cms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Role role, String search, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return userRepository.searchUsers(role, cleanSearch, pageable)
                .map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getEmployees() {
        return userRepository.findByRole(Role.EMPLOYEE).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("User with email " + email + " already exists");
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getRole(),
                request.getName().trim(),
                request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null
        );

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        String newEmail = request.getEmail().toLowerCase().trim();
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new ConflictException("Email " + newEmail + " is already in use");
        }

        user.setEmail(newEmail);
        user.setName(request.getName().trim());
        user.setRole(request.getRole());
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        userRepository.delete(user);
    }

    @Transactional
    public UserResponse updateProfile(User user, ProfileUpdateRequest request) {
        String newEmail = request.getEmail().toLowerCase().trim();
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new ConflictException("Email " + newEmail + " is already in use");
        }

        user.setEmail(newEmail);
        user.setName(request.getName().trim());
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }
}
