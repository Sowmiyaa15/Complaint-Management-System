package com.cms.dto;

import jakarta.validation.constraints.NotNull;

public class AssignComplaintRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    public AssignComplaintRequest() {
    }

    public AssignComplaintRequest(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
}
