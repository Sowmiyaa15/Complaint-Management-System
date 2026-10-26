package com.cms.dto;

import com.cms.entity.Complaint;
import com.cms.entity.ComplaintStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ComplaintResponse {

    private Long id;
    private String title;
    private String description;
    private String category;
    private ComplaintStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime resolvedAt;

    private Long complainantId;
    private String complainantName;
    private String complainantEmail;

    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private String assignedEmployeeEmail;

    private List<AttachmentResponse> attachments = new ArrayList<>();
    private List<ComplaintUpdateResponse> updates = new ArrayList<>();
    private List<ComplaintUpdateResponse> internalNotes = new ArrayList<>();

    public ComplaintResponse() {
    }

    public static ComplaintResponse fromEntity(Complaint complaint, boolean isStaff) {
        if (complaint == null) return null;

        ComplaintResponse response = new ComplaintResponse();
        response.setId(complaint.getId());
        response.setTitle(complaint.getTitle());
        response.setDescription(complaint.getDescription());
        response.setCategory(complaint.getCategory());
        response.setStatus(complaint.getStatus());
        response.setSubmittedAt(complaint.getSubmittedAt());
        response.setResolvedAt(complaint.getResolvedAt());

        if (complaint.getComplainant() != null) {
            response.setComplainantId(complaint.getComplainant().getId());
            response.setComplainantName(complaint.getComplainant().getName());
            response.setComplainantEmail(complaint.getComplainant().getEmail());
        }

        if (complaint.getAssignedEmployee() != null) {
            response.setAssignedEmployeeId(complaint.getAssignedEmployee().getId());
            response.setAssignedEmployeeName(complaint.getAssignedEmployee().getName());
            response.setAssignedEmployeeEmail(complaint.getAssignedEmployee().getEmail());
        }

        if (complaint.getAttachments() != null) {
            List<AttachmentResponse> attachmentList = new ArrayList<>();
            complaint.getAttachments().forEach(att -> attachmentList.add(AttachmentResponse.fromEntity(att)));
            response.setAttachments(attachmentList);
        }

        if (complaint.getUpdates() != null) {
            List<ComplaintUpdateResponse> publicUpdates = new ArrayList<>();
            List<ComplaintUpdateResponse> notes = new ArrayList<>();

            complaint.getUpdates().forEach(update -> {
                if (update.isInternal()) {
                    if (isStaff) {
                        notes.add(ComplaintUpdateResponse.fromEntity(update));
                    }
                } else {
                    publicUpdates.add(ComplaintUpdateResponse.fromEntity(update));
                }
            });

            response.setUpdates(publicUpdates);
            if (isStaff) {
                response.setInternalNotes(notes);
            } else {
                response.setInternalNotes(new ArrayList<>());
            }
        }

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Long getComplainantId() {
        return complainantId;
    }

    public void setComplainantId(Long complainantId) {
        this.complainantId = complainantId;
    }

    public String getComplainantName() {
        return complainantName;
    }

    public void setComplainantName(String complainantName) {
        this.complainantName = complainantName;
    }

    public String getComplainantEmail() {
        return complainantEmail;
    }

    public void setComplainantEmail(String complainantEmail) {
        this.complainantEmail = complainantEmail;
    }

    public Long getAssignedEmployeeId() {
        return assignedEmployeeId;
    }

    public void setAssignedEmployeeId(Long assignedEmployeeId) {
        this.assignedEmployeeId = assignedEmployeeId;
    }

    public String getAssignedEmployeeName() {
        return assignedEmployeeName;
    }

    public void setAssignedEmployeeName(String assignedEmployeeName) {
        this.assignedEmployeeName = assignedEmployeeName;
    }

    public String getAssignedEmployeeEmail() {
        return assignedEmployeeEmail;
    }

    public void setAssignedEmployeeEmail(String assignedEmployeeEmail) {
        this.assignedEmployeeEmail = assignedEmployeeEmail;
    }

    public List<AttachmentResponse> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<AttachmentResponse> attachments) {
        this.attachments = attachments;
    }

    public List<ComplaintUpdateResponse> getUpdates() {
        return updates;
    }

    public void setUpdates(List<ComplaintUpdateResponse> updates) {
        this.updates = updates;
    }

    public List<ComplaintUpdateResponse> getInternalNotes() {
        return internalNotes;
    }

    public void setInternalNotes(List<ComplaintUpdateResponse> internalNotes) {
        this.internalNotes = internalNotes;
    }
}
