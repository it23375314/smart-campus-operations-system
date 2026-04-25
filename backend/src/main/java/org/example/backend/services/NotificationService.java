package org.example.backend.services;

import org.example.backend.models.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getUserNotifications(String userId);
    List<Notification> getUnreadNotifications(String userId);
    long getUnreadCount(String userId);
    Notification markAsRead(String notificationId);
    void markAllAsRead(String userId);
    Notification createNotification(String userId, String title, String message, String type);
    void deleteNotification(String notificationId);
}