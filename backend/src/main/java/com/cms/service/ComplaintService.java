package com.cms.service;

import com.cms.dto.*;
import com.cms.entity.*;
import com.cms.exception.BadRequestException;
import com.cms.exception.ConflictException;
import com.cms.exception.ResourceNotFoundException;
import com.cms.exception.UnauthorizedException;
import com.cms.repository.AttachmentRepository;
import com.cms.repository.ComplaintRepository;
import com.cms.repository.ComplaintUpdateRepository;
import com.cms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;
    private final AttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintUpdateRepository complaintUpdateRepository,
                            AttachmentRepository attachmentRepository,
                            UserRepository userRepository,
                            FileStorageService fileStorageService,
                            NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.complaintUpdateRepository = complaintUpdateRepository;
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ComplaintResponse submitComplaint(ComplaintRequest request, List<MultipartFile> files, User complainant) {
        Complaint complaint = new Complaint(
                request.getTitle().trim(),
                request.getDescription().trim(),
                request.getCategory().trim(),
                complainant
        );
        complaint.setStatus(ComplaintStatus.PENDING);
        complaint.setSubmittedAt(LocalDateTime.now());

        complaint = complaintRepository.save(complaint);

        // Handle attachments if any
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String storedName = fileStorageService.storeFile(file);
                    Attachment attachment = new Attachment(
                            complaint,
                            "/api/attachments/" + storedName + "/view",
                            file.getOriginalFilename(),
                            file.getContentType(),
                            file.getSize()
                    );
                    attachmentRepository.save(attachment);
                    complaint.getAttachments().add(attachment);
                }
            }
        }

        // Initial complaint history audit log
        ComplaintUpdate initialUpdate = new ComplaintUpdate(
                complaint,
                complainant,
                "Complaint submitted with initial status PENDING",
                null,
                ComplaintStatus.PENDING.name(),
                false
        );
        complaintUpdateRepository.save(initialUpdate);
        complaint.getUpdates().add(initialUpdate);

        return ComplaintResponse.fromEntity(complaint, complainant.getRole() != Role.CITIZEN);
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long id, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        // Enforce RBAC ownership checks
        if (currentUser.getRole() == Role.CITIZEN) {
            if (!complaint.getComplainant().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access Denied: You can only view your own complaints");
            }
        } else if (currentUser.getRole() == Role.EMPLOYEE) {
            boolean isAssigned = complaint.getAssignedEmployee() != null &&
                    complaint.getAssignedEmployee().getId().equals(currentUser.getId());
            boolean isComplainant = complaint.getComplainant().getId().equals(currentUser.getId());
            if (!isAssigned && !isComplainant) {
                throw new AccessDeniedException("Access Denied: You can only view complaints assigned to you");
            }
        }

        boolean isStaff = (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.EMPLOYEE);
        return ComplaintResponse.fromEntity(complaint, isStaff);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> searchComplaints(User currentUser,
                                                    ComplaintStatus status,
                                                    String category,
                                                    LocalDateTime startDate,
                                                    LocalDateTime endDate,
                                                    String search,
                                                    Pageable pageable) {
        User complainantFilter = null;
        User employeeFilter = null;

        if (currentUser.getRole() == Role.CITIZEN) {
            complainantFilter = currentUser;
        } else if (currentUser.getRole() == Role.EMPLOYEE) {
            employeeFilter = currentUser;
        }

        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanCategory = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL"))
                ? category.trim() : null;

        boolean isStaff = currentUser.getRole() != Role.CITIZEN;
        return complaintRepository.searchComplaints(
                complainantFilter,
                employeeFilter,
                status,
                cleanCategory,
                startDate,
                endDate,
                cleanSearch,
                pageable
        ).map(c -> ComplaintResponse.fromEntity(c, isStaff));
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getMyComplaints(User currentUser, Pageable pageable) {
        boolean isStaff = currentUser.getRole() != Role.CITIZEN;
        return complaintRepository.findByComplainant(currentUser, pageable)
                .map(c -> ComplaintResponse.fromEntity(c, isStaff));
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getAssignedComplaints(User currentUser, Pageable pageable) {
        if (currentUser.getRole() == Role.CITIZEN) {
            throw new AccessDeniedException("Citizens cannot view assigned queues");
        }

        if (currentUser.getRole() == Role.EMPLOYEE) {
            return complaintRepository.findByAssignedEmployee(currentUser, pageable)
                    .map(c -> ComplaintResponse.fromEntity(c, true));
        }

        // ADMIN view of assigned complaints
        return complaintRepository.searchComplaints(null, null, null, null, null, null, null, pageable)
                .map(c -> ComplaintResponse.fromEntity(c, true));
    }

    @Transactional
    public ComplaintResponse assignComplaint(Long id, Long employeeId, User adminUser) {
        if (adminUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Administrators can assign complaints");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));

        if (employee.getRole() != Role.EMPLOYEE) {
            throw new BadRequestException("Complaints can only be assigned to users with the EMPLOYEE role");
        }

        String oldStatus = complaint.getStatus().name();
        complaint.setAssignedEmployee(employee);
        complaint.setStatus(ComplaintStatus.ASSIGNED);

        complaint = complaintRepository.save(complaint);

        // Audit log
        ComplaintUpdate update = new ComplaintUpdate(
                complaint,
                adminUser,
                "Complaint assigned to " + employee.getName(),
                oldStatus,
                ComplaintStatus.ASSIGNED.name(),
                false
        );
        complaintUpdateRepository.save(update);

        // Notify employee
        notificationService.createNotification(
                employee,
                complaint,
                "New Complaint Assigned",
                "Complaint #" + complaint.getId() + " - \"" + complaint.getTitle() + "\" has been assigned to you."
        );

        return ComplaintResponse.fromEntity(complaint, true);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, StatusUpdateRequest request, User currentUser) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        // Enforce employee assignment check
        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (complaint.getAssignedEmployee() == null ||
                    !complaint.getAssignedEmployee().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access Denied: You can only update complaints assigned to you");
            }
        } else if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Citizens cannot update complaint status");
        }

        ComplaintStatus oldStatus = complaint.getStatus();
        ComplaintStatus newStatus = request.getStatus();

        // Validate status transition
        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (newStatus != ComplaintStatus.IN_PROGRESS &&
                newStatus != ComplaintStatus.RESOLVED &&
                newStatus != ComplaintStatus.CLOSED) {
                throw new BadRequestException("Employees can only transition to IN_PROGRESS, RESOLVED, or CLOSED");
            }
        }

        complaint.setStatus(newStatus);
        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        complaint = complaintRepository.save(complaint);

        // Audit log
        String comment = request.getComment() != null && !request.getComment().trim().isEmpty()
                ? request.getComment().trim()
                : "Status changed from " + oldStatus + " to " + newStatus;

        ComplaintUpdate update = new ComplaintUpdate(
                complaint,
                currentUser,
                comment,
                oldStatus.name(),
                newStatus.name(),
                false
        );
        complaintUpdateRepository.save(update);

        // Notify complainant
        notificationService.createNotification(
                complaint.getComplainant(),
                complaint,
                "Complaint Status Updated",
                "Your complaint #" + complaint.getId() + " status is now " + newStatus.name() + "."
        );

        return ComplaintResponse.fromEntity(complaint, true);
    }

    @Transactional
    public ComplaintUpdateResponse addInternalNote(Long id, String noteContent, User currentUser) {
        if (currentUser.getRole() == Role.CITIZEN) {
            throw new AccessDeniedException("Access Denied: Citizens cannot create internal notes");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (complaint.getAssignedEmployee() == null ||
                    !complaint.getAssignedEmployee().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access Denied: You can only add notes to complaints assigned to you");
            }
        }

        ComplaintUpdate note = new ComplaintUpdate(
                complaint,
                currentUser,
                noteContent.trim(),
                null,
                null,
                true // isInternal = true
        );

        note = complaintUpdateRepository.save(note);
        return ComplaintUpdateResponse.fromEntity(note);
    }

    @Transactional(readOnly = true)
    public List<ComplaintUpdateResponse> getInternalNotes(Long id, User currentUser) {
        if (currentUser.getRole() == Role.CITIZEN) {
            throw new AccessDeniedException("Access Denied: Citizens cannot view internal notes");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (complaint.getAssignedEmployee() == null ||
                    !complaint.getAssignedEmployee().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access Denied: You can only view notes of complaints assigned to you");
            }
        }

        return complaintUpdateRepository.findByComplaintAndIsInternalTrueOrderByTimestampAsc(complaint).stream()
                .map(ComplaintUpdateResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateComplaintDetails(Long id, ComplaintRequest request, User adminUser) {
        if (adminUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Administrators can edit complaint details");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setCategory(request.getCategory().trim());

        complaint = complaintRepository.save(complaint);

        // Audit log
        ComplaintUpdate update = new ComplaintUpdate(
                complaint,
                adminUser,
                "Complaint details updated by Administrator",
                null,
                null,
                false
        );
        complaintUpdateRepository.save(update);

        return ComplaintResponse.fromEntity(complaint, true);
    }

    @Transactional
    public void deleteComplaint(Long id, User adminUser) {
        if (adminUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Administrators can delete complaints");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + id));

        complaintRepository.delete(complaint);
    }
}
