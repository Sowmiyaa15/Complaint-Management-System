package com.cms.controller;

import com.cms.dto.CategoryCountResponse;
import com.cms.dto.EmployeePerformanceResponse;
import com.cms.dto.ReportKpisResponse;
import com.cms.dto.StatusCountResponse;
import com.cms.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reports & Analytics", description = "Admin endpoints for reporting and analytics")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get high-level summary KPIs (Admin only)")
    public ResponseEntity<ReportKpisResponse> getKpis() {
        ReportKpisResponse response = reportService.getKpis();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status-breakdown")
    @Operation(summary = "Get complaint breakdown by status (Admin only)")
    public ResponseEntity<List<StatusCountResponse>> getStatusBreakdown() {
        List<StatusCountResponse> list = reportService.getStatusBreakdown();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/category-distribution")
    @Operation(summary = "Get complaint distribution by category (Admin only)")
    public ResponseEntity<List<CategoryCountResponse>> getCategoryDistribution() {
        List<CategoryCountResponse> list = reportService.getCategoryDistribution();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/trends")
    @Operation(summary = "Get complaint submission trends over time (Admin only)")
    public ResponseEntity<List<Map<String, Object>>> getTrends() {
        List<Map<String, Object>> list = reportService.getSubmissionTrends();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/resolution-time")
    @Operation(summary = "Get average resolution time metric (Admin only)")
    public ResponseEntity<Map<String, Double>> getResolutionTime() {
        ReportKpisResponse kpis = reportService.getKpis();
        return ResponseEntity.ok(Collections.singletonMap("averageResolutionHours", kpis.getAverageResolutionHours()));
    }

    @GetMapping("/employee-performance")
    @Operation(summary = "Get complaints resolved per employee within date range (Admin only)")
    public ResponseEntity<List<EmployeePerformanceResponse>> getEmployeePerformance(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<EmployeePerformanceResponse> list = reportService.getEmployeePerformance(startDate, endDate);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/export-csv")
    @Operation(summary = "Export complaints report as CSV file (Admin only)")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        String csv = reportService.generateComplaintsCsv(startDate, endDate);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"complaints_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
