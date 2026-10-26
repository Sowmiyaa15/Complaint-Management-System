package com.cms.controller;

import com.cms.dto.*;
import com.cms.entity.ComplaintStatus;
import com.cms.entity.User;
import com.cms.service.AuthService;
import com.cms.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@Tag(name = "Complaints", description = "Endpoints for managing complaints lifecycle")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuthService authService;

    public ComplaintController(ComplaintService complaintService, AuthService authService) {
        this.complaintService = complaintService;
        this.authService = authService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit a new complaint with optional supporting files")
    public ResponseEntity<ComplaintResponse> submitComplaint(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        User currentUser = authService.getCurrentUser();
        ComplaintRequest request = new ComplaintRequest(title, description, category);
        ComplaintResponse response = complaintService.submitComplaint(request, files, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "List and search complaints with filters and pagination")
    public ResponseEntity<Page<ComplaintResponse>> getComplaints(
            @RequestParam(value = "status", required = false) ComplaintStatus status,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "submittedAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        User currentUser = authService.getCurrentUser();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ComplaintResponse> complaints = complaintService.searchComplaints(
                currentUser, status, category, startDate, endDate, search, pageable
        );
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/my")
    @Operation(summary = "Get complaints submitted by the currently logged-in user")
    public ResponseEntity<Page<ComplaintResponse>> getMyComplaints(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "submittedAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        User currentUser = authService.getCurrentUser();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ComplaintResponse> complaints = complaintService.getMyComplaints(currentUser, pageable);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/assigned")
    @Operation(summary = "Get complaints assigned to the logged-in employee (or all for admin)")
    public ResponseEntity<Page<ComplaintResponse>> getAssignedComplaints(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "submittedAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        User currentUser = authService.getCurrentUser();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ComplaintResponse> complaints = complaintService.getAssignedComplaints(currentUser, pageable);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single complaint details (with public history, internal notes hidden from citizens)")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        ComplaintResponse response = complaintService.getComplaintById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update complaint title, description, category (Admin only)")
    public ResponseEntity<ComplaintResponse> updateComplaintDetails(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest request) {
        User admin = authService.getCurrentUser();
        ComplaintResponse response = complaintService.updateComplaintDetails(id, request, admin);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign a complaint to an employee (Admin only)")
    public ResponseEntity<ComplaintResponse> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request) {
        User admin = authService.getCurrentUser();
        ComplaintResponse response = complaintService.assignComplaint(id, request.getEmployeeId(), admin);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update complaint status (Employee assigned or Admin)")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        User currentUser = authService.getCurrentUser();
        ComplaintResponse response = complaintService.updateStatus(id, request, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Add an internal staff note (Employee assigned or Admin)")
    public ResponseEntity<ComplaintUpdateResponse> addInternalNote(
            @PathVariable Long id,
            @Valid @RequestBody InternalNoteRequest request) {
        User currentUser = authService.getCurrentUser();
        ComplaintUpdateResponse response = complaintService.addInternalNote(id, request.getNote(), currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Get internal staff notes for a complaint (Employee assigned or Admin)")
    public ResponseEntity<List<ComplaintUpdateResponse>> getInternalNotes(@PathVariable Long id) {
        User currentUser = authService.getCurrentUser();
        List<ComplaintUpdateResponse> notes = complaintService.getInternalNotes(id, currentUser);
        return ResponseEntity.ok(notes);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Permanently delete a complaint (Admin only)")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        User admin = authService.getCurrentUser();
        complaintService.deleteComplaint(id, admin);
        return ResponseEntity.noContent().build();
    }
}
