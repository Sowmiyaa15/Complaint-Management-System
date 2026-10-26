package com.cms.dto;

import com.cms.entity.ComplaintUpdate;

import java.time.LocalDateTime;

public class ComplaintUpdateResponse {

    private Long id;
    private String comment;
    private String statusChangeFrom;
    private String statusChangeTo;
    private boolean isInternal;
    private LocalDateTime timestamp;
    private Long userId;
    private String authorName;
    private String authorRole;

    public ComplaintUpdateResponse() {
    }

    public ComplaintUpdateResponse(Long id, String comment, String statusChangeFrom, String statusChangeTo,
                                   boolean isInternal, LocalDateTime timestamp, Long userId,
                                   String authorName, String authorRole) {
        this.id = id;
        this.comment = comment;
        this.statusChangeFrom = statusChangeFrom;
        this.statusChangeTo = statusChangeTo;
        this.isInternal = isInternal;
        this.timestamp = timestamp;
        this.userId = userId;
        this.authorName = authorName;
        this.authorRole = authorRole;
    }

    public static ComplaintUpdateResponse fromEntity(ComplaintUpdate update) {
        if (update == null) return null;
        return new ComplaintUpdateResponse(
                update.getId(),
                update.getComment(),
                update.getStatusChangeFrom(),
                update.getStatusChangeTo(),
                update.isInternal(),
                update.getTimestamp(),
                update.getUser() != null ? update.getUser().getId() : null,
                update.getUser() != null ? update.getUser().getName() : "System",
                update.getUser() != null ? update.getUser().getRole().name() : ""
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getStatusChangeFrom() {
        return statusChangeFrom;
    }

    public void setStatusChangeFrom(String statusChangeFrom) {
        this.statusChangeFrom = statusChangeFrom;
    }

    public String getStatusChangeTo() {
        return statusChangeTo;
    }

    public void setStatusChangeTo(String statusChangeTo) {
        this.statusChangeTo = statusChangeTo;
    }

    public boolean isInternal() {
        return isInternal;
    }

    public void setInternal(boolean internal) {
        isInternal = internal;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(String authorRole) {
        this.authorRole = authorRole;
    }
}
