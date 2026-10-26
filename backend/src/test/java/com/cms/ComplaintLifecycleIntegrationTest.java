package com.cms;

import com.cms.dto.*;
import com.cms.entity.ComplaintStatus;
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
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ComplaintLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private String adminToken;
    private String emp1Token;
    private String citizen1Token;
    private String citizen2Token;

    @BeforeEach
    void setUp() {
        User admin = userRepository.findByEmail("admin@example.com").orElseThrow();
        User emp1 = userRepository.findByEmail("emp1@example.com").orElseThrow();
        User citizen1 = userRepository.findByEmail("citizen1@example.com").orElseThrow();
        User citizen2 = userRepository.findByEmail("citizen2@example.com").orElseThrow();

        adminToken = "Bearer " + tokenProvider.generateToken(UserPrincipal.create(admin));
        emp1Token = "Bearer " + tokenProvider.generateToken(UserPrincipal.create(emp1));
        citizen1Token = "Bearer " + tokenProvider.generateToken(UserPrincipal.create(citizen1));
        citizen2Token = "Bearer " + tokenProvider.generateToken(UserPrincipal.create(citizen2));
    }

    @Test
    @DisplayName("Complete Lifecycle: Citizen submits -> Admin assigns -> Employee resolves -> Internal note hidden from Citizen")
    void testCompleteComplaintLifecycle() throws Exception {
        // STEP 1: Citizen 1 submits new complaint
        MvcResult submitResult = mockMvc.perform(multipart("/api/complaints")
                .param("title", "Water leak on 2nd Floor corridor")
                .param("description", "Significant water accumulation near the elevator bank.")
                .param("category", "Infrastructure")
                .header("Authorization", citizen1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.status", is("PENDING")))
                .andReturn();

        ComplaintResponse createdComplaint = objectMapper.readValue(
                submitResult.getResponse().getContentAsString(), ComplaintResponse.class);
        Long complaintId = createdComplaint.getId();
        assertNotNull(complaintId);

        // STEP 2: Admin assigns complaint to Employee 1
        User emp1 = userRepository.findByEmail("emp1@example.com").orElseThrow();
        AssignComplaintRequest assignRequest = new AssignComplaintRequest(emp1.getId());

        mockMvc.perform(put("/api/complaints/" + complaintId + "/assign")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignRequest))
                .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ASSIGNED")))
                .andExpect(jsonPath("$.assignedEmployeeId", is(emp1.getId().intValue())));

        // STEP 3: Employee 1 adds internal note
        InternalNoteRequest noteRequest = new InternalNoteRequest("Internal: Plumbing team notified, ETA 2 hours");
        mockMvc.perform(post("/api/complaints/" + complaintId + "/notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(noteRequest))
                .header("Authorization", emp1Token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.internal", is(true)))
                .andExpect(jsonPath("$.comment", containsString("Plumbing team notified")));

        // STEP 4: Employee 1 transitions status to IN_PROGRESS
        StatusUpdateRequest inProgressRequest = new StatusUpdateRequest(
                ComplaintStatus.IN_PROGRESS, "Investigation and valve replacement underway");
        mockMvc.perform(put("/api/complaints/" + complaintId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inProgressRequest))
                .header("Authorization", emp1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_PROGRESS")));

        // STEP 5: Employee 1 transitions status to RESOLVED
        StatusUpdateRequest resolveRequest = new StatusUpdateRequest(
                ComplaintStatus.RESOLVED, "Valve replaced, corridor cleaned and dry");
        mockMvc.perform(put("/api/complaints/" + complaintId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resolveRequest))
                .header("Authorization", emp1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESOLVED")))
                .andExpect(jsonPath("$.resolvedAt", notNullValue()));

        // STEP 6: Citizen 1 views complaint details - verifies internal note is NEVER exposed
        mockMvc.perform(get("/api/complaints/" + complaintId)
                .header("Authorization", citizen1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("RESOLVED")))
                .andExpect(jsonPath("$.internalNotes", hasSize(0))); // Critical: Must be empty for citizen!

        // STEP 7: Citizen 1 directly requests /api/complaints/{id}/notes - must return 403 Forbidden
        mockMvc.perform(get("/api/complaints/" + complaintId + "/notes")
                .header("Authorization", citizen1Token))
                .andExpect(status().isForbidden());

        // STEP 8: Admin views complaint details - verifies internal notes ARE visible
        mockMvc.perform(get("/api/complaints/" + complaintId)
                .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.internalNotes", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("Negative Security: Citizen cannot access another citizen's complaint")
    void testCitizenIsolation() throws Exception {
        // Citizen 1 creates complaint
        MvcResult submitResult = mockMvc.perform(multipart("/api/complaints")
                .param("title", "Private issue for citizen 1")
                .param("description", "Confidential noise complaint")
                .param("category", "Residential")
                .header("Authorization", citizen1Token))
                .andExpect(status().isCreated())
                .andReturn();

        ComplaintResponse created = objectMapper.readValue(
                submitResult.getResponse().getContentAsString(), ComplaintResponse.class);

        // Citizen 2 attempts to fetch Citizen 1's complaint
        mockMvc.perform(get("/api/complaints/" + created.getId())
                .header("Authorization", citizen2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)));
    }
}
