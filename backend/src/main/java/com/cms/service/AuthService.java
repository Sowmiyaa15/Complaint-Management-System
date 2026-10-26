package com.cms.service;

import com.cms.dto.AuthResponse;
import com.cms.dto.LoginRequest;
import com.cms.dto.RegisterRequest;
import com.cms.entity.Role;
import com.cms.entity.User;
import com.cms.exception.ConflictException;
import com.cms.exception.ResourceNotFoundException;
import com.cms.exception.UnauthorizedException;
import com.cms.repository.UserRepository;
import com.cms.security.JwtTokenProvider;
import com.cms.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new ConflictException("An account with email " + request.getEmail() + " already exists");
        }

        User user = new User(
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                Role.CITIZEN,
                request.getName().trim(),
                request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null
        );

        user = userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(userPrincipal);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getPhoneNumber()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String token = tokenProvider.generateToken(userPrincipal);

        return new AuthResponse(
                token,
                userPrincipal.getId(),
                userPrincipal.getUsername(),
                userPrincipal.getName(),
                userPrincipal.getRole(),
                userPrincipal.getPhoneNumber()
        );
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User is not authenticated");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + principal.getId()));
    }
}
