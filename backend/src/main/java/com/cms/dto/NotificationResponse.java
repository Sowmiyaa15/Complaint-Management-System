package com.cms.dto;

import com.cms.entity.Notification;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private Long complaintId;
    private String title;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(Long id, Long complaintId, String title, String message, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.complaintId = complaintId;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public static NotificationResponse fromEntity(Notification notification) {
        if (notification == null) return null;
        return new NotificationResponse(
                notification.getId(),
                notification.getComplaint() != null ? notification.getComplaint().getId() : null,
                notification.getTitle(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getComplaintId() {
        return complaintId;
    }

    public void setComplaintId(Long complaintId) {
        this.complaintId = complaintId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
