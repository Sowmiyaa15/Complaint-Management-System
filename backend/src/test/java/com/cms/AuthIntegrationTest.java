package com.cms;

import com.cms.dto.LoginRequest;
import com.cms.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should successfully login as Admin and receive JWT token")
    void testAdminLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@example.com", "Admin@123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role", is("ADMIN")))
                .andExpect(jsonPath("$.email", is("admin@example.com")));
    }

    @Test
    @DisplayName("Should fail login with incorrect password with 401 Unauthorized")
    void testLoginWithBadCredentials() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin@example.com", "WrongPassword999!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }

    @Test
    @DisplayName("Should successfully register a new Citizen user")
    void testCitizenRegistrationSuccess() throws Exception {
        long timestamp = System.currentTimeMillis();
        String testEmail = "citizen_" + timestamp + "@example.com";
        RegisterRequest registerRequest = new RegisterRequest("New Citizen", testEmail, "SecurePass123!", "+1-555-9999");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.role", is("CITIZEN")))
                .andExpect(jsonPath("$.email", is(testEmail)));
    }

    @Test
    @DisplayName("Should reject duplicate registration with 409 Conflict")
    void testDuplicateRegistrationConflict() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest("Admin Duplicate", "admin@example.com", "Password123!", null);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)));
    }

    @Test
    @DisplayName("Should reject unauthenticated access to /api/auth/me with 401 Unauthorized")
    void testUnauthenticatedCurrentUserFails() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
