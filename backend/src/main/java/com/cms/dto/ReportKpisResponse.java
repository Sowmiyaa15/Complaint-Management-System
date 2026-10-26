package com.cms.dto;

public class ReportKpisResponse {

    private long totalComplaints;
    private long pendingCount;
    private long assignedCount;
    private long inProgressCount;
    private long resolvedCount;
    private long closedCount;
    private double averageResolutionHours;
    private long unassignedCount;

    public ReportKpisResponse() {
    }

    public ReportKpisResponse(long totalComplaints, long pendingCount, long assignedCount,
                              long inProgressCount, long resolvedCount, long closedCount,
                              double averageResolutionHours, long unassignedCount) {
        this.totalComplaints = totalComplaints;
        this.pendingCount = pendingCount;
        this.assignedCount = assignedCount;
        this.inProgressCount = inProgressCount;
        this.resolvedCount = resolvedCount;
        this.closedCount = closedCount;
        this.averageResolutionHours = averageResolutionHours;
        this.unassignedCount = unassignedCount;
    }

    public long getTotalComplaints() {
        return totalComplaints;
    }

    public void setTotalComplaints(long totalComplaints) {
        this.totalComplaints = totalComplaints;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public long getAssignedCount() {
        return assignedCount;
    }

    public void setAssignedCount(long assignedCount) {
        this.assignedCount = assignedCount;
    }

    public long getInProgressCount() {
        return inProgressCount;
    }

    public void setInProgressCount(long inProgressCount) {
        this.inProgressCount = inProgressCount;
    }

    public long getResolvedCount() {
        return resolvedCount;
    }

    public void setResolvedCount(long resolvedCount) {
        this.resolvedCount = resolvedCount;
    }

    public long getClosedCount() {
        return closedCount;
    }

    public void setClosedCount(long closedCount) {
        this.closedCount = closedCount;
    }

    public double getAverageResolutionHours() {
        return averageResolutionHours;
    }

    public void setAverageResolutionHours(double averageResolutionHours) {
        this.averageResolutionHours = averageResolutionHours;
    }

    public long getUnassignedCount() {
        return unassignedCount;
    }

    public void setUnassignedCount(long unassignedCount) {
        this.unassignedCount = unassignedCount;
    }
}
