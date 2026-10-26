package com.cms.service;

import com.cms.dto.NotificationResponse;
import com.cms.entity.Complaint;
import com.cms.entity.Notification;
import com.cms.entity.User;
import com.cms.exception.ResourceNotFoundException;
import com.cms.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User recipient, Complaint complaint, String title, String message) {
        if (recipient == null) return;
        Notification notification = new Notification(recipient, complaint, title, message);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found with ID: " + id);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }
}
