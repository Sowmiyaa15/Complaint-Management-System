package com.cms.dto;

import com.cms.entity.Attachment;

import java.time.LocalDateTime;

public class AttachmentResponse {

    private Long id;
    private String fileName;
    private String fileUrl;
    private String mimeType;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    public AttachmentResponse() {
    }

    public AttachmentResponse(Long id, String fileName, String fileUrl, String mimeType, Long fileSize, LocalDateTime uploadedAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    public static AttachmentResponse fromEntity(Attachment attachment) {
        if (attachment == null) return null;
        return new AttachmentResponse(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFileUrl(),
                attachment.getMimeType(),
                attachment.getFileSize(),
                attachment.getUploadedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
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
