package com.cms.dto;

public class EmployeePerformanceResponse {

    private Long employeeId;
    private String employeeName;
    private long resolvedCount;

    public EmployeePerformanceResponse() {
    }

    public EmployeePerformanceResponse(Long employeeId, String employeeName, long resolvedCount) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.resolvedCount = resolvedCount;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public long getResolvedCount() {
        return resolvedCount;
    }

    public void setResolvedCount(long resolvedCount) {
        this.resolvedCount = resolvedCount;
    }
}
