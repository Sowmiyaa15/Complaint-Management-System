package com.cms.dto;

import com.cms.entity.ComplaintStatus;

public class StatusCountResponse {

    private ComplaintStatus status;
    private long count;

    public StatusCountResponse() {
    }

    public StatusCountResponse(ComplaintStatus status, long count) {
        this.status = status;
        this.count = count;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
