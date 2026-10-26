package com.cms.service;

import com.cms.dto.*;
import com.cms.entity.Complaint;
import com.cms.entity.ComplaintStatus;
import com.cms.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ReportService {

    private final ComplaintRepository complaintRepository;

    public ReportService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    @Transactional(readOnly = true)
    public ReportKpisResponse getKpis() {
        long total = complaintRepository.count();
        long pending = complaintRepository.countByStatus(ComplaintStatus.PENDING);
        long assigned = complaintRepository.countByStatus(ComplaintStatus.ASSIGNED);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long closed = complaintRepository.countByStatus(ComplaintStatus.CLOSED);
        long unassigned = complaintRepository.countByAssignedEmployeeIsNull();

        // Calculate average resolution time in hours
        List<Complaint> resolvedComplaints = complaintRepository.findResolvedComplaints();
        double avgHours = 0.0;
        if (!resolvedComplaints.isEmpty()) {
            long totalHours = 0;
            int count = 0;
            for (Complaint c : resolvedComplaints) {
                if (c.getSubmittedAt() != null && c.getResolvedAt() != null) {
                    totalHours += Math.max(1, Duration.between(c.getSubmittedAt(), c.getResolvedAt()).toHours());
                    count++;
                }
            }
            if (count > 0) {
                avgHours = Math.round(((double) totalHours / count) * 10.0) / 10.0;
            }
        }

        return new ReportKpisResponse(
                total, pending, assigned, inProgress, resolved, closed, avgHours, unassigned
        );
    }

    @Transactional(readOnly = true)
    public List<StatusCountResponse> getStatusBreakdown() {
        List<StatusCountResponse> result = new ArrayList<>();
        for (ComplaintStatus status : ComplaintStatus.values()) {
            long count = complaintRepository.countByStatus(status);
            result.add(new StatusCountResponse(status, count));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<CategoryCountResponse> getCategoryDistribution() {
        List<Object[]> rows = complaintRepository.countComplaintsByCategory();
        List<CategoryCountResponse> result = new ArrayList<>();
        for (Object[] row : rows) {
            String category = (String) row[0];
            long count = ((Number) row[1]).longValue();
            result.add(new CategoryCountResponse(category != null ? category : "Uncategorized", count));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSubmissionTrends() {
        List<Complaint> all = complaintRepository.findAll();
        Map<String, Long> dateCounts = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Complaint c : all) {
            if (c.getSubmittedAt() != null) {
                String dateKey = c.getSubmittedAt().format(formatter);
                dateCounts.put(dateKey, dateCounts.getOrDefault(dateKey, 0L) + 1);
            }
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (Map.Entry<String, Long> entry : dateCounts.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("date", entry.getKey());
            item.put("count", entry.getValue());
            list.add(item);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<EmployeePerformanceResponse> getEmployeePerformance(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> rows = complaintRepository.countResolvedByEmployee(startDate, endDate);
        List<EmployeePerformanceResponse> result = new ArrayList<>();
        for (Object[] row : rows) {
            Long empId = ((Number) row[0]).longValue();
            String empName = (String) row[1];
            long count = ((Number) row[2]).longValue();
            result.add(new EmployeePerformanceResponse(empId, empName, count));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public String generateComplaintsCsv(LocalDateTime startDate, LocalDateTime endDate) {
        List<Complaint> complaints = complaintRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("Complaint ID,Title,Category,Status,Complainant Name,Complainant Email,Assigned Employee,Submitted At,Resolved At\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Complaint c : complaints) {
            if (startDate != null && c.getSubmittedAt().isBefore(startDate)) continue;
            if (endDate != null && c.getSubmittedAt().isAfter(endDate)) continue;

            sb.append(c.getId()).append(",");
            sb.append("\"").append(c.getTitle().replace("\"", "\"\"")).append("\",");
            sb.append("\"").append(c.getCategory().replace("\"", "\"\"")).append("\",");
            sb.append(c.getStatus().name()).append(",");
            sb.append("\"").append(c.getComplainant() != null ? c.getComplainant().getName().replace("\"", "\"\"") : "").append("\",");
            sb.append(c.getComplainant() != null ? c.getComplainant().getEmail() : "").append(",");
            sb.append("\"").append(c.getAssignedEmployee() != null ? c.getAssignedEmployee().getName().replace("\"", "\"\"") : "Unassigned").append("\",");
            sb.append(c.getSubmittedAt() != null ? c.getSubmittedAt().format(dtf) : "").append(",");
            sb.append(c.getResolvedAt() != null ? c.getResolvedAt().format(dtf) : "").append("\n");
        }

        return sb.toString();
    }
}
