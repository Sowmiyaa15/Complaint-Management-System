package com.cms;

import com.cms.dto.AssignComplaintRequest;
import com.cms.entity.User;
import com.cms.repository.UserRepository;
import com.cms.security.JwtTokenProvider;
import com.cms.security.UserPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class RbacSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String empToken;
    private String citizenToken;

    @BeforeEach
    void setUp() {
        User emp = userRepository.findByEmail("emp1@example.com").orElseThrow();
        User citizen = userRepository.findByEmail("citizen1@example.com").orElseThrow();

        empToken = "Bearer " + tokenProvider.generateToken(UserPrincipal.create(emp));
        citizenToken = "Bearer " + tokenProvider.generateToken(UserPrincipal.create(citizen));
    }

    @Test
    @DisplayName("Citizen cannot access user management endpoints")
    void testCitizenCannotAccessUserManagement() throws Exception {
        mockMvc.perform(get("/api/users")
                .header("Authorization", citizenToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Employee cannot access user management endpoints")
    void testEmployeeCannotAccessUserManagement() throws Exception {
        mockMvc.perform(get("/api/users")
                .header("Authorization", empToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Citizen cannot access report endpoints")
    void testCitizenCannotAccessReports() throws Exception {
        mockMvc.perform(get("/api/reports/kpis")
                .header("Authorization", citizenToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Employee cannot assign complaints")
    void testEmployeeCannotAssignComplaint() throws Exception {
        AssignComplaintRequest request = new AssignComplaintRequest(1L);
        mockMvc.perform(put("/api/complaints/1/assign")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("Authorization", empToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Invalid JWT token must be rejected with 401 Unauthorized")
    void testInvalidJwtRejected() throws Exception {
        mockMvc.perform(get("/api/complaints/my")
                .header("Authorization", "Bearer invalid.fake.token12345"))
                .andExpect(status().isUnauthorized());
    }
}
