package com.cms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_updates", indexes = {
    @Index(name = "idx_updates_complaint", columnList = "complaint_id"),
    @Index(name = "idx_updates_timestamp", columnList = "timestamp")
})
public class ComplaintUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "status_change_from", length = 255)
    private String statusChangeFrom;

    @Column(name = "status_change_to", length = 255)
    private String statusChangeTo;

    @Column(name = "is_internal", nullable = false)
    private boolean isInternal = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    public ComplaintUpdate() {
    }

    public ComplaintUpdate(Complaint complaint, User user, String comment, String statusChangeFrom, String statusChangeTo, boolean isInternal) {
        this.complaint = complaint;
        this.user = user;
        this.comment = comment;
        this.statusChangeFrom = statusChangeFrom;
        this.statusChangeTo = statusChangeTo;
        this.isInternal = isInternal;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
}
