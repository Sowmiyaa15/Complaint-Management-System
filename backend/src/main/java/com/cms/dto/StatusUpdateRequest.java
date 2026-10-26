package com.cms.dto;

import com.cms.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    private String comment;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(ComplaintStatus status, String comment) {
        this.status = status;
        this.comment = comment;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
