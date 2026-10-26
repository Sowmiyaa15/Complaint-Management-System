package com.cms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachments", indexes = {
    @Index(name = "idx_attachments_complaint", columnList = "complaint_id")
})
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(name = "file_url", nullable = false, length = 255)
    private String fileUrl;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    public Attachment() {
    }

    public Attachment(Complaint complaint, String fileUrl, String fileName, String mimeType, Long fileSize) {
        this.complaint = complaint;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.uploadedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.uploadedAt == null) {
            this.uploadedAt = LocalDateTime.now();
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

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
