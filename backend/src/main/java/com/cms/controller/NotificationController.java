package com.cms.controller;

import com.cms.dto.NotificationResponse;
import com.cms.entity.User;
import com.cms.service.AuthService;
import com.cms.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Endpoints for viewing and managing user notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "Get list of notifications for the current user")
    public ResponseEntity<List<NotificationResponse>> getNotifications() {
        User user = authService.getCurrentUser();
        List<NotificationResponse> list = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count for notification badge")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        User user = authService.getCurrentUser();
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        notificationService.markAsRead(id, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mark-all-read")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Void> markAllAsRead() {
        User user = authService.getCurrentUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }
}
